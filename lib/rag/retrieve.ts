/**
 * Retrieve relevant lesson chunks for RAG
 * Supports both vector similarity search (if pgvector available) and keyword search fallback
 */

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
export async function retrieveChunks(
  query: string,
  options: RetrieveOptions = {}
): Promise<RetrievedChunk[]> {
  const supabase = await createUserSupabaseClient();
  const useVectorSearch = options.useVectorSearch !== false; // Default to true

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
        const embeddingProvider = getEmbeddingProvider();
        const queryEmbedding = await embeddingProvider.embed(query);

        // Try vector search
        const vectorResults = await retrieveWithVectorSearch(supabase, queryEmbedding, options);
        if (vectorResults.length > 0) {
          return vectorResults;
        }
      }
    } catch (error) {
      console.warn('Vector search failed, falling back to keyword search:', error);
    }
  }

  // Fall back to keyword search
  return retrieveWithKeywordSearch(supabase, query, options);
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
