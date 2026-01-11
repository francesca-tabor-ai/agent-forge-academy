import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

/**
 * POST /api/subscription/update
 * 
 * Updates a user's subscription (upgrade/downgrade) by changing the plan
 * 
 * Body:
 * {
 *   "plan_id": "essential_monthly" | "pro_monthly" | "essential_annual" | "pro_annual",
 *   "proration_behavior": "create_prorations" | "none" | "always_invoice" (default: "create_prorations")
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
    const { plan_id, proration_behavior = 'create_prorations' } = body;

    // Validate plan_id
    if (!plan_id) {
      return NextResponse.json(
        { error: 'plan_id is required' },
        { status: 400 }
      );
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('id, name, stripe_price_id, active')
      .eq('id', plan_id)
      .single();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    if (!plan.active) {
      return NextResponse.json(
        { error: 'Plan is not active' },
        { status: 400 }
      );
    }

    // Get user's active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, stripe_price_id, status')
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

    // Check if already on the requested plan
    if (subscription.stripe_price_id === plan.stripe_price_id) {
      return NextResponse.json(
        { error: `Subscription is already on ${plan.name}` },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();

    // Get the subscription from Stripe to access items
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.id);
    const subscriptionItemId = stripeSubscription.items.data[0]?.id;

    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: 'Subscription item not found' },
        { status: 500 }
      );
    }

    // Update subscription with new price
    await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscriptionItemId,
          price: plan.stripe_price_id,
        },
      ],
      proration_behavior: proration_behavior as any,
      metadata: {
        user_id: user.id,
        plan_id: plan_id,
      },
    });

    // Webhook will update the database automatically
    // Return success immediately
    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      subscriptionId: subscription.id,
      oldPlanId: subscription.stripe_price_id,
      newPlanId: plan.stripe_price_id,
      planName: plan.name,
      proration_behavior,
    });

  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription', message: error.message },
      { status: 500 }
    );
  }
}
