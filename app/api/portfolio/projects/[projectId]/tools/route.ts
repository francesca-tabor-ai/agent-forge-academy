import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// GET: Get all tools for a project
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

    // Verify project ownership (RLS will enforce, but we check for better error messages)
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get tools for this project
    const { data: projectTools, error } = await supabase
      .from('project_tools')
      .select(`
        tool_id,
        tools:tool_id (
          id,
          name,
          slug,
          description,
          category,
          logo_url,
          website_url
        )
      `)
      .eq('project_id', projectId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tools = (projectTools || [])
      .map((pt: any) => pt.tools)
      .filter(Boolean)
      .map((tool: any) => ({
        id: tool.id,
        name: tool.name,
        slug: tool.slug,
        description: tool.description,
        category: tool.category,
        logo_url: tool.logo_url,
        website_url: tool.website_url,
      }));

    return NextResponse.json({ tools });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add a tool to a project
export async function POST(request: Request, { params }: RouteParams) {
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
    const { tool_id } = body;

    if (!tool_id) {
      return NextResponse.json({ error: 'tool_id is required' }, { status: 400 });
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify tool exists
    const { data: tool } = await supabase
      .from('tools')
      .select('id')
      .eq('id', tool_id)
      .single();

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Add tool to project (RLS will enforce ownership)
    const { data: projectTool, error } = await supabase
      .from('project_tools')
      .insert({
        project_id: projectId,
        tool_id: tool_id,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Tool already added to project' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ projectTool });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a tool from a project
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { projectId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tool_id = searchParams.get('tool_id');

    if (!tool_id) {
      return NextResponse.json({ error: 'tool_id is required' }, { status: 400 });
    }

    // Verify project ownership
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Remove tool from project (RLS will enforce ownership)
    const { error } = await supabase
      .from('project_tools')
      .delete()
      .eq('project_id', projectId)
      .eq('tool_id', tool_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
