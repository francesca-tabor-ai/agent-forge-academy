/**
 * Stripe Subscription Access Control Utilities
 * 
 * This module provides functions to check user subscription access
 * using the new Stripe-based tables structure.
 * 
 * Uses:
 * - user_entitlements view (or subscriptions table directly)
 * - subscription_plans table to determine plan/tier from stripe_price_id
 */

import 'server-only';

import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * User entitlement data from user_entitlements view
 */
export interface UserEntitlement {
  user_id: string;
  status: string;
  stripe_price_id: string;
  current_period_end: string | null;
  is_active: boolean;
}

/**
 * Subscription plan data
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  interval: 'month' | 'year';
  stripe_product_id: string;
  stripe_price_id: string;
  active: boolean;
}

/**
 * User subscription status
 */
export interface UserSubscriptionStatus {
  hasActiveSubscription: boolean;
  planId: string | null;
  planName: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
  isTrialing: boolean;
}

/**
 * Check if a user has an active paid subscription
 * 
 * Rule: User has a subscription with status 'active' or 'trialing' 
 * and period end in the future
 * 
 * @param userId - The UUID of the user
 * @returns Promise<boolean> - true if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  if (!userId || typeof userId !== 'string') {
    return false;
  }

  try {
    const supabase = await createUserSupabaseClient();

    // Query subscriptions directly (more reliable than view)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .gt('current_period_end', new Date().toISOString())
      .maybeSingle();

    return !!subscription;
  } catch (error) {
    console.error('[hasActiveSubscription] Error', { userId, error });
    return false;
  }
}

/**
 * Get user's active subscription status and plan information
 * 
 * @param userId - The UUID of the user
 * @returns Promise<UserSubscriptionStatus> - Subscription status and plan info
 */
export async function getUserSubscriptionStatus(
  userId: string
): Promise<UserSubscriptionStatus> {
  const defaultStatus: UserSubscriptionStatus = {
    hasActiveSubscription: false,
    planId: null,
    planName: null,
    status: null,
    currentPeriodEnd: null,
    isTrialing: false,
  };

  if (!userId || typeof userId !== 'string') {
    return defaultStatus;
  }

  try {
    const supabase = await createUserSupabaseClient();

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, stripe_price_id, current_period_end')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .gt('current_period_end', new Date().toISOString())
      .maybeSingle();

    if (!subscription) {
      return defaultStatus;
    }

    // Get plan details from subscription_plans
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('id, name')
      .eq('stripe_price_id', subscription.stripe_price_id)
      .eq('active', true)
      .maybeSingle();

    return {
      hasActiveSubscription: true,
      planId: plan?.id || null,
      planName: plan?.name || null,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      isTrialing: subscription.status === 'trialing',
    };
  } catch (error) {
    console.error('[getUserSubscriptionStatus] Error', { userId, error });
    return defaultStatus;
  }
}

/**
 * Get user's active subscription using the user_entitlements view
 * 
 * @param userId - The UUID of the user
 * @returns Promise<UserEntitlement | null> - Entitlement data or null
 */
export async function getUserEntitlement(
  userId: string
): Promise<UserEntitlement | null> {
  if (!userId || typeof userId !== 'string') {
    return null;
  }

  try {
    const supabase = await createUserSupabaseClient();

    // Query user_entitlements view
    const { data: entitlement } = await supabase
      .from('user_entitlements')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    return entitlement as UserEntitlement | null;
  } catch (error) {
    console.error('[getUserEntitlement] Error', { userId, error });
    return null;
  }
}

/**
 * Get the plan ID (tier) for a user based on their active subscription
 * 
 * Matches stripe_price_id to subscription_plans to determine which plan
 * 
 * @param userId - The UUID of the user
 * @returns Promise<string | null> - Plan ID (e.g., 'essential_monthly', 'pro_annual') or null
 */
export async function getUserPlanId(userId: string): Promise<string | null> {
  if (!userId || typeof userId !== 'string') {
    return null;
  }

  try {
    const supabase = await createUserSupabaseClient();

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_price_id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .gt('current_period_end', new Date().toISOString())
      .maybeSingle();

    if (!subscription?.stripe_price_id) {
      return null;
    }

    // Match stripe_price_id to subscription_plans
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('stripe_price_id', subscription.stripe_price_id)
      .eq('active', true)
      .maybeSingle();

    return plan?.id || null;
  } catch (error) {
    console.error('[getUserPlanId] Error', { userId, error });
    return null;
  }
}

/**
 * Check if user has access based on plan ID
 * 
 * @param userId - The UUID of the user
 * @param requiredPlanId - The plan ID required for access (e.g., 'pro_monthly')
 * @returns Promise<boolean> - true if user has the required plan or higher
 */
export async function hasPlanAccess(
  userId: string,
  requiredPlanId: string
): Promise<boolean> {
  const userPlanId = await getUserPlanId(userId);
  
  if (!userPlanId) {
    return false;
  }

  // Simple equality check for now
  // Could be enhanced to support plan hierarchy (e.g., pro > essential)
  return userPlanId === requiredPlanId;
}

/**
 * Check if user has "pro" level access (any pro plan)
 * 
 * @param userId - The UUID of the user
 * @returns Promise<boolean> - true if user has any pro plan
 */
export async function hasProAccess(userId: string): Promise<boolean> {
  const planId = await getUserPlanId(userId);
  return planId?.startsWith('pro_') || false;
}

/**
 * Check if user has "essential" level access (any essential plan)
 * 
 * @param userId - The UUID of the user
 * @returns Promise<boolean> - true if user has any essential plan
 */
export async function hasEssentialAccess(userId: string): Promise<boolean> {
  const planId = await getUserPlanId(userId);
  return planId?.startsWith('essential_') || false;
}
