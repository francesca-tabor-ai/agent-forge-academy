/**
 * Client-Safe Subscription Types and Constants
 * 
 * This file contains types and constants that can be safely imported
 * by client components. It does NOT import any server-only code.
 */

/**
 * Subscription tier types
 */
export type SubscriptionTier = 'essential' | 'professional';

/**
 * Subscription status types
 */
export type SubscriptionStatus = 'active' | 'trial' | 'paused' | 'canceled' | 'expired';

/**
 * List of course slugs available to ESSENTIAL tier subscribers
 * These are the 5 courses included in Essential Access (£39/month)
 */
export const ESSENTIAL_TIER_COURSES = [
  'prompt-engineering',
  'ai-content-pipelines',
  'reddit-ai-visibility',
  'seo-to-aeo',
  'ai-governance-eu-ai-act',
] as const;
