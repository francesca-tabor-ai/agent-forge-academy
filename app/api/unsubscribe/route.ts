import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/unsubscribe?token=<unsubscribe_token>
 * 
 * Unsubscribe a student from weekly learning emails
 * Uses unsubscribe_token from student_profiles table
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Find student profile by unsubscribe token
    const { data: studentProfile, error: findError } = await supabase
      .from('student_profiles')
      .select('id, weekly_learning_emails_enabled')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !studentProfile) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 404 }
      );
    }

    // If already unsubscribed, return success
    if (!studentProfile.weekly_learning_emails_enabled) {
      return NextResponse.redirect(new URL('/unsubscribe?status=already', request.url));
    }

    // Disable weekly learning emails
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ weekly_learning_emails_enabled: false })
      .eq('id', studentProfile.id);

    if (updateError) {
      console.error('Error unsubscribing:', updateError);
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    // Redirect to a confirmation page (or return JSON)
    return NextResponse.redirect(new URL('/unsubscribe?status=success', request.url));
  } catch (error) {
    console.error('Error in unsubscribe endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
