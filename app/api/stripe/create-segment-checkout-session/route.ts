import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';
import { getSegment } from '@/lib/utils/segments';
import { getSegmentSubscriptionConfig } from '@/lib/utils/segment-subscriptions';
import type { SegmentType } from '@/lib/types/segment';

/**
 * POST /api/stripe/create-segment-checkout-session
 * 
 * Creates a Stripe Checkout session for segment-based subscriptions
 * 
 * Body:
 * {
 *   "segmentType": "track" | "industry" | "role",
 *   "segmentKey": "agentic-systems",
 *   "billingCycle": "monthly" | "annual",
 *   "successUrl": "/segments/track/agentic-systems?success=true",
 *   "cancelUrl": "/segments/track/agentic-systems?canceled=true"
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
    const { segmentType, segmentKey, billingCycle, successUrl, cancelUrl } = body;

    // Validate inputs
    if (!segmentType || !segmentKey || !billingCycle) {
      return NextResponse.json(
        { error: 'segmentType, segmentKey, and billingCycle are required' },
        { status: 400 }
      );
    }

    const validTypes: SegmentType[] = ['track', 'industry', 'role'];
    if (!validTypes.includes(segmentType as SegmentType)) {
      return NextResponse.json(
        { error: 'Invalid segmentType' },
        { status: 400 }
      );
    }

    if (billingCycle !== 'monthly' && billingCycle !== 'annual') {
      return NextResponse.json(
        { error: 'billingCycle must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    // Get segment
    const segment = getSegment(segmentType as SegmentType, segmentKey);
    if (!segment) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }

    // Get subscription config
    const config = getSegmentSubscriptionConfig(segment);
    if (!config) {
      return NextResponse.json(
        { error: 'Subscription config not found for segment' },
        { status: 404 }
      );
    }

    // Get price ID based on billing cycle
    const priceId = billingCycle === 'annual' ? config.annualPriceId : config.monthlyPriceId;

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
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/segments/${segmentType}/${segmentKey}?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/segments/${segmentType}/${segmentKey}?canceled=true`,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        segment_type: segmentType,
        segment_key: segmentKey,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          segment_type: segmentType,
          segment_key: segmentKey,
          billing_cycle: billingCycle,
        },
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error: any) {
    console.error('Error creating segment checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', message: error.message },
      { status: 500 }
    );
  }
}
