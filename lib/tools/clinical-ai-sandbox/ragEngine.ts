/**
 * Clinical AI Sandbox - RAG Engine
 * 
 * Deterministic retrieval-augmented generation engine for clinical documents.
 * Provides transparent retrieval with confidence scoring and gap detection.
 * 
 * Key principles:
 * - No hallucinations: Responses ONLY use retrieved excerpts
 * - Traceable: Every fact is tied to a source document
 * - Deterministic: Same query always yields same results
 * - Confidence threshold enforced: Below threshold = out-of-scope
 */

import { CLINICAL_DOCUMENTS, type ClinicalDocument } from './docs';
import type { RagRetrievalResult } from './types';

/**
 * Confidence threshold for generating answers
 * Below this threshold, the system refuses to answer
 */
export const CONFIDENCE_THRESHOLD = 0.5;

/**
 * Minimum number of documents required for an answer
 */
export const MIN_DOCUMENTS_FOR_ANSWER = 2;

/**
 * Retrieval result with full document information
 */
export interface RetrievalResult {
  doc: ClinicalDocument;
  relevanceScore: number;
  matchedTerms: string[];
}

/**
 * RAG query result
 */
export interface RAGQueryResult {
  query: string;
  retrievedDocs: RetrievalResult[];
  confidence: number; // 0-1
  coverageGaps: string[];
  hasSufficientCoverage: boolean;
  canAnswer: boolean;
}

/**
 * Deterministic retrieval function
 * Uses simple keyword matching with scoring
 */
export function retrieveDocuments(query: string, maxResults: number = 5): RAGQueryResult {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return {
      query,
      retrievedDocs: [],
      confidence: 0,
      coverageGaps: ['Empty query provided'],
      hasSufficientCoverage: false,
      canAnswer: false,
    };
  }

  // Extract query terms (simple word extraction)
  const queryTerms = normalizedQuery
    .split(/\s+/)
    .filter((term) => term.length > 2) // Filter out very short words
    .filter((term) => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(term));

  if (queryTerms.length === 0) {
    return {
      query,
      retrievedDocs: [],
      confidence: 0,
      coverageGaps: ['Query contains no meaningful search terms'],
      hasSufficientCoverage: false,
      canAnswer: false,
    };
  }

  // Score each document
  const scoredDocs: RetrievalResult[] = CLINICAL_DOCUMENTS.map((doc) => {
    const docText = `${doc.title} ${doc.excerpt} ${doc.body} ${doc.tags.join(' ')}`.toLowerCase();
    let score = 0;
    const matchedTerms: string[] = [];

    // Score based on term matches
    for (const term of queryTerms) {
      if (docText.includes(term)) {
        // Title matches are worth more
        if (doc.title.toLowerCase().includes(term)) {
          score += 3;
        } else if (doc.excerpt.toLowerCase().includes(term)) {
          score += 2;
        } else if (doc.tags.some((tag) => tag.toLowerCase().includes(term))) {
          score += 2;
        } else {
          score += 1;
        }
        matchedTerms.push(term);
      }
    }

    return {
      doc,
      relevanceScore: score,
      matchedTerms: [...new Set(matchedTerms)], // Remove duplicates
    };
  });

  // Filter and sort by relevance
  const relevantDocs = scoredDocs
    .filter((result) => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);

  // Calculate confidence based on top result score and number of results
  const topScore = relevantDocs.length > 0 ? relevantDocs[0].relevanceScore : 0;
  const maxPossibleScore = queryTerms.length * 3; // Assuming all terms match in title
  const scoreConfidence = maxPossibleScore > 0 ? Math.min(topScore / maxPossibleScore, 1) : 0;
  const coverageConfidence = relevantDocs.length >= 3 ? 0.8 : relevantDocs.length >= 2 ? 0.6 : relevantDocs.length >= 1 ? 0.4 : 0;
  const confidence = (scoreConfidence * 0.6 + coverageConfidence * 0.4);

  // Determine if coverage is sufficient (enforce confidence threshold)
  const hasSufficientCoverage = 
    confidence >= CONFIDENCE_THRESHOLD && 
    relevantDocs.length >= MIN_DOCUMENTS_FOR_ANSWER;

  // Identify coverage gaps
  const coverageGaps: string[] = [];
  if (relevantDocs.length === 0) {
    coverageGaps.push('No relevant documents found for this query');
  } else if (relevantDocs.length < MIN_DOCUMENTS_FOR_ANSWER) {
    coverageGaps.push(`Limited document coverage - only ${relevantDocs.length} relevant source(s) found (minimum ${MIN_DOCUMENTS_FOR_ANSWER} required)`);
  }
  if (confidence < CONFIDENCE_THRESHOLD) {
    coverageGaps.push(`Low confidence (${(confidence * 100).toFixed(1)}%) - below threshold of ${(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%`);
  }
  if (queryTerms.some((term) => !relevantDocs.some((r) => r.matchedTerms.includes(term)))) {
    const unmatchedTerms = queryTerms.filter((term) => !relevantDocs.some((r) => r.matchedTerms.includes(term)));
    coverageGaps.push(`No coverage for terms: ${unmatchedTerms.join(', ')}`);
  }

  // Determine if we can answer (enforce confidence threshold)
  const canAnswer = hasSufficientCoverage && confidence >= CONFIDENCE_THRESHOLD;

  return {
    query,
    retrievedDocs: relevantDocs,
    confidence,
    coverageGaps,
    hasSufficientCoverage,
    canAnswer,
  };
}

/**
 * Generate answer with citations from retrieved documents
 * 
 * CRITICAL: This function ONLY uses retrieved excerpts - no generation, no hallucinations.
 * Every fact in the response is traceable to a source document excerpt.
 * 
 * @param result - RAG query result with retrieved documents
 * @returns Answer string with citations, or empty string if cannot answer
 */
export function generateAnswerWithCitations(result: RAGQueryResult): string {
  // Enforce confidence threshold - refuse if below threshold
  if (!result.canAnswer || result.retrievedDocs.length === 0) {
    return '';
  }

  // Double-check confidence threshold (defensive programming)
  if (result.confidence < CONFIDENCE_THRESHOLD) {
    return '';
  }

  if (result.retrievedDocs.length < MIN_DOCUMENTS_FOR_ANSWER) {
    return '';
  }

  // Build response ONLY from retrieved excerpts (no generation, no new facts)
  const citations: string[] = [];
  const excerptSections: string[] = [];

  result.retrievedDocs.forEach((retrieval, index) => {
    const citationLabel = `[${retrieval.doc.title} v${retrieval.doc.version}]`;
    citations.push(`${index + 1}. ${citationLabel}`);
    
    // ONLY use the excerpt - no paraphrasing that could introduce new facts
    excerptSections.push(`${citationLabel}\n${retrieval.doc.excerpt}`);
  });

  // Construct response using ONLY the excerpts
  // No additional text generation that could introduce hallucinations
  const response = `Based on the retrieved information from the document set:\n\n${excerptSections.join('\n\n---\n\n')}\n\nSources:\n${citations.join('\n')}\n\nNote: This information is for educational purposes only and does not constitute medical advice. Please consult with a healthcare professional for personalized guidance.`;

  return response;
}

/**
 * Generate out-of-scope response when confidence is below threshold
 * 
 * @param result - RAG query result
 * @returns Out-of-scope refusal message
 */
export function generateOutOfScopeResponse(result: RAGQueryResult): string {
  const reasons: string[] = [];

  if (result.confidence < CONFIDENCE_THRESHOLD) {
    reasons.push(`Confidence score (${(result.confidence * 100).toFixed(1)}%) is below the required threshold of ${(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%`);
  }

  if (result.retrievedDocs.length < MIN_DOCUMENTS_FOR_ANSWER) {
    reasons.push(`Only ${result.retrievedDocs.length} document(s) retrieved (minimum ${MIN_DOCUMENTS_FOR_ANSWER} required)`);
  }

  if (result.coverageGaps.length > 0) {
    reasons.push(...result.coverageGaps);
  }

  return `This query is out of scope or has insufficient coverage in the available knowledge base.\n\nReasons:\n${reasons.map((r) => `• ${r}`).join('\n')}\n\nI cannot provide an answer as it would require information not present in the retrieved documents or would be based on insufficient evidence. Please consult with a healthcare professional for personalized guidance.`;
}

/**
 * Get response for a RAG query result
 * 
 * Deterministic function that:
 * - Returns answer with citations if confidence >= threshold
 * - Returns out-of-scope response if confidence < threshold
 * - Never generates facts not in retrieved excerpts
 * 
 * @param result - RAG query result
 * @returns Response string (answer with citations or out-of-scope message)
 */
export function getRAGResponse(result: RAGQueryResult): string {
  // Enforce confidence threshold
  if (result.canAnswer && result.confidence >= CONFIDENCE_THRESHOLD && result.retrievedDocs.length >= MIN_DOCUMENTS_FOR_ANSWER) {
    return generateAnswerWithCitations(result);
  } else {
    return generateOutOfScopeResponse(result);
  }
}
