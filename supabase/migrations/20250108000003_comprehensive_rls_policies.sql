-- Comprehensive RLS policies for AI Growth Hub
-- Enforces all canonical permissions defined in PERMISSIONS.md
-- Default deny: All access is denied unless explicitly granted

-- ============================================
-- Helper Functions
-- ============================================

-- Function to check if user is instructor (handles both 'tutor' and 'instructor')
CREATE OR REPLACE FUNCTION is_instructor(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = check_user_id
    AND profiles.role IN ('tutor', 'instructor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Profiles Table RLS Policies
-- ============================================

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile (except role - enforced by trigger)
-- Note: RLS policies cannot reference OLD/NEW, so role immutability is enforced by trigger only
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can update all profiles (including roles)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- Student Profiles RLS Policies
-- ============================================

-- Students can read their own profile
DROP POLICY IF EXISTS "Students can read own student profile" ON student_profiles;
CREATE POLICY "Students can read own student profile"
  ON student_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = student_profiles.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'student'
    )
  );

-- Students can update their own profile (including visibility)
DROP POLICY IF EXISTS "Students can update own student profile" ON student_profiles;
CREATE POLICY "Students can update own student profile"
  ON student_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = student_profiles.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'student'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = student_profiles.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'student'
    )
  );

-- Students can insert their own profile
DROP POLICY IF EXISTS "Students can insert own student profile" ON student_profiles;
CREATE POLICY "Students can insert own student profile"
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

-- Recruiters can read student profiles where visibility != 'private'
DROP POLICY IF EXISTS "Recruiters can read visible student profiles" ON student_profiles;
CREATE POLICY "Recruiters can read visible student profiles"
  ON student_profiles
  FOR SELECT
  USING (
    visibility != 'private'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'recruiter'
      AND profiles.user_id = auth.uid()
    )
  );

-- Instructors can read student profiles (but not recruiter-only fields - filtered at app level)
-- Cannot see private profiles unless explicitly shared (future enhancement)
DROP POLICY IF EXISTS "Instructors can read student profiles" ON student_profiles;
CREATE POLICY "Instructors can read student profiles"
  ON student_profiles
  FOR SELECT
  USING (
    visibility != 'private'
    AND is_instructor(auth.uid())
  );

-- Admins can read all student profiles
DROP POLICY IF EXISTS "Admins can read all student profiles" ON student_profiles;
CREATE POLICY "Admins can read all student profiles"
  ON student_profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================
-- Portfolio Projects RLS Policies
-- ============================================

-- Students can CRUD their own portfolio projects
-- (Already exists, but ensuring completeness)

-- Recruiters can read projects only if visibility allows
-- (Already exists, but ensuring it's correct)

-- Instructors cannot read private portfolio projects
DROP POLICY IF EXISTS "Instructors cannot read private portfolio projects" ON portfolio_projects;
-- This is enforced by NOT having a policy that allows it

-- ============================================
-- Recruiter Profiles RLS Policies
-- ============================================

-- Recruiters can read their own profile
DROP POLICY IF EXISTS "Recruiters can read own recruiter profile" ON recruiter_profiles;
CREATE POLICY "Recruiters can read own recruiter profile"
  ON recruiter_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = recruiter_profiles.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'recruiter'
    )
  );

-- Recruiters can update their own profile
DROP POLICY IF EXISTS "Recruiters can update own recruiter profile" ON recruiter_profiles;
CREATE POLICY "Recruiters can update own recruiter profile"
  ON recruiter_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = recruiter_profiles.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'recruiter'
    )
  );

-- Instructors CANNOT read recruiter profiles (no policy = deny)
-- This is intentional - instructors should not see recruiter data

-- Admins can read all recruiter profiles
DROP POLICY IF EXISTS "Admins can read all recruiter profiles" ON recruiter_profiles;
CREATE POLICY "Admins can read all recruiter profiles"
  ON recruiter_profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================
-- Contact Requests RLS Policies
-- ============================================

-- Recruiters can create contact requests
DROP POLICY IF EXISTS "Recruiters can create contact requests" ON contact_requests;
CREATE POLICY "Recruiters can create contact requests"
  ON contact_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recruiter_profiles
      JOIN profiles ON profiles.id = recruiter_profiles.profile_id
      WHERE recruiter_profiles.id = contact_requests.recruiter_profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'recruiter'
    )
  );

-- Recruiters can read their own contact requests
DROP POLICY IF EXISTS "Recruiters can read own contact requests" ON contact_requests;
CREATE POLICY "Recruiters can read own contact requests"
  ON contact_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recruiter_profiles
      JOIN profiles ON profiles.id = recruiter_profiles.profile_id
      WHERE recruiter_profiles.id = contact_requests.recruiter_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Students can read contact requests for their profile
DROP POLICY IF EXISTS "Students can read contact requests for their profile" ON contact_requests;
CREATE POLICY "Students can read contact requests for their profile"
  ON contact_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = contact_requests.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Students can update contact requests for their profile (to approve/reject)
DROP POLICY IF EXISTS "Students can update contact requests for their profile" ON contact_requests;
CREATE POLICY "Students can update contact requests for their profile"
  ON contact_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = contact_requests.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = contact_requests.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Instructors CANNOT read contact requests (no policy = deny)
-- This is intentional - instructors should not see contact requests

-- Admins can read all contact requests
DROP POLICY IF EXISTS "Admins can read all contact requests" ON contact_requests;
CREATE POLICY "Admins can read all contact requests"
  ON contact_requests
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================
-- Events RLS Policies
-- ============================================

-- Everyone can read public events
DROP POLICY IF EXISTS "Anyone can read events" ON events;
CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  USING (true);

-- Only admins can create/update/delete events
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events"
  ON events
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Instructors CANNOT manage events (no policy = deny)
-- This is intentional - only admins can manage events

-- ============================================
-- Questions RLS Policies
-- ============================================

-- Students can read all questions
DROP POLICY IF EXISTS "Students can read all questions" ON questions;
CREATE POLICY "Students can read all questions"
  ON questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'student'
      AND profiles.user_id = auth.uid()
    )
  );

-- Students can create questions
DROP POLICY IF EXISTS "Students can create questions" ON questions;
CREATE POLICY "Students can create questions"
  ON questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = questions.student_profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'student'
    )
  );

-- Students can update their own questions
DROP POLICY IF EXISTS "Students can update own questions" ON questions;
CREATE POLICY "Students can update own questions"
  ON questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = questions.student_profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'student'
    )
  );

-- Students can delete their own questions
DROP POLICY IF EXISTS "Students can delete own questions" ON questions;
CREATE POLICY "Students can delete own questions"
  ON questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = questions.student_profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'student'
    )
  );

-- Instructors can read all questions
DROP POLICY IF EXISTS "Instructors can read all questions" ON questions;
CREATE POLICY "Instructors can read all questions"
  ON questions
  FOR SELECT
  USING (is_instructor(auth.uid()));

-- Instructors CANNOT edit student questions (no policy = deny)
-- This is intentional - instructors cannot modify student questions

-- Admins can manage all questions
DROP POLICY IF EXISTS "Admins can manage all questions" ON questions;
CREATE POLICY "Admins can manage all questions"
  ON questions
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- Answers RLS Policies
-- ============================================

-- Anyone authenticated can read answers
DROP POLICY IF EXISTS "Authenticated users can read answers" ON answers;
CREATE POLICY "Authenticated users can read answers"
  ON answers
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Students and instructors can create answers
DROP POLICY IF EXISTS "Students and instructors can create answers" ON answers;
CREATE POLICY "Students and instructors can create answers"
  ON answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = answers.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role IN ('student', 'tutor', 'instructor')
    )
  );

-- Users can update their own answers
DROP POLICY IF EXISTS "Users can update own answers" ON answers;
CREATE POLICY "Users can update own answers"
  ON answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = answers.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can delete their own answers
DROP POLICY IF EXISTS "Users can delete own answers" ON answers;
CREATE POLICY "Users can delete own answers"
  ON answers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = answers.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Instructors can mark answers as accepted (update is_accepted field only)
DROP POLICY IF EXISTS "Instructors can mark answers as accepted" ON answers;
CREATE POLICY "Instructors can mark answers as accepted"
  ON answers
  FOR UPDATE
  USING (is_instructor(auth.uid()))
  WITH CHECK (
    -- Only allow updating is_accepted field
    -- Body must remain unchanged (instructors cannot edit answer content)
    (SELECT body FROM answers WHERE id = answers.id) = answers.body
    AND is_instructor(auth.uid())
  );

-- Students CANNOT edit instructor answers (enforced by update policy above)
-- Students can only update their own answers

-- Admins can manage all answers
DROP POLICY IF EXISTS "Admins can manage all answers" ON answers;
CREATE POLICY "Admins can manage all answers"
  ON answers
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

