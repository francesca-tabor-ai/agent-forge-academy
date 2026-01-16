/**
 * Segment subscription access control utilities
 * 
 * Checks if a user has access to a course via segment subscriptions
 */

import 'server-only';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getSegment } from '@/lib/utils/segments';
import type { SegmentType } from '@/lib/types/segment';

/**
 * Check if a user has access to a course via segment subscription
 * 
 * @param userId - The UUID of the user
 * @param courseSlug - The slug of the course
 * @returns Promise<boolean> - true if user has access via segment subscription
 */
export async function hasSegmentCourseAccess(
  userId: string,
  courseSlug: string
): Promise<boolean> {
  if (!userId || !courseSlug) {
    return false;
  }

  try {
    const supabase = await createUserSupabaseClient();

    // Get user's active segment subscriptions
    const { data: subscriptions, error } = await supabase
      .from('segment_subscriptions')
      .select('segment_type, segment_key')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString());

    if (error || !subscriptions || subscriptions.length === 0) {
      return false;
    }

    // Check if the course is included in any of the user's subscribed segments
    for (const subscription of subscriptions) {
      const segment = getSegment(
        subscription.segment_type as SegmentType,
        subscription.segment_key
      );

      if (segment && segment.includedCourseSlugs.includes(courseSlug)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('[hasSegmentCourseAccess] Error checking segment access:', error);
    return false;
  }
}

/**
 * Get all courses a user has access to via segment subscriptions
 * 
 * @param userId - The UUID of the user
 * @returns Promise<string[]> - Array of course slugs the user has access to
 */
export async function getUserSegmentCourses(userId: string): Promise<string[]> {
  if (!userId) {
    return [];
  }

  try {
    const supabase = await createUserSupabaseClient();

    // Get user's active segment subscriptions
    const { data: subscriptions, error } = await supabase
      .from('segment_subscriptions')
      .select('segment_type, segment_key')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString());

    if (error || !subscriptions || subscriptions.length === 0) {
      return [];
    }

    // Collect all course slugs from subscribed segments
    const courseSlugs = new Set<string>();

    for (const subscription of subscriptions) {
      const segment = getSegment(
        subscription.segment_type as SegmentType,
        subscription.segment_key
      );

      if (segment) {
        segment.includedCourseSlugs.forEach((slug) => courseSlugs.add(slug));
      }
    }

    return Array.from(courseSlugs);
  } catch (error) {
    console.error('[getUserSegmentCourses] Error getting segment courses:', error);
    return [];
  }
}
