/**
 * Course Access Guard Middleware
 * 
 * Middleware for protecting course API routes with subscription-based access control.
 * 
 * This middleware:
 * 1. Authenticates the user
 * 2. Fetches the user's subscription
 * 3. Checks course access permissions
 * 4. Returns appropriate HTTP status codes
 * 
 * Usage:
 * ```typescript
 * const guardResult = await guardCourseAccess(userId, courseId);
 * if (guardResult.error) {
 *   return NextResponse.json(
 *     { error: guardResult.error },
 *     { status: guardResult.status }
 *   );
 * }
 * // Proceed with course access
 * ```
 */

import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { canUserAccessCourse } from '@/lib/utils/subscription-access';

/**
 * Result of course access guard check
 */
export interface CourseAccessGuardResult {
  /**
   * Whether access is allowed
   */
  allowed: boolean;
  
  /**
   * HTTP status code to return
   * - 200: Access allowed
   * - 401: User not authenticated
   * - 403: Access denied (no subscription or insufficient tier)
   * - 404: Course not found
   * - 500: Internal server error
   */
  status: number;
  
  /**
   * Error message if access is denied
   */
  error?: string;
  
  /**
   * User ID (if authenticated)
   */
  userId?: string;
  
  /**
   * Course ID (if found)
   */
  courseId?: string;
}

/**
 * Guards course access by:
 * 1. Authenticating the user
 * 2. Verifying the course exists and is published
 * 3. Checking subscription access permissions
 * 
 * @param requestUserId - Optional user ID from request (if already authenticated)
 * @param courseId - The UUID of the course to check access for
 * @returns CourseAccessGuardResult with access decision and status code
 * 
 * @example
 * ```typescript
 * // In API route handler
 * const guardResult = await guardCourseAccess(undefined, courseId);
 * if (!guardResult.allowed) {
 *   return NextResponse.json(
 *     { error: guardResult.error },
 *     { status: guardResult.status }
 *   );
 * }
 * ```
 */
export async function guardCourseAccess(
  requestUserId?: string,
  courseId?: string
): Promise<CourseAccessGuardResult> {
  // Step 1: Authenticate the user
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (authError || !user) {
      return {
        allowed: false,
        status: 401,
        error: 'Unauthorized. Please log in to access this course.',
      };
    }

    // Use provided userId or authenticated user's ID
    const userId = requestUserId || user.id;

    // Validate courseId is provided
    if (!courseId) {
      return {
        allowed: false,
        status: 400,
        error: 'Course ID is required',
        userId,
      };
    }

    // Step 2: Verify course exists and is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug, title, is_published')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return {
        allowed: false,
        status: 404,
        error: 'Course not found',
        userId,
      };
    }

    // Check if course is published
    if (!course.is_published) {
      return {
        allowed: false,
        status: 403,
        error: 'Course is not available',
        userId,
        courseId,
      };
    }

    // Step 3: Check subscription access permissions
    const hasAccess = await canUserAccessCourse(userId, courseId);

    if (!hasAccess) {
      // Get user's profile to find student profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (profile) {
        // Get student profile
        const { data: studentProfile } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (studentProfile) {
          // Get subscription to provide helpful error message
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('tier, status, current_period_end')
            .eq('student_profile_id', studentProfile.id)
            .single();

          // Check if user has no subscription
          if (!subscription) {
            return {
              allowed: false,
              status: 403,
              error: 'Access denied. A subscription is required to access this course.',
              userId,
              courseId,
            };
          }

          // Check if subscription is inactive or expired
          const now = new Date();
          const periodEnd = new Date(subscription.current_period_end);
          if (subscription.status !== 'active' || periodEnd <= now) {
            return {
              allowed: false,
              status: 403,
              error: 'Access denied. Your subscription is not active or has expired.',
              userId,
              courseId,
            };
          }

          // User has Essential tier but course is not in allowed list
          if (subscription.tier === 'essential') {
            return {
              allowed: false,
              status: 403,
              error: 'Access denied. This course requires Professional Access. Please upgrade your subscription.',
              userId,
              courseId,
            };
          }
        }
      }

      // Generic access denied
      return {
        allowed: false,
        status: 403,
        error: 'Access denied. You do not have permission to access this course.',
        userId,
        courseId,
      };
    }

    // Step 4: Access granted
    return {
      allowed: true,
      status: 200,
      userId,
      courseId,
    };

  } catch (error) {
    // Handle unexpected errors
    console.error('[guardCourseAccess] Unexpected error:', error);
    return {
      allowed: false,
      status: 500,
      error: 'Internal server error. Please try again later.',
    };
  }
}

/**
 * Simplified version that uses the database function directly
 * More efficient as it runs the check in the database
 * 
 * @param userId - The authenticated user's ID
 * @param courseId - The UUID of the course to check access for
 * @returns CourseAccessGuardResult
 */
export async function guardCourseAccessViaDB(
  userId: string,
  courseId: string
): Promise<CourseAccessGuardResult> {
  try {
    const supabase = await createUserSupabaseClient();

    // Verify course exists and is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug, is_published')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return {
        allowed: false,
        status: 404,
        error: 'Course not found',
        userId,
      };
    }

    if (!course.is_published) {
      return {
        allowed: false,
        status: 403,
        error: 'Course is not available',
        userId,
        courseId,
      };
    }

    // Use database function for access check
    const { data: hasAccess, error: accessError } = await supabase.rpc(
      'has_course_access',
      {
        p_user_id: userId,
        p_course_id: courseId,
      }
    );

    if (accessError) {
      console.error('[guardCourseAccessViaDB] Database function error:', accessError);
      return {
        allowed: false,
        status: 500,
        error: 'Failed to verify course access',
        userId,
        courseId,
      };
    }

    if (!hasAccess) {
      return {
        allowed: false,
        status: 403,
        error: 'Access denied. You do not have permission to access this course.',
        userId,
        courseId,
      };
    }

    return {
      allowed: true,
      status: 200,
      userId,
      courseId,
    };

  } catch (error) {
    console.error('[guardCourseAccessViaDB] Unexpected error:', error);
    return {
      allowed: false,
      status: 500,
      error: 'Internal server error. Please try again later.',
    };
  }
}
