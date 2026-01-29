import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// POST: Reorder tools in a project
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
    const { toolIds } = body; // Array of projectToolIds in desired order

    if (!Array.isArray(toolIds)) {
      return NextResponse.json({ error: 'toolIds array is required' }, { status: 400 });
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

    // Verify all toolIds belong to this project
    const { data: existingTools } = await supabase
      .from('project_tools')
      .select('id')
      .eq('project_id', projectId);

    if (!existingTools) {
      return NextResponse.json({ error: 'Failed to fetch project tools' }, { status: 500 });
    }

    const existingToolIds = new Set(existingTools.map(t => t.id));
    const invalidIds = toolIds.filter(id => !existingToolIds.has(id));

    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: `Invalid tool IDs: ${invalidIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Update order for each tool
    const updates = toolIds.map((toolId, index) =>
      supabase
        .from('project_tools')
        .update({ order: index })
        .eq('id', toolId)
        .eq('project_id', projectId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to reorder some tools', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
