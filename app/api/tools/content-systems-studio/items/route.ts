import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/tools/content-systems-studio/items
 * Fetch all content items for the authenticated student
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

    // Fetch content items (RLS will enforce permissions)
    const { data: items, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching content items:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to ContentItem format
    const contentItems = items.map((item) => ({
      id: item.id,
      schemaId: item.schema_id,
      locale: item.locale,
      fields: item.fields,
      status: item.status,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      createdBy: 'student',
      updatedBy: 'student',
    }));

    return NextResponse.json({ items: contentItems });
  } catch (error) {
    console.error('Error in GET content items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tools/content-systems-studio/items
 * Create a new content item
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
    const { schemaId, schemaVersion, locale, fields, status } = body;

    if (!schemaId || !locale || !fields) {
      return NextResponse.json(
        { error: 'schemaId, locale, and fields are required' },
        { status: 400 }
      );
    }

    // Insert content item (RLS will enforce permissions)
    const { data: item, error } = await supabase
      .from('content_items')
      .insert({
        student_profile_id: studentProfile.id,
        schema_id: schemaId,
        schema_version: schemaVersion || '1.0.0',
        locale,
        fields,
        status: status || 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating content item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to ContentItem format
    const contentItem = {
      id: item.id,
      schemaId: item.schema_id,
      locale: item.locale,
      fields: item.fields,
      status: item.status,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      createdBy: 'student',
      updatedBy: 'student',
    };

    return NextResponse.json({ item: contentItem }, { status: 201 });
  } catch (error) {
    console.error('Error in POST content items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
