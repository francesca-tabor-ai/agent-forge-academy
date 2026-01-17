import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';
import { getStripePriceId } from '@/lib/utils/subscription-metadata';

/**
 * POST /api/stripe/checkout
 * 
 * Generic Stripe Checkout session creation endpoint
 * Supports both direct priceId and segment-based subscriptions
 * 
 * Body (Option 1 - Direct price ID):
 * {
 *   "priceId": "price_xxx",  // Stripe price ID (required if not using segment)
 *   "successUrl": "/success?session_id={CHECKOUT_SESSION_ID}",
 *   "cancelUrl": "/cancel",
 *   "mode": "subscription" | "payment",  // Default: "subscription"
 *   "metadata": { ... }  // Optional metadata
 * }
 * 
 * Body (Option 2 - Segment subscription):
 * {
 *   "segment_type": "track" | "industry" | "role",
 *   "segment_key": "agentic-systems",
 *   "billing_period": "monthly" | "annual",
 *   "successUrl": "/success?session_id={CHECKOUT_SESSION_ID}",
 *   "cancelUrl": "/cancel"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Require authentication before checkout
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', requiresAuth: true },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      priceId, 
      segment_type, 
      segment_key, 
      billing_period,
      successUrl, 
      cancelUrl, 
      mode = 'subscription', 
      metadata = {} 
    } = body;

    // Determine price ID - either direct or from segment subscription
    let finalPriceId: string | null = null;

    if (priceId) {
      // Direct price ID provided
      finalPriceId = priceId;
    } else if (segment_type && segment_key && billing_period) {
      // Segment subscription - look up price ID from subscriptions.md
      if (!['track', 'industry', 'role'].includes(segment_type)) {
        return NextResponse.json(
          { error: 'Invalid segment_type. Must be "track", "industry", or "role"' },
          { status: 400 }
        );
      }

      if (billing_period !== 'monthly' && billing_period !== 'annual') {
        return NextResponse.json(
          { error: 'Invalid billing_period. Must be "monthly" or "annual"' },
          { status: 400 }
        );
      }

      finalPriceId = getStripePriceId(
        segment_type as 'track' | 'industry' | 'role',
        segment_key,
        billing_period as 'monthly' | 'annual'
      );

      if (!finalPriceId) {
        return NextResponse.json(
          { error: `Subscription not found for ${segment_type}:${segment_key}` },
          { status: 404 }
        );
      }

      // Add segment metadata
      metadata.segment_type = segment_type;
      metadata.segment_key = segment_key;
      metadata.billing_period = billing_period;
    } else {
      return NextResponse.json(
        { error: 'Either priceId or (segment_type, segment_key, billing_period) is required' },
        { status: 400 }
      );
    }

    // Ensure finalPriceId is a string (TypeScript guard)
    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Validate mode
    if (mode !== 'subscription' && mode !== 'payment') {
      return NextResponse.json(
        { error: 'mode must be "subscription" or "payment"' },
        { status: 400 }
      );
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', user.id)
      .single();

    if (!profile || !profile.email) {
      return NextResponse.json(
        { error: 'Profile not found or email missing' },
        { status: 404 }
      );
    }

    // Get Stripe client
    const stripe = getStripeClient();

    // Check if Stripe customer exists
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let stripeCustomerId: string | undefined;

    if (existingCustomer?.stripe_customer_id) {
      stripeCustomerId = existingCustomer.stripe_customer_id ?? undefined;
      if (stripeCustomerId) {
        try {
          await stripe.customers.retrieve(stripeCustomerId);
        } catch (error: any) {
          // Customer might have been deleted, create a new one
          const newCustomer = await stripe.customers.create({
            email: profile.email,
            metadata: {
              user_id: user.id,
              ...metadata,
            },
          });
          stripeCustomerId = newCustomer.id;

          const serverSupabase = createServerSupabaseClient();
          await serverSupabase
            .from('stripe_customers')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('user_id', user.id);
        }
      }
    } else {
      // Create new Stripe customer
      const newCustomer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          user_id: user.id,
          ...metadata,
        },
      });
      stripeCustomerId = newCustomer.id;

      const serverSupabase = createServerSupabaseClient();
      await serverSupabase
        .from('stripe_customers')
        .insert({
          user_id: user.id,
          stripe_customer_id: stripeCustomerId,
        });
    }

    // Ensure URLs are always strings
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const finalSuccessUrl = successUrl || `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/cancel`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_email: profile.email }),
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId, // TypeScript now knows this is string (not null)
          quantity: 1,
        },
      ],
      mode: mode as 'subscription' | 'payment',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        ...metadata,
      },
      ...(mode === 'subscription' ? {
        subscription_data: {
          metadata: {
            user_id: user.id,
            ...metadata,
          },
        },
      } : {}),
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: error.message },
      { status: 500 }
    );
  }
}
