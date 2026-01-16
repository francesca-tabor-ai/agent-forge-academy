/**
 * Course Access Control
 * 
 * Checks if a user has access to a course based on:
 * 1. Course is free → allow
 * 2. User has active subscription for any segment that includes this course
 * 3. User has global subscription (professional tier)
 */

import 'server-only';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getSegment } from '@/lib/utils/segments';
import type { SegmentType } from '@/lib/types/segment';

export interface CourseAccessResult {
  hasAccess: boolean;
  reason?: 'free' | 'segment_subscription' | 'global_subscription' | 'no_access';
  segmentType?: SegmentType;
  segmentKey?: string;
  segmentDisplayName?: string;
}

/**
 * Check if a course is free
 * A course is free if it doesn't require a subscription
 * For now, we'll check if the course has a specific flag or is in a free list
 */
async function isCourseFree(courseSlug: string): Promise<boolean> {
  // TODO: Add a `is_free` column to courses table or check metadata
  // For now, return false (all courses require subscription)
  // You can implement this based on your business logic
  return false;
}

/**
 * Check if user has active segment subscription that includes this course
 */
async function hasSegmentSubscriptionAccess(
  userId: string,
  courseSlug: string
): Promise<{ hasAccess: boolean; segmentType?: SegmentType; segmentKey?: string; segmentDisplayName?: string }> {
  const supabase = await createUserSupabaseClient();

  // Get user's active segment subscriptions from segment_subscriptions table
  const { data: subscriptions } = await supabase
    .from('segment_subscriptions')
    .select('segment_type, segment_key, status, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('current_period_end', new Date().toISOString());

  if (!subscriptions || subscriptions.length === 0) {
    return { hasAccess: false };
  }

  // Check each subscription to see if it includes this course
  for (const subscription of subscriptions) {
    const segment = getSegment(
      subscription.segment_type as SegmentType,
      subscription.segment_key
    );

    if (segment && segment.includedCourseSlugs.includes(courseSlug)) {
      return {
        hasAccess: true,
        segmentType: subscription.segment_type as SegmentType,
        segmentKey: subscription.segment_key,
        segmentDisplayName: segment.displayName,
      };
    }
  }

  return { hasAccess: false };
}

/**
 * Check if user has global subscription (professional tier)
 */
async function hasGlobalSubscription(userId: string): Promise<boolean> {
  const supabase = await createUserSupabaseClient();

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    return false;
  }

  // Get student profile
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!studentProfile) {
    return false;
  }

  // Check for professional tier subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, status, current_period_end')
    .eq('student_profile_id', studentProfile.id)
    .eq('tier', 'professional')
    .eq('status', 'active')
    .gt('current_period_end', new Date().toISOString())
    .single();

  return !!subscription;
}

/**
 * Check if user has access to a course
 * 
 * @param userId - User ID
 * @param courseSlug - Course slug (or courseId if you prefer)
 * @returns CourseAccessResult with access status and reason
 */
export async function hasCourseAccess(
  userId: string,
  courseSlug: string
): Promise<CourseAccessResult> {
  // Validate inputs
  if (!userId || !courseSlug) {
    return { hasAccess: false, reason: 'no_access' };
  }

  try {
    // 1. Check if course is free
    const free = await isCourseFree(courseSlug);
    if (free) {
      return { hasAccess: true, reason: 'free' };
    }

    // 2. Check segment subscription access
    const segmentAccess = await hasSegmentSubscriptionAccess(userId, courseSlug);
    if (segmentAccess.hasAccess) {
      return {
        hasAccess: true,
        reason: 'segment_subscription',
        segmentType: segmentAccess.segmentType,
        segmentKey: segmentAccess.segmentKey,
        segmentDisplayName: segmentAccess.segmentDisplayName,
      };
    }

    // 3. Check global subscription
    const hasGlobal = await hasGlobalSubscription(userId);
    if (hasGlobal) {
      return { hasAccess: true, reason: 'global_subscription' };
    }

    // 4. No access
    return { hasAccess: false, reason: 'no_access' };
  } catch (error) {
    console.error('[hasCourseAccess] Error checking access', { userId, courseSlug, error });
    return { hasAccess: false, reason: 'no_access' };
  }
}

/**
 * Get segments that include a course (for paywall display)
 * Returns up to 3 relevant segments that include this course
 */
export async function getSegmentsForCourse(courseSlug: string): Promise<Array<{
  type: SegmentType;
  key: string;
  displayName: string;
}>> {
  const segments: Array<{ type: SegmentType; key: string; displayName: string }> = [];

  // Check all segment types
  const segmentTypes: SegmentType[] = ['track', 'industry', 'role'];
  
  for (const type of segmentTypes) {
    const { getSegmentsByType } = await import('@/lib/utils/segments');
    const typeSegments = getSegmentsByType(type);
    
    for (const segment of typeSegments) {
      if (segment.includedCourseSlugs.includes(courseSlug)) {
        segments.push({
          type: segment.type,
          key: segment.key,
          displayName: segment.displayName,
        });
        
        // Limit to 3 segments
        if (segments.length >= 3) {
          return segments;
        }
      }
    }
  }

  return segments;
}
