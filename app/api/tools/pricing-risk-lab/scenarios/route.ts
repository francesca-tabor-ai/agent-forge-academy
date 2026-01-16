import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/tools/pricing-risk-lab/scenarios
 * Fetch all scenarios for the current user
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

    // Fetch scenarios (RLS will enforce permissions)
    const { data: scenarios, error } = await supabase
      .from('pricing_scenarios')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scenarios:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scenarios: scenarios || [] });
  } catch (error) {
    console.error('Error in GET scenarios:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tools/pricing-risk-lab/scenarios
 * Create a new scenario
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
    const { name, data } = body;

    if (!name || !data) {
      return NextResponse.json(
        { error: 'name and data are required' },
        { status: 400 }
      );
    }

    // Insert scenario (RLS will enforce permissions)
    const { data: scenario, error } = await supabase
      .from('pricing_scenarios')
      .insert({
        student_profile_id: studentProfile.id,
        name,
        data,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating scenario:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ scenario });
  } catch (error) {
    console.error('Error in POST scenarios:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
