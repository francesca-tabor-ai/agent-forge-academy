-- Create videos table
-- Stores YouTube video metadata and associated learning content

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT,
  channel_name TEXT,
  thumbnail_url TEXT,
  description TEXT,
  video_url TEXT,
  purpose TEXT,
  cover_image_url TEXT,
  instruction TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tools_used TEXT[] DEFAULT '{}',
  playbook_md TEXT DEFAULT '',
  prompts_md TEXT DEFAULT '',
  steps JSONB DEFAULT '[]'::jsonb,
  prompt_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_videos_channel_name ON videos(channel_name);
CREATE INDEX IF NOT EXISTS idx_videos_difficulty ON videos(difficulty);
CREATE INDEX IF NOT EXISTS idx_videos_tools_used ON videos USING GIN(tools_used);
CREATE INDEX IF NOT EXISTS idx_videos_title ON videos(title);

-- Create trigram index on title for fuzzy text search (optional, if pg_trgm extension is available)
DO $$ 
BEGIN
  -- Check if pg_trgm extension exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE INDEX IF NOT EXISTS idx_videos_title_trgm ON videos USING gin(title gin_trgm_ops);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Extension not available, skip trigram index
    NULL;
END $$;

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos

-- Authenticated users (students/instructors/recruiters) can view videos
DROP POLICY IF EXISTS "Authenticated users can view videos" ON videos;
CREATE POLICY "Authenticated users can view videos"
  ON videos
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can create/update/delete videos
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;
CREATE POLICY "Admins can manage videos"
  ON videos
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
