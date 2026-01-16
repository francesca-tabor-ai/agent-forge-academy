-- Part 1: Enhance portfolio_projects table to match requirements
-- Adds: status, image_url, last_synced_at, repo_url
-- Creates: skills and project_skills tables for project-level skills tagging
--
-- Note: The unique constraint for deduplication exists in migration 20250129000001
-- as (student_profile_id, source, source_id). Since each student_profile belongs
-- to one user, this is functionally equivalent to (user_id, source, source_id).

-- ============================================
-- STEP 1: Add missing columns to portfolio_projects
-- ============================================

-- Add status column (draft | published)
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft', 'published'));

-- Add image_url column (for project cover/tile images)
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add last_synced_at column (for tracking GitHub sync)
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Add repo_url column (keeping github_url for backward compatibility)
-- repo_url is the canonical field, github_url can be migrated later
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS repo_url TEXT;

-- Migrate existing github_url to repo_url if repo_url is null
UPDATE portfolio_projects
SET repo_url = github_url
WHERE repo_url IS NULL AND github_url IS NOT NULL;

-- ============================================
-- STEP 2: Visibility enum note
-- Current enum: 'private', 'recruiters_only', 'public'
-- Requirement mentions: 'private', 'recruiters', 'public'
-- ============================================
-- Note: The existing visibility_level enum uses 'recruiters_only' instead of 'recruiters'
-- Changing enum values requires a complex migration (create new enum, migrate data, drop old)
-- For now, we keep the existing enum. The application layer can map 'recruiters_only' to 'recruiters'
-- if needed, or a separate migration can be created to update the enum type.

-- ============================================
-- STEP 3: Create skills table
-- ============================================

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Unique constraint: case-insensitive name per user
  UNIQUE(user_id, LOWER(name))
);

-- Create indexes for skills table
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(LOWER(name));

-- Add comment for documentation
COMMENT ON TABLE skills IS 'User-defined skills that can be tagged to projects';
COMMENT ON COLUMN skills.name IS 'Skill name (case-insensitive unique per user)';

-- ============================================
-- STEP 4: Create project_skills join table
-- ============================================

CREATE TABLE IF NOT EXISTS project_skills (
  project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, skill_id)
);

-- Create indexes for project_skills table
CREATE INDEX IF NOT EXISTS idx_project_skills_project_id ON project_skills(project_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_skill_id ON project_skills(skill_id);

-- Add comment for documentation
COMMENT ON TABLE project_skills IS 'Many-to-many relationship between projects and skills';

-- ============================================
-- STEP 5: Enable RLS on new tables
-- ============================================

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: RLS Policies for skills table
-- ============================================

-- SELECT: Users can see their own skills
DROP POLICY IF EXISTS "Users can view their own skills" ON skills;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can view their own skills"
    ON skills
    FOR SELECT
    USING (user_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- INSERT: Users can create their own skills
DROP POLICY IF EXISTS "Users can create their own skills" ON skills;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can create their own skills"
    ON skills
    FOR INSERT
    WITH CHECK (user_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- UPDATE: Users can update their own skills
DROP POLICY IF EXISTS "Users can update their own skills" ON skills;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can update their own skills"
    ON skills
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- DELETE: Users can delete their own skills
DROP POLICY IF EXISTS "Users can delete their own skills" ON skills;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can delete their own skills"
    ON skills
    FOR DELETE
    USING (user_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================
-- STEP 7: RLS Policies for project_skills table
-- ============================================

-- SELECT: Users can see project_skills for their own projects
DROP POLICY IF EXISTS "Users can view project_skills for own projects" ON project_skills;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can view project_skills for own projects"
    ON project_skills
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM portfolio_projects pp
        JOIN student_profiles sp ON sp.id = pp.student_profile_id
        JOIN profiles p ON p.id = sp.profile_id
        WHERE pp.id = project_skills.project_id
        AND p.user_id = auth.uid()
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- INSERT: Users can add skills to their own projects
DROP POLICY IF EXISTS "Users can add skills to own projects" ON project_skills;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can add skills to own projects"
    ON project_skills
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM portfolio_projects pp
        JOIN student_profiles sp ON sp.id = pp.student_profile_id
        JOIN profiles p ON p.id = sp.profile_id
        WHERE pp.id = project_skills.project_id
        AND p.user_id = auth.uid()
      )
      AND EXISTS (
        SELECT 1 FROM skills s
        WHERE s.id = project_skills.skill_id
        AND s.user_id = auth.uid()
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- DELETE: Users can remove skills from their own projects
DROP POLICY IF EXISTS "Users can remove skills from own projects" ON project_skills;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can remove skills from own projects"
    ON project_skills
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM portfolio_projects pp
        JOIN student_profiles sp ON sp.id = pp.student_profile_id
        JOIN profiles p ON p.id = sp.profile_id
        WHERE pp.id = project_skills.project_id
        AND p.user_id = auth.uid()
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================
-- STEP 8: Add indexes for performance
-- ============================================

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_status ON portfolio_projects(status);

-- Index on last_synced_at for sync queries
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_last_synced_at ON portfolio_projects(last_synced_at);

-- Index on repo_url for lookups
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_repo_url ON portfolio_projects(repo_url) WHERE repo_url IS NOT NULL;

-- ============================================
-- STEP 9: Add comments for documentation
-- ============================================

COMMENT ON COLUMN portfolio_projects.status IS 'Project status: draft (default) or published';
COMMENT ON COLUMN portfolio_projects.image_url IS 'URL to project cover/tile image';
COMMENT ON COLUMN portfolio_projects.last_synced_at IS 'Timestamp of last sync from source (e.g., GitHub)';
COMMENT ON COLUMN portfolio_projects.repo_url IS 'Repository URL (e.g., GitHub URL)';
