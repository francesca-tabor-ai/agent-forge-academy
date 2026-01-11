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

    // Check current gallery image count
    const { count: currentCount } = await supabase
      .from('project_images')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    const MAX_GALLERY_IMAGES = 10;
    if ((currentCount || 0) >= MAX_GALLERY_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_GALLERY_IMAGES} gallery images allowed` },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Check if adding these files would exceed limit
    if ((currentCount || 0) + files.length > MAX_GALLERY_IMAGES) {
      return NextResponse.json(
        { error: `Adding these files would exceed the maximum of ${MAX_GALLERY_IMAGES} gallery images` },
        { status: 400 }
      );
    }

    // Validate all files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Only JPG, PNG, and WEBP images are allowed' },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: 'Image size must be less than 5MB' },
          { status: 400 }
        );
      }
    }

    // Get current max sort_order
    const { data: existingImages } = await supabase
      .from('project_images')
      .select('sort_order')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: false })
      .limit(1);

    let nextSortOrder = 0;
    if (existingImages && existingImages.length > 0) {
      nextSortOrder = (existingImages[0].sort_order || 0) + 1;
    }

    // Upload files and create records
    const uploadedImages: Array<{
      id: string;
      image_path: string;
      url: string;
      sort_order: number;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const storagePath = `${user.id}/${projectId}/gallery-${timestamp}-${i}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        // Clean up any already uploaded files
        for (const img of uploadedImages) {
          await supabase.storage.from('project-images').remove([img.image_path]);
        }
        return NextResponse.json(
          { error: `Upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }

      // Create database record
      const { data: imageRecord, error: insertError } = await supabase
        .from('project_images')
        .insert({
          project_id: projectId,
          owner_id: user.id,
          image_path: storagePath,
          sort_order: nextSortOrder + i,
        })
        .select()
        .single();

      if (insertError || !imageRecord) {
        // Clean up storage and any already created records
        await supabase.storage.from('project-images').remove([storagePath]);
        for (const img of uploadedImages) {
          await supabase.storage.from('project-images').remove([img.image_path]);
          await supabase.from('project_images').delete().eq('id', img.id);
        }
        return NextResponse.json(
          { error: `Failed to save image record: ${insertError?.message || 'Unknown error'}` },
          { status: 500 }
        );
      }

      // Generate signed URL
      const { data: urlData } = await supabase.storage
        .from('project-images')
        .createSignedUrl(storagePath, 3600); // 1 hour

      uploadedImages.push({
        id: imageRecord.id,
        image_path: storagePath,
        url: urlData?.signedUrl || '',
        sort_order: imageRecord.sort_order,
      });
    }

    return NextResponse.json({
      ok: true,
      images: uploadedImages,
    });
  } catch (error) {
    console.error('Gallery images upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
