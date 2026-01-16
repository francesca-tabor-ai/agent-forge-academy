import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/tools/content-systems-studio/items/:id
 * Fetch a single content item
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Fetch content item (RLS will enforce permissions)
    const { data: item, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', id)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
      }
      console.error('Error fetching content item:', error);
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

    return NextResponse.json({ item: contentItem });
  } catch (error) {
    console.error('Error in GET content item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tools/content-systems-studio/items/:id
 * Update a content item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const updates: Record<string, unknown> = {};

    if (body.fields !== undefined) updates.fields = body.fields;
    if (body.status !== undefined) updates.status = body.status;
    if (body.locale !== undefined) updates.locale = body.locale;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Update content item (RLS will enforce permissions)
    const { data: item, error } = await supabase
      .from('content_items')
      .update(updates)
      .eq('id', id)
      .eq('student_profile_id', studentProfile.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
      }
      console.error('Error updating content item:', error);
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

    return NextResponse.json({ item: contentItem });
  } catch (error) {
    console.error('Error in PATCH content item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tools/content-systems-studio/items/:id
 * Delete a content item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Delete content item (RLS will enforce permissions, cascade will delete audit events and variants)
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id)
      .eq('student_profile_id', studentProfile.id);

    if (error) {
      console.error('Error deleting content item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE content item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
