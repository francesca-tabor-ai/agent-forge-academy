import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/tools/pricing-risk-lab/experiments
 * Fetch all experiments for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student profile required' }, { status: 403 });
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Fetch experiments (RLS will enforce permissions)
    const { data: experiments, error } = await supabase
      .from('pricing_experiments')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ experiments: experiments || [] });
  } catch (error) {
    console.error('Error in GET experiments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tools/pricing-risk-lab/experiments
 * Create a new experiment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Student profile required' }, { status: 403 });
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, draft, status } = body;

    if (!name || !draft) {
      return NextResponse.json(
        { error: 'name and draft are required' },
        { status: 400 }
      );
    }

    // Insert experiment (RLS will enforce permissions)
    const { data: experiment, error } = await supabase
      .from('pricing_experiments')
      .insert({
        student_profile_id: studentProfile.id,
        name,
        draft,
        status: status || 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating experiment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ experiment });
  } catch (error) {
    console.error('Error in POST experiments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
