-- Create project_tools table
-- Links tools to portfolio projects so students can track which tools they use for which projects
-- This enables "Tool Stack" feature: "This project uses Supabase + OpenAI"

-- Create project_tools table
CREATE TABLE IF NOT EXISTS project_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(project_id, tool_id) -- Prevent duplicate links
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_project_tools_project_id ON project_tools(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tools_tool_id ON project_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_project_tools_created_at ON project_tools(created_at DESC);

-- Enable Row Level Security
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

-- Comments for documentation
COMMENT ON TABLE project_tools IS 'Links tools to portfolio projects. Enables "Tool Stack" feature where students can track which tools they use in each project.';
COMMENT ON COLUMN project_tools.tool_id IS 'References tools.id - the tool used in this project';
COMMENT ON COLUMN project_tools.project_id IS 'References portfolio_projects.id - the project using this tool';
