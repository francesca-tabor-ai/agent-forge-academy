import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// GET: Fetch project details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch project (must belong to the student)
    const { data: project, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('id', params.id)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Get skills if they exist (from student profile)
    const { data: studentProfileData } = await supabase
      .from('student_profiles')
      .select('skills')
      .eq('id', studentProfile.id)
      .single();

    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      githubUrl: project.github_url,
      demoUrl: project.demo_url,
      visibility: project.visibility,
      coverImageUrl: project.cover_image_url,
      images: project.images || [],
      status: project.status || 'active', // Assuming status field exists or default
      techStack: project.tech_stack || [], // Assuming tech_stack field exists
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PATCH: Update project (for writeback actions)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { description } = body;

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

    // Verify project belongs to student
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', params.id)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Update project
    const updateData: any = {};
    if (description !== undefined) {
      updateData.description = description;
    }

    const { data: updatedProject, error } = await supabase
      .from('portfolio_projects')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updatedProject.id,
      title: updatedProject.title,
      description: updatedProject.description,
      updatedAt: updatedProject.updated_at,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}
