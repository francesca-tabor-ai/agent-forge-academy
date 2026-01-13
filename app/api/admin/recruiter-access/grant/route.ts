import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/recruiter-access/grant
 * 
 * Grant a recruiter access to a student's CV.
 * Requires admin role.
 * 
 * Request body:
 * - recruiterId: string (required) - Profile ID of the recruiter
 * - studentId: string (required) - Profile ID of the student
 * - expiresAt: string | null (optional) - ISO timestamp for expiration
 * - reason: string | null (optional) - Reason for granting access
 * 
 * Returns:
 * - success: boolean
 * - message: string
 * - data: { accessGrant } (if successful)
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    // Parse request body
    const body = await request.json();
    const { recruiterId, studentId, expiresAt, reason } = body;

    // Validate input
    if (!recruiterId || typeof recruiterId !== 'string') {
      return NextResponse.json(
        { error: 'Recruiter ID is required and must be a string' },
        { status: 400 }
      );
    }

    if (!studentId || typeof studentId !== 'string') {
      return NextResponse.json(
        { error: 'Student ID is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();

    // Step 1: Verify recruiter exists and has recruiter role
    const { data: recruiterProfile, error: recruiterError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', recruiterId)
      .single();

    if (recruiterError || !recruiterProfile) {
      return NextResponse.json(
        { error: 'Recruiter not found' },
        { status: 404 }
      );
    }

    if (recruiterProfile.role !== 'recruiter' && recruiterProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Profile is not a recruiter' },
        { status: 400 }
      );
    }

    // Step 2: Verify student exists and has student role
    const { data: studentProfile, error: studentError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', studentId)
      .single();

    if (studentError || !studentProfile) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    if (studentProfile.role !== 'student') {
      return NextResponse.json(
        { error: 'Profile is not a student' },
        { status: 400 }
      );
    }

    // Step 3: Check if access grant already exists
    const { data: existingAccess, error: existingError } = await supabase
      .from('recruiter_student_access')
      .select('id, expires_at')
      .eq('recruiter_id', recruiterId)
      .eq('student_id', studentId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's okay
      console.error('Error checking existing access:', existingError);
      return NextResponse.json(
        { error: 'Failed to check existing access', details: existingError.message },
        { status: 500 }
      );
    }

    // Step 4: Prepare access grant data
    const accessData: {
      recruiter_id: string;
      student_id: string;
      expires_at?: string | null;
      reason?: string | null;
    } = {
      recruiter_id: recruiterId,
      student_id: studentId,
      reason: reason || null,
    };

    if (expiresAt) {
      // Validate expiration date is in the future
      const expiresDate = new Date(expiresAt);
      const now = new Date();
      if (expiresDate <= now) {
        return NextResponse.json(
          { error: 'Expiration date must be in the future' },
          { status: 400 }
        );
      }
      accessData.expires_at = expiresAt;
    } else {
      accessData.expires_at = null;
    }

    // Step 5: Insert or update access grant
    let accessGrant;
    if (existingAccess) {
      // Update existing access grant
      const { data: updated, error: updateError } = await supabase
        .from('recruiter_student_access')
        .update(accessData)
        .eq('id', existingAccess.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating access grant:', updateError);
        return NextResponse.json(
          { error: 'Failed to update access grant', details: updateError.message },
          { status: 500 }
        );
      }

      accessGrant = updated;
    } else {
      // Create new access grant
      const { data: created, error: createError } = await supabase
        .from('recruiter_student_access')
        .insert(accessData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating access grant:', createError);
        return NextResponse.json(
          { error: 'Failed to create access grant', details: createError.message },
          { status: 500 }
        );
      }

      accessGrant = created;
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: existingAccess
        ? 'Access grant updated successfully'
        : 'Access granted successfully',
      data: {
        accessGrant,
      },
    });
  } catch (error) {
    console.error('Unexpected error granting access:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
