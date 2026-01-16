/**
 * Clinical AI Sandbox - RAG Engine
 * 
 * Deterministic retrieval-augmented generation engine for clinical documents.
 * Provides transparent retrieval with confidence scoring and gap detection.
 */

import { CLINICAL_DOCUMENTS, type ClinicalDocument } from './docs';
import type { RagRetrievalResult } from './types';

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

  // Determine if coverage is sufficient
  const hasSufficientCoverage = confidence >= 0.5 && relevantDocs.length >= 2;

  // Identify coverage gaps
  const coverageGaps: string[] = [];
  if (relevantDocs.length === 0) {
    coverageGaps.push('No relevant documents found for this query');
  } else if (relevantDocs.length < 2) {
    coverageGaps.push('Limited document coverage - only one relevant source found');
  }
  if (confidence < 0.5) {
    coverageGaps.push('Low confidence in retrieved information');
  }
  if (queryTerms.some((term) => !relevantDocs.some((r) => r.matchedTerms.includes(term)))) {
    const unmatchedTerms = queryTerms.filter((term) => !relevantDocs.some((r) => r.matchedTerms.includes(term)));
    coverageGaps.push(`No coverage for terms: ${unmatchedTerms.join(', ')}`);
  }

  // Determine if we can answer
  const canAnswer = hasSufficientCoverage && confidence >= 0.5;

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
 */
export function generateAnswerWithCitations(result: RAGQueryResult): string {
  if (!result.canAnswer || result.retrievedDocs.length === 0) {
    return '';
  }

  const citations: string[] = [];
  const excerpts: string[] = [];

  result.retrievedDocs.forEach((retrieval, index) => {
    const citation = `[${index + 1}]`;
    citations.push(`${citation} ${retrieval.doc.title} (v${retrieval.doc.version})`);
    excerpts.push(`${citation} ${retrieval.doc.excerpt}`);
  });

  return `Based on the available information:\n\n${excerpts.join('\n\n')}\n\nSources:\n${citations.join('\n')}\n\nNote: This information is for educational purposes only and does not constitute medical advice. Please consult with a healthcare professional for personalized guidance.`;
}
