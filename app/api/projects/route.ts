import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// GET: List user's projects
export async function GET(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Not a student' }, { status: 403 });
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

    // Fetch projects
    const { data: projects, error } = await supabase
      .from('portfolio_projects')
      .select('id, title')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, projects: projects || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
