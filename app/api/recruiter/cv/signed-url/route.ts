import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { getResumeBucketName } from '@/lib/utils/storage';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/recruiter/cv/signed-url
 * 
 * Generate a signed URL for a student's CV.
 * Requires recruiter or admin role.
 * 
 * Query parameters:
 * - studentId: string (required) - Student's user_id or profile_id
 * - kind: 'preview' | 'download' (optional, default: 'preview')
 * 
 * Authorization checks:
 * - Requester must be logged in
 * - Requester must be recruiter or admin
 * - CV visibility must be 'recruiters_only' or 'public'
 * - Recruiter must have access grant (not expired)
 * 
 * Returns:
 * - { url: string } - Signed URL (expires in 1 hour)
 * - Or redirects to signed URL if kind='download'
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate user via cookies/session
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication required.' },
        { status: 401 }
      );
    }

    // Step 2: Fetch requester profile and check role
    const { data: requesterProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !requesterProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if requester is recruiter or admin
    if (requesterProfile.role !== 'recruiter' && requesterProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Recruiter or admin role required.' },
        { status: 403 }
      );
    }

    // Step 3: Parse query parameters
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const kind = searchParams.get('kind') || 'preview'; // 'preview' or 'download'

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (kind !== 'preview' && kind !== 'download') {
      return NextResponse.json(
        { error: "Kind must be 'preview' or 'download'" },
        { status: 400 }
      );
    }

    // Step 4: Find student profile
    // studentId could be user_id or profile_id, so we need to check both
    let studentProfileId: string | null = null;
    let studentProfile: any = null;

    // First, try as user_id
    const { data: profileByUserId } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', studentId)
      .single();

    if (profileByUserId && profileByUserId.role === 'student') {
      // Found by user_id, now get student_profile
      const { data: sp } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', profileByUserId.id)
        .single();
      
      if (sp) {
        studentProfileId = sp.id;
        studentProfile = { profile_id: profileByUserId.id };
      }
    } else {
      // Try as profile_id
      const { data: profileById } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', studentId)
        .single();

      if (profileById && profileById.role === 'student') {
        // Found by profile_id, now get student_profile
        const { data: sp } = await supabase
          .from('student_profiles')
          .select('id')
          .eq('profile_id', profileById.id)
          .single();
        
        if (sp) {
          studentProfileId = sp.id;
          studentProfile = { profile_id: profileById.id };
        }
      }
    }

    if (!studentProfileId || !studentProfile) {
      return NextResponse.json(
        { error: 'Student not found or is not a student' },
        { status: 404 }
      );
    }

    // Step 5: Fetch student CV from student_cvs
    const { data: cv, error: cvError } = await supabase
      .from('student_cvs')
      .select('file_path, file_name, mime_type, visibility')
      .eq('student_profile_id', studentProfileId)
      .single();

    if (cvError || !cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    // Step 6: Check visibility - must be 'recruiters_only' or 'public'
    if (cv.visibility !== 'recruiters_only' && cv.visibility !== 'public') {
      return NextResponse.json(
        { error: 'CV is not accessible to recruiters' },
        { status: 403 }
      );
    }

    // Step 7: Check recruiter_student_access (unless admin)
    if (requesterProfile.role === 'recruiter') {
      // Check if access grant exists and is not expired
      const { data: accessGrant, error: accessError } = await supabase
        .from('recruiter_student_access')
        .select('id, expires_at')
        .eq('recruiter_id', requesterProfile.id)
        .eq('student_id', studentProfile.profile_id)
        .single();

      if (accessError || !accessGrant) {
        return NextResponse.json(
          { error: 'Access denied. No access grant found.' },
          { status: 403 }
        );
      }

      // Check if access grant is expired
      if (accessGrant.expires_at) {
        const expiresAt = new Date(accessGrant.expires_at);
        const now = new Date();
        if (expiresAt < now) {
          return NextResponse.json(
            { error: 'Access grant has expired' },
            { status: 403 }
          );
        }
      }
    }

    // Step 8: Generate signed URL using service role client
    const serverSupabase = createServerSupabaseClient();
    const bucketName = getResumeBucketName();

    // Never accept file_path from client - always use from DB
    const { data: signedUrlData, error: urlError } = await serverSupabase.storage
      .from(bucketName)
      .createSignedUrl(cv.file_path, 3600); // Expires in 1 hour

    if (urlError || !signedUrlData) {
      console.error('Error generating signed URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      );
    }

    // Step 9: Log access (audit trail)
    try {
      const { error: logError } = await serverSupabase
        .from('cv_access_logs')
        .insert({
          recruiter_id: requesterProfile.id,
          student_id: studentProfile.profile_id,
          action: kind,
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        });

      if (logError) {
        // Log error but don't fail the request
        console.error('Error logging CV access:', logError);
      }
    } catch (logErr) {
      // Log error but don't fail the request
      console.error('Error logging CV access:', logErr);
    }

    // Step 10: Return URL or redirect
    if (kind === 'download') {
      // Redirect to signed URL for download
      return NextResponse.redirect(signedUrlData.signedUrl);
    } else {
      // Return JSON with URL for preview
      return NextResponse.json({
        url: signedUrlData.signedUrl,
        fileName: cv.file_name,
        mimeType: cv.mime_type,
        expiresIn: 3600, // seconds
      });
    }
  } catch (error) {
    console.error('Unexpected error in recruiter CV signed URL:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
