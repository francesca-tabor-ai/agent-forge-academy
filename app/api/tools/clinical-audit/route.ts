import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface AuditLogEntry {
  module: string;
  input: string;
  decision: string;
  reasons: string[];
  escalation?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

interface SaveAuditLogRequest {
  tool_id?: string;
  entry: AuditLogEntry;
}

/**
 * POST: Save a clinical audit log entry to the database
 * 
 * This endpoint persists audit log entries from the Clinical AI Sandbox.
 * RLS policies ensure students can only save/view their own logs.
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

    const body: SaveAuditLogRequest = await request.json();
    const { tool_id = 'clinical-ai-sandbox', entry } = body;

    if (!entry) {
      return NextResponse.json({ error: 'entry is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Only students can save audit logs' }, { status: 403 });
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

    // Insert audit log entry (RLS will enforce permissions)
    const { data: logEntry, error } = await supabase
      .from('clinical_audit_logs')
      .insert({
        student_profile_id: studentProfile.id,
        tool_id,
        entry: entry as unknown as Record<string, unknown>,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving clinical audit log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, logEntry });
  } catch (error) {
    console.error('Error in save clinical audit log:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
