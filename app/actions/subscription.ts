'use server';

import { revalidatePath } from 'next/cache';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

/**
 * Cancel subscription server action
 * 
 * @param cancelImmediately - If true, cancel immediately; if false, cancel at period end
 */
export async function cancelSubscription(cancelImmediately: boolean = false) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Get user's active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, stripe_customer_id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .gt('current_period_end', new Date().toISOString())
      .maybeSingle();

    if (!subscription) {
      return {
        success: false,
        error: 'No active subscription found',
      };
    }

    const stripe = getStripeClient();

    if (cancelImmediately) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.id);
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
    }

    // Revalidate the subscription page
    revalidatePath('/student/subscription');

    return {
      success: true,
      message: cancelImmediately
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at the end of the current period',
    };

  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel subscription',
    };
  }
}

/**
 * Update billing email server action
 * 
 * @param billingEmail - New billing email address
 */
export async function updateBillingEmail(billingEmail: string) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingEmail)) {
      return {
        success: false,
        error: 'Invalid email format',
      };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    // Update billing_email in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ billing_email: billingEmail })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating billing email:', error);
      return {
        success: false,
        error: 'Failed to update billing email',
      };
    }

    // Revalidate the subscription page
    revalidatePath('/student/subscription');

    return {
      success: true,
      message: 'Billing email updated successfully',
    };

  } catch (error: any) {
    console.error('Error updating billing email:', error);
    return {
      success: false,
      error: error.message || 'Failed to update billing email',
    };
  }
}
