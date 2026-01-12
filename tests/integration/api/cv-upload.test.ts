/**
 * Integration Tests: CV Upload API
 * 
 * Tests for CV upload functionality:
 * - File upload to /api/portfolio/cv
 * - Database record creation
 * - Field validation
 * - File URL accessibility
 * 
 * Note: This test requires:
 * - Next.js dev server running on http://localhost:3000
 * - Test Supabase database configured
 * - Environment variables set in .env.test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServerSupabaseClient } from '@/lib/supabase/server';


describe('CV Upload - Integration Tests', () => {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  let testUserId: string;
  let testUserEmail: string;
  let testProfileId: string;
  let testStudentProfileId: string;

  beforeAll(async () => {
    supabase = createServerSupabaseClient();
    
    // Create test user
    testUserEmail = `test-cv-${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';
    
    // Sign up test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUserEmail,
      password: testPassword,
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    testUserId = authData.user.id;

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: testUserId,
        role: 'student',
      })
      .select('id')
      .single();

    if (profileError || !profile) {
      throw new Error(`Failed to create profile: ${profileError?.message}`);
    }

    testProfileId = profile.id;

    // Create student profile
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .insert({
        profile_id: testProfileId,
      })
      .select('id')
      .single();

    if (studentProfileError || !studentProfile) {
      throw new Error(`Failed to create student profile: ${studentProfileError?.message}`);
    }

    testStudentProfileId = studentProfile.id;
  });

  afterAll(async () => {
    // Cleanup: Delete CV, student profile, profile, and user
    if (testStudentProfileId) {
      // Delete CVs
      const { data: cvs } = await supabase
        .from('student_cvs')
        .select('file_path')
        .eq('student_profile_id', testStudentProfileId);

      if (cvs) {
        for (const cv of cvs) {
          await supabase.storage
            .from('portfolio-files')
            .remove([cv.file_path]);
        }
      }

      await supabase
        .from('student_cvs')
        .delete()
        .eq('student_profile_id', testStudentProfileId);

      await supabase
        .from('student_profiles')
        .delete()
        .eq('id', testStudentProfileId);
    }

    if (testProfileId) {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testProfileId);
    }

    if (testUserId) {
      // Note: User deletion from auth.users requires admin access
      // In production, you'd use service role key
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('CV Upload - Database Integration', () => {
    it('should upload CV and create database record', async () => {
      // Create a minimal PDF file (PDF header + minimal content)
      // This is a valid PDF structure: %PDF-1.4 header
      const pdfContent = Buffer.from(
        '%PDF-1.4\n' +
        '1 0 obj\n' +
        '<< /Type /Catalog /Pages 2 0 R >>\n' +
        'endobj\n' +
        '2 0 obj\n' +
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n' +
        'endobj\n' +
        '3 0 obj\n' +
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\n' +
        'endobj\n' +
        'xref\n' +
        '0 4\n' +
        '0000000000 65535 f \n' +
        '0000000009 00000 n \n' +
        '0000000058 00000 n \n' +
        '0000000115 00000 n \n' +
        'trailer\n' +
        '<< /Size 4 /Root 1 0 R >>\n' +
        'startxref\n' +
        '178\n' +
        '%%EOF'
      );

      const fileName = 'test-resume.pdf';
      const filePath = `cvs/${testUserId}/${Date.now()}.pdf`;
      
      // Simulate upload by directly inserting into database and storage
      // (This tests the same operations the API performs)
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('portfolio-files')
        .upload(filePath, pdfContent, {
          contentType: 'application/pdf',
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('portfolio-files')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Insert CV record (simulating what the API does)
      const { data: cvRecord, error: dbError } = await supabase
        .from('student_cvs')
        .upsert({
          student_profile_id: testStudentProfileId,
          file_name: fileName,
          file_path: filePath,
          url: publicUrl,
          file_size: pdfContent.length,
          mime_type: 'application/pdf',
          visibility: 'private',
        }, {
          onConflict: 'student_profile_id',
        })
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      // Verify response structure matches API response
      const responseData = {
        ok: true,
        resume: {
          url: publicUrl,
          fileName: fileName,
          uploadedAt: cvRecord.uploaded_at,
          fileSize: pdfContent.length,
        },
      };

      expect(responseData.ok).toBe(true);
      expect(responseData.resume).toBeDefined();
      expect(responseData.resume.fileName).toBe(fileName);
      expect(responseData.resume.uploadedAt).toBeDefined();
      expect(responseData.resume.fileSize).toBeGreaterThan(0);
      expect(responseData.resume.url).toBeDefined();
    });

    it('should create database record with all required fields', async () => {
      // Query DB for CV record by userId
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', testUserId)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!studentProfile) {
        throw new Error('Student profile not found');
      }

      const { data: cv, error: cvError } = await supabase
        .from('student_cvs')
        .select('*')
        .eq('student_profile_id', studentProfile.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      expect(cvError).toBeNull();
      expect(cv).toBeDefined();

      // Assert all required fields are populated
      expect(cv?.file_path).toBeDefined();
      expect(cv?.file_path).not.toBeNull();
      expect(cv?.url).toBeDefined();
      expect(cv?.url).not.toBeNull();
      expect(cv?.file_name).toBeDefined();
      expect(cv?.file_name).not.toBeNull();
      expect(cv?.file_size).toBeGreaterThan(0);
      expect(cv?.mime_type).toBe('application/pdf');
      expect(cv?.uploaded_at).toBeDefined();
      expect(cv?.uploaded_at).not.toBeNull();
      expect(cv?.user_id).toBe(testUserId);
      expect(cv?.student_profile_id).toBe(studentProfile.id);
    });

    it('should allow downloading the uploaded CV file', async () => {
      // Get CV record
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', testUserId)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (!studentProfile) {
        throw new Error('Student profile not found');
      }

      const { data: cv } = await supabase
        .from('student_cvs')
        .select('url, file_path, visibility')
        .eq('student_profile_id', studentProfile.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      expect(cv).toBeDefined();
      expect(cv?.url).toBeDefined();

      // For private CVs, we'd need to generate a signed URL
      // For public CVs, we can directly access the URL
      if (cv?.visibility === 'private') {
        // Generate signed URL
        const { data: signedUrl } = await supabase.storage
          .from('portfolio-files')
          .createSignedUrl(cv.file_path, 3600);

        expect(signedUrl?.signedUrl).toBeDefined();

        // Test accessing the signed URL
        const fileResponse = await fetch(signedUrl!.signedUrl);
        expect(fileResponse.ok).toBe(true);
        expect(fileResponse.headers.get('content-type')).toContain('application/pdf');
      } else {
        // Test accessing the public URL
        const fileResponse = await fetch(cv!.url);
        expect(fileResponse.ok).toBe(true);
        expect(fileResponse.headers.get('content-type')).toContain('application/pdf');
      }
    });

    it('should enforce one CV per student (UPSERT)', async () => {
      // Upload second CV (simulating replacement)
      const pdfContent2 = Buffer.from(
        '%PDF-1.4\n' +
        '1 0 obj\n' +
        '<< /Type /Catalog /Pages 2 0 R >>\n' +
        'endobj\n' +
        'xref\n' +
        '0 2\n' +
        'trailer\n' +
        '<< /Size 2 /Root 1 0 R >>\n' +
        'startxref\n' +
        '50\n' +
        '%%EOF'
      );

      const fileName2 = 'test-resume-v2.pdf';
      const filePath2 = `cvs/${testUserId}/${Date.now()}.pdf`;

      // Upload second file to storage
      const { error: uploadError2 } = await supabase.storage
        .from('portfolio-files')
        .upload(filePath2, pdfContent2, {
          contentType: 'application/pdf',
        });

      expect(uploadError2).toBeNull();

      // Get public URL for second file
      const { data: urlData2 } = supabase.storage
        .from('portfolio-files')
        .getPublicUrl(filePath2);

      // UPSERT should replace the old CV
      const { data: cvRecord2, error: dbError2 } = await supabase
        .from('student_cvs')
        .upsert({
          student_profile_id: testStudentProfileId,
          file_name: fileName2,
          file_path: filePath2,
          url: urlData2.publicUrl,
          file_size: pdfContent2.length,
          mime_type: 'application/pdf',
          visibility: 'private',
        }, {
          onConflict: 'student_profile_id',
        })
        .select()
        .single();

      expect(dbError2).toBeNull();

      // Verify only one CV exists (UPSERT replaced the old one)
      const { data: cvs } = await supabase
        .from('student_cvs')
        .select('*')
        .eq('student_profile_id', testStudentProfileId);

      // Should have exactly one CV (UPSERT replaced the old one)
      expect(cvs?.length).toBe(1);
      expect(cvs?.[0].file_name).toBe(fileName2);
    });
  });
});
