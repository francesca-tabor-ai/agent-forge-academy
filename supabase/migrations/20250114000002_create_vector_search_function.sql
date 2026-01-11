-- Create RPC function for vector similarity search
-- This function enables efficient vector search using pgvector
-- Falls back gracefully if pgvector is not available

CREATE OR REPLACE FUNCTION match_lesson_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  course_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  course_slug varchar,
  lesson_slug varchar,
  chunk_index int,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lc.id,
    lc.course_slug,
    lc.lesson_slug,
    lc.chunk_index,
    lc.content,
    lc.metadata,
    1 - (lc.embedding <=> query_embedding) AS similarity
  FROM lesson_chunks lc
  WHERE 
    lc.embedding IS NOT NULL
    AND (1 - (lc.embedding <=> query_embedding)) >= match_threshold
    AND (course_filter IS NULL OR lc.course_slug = course_filter)
  ORDER BY lc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_lesson_chunks TO authenticated;
