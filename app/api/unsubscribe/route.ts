import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Force dynamic rendering (uses nextUrl.searchParams)
export const dynamic = 'force-dynamic';

/**
 * GET /api/email/unsubscribe?token=<unsubscribe_token>&type=learning|jobs|all
 * 
 * Unsubscribe a student from weekly emails
 * Uses unsubscribe_token from student_profiles table
 * 
 * Query parameters:
 *   token: Unsubscribe token (required)
 *   type: 'learning' | 'jobs' | 'all' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const type = searchParams.get('type') || 'all';

    if (!token) {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    // Validate type parameter
    if (!['learning', 'jobs', 'all'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "learning", "jobs", or "all"' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Find student profile by unsubscribe token
    const { data: studentProfile, error: findError } = await supabase
      .from('student_profiles')
      .select('id, weekly_learning_emails_enabled, weekly_jobs_emails_enabled')
      .eq('unsubscribe_token', token)
      .single();

    if (findError || !studentProfile) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 404 }
      );
    }

    // Determine which fields to update based on type
    const updateData: {
      weekly_learning_emails_enabled?: boolean;
      weekly_jobs_emails_enabled?: boolean;
    } = {};

    if (type === 'learning' || type === 'all') {
      updateData.weekly_learning_emails_enabled = false;
    }

    if (type === 'jobs' || type === 'all') {
      updateData.weekly_jobs_emails_enabled = false;
    }

    // Check if already unsubscribed from all requested types
    const alreadyUnsubscribed =
      (type === 'learning' && !studentProfile.weekly_learning_emails_enabled) ||
      (type === 'jobs' && !studentProfile.weekly_jobs_emails_enabled) ||
      (type === 'all' && !studentProfile.weekly_learning_emails_enabled && !studentProfile.weekly_jobs_emails_enabled);

    if (alreadyUnsubscribed) {
      // Redirect to confirmation page with already unsubscribed status
      const baseUrl = new URL(request.url).origin;
      return NextResponse.redirect(
        new URL(`/student/subscription?unsubscribed=already&type=${type}`, baseUrl)
      );
    }

    // Update email preferences
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update(updateData)
      .eq('id', studentProfile.id);

    if (updateError) {
      console.error('Error unsubscribing:', updateError);
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    // Redirect to subscription page with success status
    const baseUrl = new URL(request.url).origin;
    return NextResponse.redirect(
      new URL(`/student/subscription?unsubscribed=success&type=${type}`, baseUrl)
    );
  } catch (error) {
    console.error('Error in unsubscribe endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
