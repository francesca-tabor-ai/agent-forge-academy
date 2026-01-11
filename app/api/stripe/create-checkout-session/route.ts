import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

/**
 * POST /api/stripe/create-checkout-session
 * 
 * Creates a Stripe Checkout session for new subscriptions
 * 
 * Body:
 * {
 *   "tier": "essential" | "professional",
 *   "successUrl": "/student/subscription?success=true",
 *   "cancelUrl": "/student/subscription?canceled=true"
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
    const { tier, successUrl, cancelUrl } = body;

    // Validate tier
    if (!tier || !['essential', 'professional'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "essential" or "professional"' },
        { status: 400 }
      );
    }

    // Get tier config with Stripe price ID
    const { data: tierConfig } = await supabase
      .from('subscription_tier_config')
      .select('stripe_price_id, name')
      .eq('tier', tier)
      .single();

    if (!tierConfig || !tierConfig.stripe_price_id) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured for this tier' },
        { status: 500 }
      );
    }

    // Get user profile for email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get user's profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user already has a Stripe customer ID
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', userProfile.id)
      .single();

    let customerId: string | undefined;

    if (studentProfile) {
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('student_profile_id', studentProfile.id)
        .single();

      customerId = existingSubscription?.stripe_customer_id;
    }

    // Get Stripe client
    const stripe = getStripeClient();

    // Create or retrieve Stripe customer
    let stripeCustomer: any;
    
    if (customerId) {
      stripeCustomer = await stripe.customers.retrieve(customerId);
    } else {
      stripeCustomer = await stripe.customers.create({
        email: profile.email,
        metadata: {
          user_id: user.id,
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierConfig.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/student/subscription?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/student/subscription?canceled=true`,
      metadata: {
        tier,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          tier,
          user_id: user.id,
        },
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
