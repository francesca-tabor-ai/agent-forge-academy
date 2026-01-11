import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getStripeClient } from '@/lib/stripe';

/**
 * POST /api/stripe/create-portal-session
 * 
 * Creates a Stripe Customer Portal session for managing subscriptions
 * 
 * Body:
 * {
 *   "returnUrl": "/student/subscription"
 * }
 */
export async function POST(request: NextRequest) {
  let userId: string | undefined;
  let stripeCustomerId: string | undefined;
  const requestId = crypto.randomUUID();
  
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

    userId = user.id;

    const body = await request.json();
    const { returnUrl } = body;

    // Get user's subscription to find Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (!subscription || !subscription.stripe_customer_id) {
      console.error('No Stripe customer ID found', {
        userId,
        studentProfileId: studentProfile.id,
        requestId,
      });
      return NextResponse.json(
        { error: 'NO_STRIPE_CUSTOMER', message: 'No active subscription found' },
        { status: 404 }
      );
    }

    stripeCustomerId = subscription.stripe_customer_id;

    // Get Stripe client
    const stripe = getStripeClient();

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/student/subscription`,
    });

    return NextResponse.json({
      portalUrl: session.url,
    });

  } catch (error: any) {
    console.error('Error creating portal session:', {
      error: error.message,
      stack: error.stack,
      requestId,
      userId: userId || 'unknown',
      stripeCustomerId: stripeCustomerId || 'unknown',
    });
    
    // Return more specific error if it's a Stripe error
    if (error.type === 'StripeInvalidRequestError' || error.type?.startsWith('Stripe')) {
      return NextResponse.json(
        { error: 'STRIPE_ERROR', message: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create portal session', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
