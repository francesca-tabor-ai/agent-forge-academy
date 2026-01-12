-- Enforce subscription-based course enrollment
-- Approach: RLS policy (primary) + convenience function (optional)
-- Users can only enroll in courses they're entitled to via their subscription tier

BEGIN;

-- ============================================================================
-- OPTION A: RLS Policy (Primary Enforcement)
-- ============================================================================
-- This is the recommended Supabase pattern - automatically enforced at DB level
-- Works with any client (PostgREST, direct SQL, etc.)

-- Drop existing enrollment policy if it exists
DROP POLICY IF EXISTS "Students can enroll in published courses with subscription" ON course_enrollments;
DROP POLICY IF EXISTS "Students can enroll in published courses" ON course_enrollments;

-- Create improved RLS policy that enforces subscription access
-- This policy uses the has_course_access() function which checks:
-- 1. User has active subscription
-- 2. Course is published
-- 3. Tier has all_access OR course is in subscription_tier_courses
CREATE POLICY "Students can enroll only in courses with subscription access"
  ON course_enrollments
  FOR INSERT
  WITH CHECK (
    -- User must be the student themselves
    EXISTS (
      SELECT 1 
      FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = course_enrollments.student_profile_id
      AND p.user_id = auth.uid()
    )
    -- Course must be published
    AND EXISTS (
      SELECT 1 
      FROM courses c
      WHERE c.id = course_enrollments.course_id
      AND c.is_published = true
    )
    -- User must have subscription access to the course
    -- This is the key enforcement: checks active subscription + tier entitlements
    AND has_course_access(auth.uid(), course_enrollments.course_id)
  );

-- ============================================================================
-- OPTION B: Convenience Function (Optional, but recommended)
-- ============================================================================
-- Provides a clean API for the app to call
-- Still subject to RLS enforcement, but provides better error messages
-- and can include additional logic (logging, notifications, etc.)

-- Drop function if it exists (for idempotency)
DROP FUNCTION IF EXISTS public.enroll_in_course(UUID);

-- Create enrollment function with subscription check
CREATE OR REPLACE FUNCTION public.enroll_in_course(
  p_course_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_student_profile_id UUID;
  v_course_slug TEXT;
  v_course_title TEXT;
  v_has_access BOOLEAN;
  v_enrollment_exists BOOLEAN;
  v_result JSONB;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;

  -- Get student profile ID
  SELECT sp.id INTO v_student_profile_id
  FROM student_profiles sp
  JOIN profiles p ON p.id = sp.profile_id
  WHERE p.user_id = v_user_id
  LIMIT 1;

  IF v_student_profile_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Student profile not found'
    );
  END IF;

  -- Get course info
  SELECT slug, title INTO v_course_slug, v_course_title
  FROM courses
  WHERE id = p_course_id;

  IF v_course_slug IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Course not found'
    );
  END IF;

  -- Check if course is published
  IF NOT EXISTS (
    SELECT 1 FROM courses WHERE id = p_course_id AND is_published = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Course is not available for enrollment'
    );
  END IF;

  -- Check subscription access (this is the key enforcement)
  SELECT has_course_access(v_user_id, p_course_id) INTO v_has_access;

  IF NOT v_has_access THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Course access denied. Please upgrade your subscription to access this course.',
      'requires_subscription', true,
      'course_id', p_course_id,
      'course_slug', v_course_slug
    );
  END IF;

  -- Check if already enrolled
  SELECT EXISTS(
    SELECT 1 FROM course_enrollments
    WHERE course_id = p_course_id
    AND student_profile_id = v_student_profile_id
  ) INTO v_enrollment_exists;

  IF v_enrollment_exists THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Already enrolled in this course',
      'course_id', p_course_id,
      'course_slug', v_course_slug,
      'already_enrolled', true
    );
  END IF;

  -- Insert enrollment (RLS will still enforce, but this provides better UX)
  BEGIN
    INSERT INTO course_enrollments (
      course_id,
      student_profile_id,
      progress_percentage
    ) VALUES (
      p_course_id,
      v_student_profile_id,
      0
    );

    RETURN jsonb_build_object(
      'success', true,
      'message', 'Successfully enrolled in course',
      'course_id', p_course_id,
      'course_slug', v_course_slug,
      'course_title', v_course_title
    );
  EXCEPTION
    WHEN unique_violation THEN
      RETURN jsonb_build_object(
        'success', true,
        'message', 'Already enrolled in this course',
        'course_id', p_course_id,
        'course_slug', v_course_slug,
        'already_enrolled', true
      );
    WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to enroll in course: ' || SQLERRM
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.enroll_in_course(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.enroll_in_course(UUID) IS 
'Enrolls the current user in a course if they have subscription access.
Returns JSONB with success status, error messages, and course info.
Subject to RLS enforcement - will fail if user lacks subscription access.';

-- ============================================================================
-- USAGE NOTES FOR APP DEVELOPERS
-- ============================================================================
--
-- APPROACH A: Direct INSERT (RLS automatically enforces)
-- ----------------------------------------
-- The RLS policy will automatically prevent unauthorized enrollments.
-- App can directly insert into course_enrollments table:
--
--   const { data, error } = await supabase
--     .from('course_enrollments')
--     .insert({
--       course_id: courseId,
--       student_profile_id: studentProfileId,
--       progress_percentage: 0
--     });
--
--   if (error) {
--     // Error will occur if:
--     // - User lacks subscription access
--     // - Course is not published
--     // - User is not the student themselves
--     console.error('Enrollment failed:', error);
--   }
--
-- APPROACH B: Use convenience function (Recommended)
-- ----------------------------------------
-- Provides better error messages and handles edge cases:
--
--   const { data, error } = await supabase
--     .rpc('enroll_in_course', { p_course_id: courseId });
--
--   if (error) {
--     console.error('Enrollment failed:', error);
--     return;
--   }
--
--   if (data.success) {
--     if (data.already_enrolled) {
--       // User already enrolled
--       redirect(`/student/courses/${data.course_slug}`);
--     } else {
--       // Successfully enrolled
--       redirect(`/student/courses/${data.course_slug}`);
--     }
--   } else {
--     // Handle error
--     if (data.requires_subscription) {
--       // Show upgrade prompt
--       showUpgradeModal();
--     } else {
--       // Show error message
--       showError(data.error);
--     }
--   }
--
-- Response format:
--   {
--     success: true/false,
--     message?: string,
--     error?: string,
--     requires_subscription?: boolean,
--     course_id?: UUID,
--     course_slug?: string,
--     course_title?: string,
--     already_enrolled?: boolean
--   }
--
-- RECOMMENDATION:
-- Use Approach B (function) for better UX and error handling.
-- RLS policy (Approach A) provides defense-in-depth and works with any client.

COMMIT;
