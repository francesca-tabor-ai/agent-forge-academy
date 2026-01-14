import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { extractTextFromCV } from '@/lib/cv/extractText';
import { detectMimeTypeFromBuffer, isValidCVFileType } from '@/lib/utils/detectFileType';
import { safeLogger, redactPII } from '@/lib/utils/redactPII';
import { getResumeBucketName } from '@/lib/utils/storage';

/**
 * POST /api/portfolio/cv
 * 
 * Upload CV/Resume file for the authenticated user
 * 
 * Form data:
 * - cv: File (PDF or DOCX, max 10MB)
 * 
 * Returns:
 * {
 *   ok: true,
 *   resume: {
 *     url: string,
 *     fileName: string,
 *     uploadedAt: string (ISO),
 *     fileSize: number
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    // Check for required server-side environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server misconfigured: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      );
    }

    // Auth required - reject if not logged in
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get('cv') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided. Use field name "cv".' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Do not trust client-provided mimeType - derive from file content safely
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detectedMimeType = await detectMimeTypeFromBuffer(buffer, file.name);

    if (!detectedMimeType || !isValidCVFileType(detectedMimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    // Get student profile for the user
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const studentProfileId = studentProfile.id;

    // Get bucket name from environment variable
    const bucketName = getResumeBucketName();
    const isDev = process.env.NODE_ENV === 'development';

    // Use service role client for uploads (bypasses RLS and is more reliable)
    const serverSupabase = createServerSupabaseClient();

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `${user.id}/resume-${Date.now()}.${fileExt}`;
    const filePath = fileName; // Store directly in bucket root with user prefix

    const { error: uploadError } = await serverSupabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: detectedMimeType,
        upsert: false,
      });

    if (uploadError) {
      // Provide better error messages
      const errorMessage = uploadError.message.toLowerCase();
      let userFriendlyError = 'Upload failed. Please try again.';
      
      if (errorMessage.includes('bucket') || errorMessage.includes('not found')) {
        userFriendlyError = isDev
          ? `Upload configuration error: Bucket "${bucketName}" not found. Please create the bucket in Supabase Storage or set NEXT_PUBLIC_SUPABASE_RESUME_BUCKET env var.`
          : 'Upload configuration error (bucket missing). Please contact support.';
      } else if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        userFriendlyError = 'A file with this name already exists. Please try again.';
      } else if (errorMessage.includes('size') || errorMessage.includes('too large')) {
        userFriendlyError = 'File is too large. Maximum size is 10MB.';
      }

      safeLogger.error('CV upload: Storage upload failed', {
        error: uploadError.message,
        bucketName,
        filePath,
        userId: user.id,
        fileName: file.name,
      });

      return NextResponse.json(
        { error: userFriendlyError },
        { status: 500 }
      );
    }

    // Get public URL (or signed URL for private buckets)
    const { data: urlData } = serverSupabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Check for existing CV to clean up old file
    const { data: existingCV } = await supabase
      .from('student_cvs')
      .select('file_path')
      .eq('student_profile_id', studentProfileId)
      .maybeSingle();

    // Extract text from CV (non-blocking, don't fail upload if this fails)
    let extractedText: string | null = null;
    try {
      const extractionResult = await extractTextFromCV(buffer, detectedMimeType);
      if (extractionResult.success && extractionResult.text) {
        extractedText = extractionResult.text;
      } else {
        safeLogger.warn('CV text extraction failed', extractionResult.error ? redactPII(String(extractionResult.error), { maxLength: 200 }) : 'Unknown error');
      }
    } catch (error) {
      safeLogger.error('Error extracting CV text', error);
    }

    // UPSERT database record (one CV per student)
    // CRITICAL: DB write must succeed for upload to be considered successful
    const uploadedAt = new Date().toISOString();
    
    const { data: cvRecord, error: dbError } = await supabase
      .from('student_cvs')
      .upsert({
        student_profile_id: studentProfileId,
        file_name: file.name,
        file_path: filePath,
        url: publicUrl,
        file_size: file.size,
        mime_type: detectedMimeType,
        visibility: 'private',
        uploaded_at: uploadedAt,
      }, {
        onConflict: 'student_profile_id',
      })
      .select()
      .single();

    if (dbError || !cvRecord) {
      // Log DB write failure with context
      safeLogger.error('CV upload: Database write failed', {
        error: dbError?.message,
        userId: user.id,
        studentProfileId,
        filePath,
        fileName: file.name,
      });

      // Clean up uploaded file on database error
      try {
        await serverSupabase.storage
          .from(bucketName)
          .remove([filePath]);
      } catch (cleanupError) {
        safeLogger.error('CV upload: Failed to cleanup file after DB error', {
          filePath,
          bucketName,
          cleanupError,
        });
      }

      return NextResponse.json(
        { error: 'Failed to save CV record. Please try again.' },
        { status: 500 }
      );
    }

    // Log successful DB write
    safeLogger.info('CV upload: Database record created', {
      cvId: cvRecord.id,
      userId: user.id,
      studentProfileId,
      fileName: file.name,
      fileSize: file.size,
    });

    // Clean up old file from storage if it exists and is different
    if (existingCV && existingCV.file_path !== filePath) {
      try {
        // Try to determine the old bucket (might be different if migrated)
        const oldBucketName = getResumeBucketName(); // Use current bucket name
        await serverSupabase.storage
          .from(oldBucketName)
          .remove([existingCV.file_path]);
      } catch (cleanupError) {
        // Log but don't fail - old file cleanup is best effort
        safeLogger.warn('Failed to cleanup old CV file', {
          filePath: existingCV.file_path,
          error: cleanupError,
        });
      }
    }

    // Update student_profiles with extracted CV text (non-blocking)
    if (extractedText) {
      const { error: updateError } = await supabase
        .from('student_profiles')
        .update({ cv_text: extractedText })
        .eq('id', studentProfileId);

      if (updateError) {
        safeLogger.error('Error updating student_profiles.cv_text', updateError);
      }
    }

    // Revalidate portfolio page cache to ensure fresh data on next load
    revalidatePath('/student/portfolio');
    revalidatePath('/student/portfolio', 'page');

    // Return response in the exact format requested
    // Only return success if DB write succeeded (cvRecord exists)
    return NextResponse.json({
      ok: true,
      resume: {
        url: publicUrl,
        fileName: file.name,
        uploadedAt: cvRecord.uploaded_at || uploadedAt,
        fileSize: file.size,
      },
    });
  } catch (error) {
    safeLogger.error('Error in CV upload', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
