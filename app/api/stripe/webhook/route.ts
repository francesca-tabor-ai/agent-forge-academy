import { NextRequest, NextResponse } from 'next/server';

// Runtime config - ensure Node.js runtime and force dynamic rendering
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 * 
 * Handles Stripe webhook events to keep database in sync with Stripe (source of truth)
 * 
 * Required Events:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.paid
 * - invoice.payment_failed
 * 
 * Optional Events:
 * - payment_intent.succeeded
 * - charge.succeeded
 * 
 * Uses lazy imports to avoid build-time errors when env vars are not set.
 */
export async function POST(request: NextRequest) {
  // Lazy import Stripe to avoid top-level code execution during build
  const Stripe = (await import('stripe')).default;
  const { createClient } = await import('@supabase/supabase-js');

  // Validate environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey || !webhookSecret) {
    console.error('Missing Stripe environment variables');
    return NextResponse.json(
      { error: 'Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET' },
      { status: 500 }
    );
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    return NextResponse.json(
      { error: 'Missing Supabase configuration' },
      { status: 500 }
    );
  }

  // Initialize clients inside handler (not at module scope)
  const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: any;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, stripe, supabase);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, stripe, supabase);
        // Also handle segment subscriptions if metadata indicates it
        await handleSegmentSubscriptionCreated(event.data.object, stripe, supabase);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, stripe, supabase);
        // Also handle segment subscriptions if metadata indicates it
        await handleSegmentSubscriptionUpdated(event.data.object, stripe, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase);
        // Also handle segment subscriptions if metadata indicates it
        await handleSegmentSubscriptionDeleted(event.data.object, supabase);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object, stripe, supabase);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabase);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object, supabase);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object, supabase);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    // Return 500 so Stripe will retry
    return NextResponse.json(
      { error: 'Webhook processing failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Resolve user_id from event payload
 * Priority: client_reference_id > metadata.user_id > stripe_customers lookup
 */
async function resolveUserId(
  event: any,
  stripe: any,
  supabase: any
): Promise<string | null> {
  // 1. Try client_reference_id (from checkout session)
  if (event.client_reference_id) {
    return event.client_reference_id;
  }

  // 2. Try metadata.user_id
  if (event.metadata?.user_id) {
    return event.metadata.user_id;
  }

  // 3. Try subscription metadata (if subscription is expanded in event)
  if (event.subscription) {
    let subscription = event.subscription;
    if (typeof subscription === 'string') {
      try {
        subscription = await stripe.subscriptions.retrieve(subscription);
      } catch (err) {
        // Subscription retrieval failed, continue to next method
        console.warn('Could not retrieve subscription for user_id resolution:', err);
      }
    }
    
    if (subscription && typeof subscription === 'object' && subscription.metadata?.user_id) {
      return subscription.metadata.user_id;
    }
  }

  // 4. Try customer lookup via stripe_customers table
  const customerId = event.customer || event.customer?.id;
  if (customerId) {
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (customer?.user_id) {
      return customer.user_id;
    }
  }

  return null;
}

/**
 * Ensure stripe_customers record exists
 */
async function ensureStripeCustomer(
  userId: string,
  stripeCustomerId: string,
  supabase: any
): Promise<void> {
  const { error } = await supabase
    .from('stripe_customers')
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
      },
      {
        onConflict: 'user_id',
      }
    );

  if (error) {
    console.error('Error upserting stripe_customer:', error);
    throw error;
  }
}

/**
 * Handle checkout.session.completed event
 * Creates/updates subscription for segment subscriptions
 */
async function handleCheckoutSessionCompleted(
  session: any,
  stripe: any,
  supabase: any
) {
  const userId = await resolveUserId(session, stripe, supabase);
  if (!userId) {
    console.error('Could not resolve user_id for checkout session:', session.id);
    return;
  }

  const customerId = session.customer as string;
  if (customerId) {
    await ensureStripeCustomer(userId, customerId, supabase);
  }

  // If this is a segment subscription, create/update the subscription record
  if (session.metadata?.segment_type && session.metadata?.segment_key) {
    // Retrieve the subscription from Stripe if available
    const subscriptionId = session.subscription as string | null;
    let subscription: any = null;
    let currentPeriodStart: Date;
    let currentPeriodEnd: Date;
    let priceId: string | null = null;
    const billingPeriod = (session.metadata.billing_period || 'monthly') as 'monthly' | 'annual';

    if (subscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
        currentPeriodStart = new Date(subscription.current_period_start * 1000);
        currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        priceId = subscription.items.data[0]?.price.id || null;
      } catch (error) {
        console.error('Error retrieving subscription:', error);
        // Fall back to default period end (30 days from now for monthly, 365 for annual)
        const days = billingPeriod === 'annual' ? 365 : 30;
        currentPeriodStart = new Date();
        currentPeriodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    } else {
      // No subscription yet (might be a one-time payment), use default period
      const days = billingPeriod === 'annual' ? 365 : 30;
      currentPeriodStart = new Date();
      currentPeriodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      
      // Try to get price ID from line items
      if (session.line_items?.data?.[0]?.price?.id) {
        priceId = session.line_items.data[0].price.id;
      }
    }

    // Determine status
    let status = 'active';
    if (subscription) {
      if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
        status = 'canceled';
      } else if (subscription.status === 'past_due') {
        status = 'past_due';
      } else if (subscription.status === 'expired') {
        status = 'expired';
      }
    }

    // Create or update segment subscription record
    const subscriptionData = {
      user_id: userId,
      segment_type: session.metadata.segment_type,
      segment_key: session.metadata.segment_key,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId || 'unknown', // Required field, use 'unknown' as fallback
      status: status,
      billing_cycle: billingPeriod,
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      canceled_at: subscription?.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    };

    const { error } = await supabase
      .from('segment_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id,segment_type,segment_key',
      });

    if (error) {
      console.error('Error upserting segment subscription from checkout session:', error);
      throw error;
    }

    console.log('Segment subscription created/updated from checkout session:', session.id, 'user:', userId, 'segment:', session.metadata.segment_type, session.metadata.segment_key);
  } else {
    console.log('Checkout session completed (not a segment subscription):', session.id, 'user:', userId);
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(
  subscription: any,
  stripe: any,
  supabase: any
) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('No price ID found in subscription:', subscriptionId);
    return;
  }

  // Resolve user_id
  const userId = await resolveUserId(subscription, stripe, supabase);
  if (!userId) {
    console.error('Could not resolve user_id for subscription:', subscriptionId);
    return;
  }

  // Ensure stripe_customer exists
  await ensureStripeCustomer(userId, customerId, supabase);

  // Upsert subscription
  const subscriptionData = {
    id: subscriptionId,
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    ended_at: subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }

  console.log('Subscription created/updated:', subscriptionId);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(
  subscription: any,
  stripe: any,
  supabase: any
) {
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('No price ID found in subscription:', subscriptionId);
    return;
  }

  // Resolve user_id
  const userId = await resolveUserId(subscription, stripe, supabase);
  if (!userId) {
    console.error('Could not resolve user_id for subscription:', subscriptionId);
    return;
  }

  // Ensure stripe_customer exists
  await ensureStripeCustomer(userId, customerId, supabase);

  // Upsert subscription
  const subscriptionData = {
    id: subscriptionId,
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    status: subscription.status,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    ended_at: subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }

  console.log('Subscription updated:', subscriptionId);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(
  subscription: any,
  supabase: any
) {
  const subscriptionId = subscription.id;

  const subscriptionData = {
    id: subscriptionId,
    status: 'canceled',
    ended_at: subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error updating deleted subscription:', error);
    throw error;
  }

  console.log('Subscription deleted:', subscriptionId);
}

/**
 * Handle invoice.paid event
 * Updates subscription period and status for segment subscriptions
 */
async function handleInvoicePaid(
  invoice: any,
  stripe: any,
  supabase: any
) {
  const invoiceId = invoice.id;
  const subscriptionId = invoice.subscription as string | null;
  const customerId = invoice.customer as string;
  const paymentIntentId = invoice.payment_intent as string | null;
  const chargeId = invoice.charge as string | null;

  // Resolve user_id from subscription or customer
  let userId: string | null = null;

  if (subscriptionId) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single();

    userId = subscription?.user_id || null;
  }

  if (!userId && customerId) {
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    userId = customer?.user_id || null;
  }

  if (!userId) {
    console.error('Could not resolve user_id for invoice:', invoiceId);
    return;
  }

  // Upsert payment record
  // Use payment_intent or charge ID if available, otherwise use invoice ID
  const paymentId = paymentIntentId || chargeId || invoiceId;
  const paymentData = {
    id: paymentId,
    user_id: userId,
    stripe_customer_id: customerId,
    amount: invoice.total, // For paid invoices, total is the amount paid
    currency: invoice.currency || 'gbp',
    status: 'succeeded',
    stripe_invoice_id: invoiceId,
    stripe_subscription_id: subscriptionId,
  };

  const { error } = await supabase
    .from('payments')
    .upsert(paymentData, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error upserting payment:', error);
    throw error;
  }

  // Update subscription period if it's a subscription invoice
  if (subscriptionId) {
    // First, try to get the subscription from Stripe to get metadata
    let subscription: any = null;
    try {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('Error retrieving subscription for invoice:', error);
    }

    // If this is a segment subscription, update the segment subscriptions table
    if (subscription?.metadata?.segment_type && subscription.metadata?.segment_key) {
      const subscriptionData = {
        stripe_subscription_id: subscriptionId,
        status: subscription.status === 'active' ? 'active' : 
                subscription.status === 'past_due' ? 'past_due' : 
                subscription.status === 'canceled' ? 'canceled' : 'expired',
        current_period_start: invoice.period_start
          ? new Date(invoice.period_start * 1000).toISOString()
          : null,
        current_period_end: invoice.period_end
          ? new Date(invoice.period_end * 1000).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: subError } = await supabase
        .from('segment_subscriptions')
        .update(subscriptionData)
        .eq('stripe_subscription_id', subscriptionId);

      if (subError) {
        console.error('Error updating segment subscription from invoice:', subError);
      } else {
        console.log('Segment subscription updated from invoice:', subscriptionId, 'segment:', subscription.metadata.segment_type, subscription.metadata.segment_key);
      }
    } else {
      // Update regular subscription table (if it exists with id = subscriptionId)
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({
          current_period_start: invoice.period_start
            ? new Date(invoice.period_start * 1000).toISOString()
            : null,
          current_period_end: invoice.period_end
            ? new Date(invoice.period_end * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (subError) {
        // This is expected if the subscription table uses stripe_subscription_id as id
        // Try updating by stripe_subscription_id instead
        const { error: subError2 } = await supabase
          .from('subscriptions')
          .update({
            current_period_end: invoice.period_end
              ? new Date(invoice.period_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);

        if (subError2) {
          console.error('Error updating subscription period:', subError2);
        }
      }
    }
  }

  console.log('Invoice paid:', invoiceId, 'user:', userId);
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(
  invoice: any,
  supabase: any
) {
  const invoiceId = invoice.id;
  const subscriptionId = invoice.subscription as string | null;
  const customerId = invoice.customer as string;

  // Resolve user_id
  let userId: string | null = null;

  if (subscriptionId) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single();

    userId = subscription?.user_id || null;
  }

  if (!userId && customerId) {
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    userId = customer?.user_id || null;
  }

  if (!userId) {
    console.error('Could not resolve user_id for failed invoice:', invoiceId);
    return;
  }

  // Insert payment failure record
  const paymentId = invoice.payment_intent || invoice.charge || `failed_${invoiceId}`;
  const paymentData = {
    id: paymentId,
    user_id: userId,
    stripe_customer_id: customerId,
    amount: invoice.amount_due || invoice.total,
    currency: invoice.currency || 'gbp',
    status: 'failed',
    stripe_invoice_id: invoiceId,
    stripe_subscription_id: subscriptionId,
  };

  const { error } = await supabase
    .from('payments')
    .upsert(paymentData, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error upserting failed payment:', error);
    throw error;
  }

  console.log('Invoice payment failed:', invoiceId, 'user:', userId);
}

/**
 * Handle payment_intent.succeeded event (optional)
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: any,
  supabase: any
) {
  const paymentIntentId = paymentIntent.id;
  const customerId = paymentIntent.customer as string | null;
  const invoiceId = paymentIntent.invoice as string | null;
  const subscriptionId = paymentIntent.subscription as string | null;

  if (!customerId) {
    return; // No customer, skip
  }

  // Resolve user_id
  let userId: string | null = null;

  if (subscriptionId) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single();

    userId = subscription?.user_id || null;
  }

  if (!userId && customerId) {
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single();

    userId = customer?.user_id || null;
  }

  if (!userId) {
    return; // Can't resolve user, skip
  }

  // Upsert payment record
  const paymentData = {
    id: paymentIntentId,
    user_id: userId,
    stripe_customer_id: customerId,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency || 'gbp',
    status: 'succeeded',
    stripe_invoice_id: invoiceId,
    stripe_subscription_id: subscriptionId,
  };

  const { error } = await supabase
    .from('payments')
    .upsert(paymentData, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error upserting payment intent:', error);
    // Don't throw - this is optional
  }

  console.log('Payment intent succeeded:', paymentIntentId);
}

/**
 * Handle charge.succeeded event (optional)
 */
async function handleChargeSucceeded(
  charge: any,
  supabase: any
) {
  const chargeId = charge.id;
  const customerId = charge.customer as string | null;
  const invoiceId = charge.invoice as string | null;
  const paymentIntentId = charge.payment_intent as string | null;

  if (!customerId) {
    return; // No customer, skip
  }

  // Resolve user_id
  const { data: customer } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!customer?.user_id) {
    return; // Can't resolve user, skip
  }

  // Get subscription from invoice if available
  let subscriptionId: string | null = null;
  if (invoiceId) {
    // Note: We'd need to fetch invoice from Stripe to get subscription_id
    // For now, skip subscription_id for charges
  }

  // Upsert payment record (use payment_intent if available, otherwise charge)
  const paymentId = paymentIntentId || chargeId;
  const paymentData = {
    id: paymentId,
    user_id: customer.user_id,
    stripe_customer_id: customerId,
    amount: charge.amount,
    currency: charge.currency || 'gbp',
    status: 'succeeded',
    stripe_invoice_id: invoiceId,
    stripe_subscription_id: subscriptionId,
  };

  const { error } = await supabase
    .from('payments')
    .upsert(paymentData, {
      onConflict: 'id',
    });

  if (error) {
    console.error('Error upserting charge:', error);
    // Don't throw - this is optional
  }

  console.log('Charge succeeded:', chargeId);
}

/**
 * Handle segment subscription created event
 */
async function handleSegmentSubscriptionCreated(
  subscription: any,
  stripe: any,
  supabase: any
) {
  // Check if this is a segment subscription
  if (!subscription.metadata?.segment_type || !subscription.metadata?.segment_key) {
    return; // Not a segment subscription
  }

  const subscriptionId = subscription.id;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('No price ID found in segment subscription:', subscriptionId);
    return;
  }

  // Resolve user_id
  const userId = await resolveUserId(subscription, stripe, supabase);
  if (!userId) {
    console.error('Could not resolve user_id for segment subscription:', subscriptionId);
    return;
  }

  // Determine billing cycle from price ID
  const billingCycle = priceId.includes('annual') ? 'annual' : 'monthly';

  // Upsert segment subscription
  const segmentSubscriptionData = {
    user_id: userId,
    segment_type: subscription.metadata.segment_type,
    segment_key: subscription.metadata.segment_key,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    status: subscription.status === 'active' ? 'active' : 'canceled',
    billing_cycle: billingCycle,
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : new Date().toISOString(),
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('segment_subscriptions')
    .upsert(segmentSubscriptionData, {
      onConflict: 'user_id,segment_type,segment_key',
    });

  if (error) {
    console.error('Error upserting segment subscription:', error);
    throw error;
  }

  console.log('Segment subscription created/updated:', subscriptionId, subscription.metadata.segment_type, subscription.metadata.segment_key);
}

/**
 * Handle segment subscription updated event
 */
async function handleSegmentSubscriptionUpdated(
  subscription: any,
  stripe: any,
  supabase: any
) {
  // Check if this is a segment subscription
  if (!subscription.metadata?.segment_type || !subscription.metadata?.segment_key) {
    return; // Not a segment subscription
  }

  const subscriptionId = subscription.id;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error('No price ID found in segment subscription:', subscriptionId);
    return;
  }

  // Resolve user_id
  const userId = await resolveUserId(subscription, stripe, supabase);
  if (!userId) {
    console.error('Could not resolve user_id for segment subscription:', subscriptionId);
    return;
  }

  // Determine billing cycle from price ID
  const billingCycle = priceId.includes('annual') ? 'annual' : 'monthly';

  // Update segment subscription
  const segmentSubscriptionData = {
    stripe_price_id: priceId,
    status: subscription.status === 'active' ? 'active' : subscription.status === 'canceled' ? 'canceled' : 'expired',
    billing_cycle: billingCycle,
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('segment_subscriptions')
    .update(segmentSubscriptionData)
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating segment subscription:', error);
    throw error;
  }

  console.log('Segment subscription updated:', subscriptionId);
}

/**
 * Handle segment subscription deleted event
 */
async function handleSegmentSubscriptionDeleted(
  subscription: any,
  supabase: any
) {
  // Check if this is a segment subscription
  if (!subscription.metadata?.segment_type || !subscription.metadata?.segment_key) {
    return; // Not a segment subscription
  }

  const subscriptionId = subscription.id;

  // Mark segment subscription as expired
  const { error } = await supabase
    .from('segment_subscriptions')
    .update({
      status: 'expired',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error deleting segment subscription:', error);
    throw error;
  }

  console.log('Segment subscription deleted:', subscriptionId);
}
