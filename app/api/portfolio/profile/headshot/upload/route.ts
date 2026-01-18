import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logRequest, getUserIdFromRequest, getIpAddress, getUserAgent } from '@/lib/utils/request-logger';

export async function POST(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  let status = 200;

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      status = 401;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: null,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'POST',
        status,
        duration,
        errorMessage: 'Unauthorized',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }, requestId },
        { status: 401 }
      );
    }

    // Support both form data (file upload) and JSON (URL input)
    const contentType = request.headers.get('content-type') || '';
    let imageUrl: string | null = null;
    let file: File | null = null;

    if (contentType.includes('application/json')) {
      // JSON request with URL
      const body = await request.json();
      imageUrl = body.imageUrl || body.url || null;

      if (!imageUrl) {
        status = 400;
        const duration = Date.now() - startTime;
        await logRequest({
          requestId,
          userId: user.id,
          path: '/api/portfolio/profile/headshot/upload',
          method: 'POST',
          status,
          duration,
          errorMessage: 'No image URL provided',
          ipAddress: getIpAddress(request),
          userAgent: getUserAgent(request),
        });
        return NextResponse.json(
          { ok: false, error: { code: 'NO_URL', message: 'No image URL provided' }, requestId },
          { status: 400 }
        );
      }

      // Validate URL format
      try {
        const url = new URL(imageUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          return NextResponse.json(
            { ok: false, error: { code: 'INVALID_URL', message: 'Invalid URL protocol' } },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { ok: false, error: { code: 'INVALID_URL', message: 'Invalid URL format' } },
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
          { ok: false, error: { code: 'NO_FILE_OR_URL', message: 'No file or image URL provided' } },
          { status: 400 }
        );
      }
    }

    // If URL is provided, use it directly (skip file upload)
    if (imageUrl && !file) {
      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        status = 404;
        const duration = Date.now() - startTime;
        await logRequest({
          requestId,
          userId: user.id,
          path: '/api/portfolio/profile/headshot/upload',
          method: 'POST',
          status,
          duration,
          errorMessage: 'Profile not found',
          ipAddress: getIpAddress(request),
          userAgent: getUserAgent(request),
        });
        return NextResponse.json(
          { ok: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' }, requestId },
          { status: 404 }
        );
      }

      // Get or create student profile
      let { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id, headshot_image_url')
        .eq('profile_id', profile.id)
        .single();

      if (!studentProfile) {
        const { data: newProfile, error: createError } = await supabase
          .from('student_profiles')
          .insert({
            profile_id: profile.id,
            headline: '',
            bio: null,
            skills: [],
            location: null,
            linkedin_url: null,
            github_url: null,
            website_url: null,
            headshot_image_url: null,
          })
          .select('id, headshot_image_url')
          .single();

        if (createError) {
          status = 500;
          const duration = Date.now() - startTime;
          await logRequest({
            requestId,
            userId: user.id,
            path: '/api/portfolio/profile/headshot/upload',
            method: 'POST',
            status,
            duration,
            errorStack: createError.stack || null,
            errorMessage: createError.message,
            ipAddress: getIpAddress(request),
            userAgent: getUserAgent(request),
          });
          return NextResponse.json(
            { ok: false, error: { code: 'CREATE_FAILED', message: `Failed to create profile: ${createError.message}` }, requestId },
            { status: 500 }
          );
        }

        studentProfile = newProfile;
      }

      // Delete old headshot from storage if it exists and is in our bucket
      if (studentProfile.headshot_image_url) {
        const oldUrl = studentProfile.headshot_image_url;
        if (oldUrl.includes('/profile-headshots/')) {
          const urlParts = oldUrl.split('/profile-headshots/');
          if (urlParts.length > 1) {
            const storagePath = urlParts[1];
            await supabase.storage
              .from('profile-headshots')
              .remove([storagePath]);
          }
        }
      }

      // Update profile with the provided URL
      const { error: updateError } = await supabase
        .from('student_profiles')
        .update({ headshot_image_url: imageUrl })
        .eq('id', studentProfile.id);

      if (updateError) {
        status = 500;
        const duration = Date.now() - startTime;
        await logRequest({
          requestId,
          userId: user.id,
          path: '/api/portfolio/profile/headshot/upload',
          method: 'POST',
          status,
          duration,
          errorStack: updateError.stack || null,
          errorMessage: updateError.message,
          ipAddress: getIpAddress(request),
          userAgent: getUserAgent(request),
        });
        return NextResponse.json(
          { ok: false, error: { code: 'UPDATE_FAILED', message: `Failed to update profile: ${updateError.message}` }, requestId },
          { status: 500 }
        );
      }

      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'POST',
        status,
        duration,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });

      return NextResponse.json({
        ok: true,
        success: true,
        imageUrl: imageUrl,
        avatarPath: imageUrl,
        avatarUrl: imageUrl,
        profile: {
          headshot_image_url: imageUrl,
        },
        requestId,
      });
    }

    // File upload path
    if (!file) {
      status = 400;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'POST',
        status,
        duration,
        errorMessage: 'No file provided',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'NO_FILE', message: 'No file provided' }, requestId },
        { status: 400 }
      );
    }

    // Log file details for debugging
    console.log('[Headshot Upload] File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      userId: user.id,
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('[Headshot Upload] Invalid file type:', file.type);
      status = 400;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'POST',
        status,
        duration,
        errorMessage: `Invalid file type: ${file.type}`,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_FILE_TYPE', message: 'Unsupported format — use JPG, PNG, or WEBP' }, requestId },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      console.log('[Headshot Upload] File too large:', file.size);
      status = 400;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'POST',
        status,
        duration,
        errorMessage: `File too large: ${file.size} bytes`,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'FILE_TOO_LARGE', message: 'File too large (max 5MB)' }, requestId },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      console.log('[Headshot Upload] Profile not found for user:', user.id);
      status = 404;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'POST',
        status,
        duration,
        errorMessage: 'Profile not found',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' }, requestId },
        { status: 404 }
      );
    }

    // Get or create student profile
    let { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, headshot_image_url')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      console.log('[Headshot Upload] Student profile not found, creating...');
      // Create student profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          profile_id: profile.id,
          headline: '',
          bio: null,
          skills: [],
          location: null,
          city: null,
          country: null,
          linkedin_url: null,
          github_url: null,
          website_url: null,
          headshot_image_url: null,
        })
        .select('id, headshot_image_url')
        .single();

      if (createError) {
        console.error('[Headshot Upload] Failed to create student profile:', createError);
        status = 500;
        const duration = Date.now() - startTime;
        await logRequest({
          requestId,
          userId: user.id,
          path: '/api/portfolio/profile/headshot/upload',
          method: 'POST',
          status,
          duration,
          errorStack: createError.stack || null,
          errorMessage: createError.message,
          ipAddress: getIpAddress(request),
          userAgent: getUserAgent(request),
        });
        return NextResponse.json(
          { ok: false, error: { code: 'CREATE_FAILED', message: `Failed to create profile: ${createError.message}` }, requestId },
          { status: 500 }
        );
      }

      studentProfile = newProfile;
      console.log('[Headshot Upload] Created student profile:', studentProfile.id);
    }

    // Delete old headshot if it exists (check both old and new bucket paths)
    if (studentProfile.headshot_image_url) {
      const oldUrl = studentProfile.headshot_image_url;
      // Check for old portfolio-files bucket
      if (oldUrl.includes('/portfolio-files/')) {
        const urlParts = oldUrl.split('/portfolio-files/');
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage
            .from('portfolio-files')
            .remove([storagePath]);
        }
      }
      // Check for new profile-headshots bucket
      if (oldUrl.includes('/profile-headshots/')) {
        const urlParts = oldUrl.split('/profile-headshots/');
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage
            .from('profile-headshots')
            .remove([storagePath]);
        }
      }
    }

    // Upload to Supabase Storage (using new profile-headshots bucket)
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const storagePath = `${user.id}/headshot-${timestamp}.${fileExt}`;

    console.log('[Headshot Upload] Uploading to storage:', {
      bucket: 'profile-headshots',
      path: storagePath,
      contentType: file.type,
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-headshots')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('[Headshot Upload] Storage upload error:', uploadError);
      status = 500;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'POST',
        status,
        duration,
        errorStack: uploadError.stack || null,
        errorMessage: uploadError.message,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'UPLOAD_FAILED', message: `Upload failed: ${uploadError.message}` }, requestId },
        { status: 500 }
      );
    }

    console.log('[Headshot Upload] Upload successful:', uploadData.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-headshots')
      .getPublicUrl(storagePath);

    console.log('[Headshot Upload] Public URL:', urlData.publicUrl);

    // Update student profile with new headshot URL
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ headshot_image_url: urlData.publicUrl })
      .eq('id', studentProfile.id);

    if (updateError) {
      console.error('[Headshot Upload] Profile update error:', updateError);
      status = 500;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'POST',
        status,
        duration,
        errorStack: updateError.stack || null,
        errorMessage: updateError.message,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'UPDATE_FAILED', message: `Failed to update profile: ${updateError.message}` }, requestId },
        { status: 500 }
      );
    }

    console.log('[Headshot Upload] Profile updated successfully');

    const duration = Date.now() - startTime;
    await logRequest({
      requestId,
      userId: user.id,
      path: '/api/portfolio/profile/headshot/upload',
      method: 'POST',
      status,
      duration,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      ok: true,
      success: true,
      imageUrl: urlData.publicUrl,
      avatarPath: storagePath,
      avatarUrl: urlData.publicUrl,
      profile: {
        headshot_image_url: urlData.publicUrl,
      },
      requestId,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    status = 500;
    console.error('[Headshot Upload] Unexpected error:', error);
    
    await logRequest({
      requestId,
      userId: await getUserIdFromRequest(request),
      path: '/api/portfolio/profile/headshot/upload',
      method: 'POST',
      status,
      duration,
      errorStack: error instanceof Error ? error.stack || null : null,
      errorMessage: error instanceof Error ? error.message : 'Internal server error',
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
        requestId,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  let status = 200;

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      status = 401;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: null,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'DELETE',
        status,
        duration,
        errorMessage: 'Unauthorized',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' }, requestId },
        { status: 401 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, user_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      status = 404;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'DELETE',
        status,
        duration,
        errorMessage: 'Profile not found',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' }, requestId },
        { status: 404 }
      );
    }

    // Get student profile (don't create if missing for DELETE)
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, headshot_image_url')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      status = 404;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'DELETE',
        status,
        duration,
        errorMessage: 'Student profile not found',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'STUDENT_PROFILE_NOT_FOUND', message: 'Student profile not found' }, requestId },
        { status: 404 }
      );
    }

    // Delete headshot from storage if it exists (check both old and new bucket paths)
    if (studentProfile.headshot_image_url) {
      const oldUrl = studentProfile.headshot_image_url;
      // Check for old portfolio-files bucket
      if (oldUrl.includes('/portfolio-files/')) {
        const urlParts = oldUrl.split('/portfolio-files/');
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage
            .from('portfolio-files')
            .remove([storagePath]);
        }
      }
      // Check for new profile-headshots bucket
      if (oldUrl.includes('/profile-headshots/')) {
        const urlParts = oldUrl.split('/profile-headshots/');
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage
            .from('profile-headshots')
            .remove([storagePath]);
        }
      }
    }

    // Update student profile to remove headshot URL
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ headshot_image_url: null })
      .eq('id', studentProfile.id);

    if (updateError) {
      status = 500;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile/headshot/upload',
        method: 'DELETE',
        status,
        duration,
        errorStack: updateError.stack || null,
        errorMessage: updateError.message,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'UPDATE_FAILED', message: `Failed to update profile: ${updateError.message}` }, requestId },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    await logRequest({
      requestId,
      userId: user.id,
      path: '/api/portfolio/profile/headshot/upload',
      method: 'DELETE',
      status,
      duration,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      ok: true,
      success: true,
      requestId,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    status = 500;
    console.error('[Headshot Delete] Unexpected error:', error);
    
    await logRequest({
      requestId,
      userId: await getUserIdFromRequest(request),
      path: '/api/portfolio/profile/headshot/upload',
      method: 'DELETE',
      status,
      duration,
      errorStack: error instanceof Error ? error.stack || null : null,
      errorMessage: error instanceof Error ? error.message : 'Internal server error',
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
        requestId,
      },
      { status: 500 }
    );
  }
}
