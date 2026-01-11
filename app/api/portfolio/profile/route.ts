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
      .select('id, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
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
        .select('id, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
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
    let { headline, bio, skills, location, linkedin_url, github_url, website_url } = body;

    // Normalize empty strings to null for URL fields
    const normalizeUrl = (url: string | null | undefined): string | null => {
      if (!url || typeof url !== 'string') return null;
      const trimmed = url.trim();
      return trimmed === '' ? null : trimmed;
    };

    linkedin_url = normalizeUrl(linkedin_url);
    github_url = normalizeUrl(github_url);
    website_url = normalizeUrl(website_url);

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
        { ok: false, error: { code: 'INVALID_URL', message: 'Invalid LinkedIn URL format' } },
        { status: 400 }
      );
    }

    if (github_url && !isValidUrl(github_url)) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_URL', message: 'Invalid GitHub URL format' } },
        { status: 400 }
      );
    }

    if (website_url && !isValidUrl(website_url)) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_URL', message: 'Invalid website URL format' } },
        { status: 400 }
      );
    }

    // Validate headline - will check after we know if profile exists
    headline = headline?.trim() || '';

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
      // Allow empty headline on initial create
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          profile_id: profile.id,
          headline: headline || '',
          bio: bio || null,
          skills: skills || [],
          location: location || null,
          linkedin_url: linkedin_url,
          github_url: github_url,
          website_url: website_url,
        })
        .select('id, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
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
    // Require headline to be at least 5 chars on update
    if (!headline || headline.length < 5) {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Professional headline must be at least 5 characters' } },
        { status: 400 }
      );
    }

    const { data: updatedProfile, error } = await supabase
      .from('student_profiles')
      .update({
        headline,
        bio: bio || null,
        skills: skills || [],
        location: location || null,
        linkedin_url: linkedin_url,
        github_url: github_url,
        website_url: website_url,
      })
      .eq('id', studentProfile.id)
      .select('id, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
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
