import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentProfileId, isDefault } = body;

    if (!studentProfileId || typeof isDefault !== 'boolean') {
      return NextResponse.json(
        { error: 'studentProfileId and isDefault (boolean) are required' },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get student profile and verify ownership
    const { data: studentProfile, error: fetchError } = await supabase
      .from('student_profiles')
      .select('id, profile_id')
      .eq('id', studentProfileId)
      .single();

    if (fetchError || !studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    if (studentProfile.profile_id !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Note: Currently, there's only one CV per student (enforced by unique constraint)
    // This endpoint is prepared for future multi-CV support
    // For now, we just return success since the current CV is effectively the default
    
    // In the future, we could add an `is_default` field to student_cvs table
    // and update it here. For now, we'll just return success.

    return NextResponse.json({ 
      success: true, 
      message: 'Default CV updated',
      // Note: Currently only one CV per student, so this is always the default
      isDefault: true 
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
