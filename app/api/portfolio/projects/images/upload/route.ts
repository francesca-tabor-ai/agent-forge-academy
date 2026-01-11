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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const isCover = formData.get('isCover') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WEBP images are allowed' }, { status: 400 });
    }

    // Validate file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Image size must be less than 5MB' }, { status: 400 });
    }

    // Verify ownership
    const { data: project } = await supabase
      .from('portfolio_projects')
      .select('id, student_profile_id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('profile_id')
      .eq('id', project.student_profile_id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', studentProfile.profile_id)
      .single();

    if (!profile || profile.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}/${isCover ? 'cover' : Date.now()}.${fileExt}`;
    const filePath = `project-images/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-files')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolio-files')
      .getPublicUrl(filePath);

    // If this is a cover image, delete old cover
    if (isCover) {
      const { data: currentProject } = await supabase
        .from('portfolio_projects')
        .select('cover_image_url')
        .eq('id', projectId)
        .single();

      if (currentProject?.cover_image_url) {
        // Extract path from URL and delete old cover
        const oldPath = currentProject.cover_image_url.split('/portfolio-files/')[1];
        if (oldPath) {
          await supabase.storage
            .from('portfolio-files')
            .remove([`project-images/${oldPath}`]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
