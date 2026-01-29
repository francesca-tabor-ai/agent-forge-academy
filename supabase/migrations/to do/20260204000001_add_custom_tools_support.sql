-- Add custom tools support to project tools
-- This migration enables users to add custom tools to projects (not just catalog tools)
-- and optionally save them for reuse in future projects

-- ============================================================================
-- 1. CREATE CUSTOM_TOOLS TABLE
-- ============================================================================
-- Stores user-defined custom tools that can be reused across projects
CREATE TABLE IF NOT EXISTS custom_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- Framework, Language, Library, Platform, Cloud, Database, Tooling, Other
  version VARCHAR(100),
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for custom_tools
CREATE INDEX IF NOT EXISTS idx_custom_tools_user_id ON custom_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_tools_name ON custom_tools(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_custom_tools_created_at ON custom_tools(created_at DESC);

-- Create unique index to prevent duplicate custom tools per user (case-insensitive, trimmed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_tools_unique_user_name 
  ON custom_tools(user_id, LOWER(TRIM(name)));

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_custom_tools_updated_at ON custom_tools;
CREATE TRIGGER update_custom_tools_updated_at
  BEFORE UPDATE ON custom_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. UPDATE PROJECT_TOOLS TABLE
-- ============================================================================
-- Add support for both catalog tools and custom tools

-- Add tool_type column (catalog or custom)
ALTER TABLE project_tools 
  ADD COLUMN IF NOT EXISTS tool_type VARCHAR(20) DEFAULT 'catalog' CHECK (tool_type IN ('catalog', 'custom'));

-- Add custom_tool_id column (nullable, used when tool_type = 'custom')
ALTER TABLE project_tools 
  ADD COLUMN IF NOT EXISTS custom_tool_id UUID REFERENCES custom_tools(id) ON DELETE CASCADE;

-- Add order column for tool ordering within a project
ALTER TABLE project_tools 
  ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Make tool_id nullable (required for custom tools)
-- First, ensure all existing rows have tool_type = 'catalog'
UPDATE project_tools SET tool_type = 'catalog' WHERE tool_type IS NULL;

-- Now make tool_id nullable
ALTER TABLE project_tools 
  ALTER COLUMN tool_id DROP NOT NULL;

-- Update unique constraint to handle both types
-- Remove old constraint (PostgreSQL auto-generates constraint names)
DO $$ 
DECLARE
  constraint_name TEXT;
BEGIN
  -- Find the unique constraint on (project_id, tool_id)
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'project_tools'::regclass
    AND contype = 'u'
    AND array_length(conkey, 1) = 2
    AND (
      SELECT array_agg(attname ORDER BY attnum) 
      FROM pg_attribute 
      WHERE attrelid = conrelid 
      AND attnum = ANY(conkey)
    ) = ARRAY['project_id', 'tool_id'];
  
  -- Drop the constraint if found
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE project_tools DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END IF;
END $$;

-- Add new constraint: prevent duplicate catalog tools per project
ALTER TABLE project_tools 
  ADD CONSTRAINT unique_project_catalog_tool 
  UNIQUE (project_id, tool_id) 
  WHERE tool_id IS NOT NULL;

-- Add constraint: prevent duplicate custom tools per project
ALTER TABLE project_tools 
  ADD CONSTRAINT unique_project_custom_tool 
  UNIQUE (project_id, custom_tool_id) 
  WHERE custom_tool_id IS NOT NULL;

-- Add constraint: ensure exactly one of tool_id or custom_tool_id is set
ALTER TABLE project_tools 
  ADD CONSTRAINT check_tool_reference 
  CHECK (
    (tool_type = 'catalog' AND tool_id IS NOT NULL AND custom_tool_id IS NULL) OR
    (tool_type = 'custom' AND tool_id IS NULL AND custom_tool_id IS NOT NULL)
  );

-- Create index for custom_tool_id
CREATE INDEX IF NOT EXISTS idx_project_tools_custom_tool_id ON project_tools(custom_tool_id);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_project_tools_project_order ON project_tools(project_id, "order");

-- Set order for existing tools based on created_at
UPDATE project_tools 
SET "order" = subquery.row_number - 1
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY created_at ASC) as row_number
  FROM project_tools
) AS subquery
WHERE project_tools.id = subquery.id;

-- ============================================================================
-- 3. ROW LEVEL SECURITY FOR CUSTOM_TOOLS
-- ============================================================================
ALTER TABLE custom_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own custom tools
DROP POLICY IF EXISTS "Users can view their own custom tools" ON custom_tools;
CREATE POLICY "Users can view their own custom tools"
  ON custom_tools
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Users can insert their own custom tools
DROP POLICY IF EXISTS "Users can insert their own custom tools" ON custom_tools;
CREATE POLICY "Users can insert their own custom tools"
  ON custom_tools
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can update their own custom tools
DROP POLICY IF EXISTS "Users can update their own custom tools" ON custom_tools;
CREATE POLICY "Users can update their own custom tools"
  ON custom_tools
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can delete their own custom tools
DROP POLICY IF EXISTS "Users can delete their own custom tools" ON custom_tools;
CREATE POLICY "Users can delete their own custom tools"
  ON custom_tools
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Admins can manage all custom tools
DROP POLICY IF EXISTS "Admins can manage all custom tools" ON custom_tools;
CREATE POLICY "Admins can manage all custom tools"
  ON custom_tools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 4. UPDATE PROJECT_TOOLS RLS POLICIES
-- ============================================================================
-- Update existing policies to handle custom tools
-- The existing policies should work, but we need to ensure they handle custom_tool_id

-- RLS Policy: Students can update project_tools for their own projects (for reordering)
DROP POLICY IF EXISTS "Students can update project_tools for own projects" ON project_tools;
CREATE POLICY "Students can update project_tools for own projects"
  ON project_tools
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      JOIN student_profiles sp ON sp.id = pp.student_profile_id
      JOIN profiles p ON p.id = sp.profile_id
      WHERE pp.id = project_tools.project_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      JOIN student_profiles sp ON sp.id = pp.student_profile_id
      JOIN profiles p ON p.id = sp.profile_id
      WHERE pp.id = project_tools.project_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE custom_tools IS 'User-defined custom tools that can be added to projects and optionally saved for reuse';
COMMENT ON COLUMN custom_tools.user_id IS 'Owner of the custom tool';
COMMENT ON COLUMN custom_tools.name IS 'Tool name (required, max 255 chars)';
COMMENT ON COLUMN custom_tools.category IS 'Tool category: Framework, Language, Library, Platform, Cloud, Database, Tooling, Other';
COMMENT ON COLUMN custom_tools.version IS 'Optional version string';
COMMENT ON COLUMN custom_tools.url IS 'Optional URL to tool website/docs';
COMMENT ON COLUMN custom_tools.notes IS 'Optional notes about the tool';

COMMENT ON COLUMN project_tools.tool_type IS 'Type of tool: catalog (from tools table) or custom (from custom_tools table)';
COMMENT ON COLUMN project_tools.custom_tool_id IS 'References custom_tools.id when tool_type = custom';
COMMENT ON COLUMN project_tools."order" IS 'Display order of tool within the project (0-based)';
