import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/subscription/update-billing-email
 * 
 * Updates the billing email for the authenticated user
 * 
 * Body:
 * {
 *   "billingEmail": "newemail@example.com"
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
    const { billingEmail } = body;

    if (!billingEmail) {
      return NextResponse.json(
        { error: 'billingEmail is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get user profile
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

    // Update billing_email in profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ billing_email: billingEmail })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating billing email:', error);
      return NextResponse.json(
        { error: 'Failed to update billing email', message: error.message },
        { status: 500 }
      );
    }

    // Revalidate the subscription page
    revalidatePath('/student/subscription');

    return NextResponse.json({
      success: true,
      message: 'Billing email updated successfully',
      billingEmail,
    });

  } catch (error: any) {
    console.error('Error updating billing email:', error);
    return NextResponse.json(
      { error: 'Failed to update billing email', message: error.message },
      { status: 500 }
    );
  }
}
