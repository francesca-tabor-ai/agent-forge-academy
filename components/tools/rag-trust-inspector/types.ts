/**
 * Shared types for RAG Trust Inspector
 * These types are used by both client and server components
 */

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
  score?: number;
}

export interface RetrievalDiagnostics {
  method: 'vector' | 'keyword';
  embeddingLatency?: number;
  searchLatency: number;
  totalLatency: number;
  resultsCount: number;
  scores?: number[];
}
