-- Row Level Security policies for student_profiles table
-- Extends the profiles RLS with visibility-based access

-- Policy: Students can read their own profile (idempotent)
DROP POLICY IF EXISTS "Students can read own profile" ON student_profiles;
CREATE POLICY "Students can read own profile"
  ON student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = student_profiles.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy: Students can update their own profile (idempotent)
DROP POLICY IF EXISTS "Students can update own profile" ON student_profiles;
CREATE POLICY "Students can update own profile"
  ON student_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = student_profiles.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy: Students can insert their own profile (idempotent)
DROP POLICY IF EXISTS "Students can insert own profile" ON student_profiles;
CREATE POLICY "Students can insert own profile"
  ON student_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = student_profiles.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'student'
    )
  );

-- Policy: Recruiters can read student profiles where visibility != 'private' (idempotent)
DROP POLICY IF EXISTS "Recruiters can read non-private student profiles" ON student_profiles;
CREATE POLICY "Recruiters can read non-private student profiles"
  ON student_profiles
  FOR SELECT
  USING (
    visibility != 'private'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = student_profiles.profile_id
      AND profiles.role = 'student'
    )
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'recruiter'
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy: Tutors can read student profiles (but not recruiter-only fields) (idempotent)
-- Note: Recruiter-only fields would be filtered at application level
DROP POLICY IF EXISTS "Tutors can read student profiles" ON student_profiles;
CREATE POLICY "Tutors can read student profiles"
  ON student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'tutor'
      AND profiles.user_id = auth.uid()
    )
  );

-- Policy: Admins can read all student profiles (idempotent)
DROP POLICY IF EXISTS "Admins can read all student profiles" ON student_profiles;
CREATE POLICY "Admins can read all student profiles"
  ON student_profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

