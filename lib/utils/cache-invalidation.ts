/**
 * Cache Invalidation Utilities
 * 
 * Handles invalidation of cached subscription and access data
 * when subscription tiers change.
 */

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Cache keys/tags used throughout the application
 */
export const CACHE_TAGS = {
  SUBSCRIPTION: 'subscription',
  COURSE_ACCESS: 'course-access',
  USER_TIER: 'user-tier',
} as const;

/**
 * Cache keys for specific user data
 */
export function getUserCacheKey(userId: string, key: string): string {
  return `${key}:${userId}`;
}

/**
 * Invalidates all subscription-related cache for a user
 * 
 * @param userId - The user ID whose cache should be invalidated
 */
export async function invalidateSubscriptionCache(userId: string): Promise<void> {
  // Invalidate Next.js cache paths
  revalidatePath('/student/courses');
  revalidatePath('/student/subscription');
  revalidatePath('/student/dashboard');
  revalidatePath(`/student/courses/[courseSlug]`, 'page');

  // Invalidate cache tags
  revalidateTag(CACHE_TAGS.SUBSCRIPTION);
  revalidateTag(CACHE_TAGS.COURSE_ACCESS);
  revalidateTag(CACHE_TAGS.USER_TIER);
  revalidateTag(getUserCacheKey(userId, CACHE_TAGS.USER_TIER));
}

/**
 * Invalidates course access cache for a specific user
 * 
 * @param userId - The user ID
 */
export async function invalidateCourseAccessCache(userId: string): Promise<void> {
  revalidatePath('/student/courses');
  revalidatePath('/student/courses/[courseSlug]', 'page');
  revalidateTag(CACHE_TAGS.COURSE_ACCESS);
  revalidateTag(getUserCacheKey(userId, CACHE_TAGS.COURSE_ACCESS));
}

/**
 * Client-side cache invalidation
 * Clears browser storage and triggers page refresh
 */
export function invalidateClientCache(): void {
  if (typeof window === 'undefined') return;

  // Clear localStorage cache
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('subscription:') || key.startsWith('course-access:'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // Clear sessionStorage cache
  const sessionKeysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.startsWith('subscription:') || key.startsWith('course-access:'))) {
      sessionKeysToRemove.push(key);
    }
  }
  sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

  // Trigger router refresh (if using Next.js router)
  if (typeof window !== 'undefined' && 'router' in window) {
    // @ts-ignore - Next.js router refresh
    window.router?.refresh?.();
  }
}

/**
 * Server-side cache invalidation with webhook support
 * 
 * @param userId - The user ID
 * @param subscriptionId - The subscription ID
 * @param oldTier - Previous tier
 * @param newTier - New tier
 */
export async function invalidateSubscriptionChangeCache(
  userId: string,
  subscriptionId: string,
  oldTier: string,
  newTier: string
): Promise<void> {
  // Invalidate server-side cache
  await invalidateSubscriptionCache(userId);

  // In production, you might want to:
  // 1. Send webhook to invalidate CDN cache
  // 2. Publish event to message queue
  // 3. Notify connected WebSocket clients
  // 4. Invalidate Redis cache if using it

  // Example webhook call (commented out - implement based on your infrastructure)
  /*
  try {
    await fetch(process.env.CACHE_INVALIDATION_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscriptionId,
        oldTier,
        newTier,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to send cache invalidation webhook:', error);
  }
  */
}

/**
 * Gets cache TTL for subscription data
 * Shorter TTL for more dynamic data
 */
export function getSubscriptionCacheTTL(): number {
  // Return cache TTL in seconds
  // Subscription data changes infrequently, so longer TTL is acceptable
  return 300; // 5 minutes
}

/**
 * Gets cache TTL for course access checks
 * Very short TTL since access can change immediately
 */
export function getCourseAccessCacheTTL(): number {
  // Course access can change immediately on subscription change
  // Use very short TTL or no cache
  return 60; // 1 minute
}
