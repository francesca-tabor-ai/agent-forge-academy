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

    if (!file) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_FILE', message: 'No file provided' } },
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
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_FILE_TYPE', message: 'Unsupported format — use JPG, PNG, or WEBP' } },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      console.log('[Headshot Upload] File too large:', file.size);
      return NextResponse.json(
        { ok: false, error: { code: 'FILE_TOO_LARGE', message: 'File too large (max 5MB)' } },
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
      return NextResponse.json(
        { ok: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' } },
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
          linkedin_url: null,
          github_url: null,
          website_url: null,
          headshot_image_url: null,
        })
        .select('id, headshot_image_url')
        .single();

      if (createError) {
        console.error('[Headshot Upload] Failed to create student profile:', createError);
        return NextResponse.json(
          { error: `We couldn't save your profile yet — please try again` },
          { status: 500 }
        );
      }

      studentProfile = newProfile;
      console.log('[Headshot Upload] Created student profile:', studentProfile.id);
    }

    // Delete old headshot if it exists
    if (studentProfile.headshot_image_url) {
      // Extract the path from the URL (format: .../portfolio-files/headshots/...)
      const urlParts = studentProfile.headshot_image_url.split('/portfolio-files/');
      if (urlParts.length > 1) {
        const storagePath = urlParts[1]; // This already includes 'headshots/...'
        await supabase.storage
          .from('portfolio-files')
          .remove([storagePath]);
      }
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const fileName = `${studentProfile.id}/headshot-${timestamp}.${fileExt}`;
    const filePath = `headshots/${fileName}`;

    console.log('[Headshot Upload] Uploading to storage:', {
      bucket: 'portfolio-files',
      path: filePath,
      contentType: file.type,
    });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-files')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('[Headshot Upload] Storage upload error:', uploadError);
      return NextResponse.json(
        { ok: false, error: { code: 'UPLOAD_FAILED', message: `Upload failed: ${uploadError.message}` } },
        { status: 500 }
      );
    }

    console.log('[Headshot Upload] Upload successful:', uploadData.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolio-files')
      .getPublicUrl(filePath);

    console.log('[Headshot Upload] Public URL:', urlData.publicUrl);

    // Update student profile with new headshot URL
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ headshot_image_url: urlData.publicUrl })
      .eq('id', studentProfile.id);

    if (updateError) {
      console.error('[Headshot Upload] Profile update error:', updateError);
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log('[Headshot Upload] Profile updated successfully');

    return NextResponse.json({
      ok: true,
      success: true,
      imageUrl: urlData.publicUrl,
      profile: {
        headshot_image_url: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('[Headshot Upload] Unexpected error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
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
      return NextResponse.json(
        { ok: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' } },
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
      return NextResponse.json(
        { ok: false, error: { code: 'STUDENT_PROFILE_NOT_FOUND', message: 'Student profile not found' } },
        { status: 404 }
      );
    }

    // Delete headshot from storage if it exists
    if (studentProfile.headshot_image_url) {
      // Extract the path from the URL (format: .../portfolio-files/headshots/...)
      const urlParts = studentProfile.headshot_image_url.split('/portfolio-files/');
      if (urlParts.length > 1) {
        const storagePath = urlParts[1]; // This already includes 'headshots/...'
        await supabase.storage
          .from('portfolio-files')
          .remove([storagePath]);
      }
    }

    // Update student profile to remove headshot URL
    const { error: updateError } = await supabase
      .from('student_profiles')
      .update({ headshot_image_url: null })
      .eq('id', studentProfile.id);

    if (updateError) {
      return NextResponse.json(
        { ok: false, error: { code: 'UPDATE_FAILED', message: `Failed to update profile: ${updateError.message}` } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
