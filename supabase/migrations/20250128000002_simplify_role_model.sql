-- Phase 0: Simplify role model to student, recruiter, admin only
-- Remove tutor/instructor roles and migrate existing users to admin
-- Update all RLS policies and functions to use simplified roles

-- ============================================
-- Step 1: Migrate existing tutor/instructor roles to admin
-- ============================================
UPDATE profiles
SET role = 'admin'
WHERE role IN ('tutor', 'instructor');

-- ============================================
-- Step 2: Remove instructor-related functions
-- ============================================
DROP FUNCTION IF EXISTS is_instructor(UUID) CASCADE;

-- ============================================
-- Step 3: Update RLS policies - Remove instructor/tutor references
-- ============================================

-- Remove instructor policies from student_profiles
DROP POLICY IF EXISTS "Instructors can read student profiles" ON student_profiles;
DROP POLICY IF EXISTS "Tutors can read student profiles" ON student_profiles;

-- Remove instructor policies from portfolio_projects
DROP POLICY IF EXISTS "Tutors can read portfolio projects" ON portfolio_projects;
DROP POLICY IF EXISTS "Instructors cannot read private portfolio projects" ON portfolio_projects;

-- Remove instructor policies from questions
DROP POLICY IF EXISTS "Tutors can read all questions" ON questions;
DROP POLICY IF EXISTS "Instructors can read all questions" ON questions;

-- Remove instructor policies from answers
DROP POLICY IF EXISTS "Students and tutors can create answers" ON answers;
DROP POLICY IF EXISTS "Students and instructors can create answers" ON answers;
DROP POLICY IF EXISTS "Tutors can mark answers as accepted" ON answers;
DROP POLICY IF EXISTS "Instructors can mark answers as accepted" ON answers;

-- Recreate simplified answer policies (students and admins only)
-- Note: This replaces the policy that allowed students and instructors to create answers
DROP POLICY IF EXISTS "Students and admins can create answers" ON answers;
CREATE POLICY "Students and admins can create answers"
  ON answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = answers.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role IN ('student', 'admin')
    )
  );

-- Admins can mark answers as accepted
DROP POLICY IF EXISTS "Admins can mark answers as accepted" ON answers;
CREATE POLICY "Admins can mark answers as accepted"
  ON answers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = answers.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    -- Body must remain unchanged (admins cannot edit answer content)
    body = OLD.body
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = answers.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- Step 4: Update storage bucket policies
-- ============================================

-- Update course-images bucket policies to use admin instead of instructor
DROP POLICY IF EXISTS "Admins can upload course images" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Admins can upload course images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = ''course-images'' AND
      EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = ''admin''
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DROP POLICY IF EXISTS "Admins can delete course images" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Admins can delete course images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = ''course-images'' AND
      EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = ''admin''
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================
-- Step 5: Add comment documenting simplified role model
-- ============================================
COMMENT ON TYPE user_role IS 'User roles: student, recruiter, admin. Tutor and instructor are deprecated and migrated to admin.';
