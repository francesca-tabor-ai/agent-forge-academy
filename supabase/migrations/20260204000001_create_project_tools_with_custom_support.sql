-- Create project_tools table with custom tools support
-- This migration creates the project_tools table and adds support for both catalog and custom tools
-- Links tools to portfolio projects so students can track which tools they use for which projects
-- This enables "Tool Stack" feature: "This project uses Supabase + OpenAI"

-- ============================================================================
-- 1. CREATE PROJECT_TOOLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  tool_id UUID NULL REFERENCES tools(id) ON DELETE SET NULL,
  tool_type VARCHAR(20) DEFAULT 'catalog' CHECK (tool_type IN ('catalog', 'custom')),
  custom_tool_id UUID NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_project_tools_project_id ON project_tools(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tools_tool_id ON project_tools(tool_id) WHERE tool_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_tools_created_at ON project_tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_tools_project_order ON project_tools(project_id, "order");

-- Unique constraints: prevent duplicate catalog tools per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_tools_unique_catalog 
  ON project_tools(project_id, tool_id) 
  WHERE tool_id IS NOT NULL;

-- ============================================================================
-- 2. CREATE CUSTOM_TOOLS TABLE
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

-- Create trigger to update updated_at (if function exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    DROP TRIGGER IF EXISTS update_custom_tools_updated_at ON custom_tools;
    CREATE TRIGGER update_custom_tools_updated_at
      BEFORE UPDATE ON custom_tools
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- 3. ADD FOREIGN KEY FOR CUSTOM_TOOL_ID
-- ============================================================================
-- Add foreign key constraint for custom_tool_id (must be done after custom_tools table exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'project_tools'::regclass 
    AND conname = 'project_tools_custom_tool_id_fkey'
  ) THEN
    ALTER TABLE project_tools 
      ADD CONSTRAINT project_tools_custom_tool_id_fkey
      FOREIGN KEY (custom_tool_id) REFERENCES custom_tools(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for custom_tool_id
CREATE INDEX IF NOT EXISTS idx_project_tools_custom_tool_id ON project_tools(custom_tool_id) WHERE custom_tool_id IS NOT NULL;

-- Add unique index: prevent duplicate custom tools per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_tools_unique_custom 
  ON project_tools(project_id, custom_tool_id) 
  WHERE custom_tool_id IS NOT NULL;

-- Add constraint: ensure exactly one of tool_id or custom_tool_id is set
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'project_tools'::regclass 
    AND conname = 'check_tool_reference'
  ) THEN
    ALTER TABLE project_tools 
      ADD CONSTRAINT check_tool_reference 
      CHECK (
        (tool_type = 'catalog' AND tool_id IS NOT NULL AND custom_tool_id IS NULL) OR
        (tool_type = 'custom' AND tool_id IS NULL AND custom_tool_id IS NOT NULL)
      );
  END IF;
END $$;

-- ============================================================================
-- 4. ROW LEVEL SECURITY FOR PROJECT_TOOLS
-- ============================================================================
ALTER TABLE project_tools ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can read project_tools for their own projects
DROP POLICY IF EXISTS "Students can read project_tools for own projects" ON project_tools;
CREATE POLICY "Students can read project_tools for own projects"
  ON project_tools
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      JOIN student_profiles sp ON sp.id = pp.student_profile_id
      JOIN profiles p ON p.id = sp.profile_id
      WHERE pp.id = project_tools.project_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policy: Students can insert project_tools for their own projects
DROP POLICY IF EXISTS "Students can insert project_tools for own projects" ON project_tools;
CREATE POLICY "Students can insert project_tools for own projects"
  ON project_tools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      JOIN student_profiles sp ON sp.id = pp.student_profile_id
      JOIN profiles p ON p.id = sp.profile_id
      WHERE pp.id = project_tools.project_id
      AND p.user_id = auth.uid()
    )
  );

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

-- RLS Policy: Students can delete project_tools for their own projects
DROP POLICY IF EXISTS "Students can delete project_tools for own projects" ON project_tools;
CREATE POLICY "Students can delete project_tools for own projects"
  ON project_tools
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      JOIN student_profiles sp ON sp.id = pp.student_profile_id
      JOIN profiles p ON p.id = sp.profile_id
      WHERE pp.id = project_tools.project_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can manage all project_tools
DROP POLICY IF EXISTS "Admins can manage all project_tools" ON project_tools;
CREATE POLICY "Admins can manage all project_tools"
  ON project_tools
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
-- 5. ROW LEVEL SECURITY FOR CUSTOM_TOOLS
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
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE project_tools IS 'Links tools to portfolio projects. Enables "Tool Stack" feature where students can track which tools they use in each project. Supports both catalog tools (from tools table) and custom tools (from custom_tools table).';
COMMENT ON COLUMN project_tools.tool_id IS 'References tools.id - the catalog tool used in this project (when tool_type = catalog)';
COMMENT ON COLUMN project_tools.project_id IS 'References portfolio_projects.id - the project using this tool';
COMMENT ON COLUMN project_tools.tool_type IS 'Type of tool: catalog (from tools table) or custom (from custom_tools table)';
COMMENT ON COLUMN project_tools.custom_tool_id IS 'References custom_tools.id when tool_type = custom';
COMMENT ON COLUMN project_tools."order" IS 'Display order of tool within the project (0-based)';

COMMENT ON TABLE custom_tools IS 'User-defined custom tools that can be added to projects and optionally saved for reuse';
COMMENT ON COLUMN custom_tools.user_id IS 'Owner of the custom tool';
COMMENT ON COLUMN custom_tools.name IS 'Tool name (required, max 255 chars)';
COMMENT ON COLUMN custom_tools.category IS 'Tool category: Framework, Language, Library, Platform, Cloud, Database, Tooling, Other';
COMMENT ON COLUMN custom_tools.version IS 'Optional version string';
COMMENT ON COLUMN custom_tools.url IS 'Optional URL to tool website/docs';
COMMENT ON COLUMN custom_tools.notes IS 'Optional notes about the tool';
