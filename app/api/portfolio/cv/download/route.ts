import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getResumeBucketName } from '@/lib/utils/storage';

export async function GET(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentProfileId = searchParams.get('studentProfileId');

    if (!studentProfileId) {
      return NextResponse.json({ error: 'Student profile ID required' }, { status: 400 });
    }

    // Verify ownership
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, profile_id')
      .eq('id', studentProfileId)
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

    // Get CV record
    const { data: cv } = await supabase
      .from('student_cvs')
      .select('file_path, file_name, mime_type, visibility')
      .eq('student_profile_id', studentProfileId)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single();

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Use service role client for storage operations
    const serverSupabase = createServerSupabaseClient();
    const bucketName = getResumeBucketName();

    // For private CVs, use signed URL; for public, use direct download
    if (cv.visibility === 'private') {
      // Generate signed URL for private CVs (expires in 1 hour)
      const { data: signedUrl, error: urlError } = await serverSupabase.storage
        .from(bucketName)
        .createSignedUrl(cv.file_path, 3600);

      if (urlError || !signedUrl) {
        return NextResponse.json(
          { error: 'Failed to generate download URL' },
          { status: 500 }
        );
      }

      // Redirect to signed URL
      return NextResponse.redirect(signedUrl.signedUrl);
    } else {
      // For public CVs, download directly
      const { data: fileData, error: downloadError } = await serverSupabase.storage
        .from(bucketName)
        .download(cv.file_path);

      if (downloadError || !fileData) {
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
      }

      // Convert blob to array buffer
      const arrayBuffer = await fileData.arrayBuffer();

      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': cv.mime_type,
          'Content-Disposition': `attachment; filename="${cv.file_name}"`,
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
