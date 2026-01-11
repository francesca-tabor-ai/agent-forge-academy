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
    const studentProfileId = formData.get('studentProfileId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!studentProfileId) {
      return NextResponse.json({ error: 'Student profile ID required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are allowed' }, { status: 400 });
    }

    // Validate file size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
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

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `cvs/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-files')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // If bucket doesn't exist, we'll need to create it or use a different approach
      // For now, return error
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('portfolio-files')
      .getPublicUrl(filePath);

    // Delete old CV if exists
    const { data: oldCVs } = await supabase
      .from('student_cvs')
      .select('file_path')
      .eq('student_profile_id', studentProfileId);

    if (oldCVs && oldCVs.length > 0) {
      // Delete old files from storage
      for (const oldCV of oldCVs) {
        await supabase.storage
          .from('portfolio-files')
          .remove([oldCV.file_path]);
      }

      // Delete old CV records
      await supabase
        .from('student_cvs')
        .delete()
        .eq('student_profile_id', studentProfileId);
    }

    // Save CV metadata to database
    const { data: cvRecord, error: dbError } = await supabase
      .from('student_cvs')
      .insert({
        student_profile_id: studentProfileId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        visibility: 'private', // Default to private
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file
      await supabase.storage
        .from('portfolio-files')
        .remove([filePath]);

      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      cv: cvRecord,
      url: urlData.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
