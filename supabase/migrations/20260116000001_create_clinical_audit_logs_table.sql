-- Create clinical_audit_logs table
-- Stores audit log entries for Clinical AI Sandbox tool
-- Allows students to track their interactions with the tool

CREATE TABLE IF NOT EXISTS clinical_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  tool_id VARCHAR(100) NOT NULL DEFAULT 'clinical-ai-sandbox',
  entry JSONB NOT NULL, -- Full audit log entry (module, input, decision, reasons, escalation, metadata)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clinical_audit_logs_student_profile_id ON clinical_audit_logs(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_clinical_audit_logs_tool_id ON clinical_audit_logs(tool_id);
CREATE INDEX IF NOT EXISTS idx_clinical_audit_logs_created_at ON clinical_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clinical_audit_logs_student_tool_date ON clinical_audit_logs(student_profile_id, tool_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE clinical_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can insert their own audit logs
DROP POLICY IF EXISTS "Students can insert their own clinical audit logs" ON clinical_audit_logs;
CREATE POLICY "Students can insert their own clinical audit logs"
  ON clinical_audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = clinical_audit_logs.student_profile_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = student_profiles.profile_id
        AND profiles.user_id = auth.uid()
      )
    )
  );

-- RLS Policy: Students can view their own audit logs
DROP POLICY IF EXISTS "Students can view their own clinical audit logs" ON clinical_audit_logs;
CREATE POLICY "Students can view their own clinical audit logs"
  ON clinical_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      WHERE student_profiles.id = clinical_audit_logs.student_profile_id
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = student_profiles.profile_id
        AND profiles.user_id = auth.uid()
      )
    )
  );

-- RLS Policy: Admins can view all audit logs
DROP POLICY IF EXISTS "Admins can view all clinical audit logs" ON clinical_audit_logs;
CREATE POLICY "Admins can view all clinical audit logs"
  ON clinical_audit_logs
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
COMMENT ON TABLE clinical_audit_logs IS 'Stores audit log entries for Clinical AI Sandbox tool, allowing students to track their interactions';
COMMENT ON COLUMN clinical_audit_logs.tool_id IS 'Identifier for the tool (default: clinical-ai-sandbox)';
COMMENT ON COLUMN clinical_audit_logs.entry IS 'Full audit log entry stored as JSONB (module, input, decision, reasons, escalation, metadata)';
