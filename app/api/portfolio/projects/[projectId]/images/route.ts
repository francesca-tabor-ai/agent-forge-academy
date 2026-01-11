import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

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

    // Verify project exists and belongs to user (or is public)
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select(`
        id,
        cover_image_path,
        student_profile_id,
        visibility,
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

    // Check ownership or public visibility
    const studentProfile = project.student_profiles as any;
    const profile = studentProfile?.profiles as any;
    const isOwner = profile && profile.user_id === user.id;
    const isPublic = project.visibility === 'public';

    if (!isOwner && !isPublic) {
      // For recruiters_only, we'd need additional checks, but for now just check owner
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get cover image URL if exists
    let cover = null;
    if (project.cover_image_path) {
      const { data: coverUrlData } = await supabase.storage
        .from('project-images')
        .createSignedUrl(project.cover_image_path, 3600); // 1 hour

      cover = {
        path: project.cover_image_path,
        url: coverUrlData?.signedUrl || null,
      };
    }

    // Get gallery images
    const { data: galleryImages, error: galleryError } = await supabase
      .from('project_images')
      .select('id, image_path, sort_order')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (galleryError) {
      console.error('Error fetching gallery images:', galleryError);
    }

    // Generate signed URLs for gallery images
    const gallery = await Promise.all(
      (galleryImages || []).map(async (img) => {
        const { data: urlData } = await supabase.storage
          .from('project-images')
          .createSignedUrl(img.image_path, 3600); // 1 hour

        return {
          id: img.id,
          path: img.image_path,
          url: urlData?.signedUrl || null,
          sort_order: img.sort_order,
        };
      })
    );

    return NextResponse.json({
      cover,
      gallery,
    });
  } catch (error) {
    console.error('Get images error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
