import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface SaveRunRequest {
  tool_id: string;
  inputs: Record<string, unknown>;
  outputs: Record<string, unknown>;
}

/**
 * POST: Save a tool run to the database
 */
export async function POST(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SaveRunRequest = await request.json();
    const { tool_id, inputs, outputs } = body;

    if (!tool_id) {
      return NextResponse.json({ error: 'tool_id is required' }, { status: 400 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.role !== 'student') {
      return NextResponse.json({ error: 'Only students can save tool runs' }, { status: 403 });
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

    // Insert tool run (RLS will enforce permissions)
    const { data: run, error } = await supabase
      .from('tool_runs')
      .insert({
        student_profile_id: studentProfile.id,
        tool_id,
        inputs: inputs || {},
        outputs: outputs || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving tool run:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, run });
  } catch (error) {
    console.error('Error in save tool run:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
