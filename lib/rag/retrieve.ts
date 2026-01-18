/**
 * Retrieve relevant lesson chunks for RAG
 * Supports both vector similarity search (if pgvector available) and keyword search fallback
 */

import 'server-only';

import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getEmbeddingProvider } from './embeddings';

export interface RetrievedChunk {
  id: string;
  courseSlug: string;
  lessonSlug: string;
  chunkIndex: number;
  content: string;
  metadata: {
    title?: string;
    module?: string;
    week?: number;
    order?: number;
    sectionHeaders?: string[];
  };
  score?: number; // Similarity score (for vector search) or relevance score (for keyword search)
}

export interface RetrieveOptions {
  limit?: number; // Number of chunks to retrieve (default: 5)
  courseSlug?: string; // Filter by course slug
  minScore?: number; // Minimum similarity/relevance score (0-1)
  useVectorSearch?: boolean; // Force vector search (default: auto-detect)
}

export interface RetrievalDiagnostics {
  method: 'vector' | 'keyword';
  embeddingLatency?: number;
  searchLatency: number;
  totalLatency: number;
  resultsCount: number;
  scores?: number[];
}

/**
 * Retrieve chunks using vector similarity search (if embeddings available)
 */
async function retrieveWithVectorSearch(
  supabase: any,
  queryEmbedding: number[],
  options: RetrieveOptions
): Promise<RetrievedChunk[]> {
  const limit = options.limit || 5;
  const courseFilter = options.courseSlug ? `AND course_slug = '${options.courseSlug}'` : '';

  // Use pgvector cosine similarity
  const { data, error } = await supabase.rpc('match_lesson_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: options.minScore || 0.7,
    match_count: limit,
    course_filter: options.courseSlug || null,
  });

  if (error) {
    // If RPC function doesn't exist, fall back to keyword search
    console.warn('Vector search RPC not available, falling back to keyword search:', error);
    return [];
  }

  return (data || []).map((chunk: any) => ({
    id: chunk.id,
    courseSlug: chunk.course_slug,
    lessonSlug: chunk.lesson_slug,
    chunkIndex: chunk.chunk_index,
    content: chunk.content,
    metadata: chunk.metadata || {},
    score: chunk.similarity,
  }));
}

/**
 * Retrieve chunks using keyword search (PostgreSQL full-text search)
 */
async function retrieveWithKeywordSearch(
  supabase: any,
  query: string,
  options: RetrieveOptions
): Promise<RetrievedChunk[]> {
  const limit = options.limit || 5;

  // Build query
  let queryBuilder = supabase
    .from('lesson_chunks')
    .select('id, course_slug, lesson_slug, chunk_index, content, metadata')
    .textSearch('content', query, {
      type: 'websearch',
      config: 'english',
    })
    .order('rank', { ascending: false })
    .limit(limit);

  // Filter by course if specified
  if (options.courseSlug) {
    queryBuilder = queryBuilder.eq('course_slug', options.courseSlug);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Keyword search error:', error);
    return [];
  }

  return (data || []).map((chunk: any) => ({
    id: chunk.id,
    courseSlug: chunk.course_slug,
    lessonSlug: chunk.lesson_slug,
    chunkIndex: chunk.chunk_index,
    content: chunk.content,
    metadata: chunk.metadata || {},
  }));
}

/**
 * Retrieve relevant lesson chunks for a query
 * Automatically uses vector search if available, falls back to keyword search
 */
// Overload signatures (NO default parameters, end with semicolons)
export async function retrieveChunks(
  query: string,
  options: RetrieveOptions & { includeDiagnostics: true },
  requestId?: string
): Promise<{ chunks: RetrievedChunk[]; diagnostics: RetrievalDiagnostics }>;
export async function retrieveChunks(
  query: string,
  options?: RetrieveOptions & { includeDiagnostics?: false },
  requestId?: string
): Promise<RetrievedChunk[]>;
// Implementation (HAS default parameters, has body)
export async function retrieveChunks(
  query: string,
  options: RetrieveOptions & { includeDiagnostics?: boolean } = {},
  requestId?: string
): Promise<RetrievedChunk[] | { chunks: RetrievedChunk[]; diagnostics: RetrievalDiagnostics }> {
  const supabase = await createUserSupabaseClient();
  const useVectorSearch = options.useVectorSearch !== false; // Default to true
  const includeDiagnostics = options.includeDiagnostics === true;
  const totalStart = Date.now();

  // Try vector search first if enabled
  if (useVectorSearch) {
    try {
      // Check if embeddings are available by checking if any chunk has an embedding
      const { data: sampleChunk } = await supabase
        .from('lesson_chunks')
        .select('embedding')
        .not('embedding', 'is', null)
        .limit(1)
        .single();

      if (sampleChunk && sampleChunk.embedding) {
        // Generate query embedding
        const embeddingStart = Date.now();
        const embeddingProvider = getEmbeddingProvider();
        const queryEmbedding = await embeddingProvider.embed(query);
        const embeddingLatency = Date.now() - embeddingStart;
        
        if (requestId) {
          console.log(`[RAG] [${requestId}] Query embedding generated`, {
            queryLength: query.length,
            embeddingDimensions: queryEmbedding.length,
            latency: embeddingLatency,
          });
        }

        // Try vector search
        const vectorSearchStart = Date.now();
        const vectorResults = await retrieveWithVectorSearch(supabase, queryEmbedding, options);
        const vectorSearchLatency = Date.now() - vectorSearchStart;
        const totalLatency = Date.now() - totalStart;
        
        if (requestId) {
          console.log(`[RAG] [${requestId}] Vector search completed`, {
            resultsCount: vectorResults.length,
            latency: vectorSearchLatency,
            scores: vectorResults.map(r => r.score).filter(Boolean),
          });
        }
        
        if (vectorResults.length > 0) {
          if (includeDiagnostics) {
            return {
              chunks: vectorResults,
              diagnostics: {
                method: 'vector',
                embeddingLatency,
                searchLatency: vectorSearchLatency,
                totalLatency,
                resultsCount: vectorResults.length,
                scores: vectorResults.map(r => r.score).filter((s): s is number => s !== undefined),
              },
            };
          }
          return vectorResults;
        }
      }
    } catch (error) {
      if (requestId) {
        console.warn(`[RAG] [${requestId}] Vector search failed, falling back to keyword search:`, error);
      } else {
        console.warn('Vector search failed, falling back to keyword search:', error);
      }
    }
  }

  // Fall back to keyword search
  const keywordSearchStart = Date.now();
  const keywordResults = await retrieveWithKeywordSearch(supabase, query, options);
  const keywordSearchLatency = Date.now() - keywordSearchStart;
  const totalLatency = Date.now() - totalStart;
  
  if (requestId) {
    console.log(`[RAG] [${requestId}] Keyword search completed`, {
      resultsCount: keywordResults.length,
      latency: keywordSearchLatency,
    });
  }
  
  if (includeDiagnostics) {
    return {
      chunks: keywordResults,
      diagnostics: {
        method: 'keyword',
        searchLatency: keywordSearchLatency,
        totalLatency,
        resultsCount: keywordResults.length,
      },
    };
  }
  
  return keywordResults;
}

/**
 * Format retrieved chunks for LLM context with citations
 */
export function formatChunksForContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return '';
  }

  const formatted = chunks.map((chunk, index) => {
    const metadata = chunk.metadata;
    let header = `[Chunk ${index + 1}]`;
    
    if (metadata.title) {
      header += ` ${metadata.title}`;
    }
    if (metadata.module) {
      header += ` - Module ${metadata.module}`;
    }
    if (metadata.sectionHeaders && metadata.sectionHeaders.length > 0) {
      header += ` (${metadata.sectionHeaders.join(', ')})`;
    }
    // Add citation reference
    header += `\nSource: ${chunk.courseSlug}/${chunk.lessonSlug} [ref:${index + 1}]\n`;

    return header + chunk.content;
  });

  return `\n\n## Relevant Course Content\n\n${formatted.join('\n\n---\n\n')}\n\n`;
}

/**
 * Generate citation references for chunks
 */
export function generateCitations(chunks: RetrievedChunk[]): Array<{ ref: number; courseSlug: string; lessonSlug: string; title?: string }> {
  return chunks.map((chunk, index) => ({
    ref: index + 1,
    courseSlug: chunk.courseSlug,
    lessonSlug: chunk.lessonSlug,
    title: chunk.metadata.title,
  }));
}
