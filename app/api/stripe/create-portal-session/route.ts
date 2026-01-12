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
    // Try new structure (user_id) first, then fall back to old structure (student_profile_id)
    let subscription = null;
    let studentProfileId: string | undefined;
    
    // Try new structure with user_id
    const { data: subByUserId } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .not('stripe_customer_id', 'is', null)
      .limit(1)
      .maybeSingle();
    
    if (subByUserId) {
      subscription = subByUserId;
    } else {
      // Fall back to old structure with student_profile_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data: studentProfile } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('profile_id', profile.id)
          .single();

        if (studentProfile) {
          studentProfileId = studentProfile.id;
          const { data: subByStudentProfile } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('student_profile_id', studentProfile.id)
            .not('stripe_customer_id', 'is', null)
            .single();
          
          subscription = subByStudentProfile;
        }
      }
    }

    if (!subscription || !subscription.stripe_customer_id) {
      console.error('No Stripe customer ID found', {
        userId,
        studentProfileId: studentProfileId || 'N/A',
        requestId,
      });
      return NextResponse.json(
        { error: 'NO_STRIPE_CUSTOMER', message: 'No active subscription found' },
        { status: 404 }
      );
    }

    stripeCustomerId = subscription.stripe_customer_id;

    // Guard: ensure stripeCustomerId exists before creating portal session
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found for this user" },
        { status: 400 }
      );
    }

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
