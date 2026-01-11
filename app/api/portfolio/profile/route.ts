import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/portfolio/profile
 * Get or create student profile for the authenticated user
 */
export async function GET() {
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
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { ok: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' } },
        { status: 404 }
      );
    }

    // Get or create student profile
    let { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, full_name, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      // Create student profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          profile_id: profile.id,
          full_name: null,
          headline: '',
          bio: null,
          skills: [],
          location: null,
          linkedin_url: null,
          github_url: null,
          website_url: null,
          headshot_image_url: null,
        })
        .select('id, full_name, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
        .single();

      if (createError) {
        console.error('[Profile GET] Failed to create student profile:', createError);
        return NextResponse.json(
          { ok: false, error: { code: 'CREATE_FAILED', message: createError.message } },
          { status: 500 }
        );
      }

      studentProfile = newProfile;
    }

    return NextResponse.json({
      ok: true,
      profile: studentProfile,
    });
  } catch (error) {
    console.error('[Profile GET] Unexpected error:', error);
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

/**
 * PATCH /api/portfolio/profile
 * Update student profile for the authenticated user
 */
export async function PATCH(request: Request) {
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

    const body = await request.json();
    let { full_name, headline, bio, skills, location, linkedin_url, github_url, website_url } = body;

    // Normalize empty strings to null for URL fields
    const normalizeUrl = (url: string | null | undefined): string | null => {
      if (!url || typeof url !== 'string') return null;
      const trimmed = url.trim();
      return trimmed === '' ? null : trimmed;
    };

    linkedin_url = normalizeUrl(linkedin_url);
    github_url = normalizeUrl(github_url);
    website_url = normalizeUrl(website_url);

    // Validate full_name
    const fieldErrors: Record<string, string> = {};
    full_name = full_name?.trim() || '';
    if (!full_name || full_name.length < 2) {
      fieldErrors.full_name = 'Full name is required and must be at least 2 characters';
    } else if (full_name.length > 80) {
      fieldErrors.full_name = 'Full name must be 80 characters or less';
    }

    // Validate headline
    headline = headline?.trim() || '';
    if (!headline || headline.length < 5) {
      fieldErrors.headline = 'Professional headline must be at least 5 characters';
    }

    // Validate bio length if provided
    if (bio && bio.trim().length > 2000) {
      fieldErrors.bio = 'Bio must be 2000 characters or less';
    }

    // Validate skills array
    if (!Array.isArray(skills)) {
      fieldErrors.skills = 'Skills must be an array';
    } else if (skills.length > 30) {
      fieldErrors.skills = 'Maximum 30 skills allowed';
    }

    // Return validation errors if any
    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Validation failed',
            fieldErrors 
          } 
        },
        { status: 400 }
      );
    }

    // Validate URLs if provided
    const isValidUrl = (url: string | null): boolean => {
      if (!url) return true; // null/empty is valid
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (linkedin_url && !isValidUrl(linkedin_url)) {
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid LinkedIn URL format',
            fieldErrors: { linkedin_url: 'Please enter a valid URL' }
          } 
        },
        { status: 400 }
      );
    }

    if (github_url && !isValidUrl(github_url)) {
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid GitHub URL format',
            fieldErrors: { github_url: 'Please enter a valid URL' }
          } 
        },
        { status: 400 }
      );
    }

    if (website_url && !isValidUrl(website_url)) {
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid website URL format',
            fieldErrors: { website_url: 'Please enter a valid URL' }
          } 
        },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { ok: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' } },
        { status: 404 }
      );
    }

    // Get or create student profile
    let { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    // Normalize bio and location
    bio = bio?.trim() || null;
    location = location?.trim() || null;

    if (!studentProfile) {
      // Create student profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          profile_id: profile.id,
          full_name: full_name || null,
          headline: headline || '',
          bio: bio || null,
          skills: skills || [],
          location: location || null,
          linkedin_url: linkedin_url,
          github_url: github_url,
          website_url: website_url,
        })
        .select('id, full_name, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
        .single();

      if (createError) {
        console.error('[Profile PATCH] Failed to create student profile:', createError);
        return NextResponse.json(
          { ok: false, error: { code: 'CREATE_FAILED', message: createError.message } },
          { status: 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        profile: newProfile,
      });
    }

    // Update existing student profile (RLS will enforce ownership)
    const { data: updatedProfile, error } = await supabase
      .from('student_profiles')
      .update({
        full_name: full_name || null,
        headline,
        bio: bio || null,
        skills: skills || [],
        location: location || null,
        linkedin_url: linkedin_url,
        github_url: github_url,
        website_url: website_url,
      })
      .eq('id', studentProfile.id)
      .select('id, full_name, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
      .single();

    if (error) {
      console.error('[Profile PATCH] Update error:', error);
      return NextResponse.json(
        { ok: false, error: { code: 'UPDATE_FAILED', message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('[Profile PATCH] Unexpected error:', error);
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
