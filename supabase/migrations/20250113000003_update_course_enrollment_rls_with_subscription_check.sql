-- Update course enrollment RLS policies to enforce subscription access
-- Students can only enroll in courses they have subscription access to

-- Drop existing enrollment policy
DROP POLICY IF EXISTS "Students can enroll in published courses" ON course_enrollments;

-- Create new enrollment policy with subscription check
CREATE POLICY "Students can enroll in published courses with subscription"
  ON course_enrollments
  FOR INSERT
  WITH CHECK (
    -- User must be a student
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = course_enrollments.student_profile_id
      AND p.user_id = auth.uid()
    )
    -- Course must be published
    AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_enrollments.course_id
      AND c.is_published = true
    )
    -- User must have subscription access to the course
    AND has_course_access(auth.uid(), course_enrollments.course_id)
  );
