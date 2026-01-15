import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * PATCH /api/portfolio/visibility
 * 
 * Update student profile visibility
 * 
 * Body: {
 *   visibility: 'private' | 'recruiters_only' | 'public'
 *   studentProfileId: string
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
    const { visibility, studentProfileId } = body;

    // Validate visibility value
    if (!['private', 'recruiters_only', 'public'].includes(visibility)) {
      return NextResponse.json(
        { error: 'Invalid visibility value. Must be private, recruiters_only, or public' },
        { status: 400 }
      );
    }

    if (!studentProfileId) {
      return NextResponse.json(
        { error: 'studentProfileId is required' },
        { status: 400 }
      );
    }

    // Get user's profile to verify ownership
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify the student profile belongs to the user
    const { data: studentProfile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('id, profile_id')
      .eq('id', studentProfileId)
      .single();

    if (fetchError || !studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    if (studentProfile.profile_id !== profile.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update visibility (RLS will enforce ownership)
    const { data: updatedProfile, error: updateError } = await supabase
      .from('student_profiles')
      .update({ visibility })
      .eq('id', studentProfileId)
      .select('id, visibility')
      .single();

    if (updateError) {
      console.error('Error updating visibility:', updateError);
      return NextResponse.json(
        { error: 'Failed to update visibility' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error in PATCH /api/portfolio/visibility:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
