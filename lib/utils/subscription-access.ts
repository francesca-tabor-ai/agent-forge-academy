/**
 * Subscription Access Control Utilities
 * 
 * This module provides functions to check if a user has access to courses
 * based on their subscription tier.
 * 
 * Subscription Tiers:
 * - ESSENTIAL: Limited access to predefined course list
 * - PROFESSIONAL: Full access to all courses
 */

import 'server-only';

import { createUserSupabaseClient } from '@/lib/supabase/server';
import { ESSENTIAL_TIER_COURSES, type SubscriptionTier, type SubscriptionStatus } from './subscription-types';

// Re-export types for backward compatibility (server-side only)
export type { SubscriptionTier, SubscriptionStatus };
export { ESSENTIAL_TIER_COURSES };

/**
 * Interface for subscription data retrieved from database
 */
interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_end: string; // ISO timestamp string
}

/**
 * Checks if a user has access to a specific course based on their subscription.
 * 
 * Logic Flow:
 * 1. Validate inputs (userId and courseId)
 * 2. Check if course exists and is published
 * 3. Retrieve user's active subscription
 * 4. If no active subscription → deny access
 * 5. If subscription is inactive/expired → deny access
 * 6. If tier is PROFESSIONAL → grant access (all courses)
 * 7. If tier is ESSENTIAL → check if course is in allowed list
 * 
 * @param userId - The UUID of the user to check access for
 * @param courseId - The UUID of the course to check access for
 * @returns Promise<boolean> - true if user has access, false otherwise
 * 
 * @example
 * ```typescript
 * const hasAccess = await canUserAccessCourse(userId, courseId);
 * if (hasAccess) {
 *   // Allow enrollment or course access
 * } else {
 *   // Show upgrade prompt
 * }
 * ```
 */
export async function canUserAccessCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  // Edge Case 1: Invalid inputs
  // Validate that both userId and courseId are provided and non-empty
  if (!userId || !courseId || typeof userId !== 'string' || typeof courseId !== 'string') {
    console.warn('[canUserAccessCourse] Invalid input parameters', { userId, courseId });
    return false;
  }

  try {
    const supabase = await createUserSupabaseClient();

    // Edge Case 2: Invalid course
    // Check if course exists and is published
    // If course doesn't exist or isn't published, deny access
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug, is_published')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.warn('[canUserAccessCourse] Course not found', { courseId, error: courseError });
      return false;
    }

    if (!course.is_published) {
      console.warn('[canUserAccessCourse] Course is not published', { courseId, slug: course.slug });
      return false;
    }

    // Get user's profile to find their student profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      console.warn('[canUserAccessCourse] User profile not found', { userId, error: profileError });
      return false;
    }

    // Get student profile linked to the user's profile
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (studentProfileError || !studentProfile) {
      console.warn('[canUserAccessCourse] Student profile not found', { userId, error: studentProfileError });
      return false;
    }

    // Edge Case 3: Missing subscription
    // Retrieve user's subscription
    // If no subscription exists, deny access
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('tier, status, current_period_end')
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (subscriptionError || !subscription) {
      console.warn('[canUserAccessCourse] No subscription found', { userId, error: subscriptionError });
      return false;
    }

    // Edge Case 4: Inactive or expired subscription
    // Check if subscription is active and not expired
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);

    // Subscription must be 'active' status
    if (subscription.status !== 'active') {
      console.warn('[canUserAccessCourse] Subscription is not active', { 
        userId, 
        status: subscription.status 
      });
      return false;
    }

    // Subscription period must not be expired
    if (periodEnd <= now) {
      console.warn('[canUserAccessCourse] Subscription period has expired', { 
        userId, 
        periodEnd: subscription.current_period_end,
        now: now.toISOString()
      });
      return false;
    }

    // Conditional Logic: Check access based on subscription tier
    const subscriptionData = subscription as SubscriptionData;

    // Case 1: PROFESSIONAL tier - Full access to all courses
    if (subscriptionData.tier === 'professional') {
      console.log('[canUserAccessCourse] Professional tier - granting access', { userId, courseId });
      return true;
    }

    // Case 2: ESSENTIAL tier - Limited access to predefined courses
    if (subscriptionData.tier === 'essential') {
      // Check if course slug is in the ESSENTIAL tier allowed list
      const courseSlug = course.slug;
      const hasAccess = (ESSENTIAL_TIER_COURSES as readonly string[]).includes(courseSlug);

      if (hasAccess) {
        console.log('[canUserAccessCourse] Essential tier - course in allowed list', { 
          userId, 
          courseId, 
          courseSlug 
        });
        return true;
      } else {
        console.warn('[canUserAccessCourse] Essential tier - course not in allowed list', { 
          userId, 
          courseId, 
          courseSlug,
          allowedCourses: ESSENTIAL_TIER_COURSES
        });
        return false;
      }
    }

    // Edge Case 5: Unknown tier (shouldn't happen, but handle gracefully)
    console.error('[canUserAccessCourse] Unknown subscription tier', { 
      userId, 
      tier: subscriptionData.tier 
    });
    return false;

  } catch (error) {
    // Edge Case 6: Unexpected errors
    // Log error and deny access (fail-secure)
    console.error('[canUserAccessCourse] Unexpected error', { userId, courseId, error });
    return false;
  }
}

/**
 * Alternative implementation using the database function for better performance.
 * This version uses the PostgreSQL function we created, which is more efficient
 * for server-side checks as it runs directly in the database.
 * 
 * @param userId - The UUID of the user to check access for
 * @param courseId - The UUID of the course to check access for
 * @returns Promise<boolean> - true if user has access, false otherwise
 */
export async function canUserAccessCourseViaDB(
  userId: string,
  courseId: string
): Promise<boolean> {
  // Validate inputs
  if (!userId || !courseId || typeof userId !== 'string' || typeof courseId !== 'string') {
    return false;
  }

  try {
    const supabase = await createUserSupabaseClient();

    // Use the database function for access check
    // This is more efficient as it runs in the database and uses indexes
    const { data: hasAccess, error } = await supabase.rpc('has_course_access', {
      p_user_id: userId,
      p_course_id: courseId,
    });

    if (error) {
      console.error('[canUserAccessCourseViaDB] Database function error', { userId, courseId, error });
      return false;
    }

    return hasAccess === true;
  } catch (error) {
    console.error('[canUserAccessCourseViaDB] Unexpected error', { userId, courseId, error });
    return false;
  }
}

/**
 * Gets the user's current subscription tier.
 * 
 * @param userId - The UUID of the user
 * @returns Promise<SubscriptionTier | null> - The subscription tier or null if no active subscription
 */
export async function getUserSubscriptionTier(
  userId: string
): Promise<SubscriptionTier | null> {
  if (!userId || typeof userId !== 'string') {
    return null;
  }

  try {
    const supabase = await createUserSupabaseClient();

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      return null;
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return null;
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tier, status, current_period_end')
      .eq('student_profile_id', studentProfile.id)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .single();

    return subscription?.tier as SubscriptionTier | null;
  } catch (error) {
    console.error('[getUserSubscriptionTier] Error', { userId, error });
    return null;
  }
}
