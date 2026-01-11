/**
 * Frontend Course Access Utilities
 * 
 * Client-side utilities for determining course visibility and access
 * based on subscription tier. These functions are used for UI rendering
 * and do not replace server-side access control.
 */

import { ESSENTIAL_TIER_COURSES, type SubscriptionTier } from './subscription-types';

/**
 * Checks if a course is accessible based on subscription tier
 * 
 * @param courseSlug - The slug of the course to check
 * @param subscriptionTier - The user's subscription tier ('essential' | 'professional' | null | undefined)
 * @returns true if course is accessible, false if locked
 */
export function isCourseAccessible(
  courseSlug: string,
  subscriptionTier: SubscriptionTier | null | undefined
): boolean {
  // No subscription = no access
  if (!subscriptionTier) {
    return false;
  }

  // Professional tier has access to all courses
  if (subscriptionTier === 'professional') {
    return true;
  }

  // Essential tier only has access to predefined courses
  if (subscriptionTier === 'essential') {
    return (ESSENTIAL_TIER_COURSES as readonly string[]).includes(courseSlug);
  }

  // Unknown tier = no access (fail-secure)
  return false;
}

/**
 * Checks if a course is locked for the current subscription tier
 * 
 * @param courseSlug - The slug of the course to check
 * @param subscriptionTier - The user's subscription tier
 * @returns true if course is locked, false if accessible
 */
export function isCourseLocked(
  courseSlug: string,
  subscriptionTier: SubscriptionTier | null | undefined
): boolean {
  return !isCourseAccessible(courseSlug, subscriptionTier);
}

/**
 * Gets the reason why a course is locked
 * 
 * @param subscriptionTier - The user's subscription tier
 * @returns Lock reason message or null if not locked
 */
export function getCourseLockReason(
  subscriptionTier: SubscriptionTier | null | undefined
): string | null {
  if (!subscriptionTier) {
    return 'A subscription is required to access this course.';
  }

  if (subscriptionTier === 'essential') {
    return 'This course requires Professional Access.';
  }

  return null;
}

/**
 * Gets the upgrade message for locked courses
 * 
 * @param subscriptionTier - The user's subscription tier
 * @returns Upgrade message
 */
export function getUpgradeMessage(subscriptionTier: SubscriptionTier | null | undefined): string {
  if (!subscriptionTier) {
    return 'Upgrade to Professional Access to unlock all courses.';
  }

  if (subscriptionTier === 'essential') {
    return 'Upgrade to Professional Access to unlock this course and all others.';
  }

  return 'Upgrade your subscription to access this course.';
}
