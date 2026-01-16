import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/tools/content-systems-studio/variants
 * Fetch variants (optionally filtered by parent_content_item_id)
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

    // Get optional filter
    const { searchParams } = new URL(request.url);
    const parentContentItemId = searchParams.get('parent_content_item_id');

    // Build query
    let query = supabase
      .from('content_variants')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: false });

    if (parentContentItemId) {
      query = query.eq('parent_content_item_id', parentContentItemId);
    }

    const { data: variants, error } = await query;

    if (error) {
      console.error('Error fetching variants:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variants });
  } catch (error) {
    console.error('Error in GET variants:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tools/content-systems-studio/variants
 * Create a new variant
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
    const { parentContentItemId, variant } = body;

    if (!parentContentItemId || !variant) {
      return NextResponse.json(
        { error: 'parentContentItemId and variant are required' },
        { status: 400 }
      );
    }

    // Verify parent content item belongs to student (RLS will also enforce)
    const { data: contentItem } = await supabase
      .from('content_items')
      .select('id')
      .eq('id', parentContentItemId)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (!contentItem) {
      return NextResponse.json({ error: 'Parent content item not found' }, { status: 404 });
    }

    // Insert variant (RLS will enforce permissions)
    const { data: variantRecord, error } = await supabase
      .from('content_variants')
      .insert({
        parent_content_item_id: parentContentItemId,
        student_profile_id: studentProfile.id,
        variant,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating variant:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ variant: variantRecord }, { status: 201 });
  } catch (error) {
    console.error('Error in POST variant:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
