import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ caseId: string }>;
}

// GET /api/tools/product-fundamentals/cases/[caseId]/audit - Get audit log for case
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId } = await params;

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify case exists and user has access
    const { data: caseData } = await supabase
      .from('pm_cases')
      .select('student_profile_id, visibility')
      .eq('id', caseId)
      .single();

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Check access
    if (profile.role === 'student') {
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!studentProfile || caseData.student_profile_id !== studentProfile.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (profile.role === 'recruiter' && caseData.visibility === 'private') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch audit log
    const { data: auditLog, error } = await supabase
      .from('pm_case_audit')
      .select('id, event, created_at')
      .eq('pm_case_id', caseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching audit log:', error);
      return NextResponse.json({ error: 'Failed to fetch audit log' }, { status: 500 });
    }

    return NextResponse.json({ auditLog: auditLog || [] });
  } catch (error) {
    console.error('Error in GET /api/tools/product-fundamentals/cases/[caseId]/audit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tools/product-fundamentals/cases/[caseId]/audit - Append audit event
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId } = await params;

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

    // Verify case belongs to student
    const { data: caseData } = await supabase
      .from('pm_cases')
      .select('student_profile_id')
      .eq('id', caseId)
      .single();

    if (!caseData || caseData.student_profile_id !== studentProfile.id) {
      return NextResponse.json({ error: 'Case not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const { event } = body;

    if (!event) {
      return NextResponse.json({ error: 'Event is required' }, { status: 400 });
    }

    // Append audit event (append-only)
    const { data: auditEvent, error } = await supabase
      .from('pm_case_audit')
      .insert({
        pm_case_id: caseId,
        student_profile_id: studentProfile.id,
        event,
      })
      .select('id, event, created_at')
      .single();

    if (error) {
      console.error('Error appending audit event:', error);
      return NextResponse.json({ error: 'Failed to append audit event' }, { status: 500 });
    }

    return NextResponse.json({ auditEvent }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tools/product-fundamentals/cases/[caseId]/audit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
