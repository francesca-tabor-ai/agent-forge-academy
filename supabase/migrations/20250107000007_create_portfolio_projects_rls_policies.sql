-- Row Level Security policies for portfolio_projects table
-- Rules:
-- - Students can CRUD their own portfolio projects
-- - Recruiters can read projects only if the student's visibility allows it
-- - Unauthenticated users cannot access portfolios
-- - Do not allow implicit access

-- Policy: Students can read their own portfolio projects
CREATE POLICY "Students can read own portfolio projects"
  ON portfolio_projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = portfolio_projects.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy: Students can insert their own portfolio projects
CREATE POLICY "Students can insert own portfolio projects"
  ON portfolio_projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = portfolio_projects.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy: Students can update their own portfolio projects
CREATE POLICY "Students can update own portfolio projects"
  ON portfolio_projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = portfolio_projects.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy: Students can delete their own portfolio projects
CREATE POLICY "Students can delete own portfolio projects"
  ON portfolio_projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = portfolio_projects.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy: Recruiters can read projects if student visibility allows
-- Checks both project visibility and student profile visibility
CREATE POLICY "Recruiters can read visible portfolio projects"
  ON portfolio_projects
  FOR SELECT
  USING (
    -- Requester must be a recruiter
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'recruiter'
      AND profiles.user_id = auth.uid()
    )
    AND (
      -- Project visibility allows recruiters
      portfolio_projects.visibility = 'recruiters_only'
      OR portfolio_projects.visibility = 'public'
    )
    AND (
      -- Student profile visibility allows recruiters
      EXISTS (
        SELECT 1 FROM student_profiles
        WHERE student_profiles.id = portfolio_projects.student_profile_id
        AND student_profiles.visibility != 'private'
      )
    )
  );

-- Policy: Tutors can read portfolio projects (for educational purposes)
CREATE POLICY "Tutors can read portfolio projects"
  ON portfolio_projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'tutor'
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy: Admins can read all portfolio projects
CREATE POLICY "Admins can read all portfolio projects"
  ON portfolio_projects
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Note: No policy for unauthenticated users = they cannot access portfolios
-- This is the default behavior when RLS is enabled and no policies match

