import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/tools/product-fundamentals/cases - List cases for current student
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Fetch cases for this student
    const { data: cases, error } = await supabase
      .from('pm_cases')
      .select('id, title, state, visibility, created_at, updated_at')
      .eq('student_profile_id', studentProfile.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching cases:', error);
      return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
    }

    return NextResponse.json({ cases: cases || [] });
  } catch (error) {
    console.error('Error in GET /api/tools/product-fundamentals/cases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tools/product-fundamentals/cases - Create new case
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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    const { title, state, visibility = 'private' } = body;

    if (!title || !state) {
      return NextResponse.json({ error: 'Title and state are required' }, { status: 400 });
    }

    // Create case
    const { data: newCase, error } = await supabase
      .from('pm_cases')
      .insert({
        student_profile_id: studentProfile.id,
        title,
        state,
        visibility,
      })
      .select('id, title, state, visibility, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error creating case:', error);
      return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
    }

    return NextResponse.json({ case: newCase }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tools/product-fundamentals/cases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
