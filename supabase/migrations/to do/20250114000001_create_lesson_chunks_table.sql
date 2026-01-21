-- Create lesson_chunks table for RAG (Retrieval Augmented Generation)
-- Stores chunked lesson content with embeddings for semantic search
-- Supports both vector search (pgvector) and keyword search fallback

-- Enable pgvector extension if available (optional)
-- If pgvector is not available, we'll use keyword search as fallback
DO $$ 
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
    WHEN OTHERS THEN
        -- Extension not available, will use keyword search fallback
        RAISE NOTICE 'pgvector extension not available, using keyword search fallback';
END $$;

-- Create lesson_chunks table
CREATE TABLE IF NOT EXISTS lesson_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug VARCHAR(255) NOT NULL,
  lesson_slug VARCHAR(255) NOT NULL,
  chunk_index INTEGER NOT NULL, -- Order of chunk within lesson (0-indexed)
  content TEXT NOT NULL, -- The actual chunk text
  content_length INTEGER NOT NULL, -- Character length of chunk
  embedding vector(1536), -- OpenAI embedding vector (1536 dimensions) - nullable for keyword fallback
  metadata JSONB DEFAULT '{}'::jsonb, -- Store title, module, section headers, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure unique chunks per lesson
  UNIQUE(course_slug, lesson_slug, chunk_index)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_course_slug ON lesson_chunks(course_slug);
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_lesson_slug ON lesson_chunks(lesson_slug);
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_course_lesson ON lesson_chunks(course_slug, lesson_slug);
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_metadata ON lesson_chunks USING GIN(metadata);

-- Index for full-text search (keyword fallback)
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_content_search ON lesson_chunks USING GIN(to_tsvector('english', content));

-- Index for vector similarity search (if pgvector is available)
-- This will only work if pgvector extension is installed
DO $$ 
BEGIN
    CREATE INDEX IF NOT EXISTS idx_lesson_chunks_embedding ON lesson_chunks 
    USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);
EXCEPTION
    WHEN OTHERS THEN
        -- Index creation failed (likely pgvector not available)
        RAISE NOTICE 'Vector index not created, using keyword search fallback';
END $$;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_lesson_chunks_updated_at ON lesson_chunks;
CREATE TRIGGER update_lesson_chunks_updated_at
  BEFORE UPDATE ON lesson_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (optional - depends on access requirements)
-- For now, make chunks readable by all authenticated users
ALTER TABLE lesson_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all authenticated users to read lesson chunks
DROP POLICY IF EXISTS "Authenticated users can read lesson chunks" ON lesson_chunks;
CREATE POLICY "Authenticated users can read lesson chunks"
  ON lesson_chunks
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Note: We don't need INSERT/UPDATE policies for now since indexing will be done via service role
-- If you want to allow manual indexing, add appropriate policies
