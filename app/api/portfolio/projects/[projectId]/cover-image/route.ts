import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

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

    // Verify project exists and belongs to user
    const { data: project, error: projectError } = await supabase
      .from('portfolio_projects')
      .select(`
        id,
        student_profile_id,
        cover_image_path,
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WEBP images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate file path: userId/projectId/cover-timestamp.ext
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const storagePath = `${user.id}/${projectId}/cover-${timestamp}.${fileExt}`;

    // Delete old cover image if exists
    if (project.cover_image_path) {
      try {
        await supabase.storage
          .from('project-images')
          .remove([project.cover_image_path]);
      } catch (err) {
        // Ignore errors when deleting old image (might not exist)
        console.warn('Failed to delete old cover image:', err);
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Update project with new cover image path
    const { error: updateError } = await supabase
      .from('portfolio_projects')
      .update({
        cover_image_path: storagePath,
        cover_image_updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      // If update fails, try to clean up the uploaded file
      await supabase.storage.from('project-images').remove([storagePath]);
      return NextResponse.json(
        { error: `Failed to update project: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Generate signed URL (1 hour expiry for private bucket)
    const { data: urlData } = await supabase.storage
      .from('project-images')
      .createSignedUrl(storagePath, 3600); // 1 hour

    if (!urlData) {
      return NextResponse.json(
        { error: 'Failed to generate image URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      cover_image_path: storagePath,
      cover_image_url: urlData.signedUrl,
    });
  } catch (error) {
    console.error('Cover image upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
