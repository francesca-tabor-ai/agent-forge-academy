/**
 * RAG Trust Inspector API
 * 
 * Endpoint for inspecting and validating RAG system performance,
 * trust metrics, and retrieval quality.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { retrieveChunks, type RetrievedChunk, type RetrievalDiagnostics } from '@/lib/rag/retrieve';
import { getAllCourseSlugs } from '@/lib/lessons';

export interface RAGInspectionRequest {
  query: string;
  courseSlug?: string;
  limit?: number;
  minScore?: number;
  useVectorSearch?: boolean;
}

export interface RAGInspectionResult {
  query: string;
  chunks: RetrievedChunk[];
  diagnostics: RetrievalDiagnostics;
  trustMetrics: {
    averageScore: number;
    minScore: number;
    maxScore: number;
    hasHighConfidence: boolean;
    coverageScore: number; // Based on number of results vs requested
    scoreDistribution: {
      high: number; // >= 0.8
      medium: number; // 0.5-0.8
      low: number; // < 0.5
    };
  };
  warnings: string[];
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: RAGInspectionRequest = await request.json();
    const { query, courseSlug, limit = 5, minScore = 0.5, useVectorSearch } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Retrieve chunks with diagnostics
    const result = await retrieveChunks(query.trim(), {
      limit,
      courseSlug,
      minScore,
      useVectorSearch,
      includeDiagnostics: true,
    });

    if (!('chunks' in result) || !('diagnostics' in result)) {
      return NextResponse.json(
        { error: 'Failed to retrieve chunks with diagnostics' },
        { status: 500 }
      );
    }

    const { chunks, diagnostics } = result;

    // Calculate trust metrics
    const scores = chunks
      .map((c) => c.score)
      .filter((s): s is number => s !== undefined);

    const averageScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s, 0) / scores.length
      : 0;

    const minScoreValue = scores.length > 0 ? Math.min(...scores) : 0;
    const maxScoreValue = scores.length > 0 ? Math.max(...scores) : 0;

    const scoreDistribution = {
      high: scores.filter((s) => s >= 0.8).length,
      medium: scores.filter((s) => s >= 0.5 && s < 0.8).length,
      low: scores.filter((s) => s < 0.5).length,
    };

    const hasHighConfidence = averageScore >= 0.7 && chunks.length >= 3;
    const coverageScore = Math.min(chunks.length / limit, 1.0);

    // Generate warnings and recommendations
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (chunks.length === 0) {
      warnings.push('No chunks retrieved for this query. The RAG system may not have relevant content.');
      recommendations.push('Consider rephrasing the query or checking if the content has been indexed.');
    } else if (chunks.length < limit) {
      warnings.push(`Only ${chunks.length} chunks retrieved (requested ${limit}). Coverage may be incomplete.`);
    }

    if (averageScore < 0.5) {
      warnings.push('Low average similarity score. Retrieved content may not be highly relevant.');
      recommendations.push('Consider refining the query or checking if embeddings are properly generated.');
    }

    if (diagnostics.method === 'keyword' && useVectorSearch !== false) {
      warnings.push('Vector search unavailable, using keyword search fallback. Results may be less accurate.');
      recommendations.push('Ensure embeddings are generated and pgvector extension is installed for better results.');
    }

    if (scoreDistribution.low > 0) {
      warnings.push(`${scoreDistribution.low} chunk(s) have low relevance scores (< 0.5).`);
    }

    if (diagnostics.totalLatency > 1000) {
      warnings.push(`Slow retrieval latency: ${diagnostics.totalLatency}ms. Consider optimizing embeddings or database indexes.`);
    }

    if (hasHighConfidence && chunks.length >= 3) {
      recommendations.push('High confidence retrieval detected. This query should produce reliable results.');
    }

    if (coverageScore < 0.6) {
      recommendations.push('Consider increasing the limit or adjusting the minimum score threshold.');
    }

    const inspectionResult: RAGInspectionResult = {
      query: query.trim(),
      chunks,
      diagnostics,
      trustMetrics: {
        averageScore,
        minScore: minScoreValue,
        maxScore: maxScoreValue,
        hasHighConfidence,
        coverageScore,
        scoreDistribution,
      },
      warnings,
      recommendations,
    };

    return NextResponse.json(inspectionResult);
  } catch (error) {
    console.error('RAG inspection error:', error);
    return NextResponse.json(
      { error: 'Failed to inspect RAG system', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve available courses for filtering
 */
export async function GET() {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseSlugs = getAllCourseSlugs();

    // Get course metadata if available
    const courses = courseSlugs.map((slug) => ({
      slug,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
