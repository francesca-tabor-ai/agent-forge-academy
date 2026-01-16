-- Create Tools Platform tables
-- This migration creates the core data model for the Tools platform:
-- - tools: Core tool entities (Supabase, OpenAI, Cursor, etc.)
-- - tool_courses: Many-to-many relationship between tools and courses
-- - tool_videos: Video content associated with tools
-- - tool_offers: Offers/discounts attached to tools (with optional course completion gating)

-- ============================================================================
-- 1. TOOLS TABLE
-- ============================================================================
-- Core entity representing developer/AI tools
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- "Supabase", "OpenAI", "Cursor"
  slug VARCHAR(255) NOT NULL UNIQUE, -- URL-friendly identifier
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'db', 'llm', 'hosting', 'analytics', 'monitoring', etc.
  logo_url TEXT, -- URL to tool logo image
  website_url TEXT NOT NULL, -- Main website URL
  docs_url TEXT, -- Documentation URL (nullable)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for tools
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
CREATE TRIGGER update_tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. TOOL_COURSES TABLE (Many-to-Many)
-- ============================================================================
-- Links tools to courses: "Learn Supabase by taking X course"
CREATE TABLE IF NOT EXISTS tool_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tool_id, course_id) -- Prevent duplicate associations
);

-- Create indexes for tool_courses
CREATE INDEX IF NOT EXISTS idx_tool_courses_tool_id ON tool_courses(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_courses_course_id ON tool_courses(course_id);

-- ============================================================================
-- 3. TOOL_VIDEOS TABLE
-- ============================================================================
-- Video content associated with tools (tutorials, demos, etc.)
CREATE TABLE IF NOT EXISTS tool_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL, -- YouTube, Vimeo, or hosted video URL
  duration INTEGER, -- Duration in seconds (nullable)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for tool_videos
CREATE INDEX IF NOT EXISTS idx_tool_videos_tool_id ON tool_videos(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_videos_created_at ON tool_videos(created_at DESC);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_tool_videos_updated_at ON tool_videos;
CREATE TRIGGER update_tool_videos_updated_at
  BEFORE UPDATE ON tool_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. TOOL_OFFERS TABLE
-- ============================================================================
-- Offers/discounts attached to tools (optional children of tools)
-- Some offers are gated by course completion
CREATE TABLE IF NOT EXISTS tool_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  discount_type VARCHAR(50) NOT NULL, -- 'credits', 'percent', 'free_tier', 'trial'
  value_display VARCHAR(255) NOT NULL, -- e.g., "$100 credits", "20% off", "Free tier upgrade"
  eligibility VARCHAR(50) NOT NULL DEFAULT 'open', -- 'students_only', 'new_users', 'open'
  expires_at TIMESTAMPTZ, -- When the offer expires (nullable)
  requires_course_completion BOOLEAN NOT NULL DEFAULT false, -- Gate by course completion
  required_course_id UUID REFERENCES courses(id) ON DELETE SET NULL, -- Required course (nullable)
  claim_url TEXT NOT NULL, -- URL to claim/redeem the offer
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Ensure required_course_id is set when requires_course_completion is true
  CONSTRAINT check_course_completion_requires_course 
    CHECK (
      (requires_course_completion = false) OR 
      (requires_course_completion = true AND required_course_id IS NOT NULL)
    )
);

-- Create indexes for tool_offers
CREATE INDEX IF NOT EXISTS idx_tool_offers_tool_id ON tool_offers(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_offers_is_active ON tool_offers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tool_offers_expires_at ON tool_offers(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tool_offers_requires_course_completion ON tool_offers(requires_course_completion, required_course_id) 
  WHERE requires_course_completion = true;
CREATE INDEX IF NOT EXISTS idx_tool_offers_created_at ON tool_offers(created_at DESC);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_tool_offers_updated_at ON tool_offers;
CREATE TRIGGER update_tool_offers_updated_at
  BEFORE UPDATE ON tool_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tools
-- All authenticated users can view tools
DROP POLICY IF EXISTS "Authenticated users can view tools" ON tools;
CREATE POLICY "Authenticated users can view tools"
  ON tools
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage tools
DROP POLICY IF EXISTS "Admins can manage tools" ON tools;
CREATE POLICY "Admins can manage tools"
  ON tools
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for tool_courses
-- All authenticated users can view tool-course associations
DROP POLICY IF EXISTS "Authenticated users can view tool_courses" ON tool_courses;
CREATE POLICY "Authenticated users can view tool_courses"
  ON tool_courses
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage tool-course associations
DROP POLICY IF EXISTS "Admins can manage tool_courses" ON tool_courses;
CREATE POLICY "Admins can manage tool_courses"
  ON tool_courses
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for tool_videos
-- All authenticated users can view tool videos
DROP POLICY IF EXISTS "Authenticated users can view tool_videos" ON tool_videos;
CREATE POLICY "Authenticated users can view tool_videos"
  ON tool_videos
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage tool videos
DROP POLICY IF EXISTS "Admins can manage tool_videos" ON tool_videos;
CREATE POLICY "Admins can manage tool_videos"
  ON tool_videos
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for tool_offers
-- All authenticated users can view active tool offers
DROP POLICY IF EXISTS "Authenticated users can view active tool_offers" ON tool_offers;
CREATE POLICY "Authenticated users can view active tool_offers"
  ON tool_offers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can view all tool offers (including inactive)
DROP POLICY IF EXISTS "Admins can view all tool_offers" ON tool_offers;
CREATE POLICY "Admins can view all tool_offers"
  ON tool_offers
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can manage tool offers
DROP POLICY IF EXISTS "Admins can manage tool_offers" ON tool_offers;
CREATE POLICY "Admins can manage tool_offers"
  ON tool_offers
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE tools IS 'Core tool entities (Supabase, OpenAI, Cursor, etc.)';
COMMENT ON TABLE tool_courses IS 'Many-to-many relationship: tools can be associated with multiple courses';
COMMENT ON TABLE tool_videos IS 'Video content (tutorials, demos) associated with tools';
COMMENT ON TABLE tool_offers IS 'Offers/discounts attached to tools. Some offers are gated by course completion.';

COMMENT ON COLUMN tool_offers.requires_course_completion IS 'If true, offer is only available after completing required_course_id';
COMMENT ON COLUMN tool_offers.required_course_id IS 'Course that must be completed to access this offer (nullable)';
COMMENT ON COLUMN tool_offers.eligibility IS 'Who can claim: students_only, new_users, or open';
