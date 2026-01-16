import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

/**
 * POST /api/stripe/checkout
 * 
 * Generic Stripe Checkout session creation endpoint
 * 
 * Body:
 * {
 *   "priceId": "price_xxx",  // Stripe price ID (required)
 *   "successUrl": "/success?session_id={CHECKOUT_SESSION_ID}",
 *   "cancelUrl": "/cancel",
 *   "mode": "subscription" | "payment",  // Default: "subscription"
 *   "metadata": { ... }  // Optional metadata
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
    const { priceId, successUrl, cancelUrl, mode = 'subscription', metadata = {} } = body;

    // Validate inputs
    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId is required' },
        { status: 400 }
      );
    }

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

    let stripeCustomerId: string;

    if (existingCustomer?.stripe_customer_id) {
      stripeCustomerId = existingCustomer.stripe_customer_id;
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

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as 'subscription' | 'payment',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cancel`,
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
