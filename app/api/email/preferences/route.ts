import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * PATCH /api/email/preferences
 * 
 * Update student email preferences
 * 
 * Body: {
 *   weekly_learning_emails_enabled?: boolean
 *   weekly_jobs_emails_enabled?: boolean
 *   weekly_email_day?: number (0-6)
 *   weekly_email_hour?: number (0-23)
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      weekly_learning_emails_enabled,
      weekly_jobs_emails_enabled,
      weekly_email_day,
      weekly_email_hour,
    } = body;

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Build update object with only provided fields
    const updateData: any = {};

    if (typeof weekly_learning_emails_enabled === 'boolean') {
      updateData.weekly_learning_emails_enabled = weekly_learning_emails_enabled;
    }

    if (typeof weekly_jobs_emails_enabled === 'boolean') {
      updateData.weekly_jobs_emails_enabled = weekly_jobs_emails_enabled;
    }

    if (typeof weekly_email_day === 'number') {
      if (weekly_email_day < 0 || weekly_email_day > 6) {
        return NextResponse.json(
          { error: 'weekly_email_day must be between 0 and 6' },
          { status: 400 }
        );
      }
      updateData.weekly_email_day = weekly_email_day;
    }

    if (typeof weekly_email_hour === 'number') {
      if (weekly_email_hour < 0 || weekly_email_hour > 23) {
        return NextResponse.json(
          { error: 'weekly_email_hour must be between 0 and 23' },
          { status: 400 }
        );
      }
      updateData.weekly_email_hour = weekly_email_hour;
    }

    // Update student profile
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update(updateData)
      .eq('id', studentProfile.id);

    if (updateError) {
      console.error('Error updating email preferences:', updateError);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email preferences updated',
    });
  } catch (error) {
    console.error('Error in email preferences API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
