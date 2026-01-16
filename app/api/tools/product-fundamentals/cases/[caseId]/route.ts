import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ caseId: string }>;
}

// GET /api/tools/product-fundamentals/cases/[caseId] - Get single case
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

    // Fetch case
    const { data: caseData, error } = await supabase
      .from('pm_cases')
      .select('id, student_profile_id, title, state, visibility, created_at, updated_at')
      .eq('id', caseId)
      .single();

    if (error || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Check access: students can read own, recruiters can read if visible
    if (profile.role === 'student') {
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!studentProfile || caseData.student_profile_id !== studentProfile.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (profile.role === 'recruiter') {
      // Check visibility - RLS should handle this, but verify
      if (caseData.visibility === 'private') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ case: caseData });
  } catch (error) {
    console.error('Error in GET /api/tools/product-fundamentals/cases/[caseId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tools/product-fundamentals/cases/[caseId] - Update case
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { data: existingCase } = await supabase
      .from('pm_cases')
      .select('student_profile_id')
      .eq('id', caseId)
      .single();

    if (!existingCase || existingCase.student_profile_id !== studentProfile.id) {
      return NextResponse.json({ error: 'Case not found or access denied' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;

    // Update case
    const { data: updatedCase, error } = await supabase
      .from('pm_cases')
      .update(updateData)
      .eq('id', caseId)
      .eq('student_profile_id', studentProfile.id)
      .select('id, title, state, visibility, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error updating case:', error);
      return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
    }

    return NextResponse.json({ case: updatedCase });
  } catch (error) {
    console.error('Error in PATCH /api/tools/product-fundamentals/cases/[caseId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tools/product-fundamentals/cases/[caseId] - Delete case
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Delete case (cascade will handle audit logs)
    const { error } = await supabase
      .from('pm_cases')
      .delete()
      .eq('id', caseId)
      .eq('student_profile_id', studentProfile.id);

    if (error) {
      console.error('Error deleting case:', error);
      return NextResponse.json({ error: 'Failed to delete case' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/tools/product-fundamentals/cases/[caseId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
