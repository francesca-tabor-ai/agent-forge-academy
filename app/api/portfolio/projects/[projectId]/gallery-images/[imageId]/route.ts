import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ projectId: string; imageId: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { projectId, imageId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the image record and verify ownership
    const { data: image, error: imageError } = await supabase
      .from('project_images')
      .select(`
        id,
        image_path,
        project_id,
        owner_id,
        portfolio_projects!inner(
          student_profile_id,
          student_profiles!inner(
            profile_id,
            profiles!inner(user_id)
          )
        )
      `)
      .eq('id', imageId)
      .eq('project_id', projectId)
      .single();

    if (imageError || !image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Verify ownership
    if (image.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project-images')
      .remove([image.image_path]);

    if (storageError) {
      console.warn('Failed to delete image from storage:', storageError);
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('project_images')
      .delete()
      .eq('id', imageId);

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete image: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
