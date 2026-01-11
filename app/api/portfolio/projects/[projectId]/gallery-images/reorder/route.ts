import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ projectId: string }>;
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

    // Verify project exists and belongs to user
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select(`
        id,
        student_profile_id,
        student_profiles!inner(
          profile_id,
          profiles!inner(user_id)
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check ownership
    const studentProfile = project.student_profiles as any;
    const profile = studentProfile?.profiles as any;
    if (!profile || profile.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { orderedImageIds } = body;

    if (!Array.isArray(orderedImageIds)) {
      return NextResponse.json(
        { error: 'orderedImageIds must be an array' },
        { status: 400 }
      );
    }

    // Verify all image IDs belong to this project
    const { data: existingImages, error: fetchError } = await supabase
      .from('project_images')
      .select('id')
      .eq('project_id', projectId)
      .in('id', orderedImageIds);

    if (fetchError) {
      return NextResponse.json(
        { error: `Failed to verify images: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!existingImages || existingImages.length !== orderedImageIds.length) {
      return NextResponse.json(
        { error: 'Some image IDs do not belong to this project' },
        { status: 400 }
      );
    }

    // Update sort_order in a transaction-like manner
    // We'll update each image individually (Supabase doesn't support batch updates with different values easily)
    const updates = orderedImageIds.map((imageId, index) =>
      supabase
        .from('project_images')
        .update({ sort_order: index })
        .eq('id', imageId)
        .eq('project_id', projectId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter((r) => r.error);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: `Failed to update sort order: ${errors[0].error?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Reorder gallery images error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
