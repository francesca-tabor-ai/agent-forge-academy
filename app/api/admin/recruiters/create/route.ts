import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/recruiters/create
 * 
 * Create or invite a recruiter account.
 * Requires admin role.
 * 
 * Request body:
 * - email: string (required) - Email address for the recruiter
 * - orgName: string (required) - Name of the recruiter organization
 * 
 * Returns:
 * - success: boolean
 * - message: string
 * - data: { userId, profileId, orgId } (if successful)
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
    const { email, orgName } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      );
    }

    if (!orgName || typeof orgName !== 'string') {
      return NextResponse.json(
        { error: 'Organization name is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();

    // Step 1: Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error checking existing users:', listError);
      return NextResponse.json(
        { error: 'Failed to check existing users', details: listError.message },
        { status: 500 }
      );
    }

    const existingUser = existingUsers?.users?.find(u => u.email === email.toLowerCase());

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // User already exists, use their ID
      userId = existingUser.id;
    } else {
      // Step 2: Create/invite new user
      // Using inviteUserByEmail sends an invitation email
      // The user will need to set their password via the email link
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            role: 'recruiter',
            orgName,
          },
        }
      );

      if (inviteError) {
        console.error('Error inviting user:', inviteError);
        return NextResponse.json(
          { error: 'Failed to invite user', details: inviteError.message },
          { status: 500 }
        );
      }

      if (!inviteData?.user?.id) {
        return NextResponse.json(
          { error: 'Failed to create user - no user ID returned' },
          { status: 500 }
        );
      }

      userId = inviteData.user.id;
      isNewUser = true;
    }

    // Step 3: Ensure profile exists and set role to 'recruiter'
    // First, check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', userId)
      .single();

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's okay, we'll create it
      console.error('Error checking profile:', profileCheckError);
      return NextResponse.json(
        { error: 'Failed to check profile', details: profileCheckError.message },
        { status: 500 }
      );
    }

    let profileId: string;

    if (existingProfile) {
      // Profile exists, update role to recruiter
      profileId = existingProfile.id;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'recruiter' })
        .eq('id', profileId);

      if (updateError) {
        console.error('Error updating profile role:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile role', details: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // Profile doesn't exist, create it with recruiter role
      // Note: The trigger should create it, but we'll create it explicitly to ensure role is set
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          role: 'recruiter',
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create profile', details: createError.message },
          { status: 500 }
        );
      }

      profileId = newProfile.id;
    }

    // Step 4: Create or find organization
    let orgId: string;

    // Check if org already exists
    const { data: existingOrg, error: orgCheckError } = await supabase
      .from('recruiter_orgs')
      .select('id')
      .eq('name', orgName)
      .single();

    if (orgCheckError && orgCheckError.code !== 'PGRST116') {
      console.error('Error checking organization:', orgCheckError);
      return NextResponse.json(
        { error: 'Failed to check organization', details: orgCheckError.message },
        { status: 500 }
      );
    }

    if (existingOrg) {
      // Org exists, use it
      orgId = existingOrg.id;
    } else {
      // Create new org
      const { data: newOrg, error: orgCreateError } = await supabase
        .from('recruiter_orgs')
        .insert({
          name: orgName,
        })
        .select('id')
        .single();

      if (orgCreateError) {
        console.error('Error creating organization:', orgCreateError);
        return NextResponse.json(
          { error: 'Failed to create organization', details: orgCreateError.message },
          { status: 500 }
        );
      }

      orgId = newOrg.id;
    }

    // Step 5: Add recruiter to organization (if not already a member)
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('recruiter_org_members')
      .select('org_id')
      .eq('org_id', orgId)
      .eq('user_id', profileId)
      .single();

    if (memberCheckError && memberCheckError.code !== 'PGRST116') {
      console.error('Error checking org membership:', memberCheckError);
      return NextResponse.json(
        { error: 'Failed to check org membership', details: memberCheckError.message },
        { status: 500 }
      );
    }

    if (!existingMember) {
      // Add recruiter to org
      const { error: memberError } = await supabase
        .from('recruiter_org_members')
        .insert({
          org_id: orgId,
          user_id: profileId,
        });

      if (memberError) {
        console.error('Error adding recruiter to org:', memberError);
        return NextResponse.json(
          { error: 'Failed to add recruiter to organization', details: memberError.message },
          { status: 500 }
        );
      }
    }

    // Step 6: Ensure recruiter_profile exists (for backward compatibility with existing code)
    const { data: existingRecruiterProfile, error: recruiterProfileCheckError } = await supabase
      .from('recruiter_profiles')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (recruiterProfileCheckError && recruiterProfileCheckError.code !== 'PGRST116') {
      console.error('Error checking recruiter profile:', recruiterProfileCheckError);
      // Non-fatal, continue
    }

    if (!existingRecruiterProfile) {
      // Create recruiter_profile for backward compatibility
      const { error: recruiterProfileError } = await supabase
        .from('recruiter_profiles')
        .insert({
          profile_id: profileId,
          company_name: orgName,
        });

      if (recruiterProfileError) {
        console.error('Error creating recruiter profile:', recruiterProfileError);
        // Non-fatal, continue
      }
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: isNewUser
        ? `Recruiter invitation sent to ${email}. They will receive an email to set their password.`
        : `Recruiter account updated for ${email}.`,
      data: {
        userId,
        profileId,
        orgId,
        isNewUser,
      },
    });
  } catch (error) {
    console.error('Unexpected error creating recruiter:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
