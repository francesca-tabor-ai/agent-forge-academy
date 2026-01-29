import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

/**
 * GET /api/portfolio/projects/[projectId]
 * Fetch project details including skills
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch project (RLS will enforce ownership)
    const { data: project, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch project skills
    const { data: projectSkills } = await supabase
      .from('project_skills')
      .select(`
        skill_id,
        skills:skill_id (
          id,
          name
        )
      `)
      .eq('project_id', projectId);

    const skills = (projectSkills || [])
      .map((ps: any) => ps.skills)
      .filter(Boolean)
      .map((skill: any) => ({
        id: skill.id,
        name: skill.name,
      }));

    return NextResponse.json({
      ...project,
      skills,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, github_url, demo_url, visibility } = body;

    // Verify project belongs to user (RLS will enforce, but we check for better error messages)
    const { data: existingProject } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update project (RLS will enforce ownership)
    // Note: Images are now handled via separate API routes
    const { data: project, error } = await supabase
      .from('portfolio_projects')
      .update({
        title,
        description,
        github_url,
        demo_url,
        visibility,
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Revalidate profile and portfolio pages to ensure fresh data
    revalidatePath('/student/profile');
    revalidatePath('/student/profile', 'page');
    revalidatePath('/student/portfolio');
    revalidatePath('/student/portfolio', 'page');

    // Fetch project skills
    const { data: projectSkills } = await supabase
      .from('project_skills')
      .select(`
        skill_id,
        skills:skill_id (
          id,
          name
        )
      `)
      .eq('project_id', projectId);

    const skills = (projectSkills || [])
      .map((ps: any) => ps.skills)
      .filter(Boolean)
      .map((skill: any) => ({
        id: skill.id,
        name: skill.name,
      }));

    return NextResponse.json({
      ...project,
      skills,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
