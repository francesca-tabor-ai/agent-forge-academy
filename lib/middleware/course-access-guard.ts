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
import {
  getSubscriptionStatusError,
  getExpiredPeriodError,
  getInsufficientTierError,
  getCourseNotFoundError,
  getCourseUnpublishedError,
  SUBSCRIPTION_ERROR_MESSAGES,
  type AccessErrorDetails,
} from '@/lib/utils/subscription-error-messages';

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
   * - 301: Course redirected (renamed)
   * - 401: User not authenticated
   * - 403: Access denied (no subscription or insufficient tier)
   * - 404: Course not found
   * - 500: Internal server error
   * - 503: Service unavailable
   */
  status: number;
  
  /**
   * Error message if access is denied
   */
  error?: string;
  
  /**
   * Warning message if access allowed but with warning
   */
  warning?: string;
  
  /**
   * User ID (if authenticated)
   */
  userId?: string;
  
  /**
   * Course ID (if found)
   */
  courseId?: string;
  
  /**
   * Redirect URL (for course redirects)
   */
  redirectTo?: string;
  
  /**
   * Action required from user
   */
  actionRequired?: string;
  
  /**
   * Retry after seconds (for 503 errors)
   */
  retryAfter?: number;
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
      // Check if course was renamed (redirect)
      const { data: redirect } = await supabase.rpc('get_course_redirect', {
        p_course_id: courseId,
      });

      if (redirect) {
        // Course was renamed - return redirect
        const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.COURSE_RENAMED;
        return {
          allowed: false,
          status: 301,
          error: errorDetails.message,
          redirectTo: `/student/courses/${redirect}`,
          userId,
        };
      }

      // Course not found
      const errorDetails = getCourseNotFoundError();
      return {
        allowed: false,
        status: errorDetails.status,
        error: errorDetails.message,
        redirectTo: errorDetails.redirectTo,
        userId,
      };
    }

    // Check if course is published
    if (!course.is_published) {
      const errorDetails = getCourseUnpublishedError();
      return {
        allowed: false,
        status: errorDetails.status,
        error: errorDetails.message,
        redirectTo: errorDetails.redirectTo,
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
            const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.NO_SUBSCRIPTION;
            return {
              allowed: false,
              status: errorDetails.status,
              error: errorDetails.message,
              actionRequired: errorDetails.actionRequired,
              redirectTo: errorDetails.redirectTo,
              userId,
              courseId,
            };
          }

          // Check subscription status
          const now = new Date();
          const periodEnd = new Date(subscription.current_period_end);
          const trialEnd = subscription.trial_end_at ? new Date(subscription.trial_end_at) : null;

          // Check if period expired
          if (periodEnd <= now) {
            const errorDetails = getExpiredPeriodError(periodEnd);
            return {
              allowed: false,
              status: errorDetails.status,
              error: errorDetails.message,
              actionRequired: errorDetails.actionRequired,
              redirectTo: errorDetails.redirectTo,
              userId,
              courseId,
            };
          }

          // Check subscription status for specific errors
          const statusError = getSubscriptionStatusError(
            subscription.status as 'active' | 'trial' | 'paused' | 'canceled' | 'expired',
            periodEnd,
            trialEnd || undefined
          );

          if (statusError) {
            // For canceled/trial with grace period, allow access but show warning
            if (statusError.status === 200 && subscription.status === 'canceled') {
              return {
                allowed: true,
                status: 200,
                warning: statusError.message,
                actionRequired: statusError.actionRequired,
                userId,
                courseId,
              };
            }

            // Otherwise deny access
            return {
              allowed: false,
              status: statusError.status,
              error: statusError.message,
              actionRequired: statusError.actionRequired,
              redirectTo: statusError.redirectTo,
              userId,
              courseId,
            };
          }

          // User has Essential tier but course is not in allowed list
          if (subscription.tier === 'essential') {
            const errorDetails = getInsufficientTierError();
            return {
              allowed: false,
              status: errorDetails.status,
              error: errorDetails.message,
              actionRequired: errorDetails.actionRequired,
              redirectTo: errorDetails.redirectTo,
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

  } catch (error: any) {
    // Handle unexpected errors
    console.error('[guardCourseAccess] Unexpected error:', error);

    // Check if it's a database connection error
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
      const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.DATABASE_ERROR;
      return {
        allowed: false,
        status: errorDetails.status,
        error: errorDetails.message,
        retryAfter: errorDetails.retryAfter,
      };
    }

    // Generic error
    const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.UNEXPECTED_ERROR;
    return {
      allowed: false,
      status: errorDetails.status,
      error: errorDetails.message,
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
      // Check if course was renamed (redirect)
      const { data: redirect } = await supabase.rpc('get_course_redirect', {
        p_course_id: courseId,
      });

      if (redirect) {
        const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.COURSE_RENAMED;
        return {
          allowed: false,
          status: 301,
          error: errorDetails.message,
          redirectTo: `/student/courses/${redirect}`,
          userId,
        };
      }

      const errorDetails = getCourseNotFoundError();
      return {
        allowed: false,
        status: errorDetails.status,
        error: errorDetails.message,
        redirectTo: errorDetails.redirectTo,
        userId,
      };
    }

    if (!course.is_published) {
      const errorDetails = getCourseUnpublishedError();
      return {
        allowed: false,
        status: errorDetails.status,
        error: errorDetails.message,
        redirectTo: errorDetails.redirectTo,
        userId,
        courseId,
      };
    }

    // Get detailed subscription status for better error messages
    const { data: subscriptionStatus } = await supabase.rpc(
      'get_subscription_access_status',
      { p_user_id: userId }
    );

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
      
      // Check if it's a connection error
      if (accessError.code === 'ECONNREFUSED' || accessError.code === 'ETIMEDOUT') {
        const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.DATABASE_ERROR;
        return {
          allowed: false,
          status: errorDetails.status,
          error: errorDetails.message,
          retryAfter: errorDetails.retryAfter,
          userId,
          courseId,
        };
      }

      const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.UNEXPECTED_ERROR;
      return {
        allowed: false,
        status: errorDetails.status,
        error: errorDetails.message,
        userId,
        courseId,
      };
    }

    if (!hasAccess) {
      // Use subscription status to provide better error message
      if (subscriptionStatus) {
        const reason = subscriptionStatus.reason;
        
        if (reason === 'no_subscription') {
          const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.NO_SUBSCRIPTION;
          return {
            allowed: false,
            status: errorDetails.status,
            error: errorDetails.message,
            actionRequired: errorDetails.actionRequired,
            redirectTo: errorDetails.redirectTo,
            userId,
            courseId,
          };
        }

        if (reason === 'expired') {
          const errorDetails = getExpiredPeriodError(
            new Date(subscriptionStatus.period_end)
          );
          return {
            allowed: false,
            status: errorDetails.status,
            error: errorDetails.message,
            actionRequired: errorDetails.actionRequired,
            redirectTo: errorDetails.redirectTo,
            userId,
            courseId,
          };
        }

        if (reason === 'paused') {
          const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.PAUSED_SUBSCRIPTION;
          return {
            allowed: false,
            status: errorDetails.status,
            error: errorDetails.message,
            actionRequired: errorDetails.actionRequired,
            redirectTo: errorDetails.redirectTo,
            userId,
            courseId,
          };
        }

        if (reason === 'canceled') {
          const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.CANCELED_SUBSCRIPTION;
          return {
            allowed: false,
            status: errorDetails.status,
            error: errorDetails.message,
            actionRequired: errorDetails.actionRequired,
            redirectTo: errorDetails.redirectTo,
            userId,
            courseId,
          };
        }
      }

      // Check if it's an insufficient tier issue
      if (subscriptionStatus?.tier === 'essential') {
        const errorDetails = getInsufficientTierError();
        return {
          allowed: false,
          status: errorDetails.status,
          error: errorDetails.message,
          actionRequired: errorDetails.actionRequired,
          redirectTo: errorDetails.redirectTo,
          userId,
          courseId,
        };
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

    return {
      allowed: true,
      status: 200,
      userId,
      courseId,
    };

  } catch (error: any) {
    console.error('[guardCourseAccessViaDB] Unexpected error:', error);

    // Check if it's a database connection error
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
      const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.DATABASE_ERROR;
      return {
        allowed: false,
        status: errorDetails.status,
        error: errorDetails.message,
        retryAfter: errorDetails.retryAfter,
      };
    }

    const errorDetails = SUBSCRIPTION_ERROR_MESSAGES.UNEXPECTED_ERROR;
    return {
      allowed: false,
      status: errorDetails.status,
      error: errorDetails.message,
    };
  }
}
