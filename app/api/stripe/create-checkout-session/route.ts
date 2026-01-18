import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

/**
 * POST /api/stripe/create-checkout-session
 * 
 * Creates a Stripe Checkout session for new subscriptions
 * 
 * Body:
 * {
 *   "plan_id": "essential_monthly" | "pro_monthly" | "essential_annual" | "pro_annual",
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
    const { plan_id, successUrl, cancelUrl } = body;

    // Validate plan_id
    if (!plan_id) {
      return NextResponse.json(
        { error: 'plan_id is required' },
        { status: 400 }
      );
    }

    // Look up plan from subscription_plans table
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

    if (!plan.stripe_price_id) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured for this plan' },
        { status: 500 }
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

    // Check if Stripe customer exists in stripe_customers table
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let stripeCustomerId: string | undefined;

    if (existingCustomer?.stripe_customer_id) {
      // Retrieve existing customer
      stripeCustomerId = existingCustomer.stripe_customer_id ?? undefined;
      if (stripeCustomerId) {
        try {
          await stripe.customers.retrieve(stripeCustomerId);
        } catch (error: any) {
          // Customer might have been deleted in Stripe, create a new one
          const newCustomer = await stripe.customers.create({
            email: profile.email,
            metadata: {
              user_id: user.id,
            },
          });
          stripeCustomerId = newCustomer.id;

          // Update stripe_customers table (use service role to bypass RLS)
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
        },
      });
      stripeCustomerId = newCustomer.id;

      // Insert into stripe_customers table (use service role to bypass RLS)
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
    const finalSuccessUrl = successUrl || `${baseUrl}/student/subscription?success=true`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/student/subscription?canceled=true`;

    // Coerce null to undefined for Stripe (SessionCreateParams rejects null)
    const customerId = stripeCustomerId ?? undefined;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      ...(customerId ? { customer: customerId } : { customer_email: profile.email ?? undefined }),
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id, // TypeScript now knows this is string (not null)
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        plan_id: plan_id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: plan_id,
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
      { error: 'Failed to create checkout session', message: error.message },
      { status: 500 }
    );
  }
}
