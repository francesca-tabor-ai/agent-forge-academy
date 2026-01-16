import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/tools/content-systems-studio/audit-events
 * Fetch audit events for content items (optionally filtered by content_item_id)
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
    const contentItemId = searchParams.get('content_item_id');

    // Build query
    let query = supabase
      .from('content_audit_events')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .order('created_at', { ascending: false });

    if (contentItemId) {
      query = query.eq('content_item_id', contentItemId);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching audit events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to AuditEvent format
    const auditEvents = events.map((event) => ({
      timestamp: new Date(event.created_at),
      actorRole: (event.event as { actorRole?: string }).actorRole || 'student',
      action: (event.event as { action?: string }).action || 'unknown',
      fromState: (event.event as { fromState?: string })?.fromState,
      toState: (event.event as { toState?: string })?.toState,
      metadata: event.event as Record<string, unknown>,
    }));

    return NextResponse.json({ events: auditEvents });
  } catch (error) {
    console.error('Error in GET audit events:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tools/content-systems-studio/audit-events
 * Append a new audit event (append-only)
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
    const { contentItemId, event } = body;

    if (!contentItemId || !event) {
      return NextResponse.json(
        { error: 'contentItemId and event are required' },
        { status: 400 }
      );
    }

    // Verify content item belongs to student (RLS will also enforce)
    const { data: contentItem } = await supabase
      .from('content_items')
      .select('id')
      .eq('id', contentItemId)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (!contentItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    }

    // Insert audit event (RLS will enforce permissions, append-only)
    const { data: auditEvent, error } = await supabase
      .from('content_audit_events')
      .insert({
        content_item_id: contentItemId,
        student_profile_id: studentProfile.id,
        event,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating audit event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to AuditEvent format
    const auditEventResult = {
      timestamp: new Date(auditEvent.created_at),
      actorRole: (event as { actorRole?: string }).actorRole || 'student',
      action: (event as { action?: string }).action || 'unknown',
      fromState: (event as { fromState?: string })?.fromState,
      toState: (event as { toState?: string })?.toState,
      metadata: event as Record<string, unknown>,
    };

    return NextResponse.json({ event: auditEventResult }, { status: 201 });
  } catch (error) {
    console.error('Error in POST audit event:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
