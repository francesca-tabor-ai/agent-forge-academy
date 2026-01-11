import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/stripe/webhook
 * 
 * Handles Stripe webhook events to keep database in sync
 * 
 * Required Events:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * - customer.subscription.trial_will_end
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    // Return 500 so Stripe will retry
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const priceId = subscription.items.data[0]?.price.id;

  // Get tier from price metadata or price ID lookup
  const { data: tierConfig } = await supabase
    .from('subscription_tier_config')
    .select('tier')
    .eq('stripe_price_id', priceId)
    .single();

  if (!tierConfig) {
    console.error('Tier config not found for price ID:', priceId);
    return;
  }

  // Get customer email to find user
  const customer = await stripe.customers.retrieve(customerId);
  const email = typeof customer === 'object' && !customer.deleted
    ? customer.email
    : null;

  if (!email) {
    console.error('Customer email not found:', customerId);
    return;
  }

  // Find user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('email', email)
    .single();

  if (!profile) {
    console.error('Profile not found for email:', email);
    return;
  }

  // Get student profile
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!studentProfile) {
    console.error('Student profile not found for profile:', profile.id);
    return;
  }

  // Get tier config for price
  const { data: tierConfigFull } = await supabase
    .from('subscription_tier_config')
    .select('price_monthly')
    .eq('tier', tierConfig.tier)
    .single();

  // Determine status
  const status = subscription.status === 'trialing' ? 'trial' : 'active';
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  // Create subscription record
  const { error } = await supabase
    .from('subscriptions')
    .insert({
      student_profile_id: studentProfile.id,
      tier: tierConfig.tier,
      status,
      price_monthly: tierConfigFull?.price_monthly || 0,
      currency: 'GBP',
      started_at: new Date(subscription.created * 1000).toISOString(),
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end_at: trialEnd,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: customerId,
    });

  if (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }

  console.log('Subscription created:', subscriptionId);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;
  const priceId = subscription.items.data[0]?.price.id;

  // Get tier from price
  const { data: tierConfig } = await supabase
    .from('subscription_tier_config')
    .select('tier, price_monthly')
    .eq('stripe_price_id', priceId)
    .single();

  // Map Stripe status to our status
  let status: 'active' | 'trial' | 'paused' | 'canceled' | 'expired';
  switch (subscription.status) {
    case 'active':
      status = 'active';
      break;
    case 'trialing':
      status = 'trial';
      break;
    case 'canceled':
    case 'unpaid':
      status = 'canceled';
      break;
    case 'past_due':
      status = 'paused';
      break;
    default:
      status = 'active';
  }

  // Update subscription
  const updateData: any = {
    status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Update tier if changed
  if (tierConfig) {
    updateData.tier = tierConfig.tier;
    updateData.price_monthly = tierConfig.price_monthly;
  }

  // Update canceled_at if canceled
  if (subscription.canceled_at) {
    updateData.canceled_at = new Date(subscription.canceled_at * 1000).toISOString();
  }

  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('tier, student_profile_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (existingSubscription && tierConfig && existingSubscription.tier !== tierConfig.tier) {
    // Tier changed - log it
    await supabase.rpc('change_subscription_tier', {
      p_subscription_id: existingSubscription.id,
      p_new_tier: tierConfig.tier,
      p_effective_immediately: true,
      p_prorated_amount: null,
    });
  } else {
    // Just update the subscription
    const { error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscriptionId);

    if (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  console.log('Subscription updated:', subscriptionId);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }

  console.log('Subscription canceled:', subscriptionId);
}

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return; // One-time payment, not subscription
  }

  // Update subscription period
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: invoice.period_start
        ? new Date(invoice.period_start * 1000).toISOString()
        : undefined,
      current_period_end: invoice.period_end
        ? new Date(invoice.period_end * 1000).toISOString()
        : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription after payment:', error);
    throw error;
  }

  console.log('Payment succeeded for subscription:', subscriptionId);
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return; // One-time payment, not subscription
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (subscription) {
    // Call payment failure handler
    await supabase.rpc('handle_payment_failure', {
      p_subscription_id: subscription.id,
      p_grace_period_days: 7,
    });
  }

  console.log('Payment failed for subscription:', subscriptionId);
}

/**
 * Handle trial will end event
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  // This is a notification event - we can log it or send email
  // The UI should check trial_end_at and show banner
  console.log('Trial ending soon for subscription:', subscription.id);
  
  // Could trigger email notification here
  // For now, just log - UI will handle display
}
