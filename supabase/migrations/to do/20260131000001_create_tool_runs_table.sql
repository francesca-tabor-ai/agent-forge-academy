-- Create tool_runs table
-- Stores simulation runs for GTM Control Tower and other tools
-- Allows students to track their tool usage and results

CREATE TABLE IF NOT EXISTS tool_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  tool_id VARCHAR(100) NOT NULL, -- e.g., 'gtm-control-tower'
  inputs JSONB DEFAULT '{}'::jsonb, -- Event + settings used as input
  outputs JSONB DEFAULT '{}'::jsonb, -- Actions + failures + metrics snapshot
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tool_runs_student_profile_id ON tool_runs(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_tool_runs_tool_id ON tool_runs(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_runs_created_at ON tool_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_runs_student_tool_date ON tool_runs(student_profile_id, tool_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE tool_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can insert their own runs
DROP POLICY IF EXISTS "Students can insert their own tool runs" ON tool_runs;
CREATE POLICY "Students can insert their own tool runs"
  ON tool_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = tool_runs.student_profile_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = student_profiles.profile_id
        AND profiles.user_id = auth.uid()
      )
    )
  );

-- RLS Policy: Students can view their own runs
DROP POLICY IF EXISTS "Students can view their own tool runs" ON tool_runs;
CREATE POLICY "Students can view their own tool runs"
  ON tool_runs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = tool_runs.student_profile_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = student_profiles.profile_id
        AND profiles.user_id = auth.uid()
      )
    )
  );

-- RLS Policy: Admins can view all runs
DROP POLICY IF EXISTS "Admins can view all tool runs" ON tool_runs;
CREATE POLICY "Admins can view all tool runs"
  ON tool_runs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Comments for documentation
COMMENT ON TABLE tool_runs IS 'Stores simulation runs for tools like GTM Control Tower, allowing students to track their tool usage and results';
COMMENT ON COLUMN tool_runs.tool_id IS 'Identifier for the tool (e.g., gtm-control-tower)';
COMMENT ON COLUMN tool_runs.inputs IS 'Input data for the run (event + settings) stored as JSONB';
COMMENT ON COLUMN tool_runs.outputs IS 'Output data from the run (actions + failures + metrics) stored as JSONB';
