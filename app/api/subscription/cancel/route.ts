import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

/**
 * POST /api/subscription/cancel
 * 
 * Cancels a user's subscription in Stripe
 * 
 * Body:
 * {
 *   "cancelImmediately": boolean (default: false)
 *     - false: Cancel at period end (set cancel_at_period_end=true)
 *     - true: Cancel immediately
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cancelImmediately = false } = body;

    // Get user's active subscription from new subscriptions table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, stripe_customer_id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .gt('current_period_end', new Date().toISOString())
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
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

    // Webhook will update the database automatically
    // Return success immediately
    return NextResponse.json({
      success: true,
      message: cancelImmediately
        ? 'Subscription canceled immediately'
        : 'Subscription will be canceled at the end of the current period',
      subscriptionId: subscription.id,
      cancelImmediately,
    });

  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', message: error.message },
      { status: 500 }
    );
  }
}
