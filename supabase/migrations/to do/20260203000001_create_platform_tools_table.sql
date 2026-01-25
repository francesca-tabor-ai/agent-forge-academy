-- Create platform_tools table
-- This table stores internal platform tools (GTM System Designer, RAG Trust Inspector, etc.)
-- These are distinct from external tools (Supabase, OpenAI, etc.) which are stored in the 'tools' table

-- Create tool_status enum (idempotent)
DO $$ BEGIN
    CREATE TYPE tool_status AS ENUM ('active', 'coming_soon', 'beta', 'deprecated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create platform_tools table
CREATE TABLE IF NOT EXISTS platform_tools (
  id VARCHAR(100) PRIMARY KEY, -- e.g., 'gtm-system-designer'
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  href VARCHAR(500) NOT NULL, -- Route path, e.g., '/student/tools/gtm-system-designer'
  status tool_status NOT NULL DEFAULT 'active',
  tags TEXT[] DEFAULT '{}'::text[], -- Array of tags
  recommended_for_courses TEXT[] DEFAULT '{}'::text[], -- Array of course slugs
  category VARCHAR(255), -- Track/category (e.g., "GTM & Revenue Operations", "Agentic Systems")
  difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  duration VARCHAR(100), -- Time estimate (e.g., "~4-6 hours", "~8 weeks")
  industries TEXT[] DEFAULT '{}'::text[], -- Array of industries
  best_for TEXT[] DEFAULT '{}'::text[], -- Array of target audiences
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- Add category column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_tools' AND column_name = 'category') THEN
    ALTER TABLE platform_tools ADD COLUMN category VARCHAR(255);
  END IF;
  
  -- Add difficulty_level column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_tools' AND column_name = 'difficulty_level') THEN
    ALTER TABLE platform_tools ADD COLUMN difficulty_level VARCHAR(50);
  END IF;
  
  -- Add duration column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_tools' AND column_name = 'duration') THEN
    ALTER TABLE platform_tools ADD COLUMN duration VARCHAR(100);
  END IF;
  
  -- Add industries column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_tools' AND column_name = 'industries') THEN
    ALTER TABLE platform_tools ADD COLUMN industries TEXT[] DEFAULT '{}'::text[];
  END IF;
  
  -- Add best_for column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_tools' AND column_name = 'best_for') THEN
    ALTER TABLE platform_tools ADD COLUMN best_for TEXT[] DEFAULT '{}'::text[];
  END IF;
END $$;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_platform_tools_status ON platform_tools(status);
CREATE INDEX IF NOT EXISTS idx_platform_tools_tags ON platform_tools USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_platform_tools_recommended_for_courses ON platform_tools USING GIN(recommended_for_courses);
CREATE INDEX IF NOT EXISTS idx_platform_tools_created_at ON platform_tools(created_at DESC);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_platform_tools_updated_at ON platform_tools;
CREATE TRIGGER update_platform_tools_updated_at
  BEFORE UPDATE ON platform_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE platform_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can view platform tools
DROP POLICY IF EXISTS "Authenticated users can view platform tools" ON platform_tools;
CREATE POLICY "Authenticated users can view platform tools"
  ON platform_tools
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage platform tools
DROP POLICY IF EXISTS "Admins can manage platform tools" ON platform_tools;
CREATE POLICY "Admins can manage platform tools"
  ON platform_tools
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Comments for documentation
COMMENT ON TABLE platform_tools IS 'Internal platform tools (GTM System Designer, RAG Trust Inspector, etc.). Distinct from external tools stored in the tools table.';
COMMENT ON COLUMN platform_tools.id IS 'Unique identifier for the tool (e.g., gtm-system-designer)';
COMMENT ON COLUMN platform_tools.href IS 'Route path to access the tool (e.g., /student/tools/gtm-system-designer)';
COMMENT ON COLUMN platform_tools.status IS 'Tool status: active, coming_soon, beta, or deprecated';
COMMENT ON COLUMN platform_tools.tags IS 'Array of tags for categorizing and filtering tools';
COMMENT ON COLUMN platform_tools.recommended_for_courses IS 'Array of course slugs that this tool is recommended for';
