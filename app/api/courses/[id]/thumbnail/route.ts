import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/courses/[id]/thumbnail
 * Upload or set a course thumbnail image
 * Supports both file upload and URL input
 * Requires admin role
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug, thumbnail_url')
      .eq('id', id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Support both form data (file upload) and JSON (URL input)
    const contentType = request.headers.get('content-type') || '';
    let imageUrl: string | null = null;
    let file: File | null = null;

    if (contentType.includes('application/json')) {
      // JSON request with URL
      const body = await request.json();
      imageUrl = body.imageUrl || body.url || body.thumbnail_url || null;

      if (!imageUrl) {
        return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
      }

      // Validate URL format
      try {
        const url = new URL(imageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return NextResponse.json(
            { error: 'Invalid URL protocol' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL format' },
          { status: 400 }
        );
      }
    } else {
      // Form data with file upload
      const formData = await request.formData();
      file = formData.get('file') as File;
      imageUrl = formData.get('imageUrl') as string | null;

      if (!file && !imageUrl) {
        return NextResponse.json(
          { error: 'No file or image URL provided' },
          { status: 400 }
        );
      }
    }

    // If URL is provided, use it directly (skip file upload)
    if (imageUrl && !file) {
      // Update course with the provided URL
      const { error: updateError } = await supabase
        .from('courses')
        .update({
          thumbnail_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to update course: ${updateError.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        thumbnail_url: imageUrl,
      });
    }

    // File upload path
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP, and GIF images are allowed' },
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

    // Delete old thumbnail from storage if it exists
    if (course.thumbnail_url && course.thumbnail_url.includes('/course-images/')) {
      try {
        const urlParts = course.thumbnail_url.split('/course-images/');
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage
            .from('course-images')
            .remove([storagePath]);
        }
      } catch (err) {
        // Ignore errors when deleting old image (might not exist)
        console.warn('Failed to delete old course thumbnail:', err);
      }
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const storagePath = `${course.slug}/thumbnail-${timestamp}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('course-images')
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('course-images')
      .getPublicUrl(storagePath);

    // Update course with new thumbnail URL
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        thumbnail_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      // If update fails, try to clean up the uploaded file
      await supabase.storage.from('course-images').remove([storagePath]);
      return NextResponse.json(
        { error: `Failed to update course: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      thumbnail_url: urlData.publicUrl,
    });
  } catch (error) {
    console.error('Course thumbnail upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]/thumbnail
 * Remove a course thumbnail image
 * Requires admin role
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin role required' }, { status: 403 });
    }

    // Get course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, thumbnail_url')
      .eq('id', id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Delete thumbnail from storage if it exists
    if (course.thumbnail_url && course.thumbnail_url.includes('/course-images/')) {
      try {
        const urlParts = course.thumbnail_url.split('/course-images/');
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage
            .from('course-images')
            .remove([storagePath]);
        }
      } catch (err) {
        console.warn('Failed to delete course thumbnail from storage:', err);
      }
    }

    // Update course to remove thumbnail URL
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        thumbnail_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update course: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      success: true,
    });
  } catch (error) {
    console.error('Course thumbnail delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
