import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, featured } = body;

    if (!projectId || typeof featured !== 'boolean') {
      return NextResponse.json(
        { error: 'projectId and featured (boolean) are required' },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
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

    // Verify project belongs to user
    const { data: project, error: fetchError } = await supabase
      .from('portfolio_projects')
      .select('id, student_profile_id')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.student_profile_id !== studentProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If setting to featured, check limit (max 4)
    if (featured) {
      const { count } = await supabase
        .from('portfolio_projects')
        .select('*', { count: 'exact', head: true })
        .eq('student_profile_id', studentProfile.id)
        .eq('featured', true);

      if (count && count >= 4) {
        return NextResponse.json(
          { error: 'You can feature up to 4 projects. Please unfeature another project first.' },
          { status: 400 }
        );
      }
    }

    // Update featured status
    const { data: updatedProject, error: updateError } = await supabase
      .from('portfolio_projects')
      .update({ featured })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
