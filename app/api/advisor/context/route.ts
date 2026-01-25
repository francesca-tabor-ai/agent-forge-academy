import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch current advisor context
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
      return NextResponse.json({ error: 'Not a student' }, { status: 403 });
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Fetch advisor context
    const { data: context } = await supabase
      .from('advisor_context')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (!context) {
      // Return empty context if none exists
      return NextResponse.json({
        studentProfileId: studentProfile.id,
        activeCourseId: null,
        activeProjectId: null,
        activeJobId: null,
        activeStartupId: null,
      });
    }

    return NextResponse.json({
      studentProfileId: studentProfile.id,
      activeCourseId: context.active_course_id,
      activeProjectId: context.active_project_id,
      activeJobId: context.active_job_id,
      activeStartupId: context.active_startup_id,
    });
  } catch (error) {
    console.error('Error fetching advisor context:', error);
    return NextResponse.json(
      { error: 'Failed to fetch context' },
      { status: 500 }
    );
  }
}

// POST/PUT: Update advisor context
export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { activeCourseId, activeProjectId, activeJobId, activeStartupId } = body;

    // Get student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Not a student' }, { status: 403 });
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Validate that IDs exist and belong to the user (for projects)
    if (activeProjectId) {
      const { data: project } = await supabase
        .from('portfolio_projects')
        .select('id')
        .eq('id', activeProjectId)
        .eq('student_profile_id', studentProfile.id)
        .single();

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Upsert context
    const { data: context, error } = await supabase
      .from('advisor_context')
      .upsert(
        {
          student_profile_id: studentProfile.id,
          active_course_id: activeCourseId || null,
          active_project_id: activeProjectId || null,
          active_job_id: activeJobId || null,
          active_startup_id: activeStartupId || null,
        },
        {
          onConflict: 'student_profile_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error updating advisor context:', error);
      return NextResponse.json(
        { error: 'Failed to update context' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      studentProfileId: studentProfile.id,
      activeCourseId: context.active_course_id,
      activeProjectId: context.active_project_id,
      activeJobId: context.active_job_id,
      activeStartupId: context.active_startup_id,
    });
  } catch (error) {
    console.error('Error updating advisor context:', error);
    return NextResponse.json(
      { error: 'Failed to update context' },
      { status: 500 }
    );
  }
}
