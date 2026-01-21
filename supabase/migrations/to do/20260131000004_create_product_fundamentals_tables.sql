-- Create Product Fundamentals Playground tables
-- Tables: pm_cases, pm_case_audit
-- RLS: Students can read/write own cases, recruiters can read if student opted-in

BEGIN;

-- Create pm_cases table
CREATE TABLE IF NOT EXISTS pm_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility visibility_level NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pm_case_audit table (append-only)
CREATE TABLE IF NOT EXISTS pm_case_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pm_case_id UUID NOT NULL REFERENCES pm_cases(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event JSONB NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pm_cases_student_profile_id ON pm_cases(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_pm_cases_visibility ON pm_cases(visibility);
CREATE INDEX IF NOT EXISTS idx_pm_cases_created_at ON pm_cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pm_case_audit_pm_case_id ON pm_case_audit(pm_case_id);
CREATE INDEX IF NOT EXISTS idx_pm_case_audit_student_profile_id ON pm_case_audit(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_pm_case_audit_created_at ON pm_case_audit(created_at DESC);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_pm_cases_updated_at ON pm_cases;
CREATE TRIGGER update_pm_cases_updated_at
  BEFORE UPDATE ON pm_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE pm_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pm_case_audit ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for pm_cases
-- ============================================

-- Students can read their own cases
DROP POLICY IF EXISTS "Students can read own pm cases" ON pm_cases;
CREATE POLICY "Students can read own pm cases"
  ON pm_cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pm_cases.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own cases
DROP POLICY IF EXISTS "Students can insert own pm cases" ON pm_cases;
CREATE POLICY "Students can insert own pm cases"
  ON pm_cases
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pm_cases.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can update their own cases
DROP POLICY IF EXISTS "Students can update own pm cases" ON pm_cases;
CREATE POLICY "Students can update own pm cases"
  ON pm_cases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pm_cases.student_profile_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pm_cases.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can delete their own cases
DROP POLICY IF EXISTS "Students can delete own pm cases" ON pm_cases;
CREATE POLICY "Students can delete own pm cases"
  ON pm_cases
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pm_cases.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Recruiters can read cases if student opted-in (visibility != 'private')
-- AND student profile visibility allows recruiters
DROP POLICY IF EXISTS "Recruiters can read visible pm cases" ON pm_cases;
CREATE POLICY "Recruiters can read visible pm cases"
  ON pm_cases
  FOR SELECT
  USING (
    -- Requester must be a recruiter
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'recruiter'
      AND profiles.user_id = auth.uid()
    )
    AND (
      -- Case visibility allows recruiters
      pm_cases.visibility = 'recruiters_only'
      OR pm_cases.visibility = 'public'
    )
    AND (
      -- Student profile visibility allows recruiters
      EXISTS (
        SELECT 1 FROM student_profiles
        WHERE student_profiles.id = pm_cases.student_profile_id
        AND student_profiles.visibility != 'private'
      )
    )
  );

-- Admins can read all cases
DROP POLICY IF EXISTS "Admins can read all pm cases" ON pm_cases;
CREATE POLICY "Admins can read all pm cases"
  ON pm_cases
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS Policies for pm_case_audit (append-only)
-- ============================================

-- Students can read audit logs for their own cases
DROP POLICY IF EXISTS "Students can read own pm case audit" ON pm_case_audit;
CREATE POLICY "Students can read own pm case audit"
  ON pm_case_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pm_case_audit.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert audit events for their own cases
DROP POLICY IF EXISTS "Students can insert own pm case audit" ON pm_case_audit;
CREATE POLICY "Students can insert own pm case audit"
  ON pm_case_audit
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pm_case_audit.student_profile_id
      AND p.user_id = auth.uid()
    )
    -- Ensure the case belongs to the student
    AND EXISTS (
      SELECT 1 FROM pm_cases
      WHERE pm_cases.id = pm_case_audit.pm_case_id
      AND pm_cases.student_profile_id = pm_case_audit.student_profile_id
    )
  );

-- Recruiters can read audit logs for visible cases (same visibility rules as cases)
DROP POLICY IF EXISTS "Recruiters can read visible pm case audit" ON pm_case_audit;
CREATE POLICY "Recruiters can read visible pm case audit"
  ON pm_case_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'recruiter'
      AND profiles.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM pm_cases
      WHERE pm_cases.id = pm_case_audit.pm_case_id
      AND (
        pm_cases.visibility = 'recruiters_only'
        OR pm_cases.visibility = 'public'
      )
      AND EXISTS (
        SELECT 1 FROM student_profiles
        WHERE student_profiles.id = pm_cases.student_profile_id
        AND student_profiles.visibility != 'private'
      )
    )
  );

-- Admins can read all audit logs
DROP POLICY IF EXISTS "Admins can read all pm case audit" ON pm_case_audit;
CREATE POLICY "Admins can read all pm case audit"
  ON pm_case_audit
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Note: No UPDATE or DELETE policies for pm_case_audit - it's append-only

COMMIT;
