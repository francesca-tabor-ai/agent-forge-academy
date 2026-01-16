import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/tools/pricing-risk-lab/snapshots
 * Fetch all snapshots for the current user (optionally filtered by experiment_id)
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

    const { searchParams } = new URL(request.url);
    const experimentId = searchParams.get('experiment_id');

    // Build query (RLS will enforce permissions)
    let query = supabase
      .from('pricing_snapshots')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: false });

    if (experimentId) {
      query = query.eq('experiment_id', experimentId);
    }

    const { data: snapshots, error } = await query;

    if (error) {
      console.error('Error fetching snapshots:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ snapshots: snapshots || [] });
  } catch (error) {
    console.error('Error in GET snapshots:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tools/pricing-risk-lab/snapshots
 * Create a new snapshot
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
    const { experiment_id, snapshot } = body;

    if (!snapshot) {
      return NextResponse.json(
        { error: 'snapshot is required' },
        { status: 400 }
      );
    }

    // Insert snapshot (RLS will enforce permissions)
    const { data: savedSnapshot, error } = await supabase
      .from('pricing_snapshots')
      .insert({
        student_profile_id: studentProfile.id,
        experiment_id: experiment_id || null,
        snapshot,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating snapshot:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ snapshot: savedSnapshot });
  } catch (error) {
    console.error('Error in POST snapshots:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
