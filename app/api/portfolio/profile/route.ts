import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { headline, bio, skills, location, linkedin_url, github_url, website_url } = body;

    // Validation
    if (!headline || headline.trim().length < 5) {
      return NextResponse.json(
        { error: 'Professional headline must be at least 5 characters' },
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
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get or create student profile
    let { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      // Create student profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          profile_id: profile.id,
          headline,
          bio: bio || null,
          skills: skills || [],
          location: location || null,
          linkedin_url: linkedin_url || null,
          github_url: github_url || null,
          website_url: website_url || null,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      return NextResponse.json(newProfile);
    }

    // Update existing student profile (RLS will enforce ownership)
    const { data: updatedProfile, error } = await supabase
      .from('student_profiles')
      .update({
        headline,
        bio: bio || null,
        skills: skills || [],
        location: location || null,
        linkedin_url: linkedin_url || null,
        github_url: github_url || null,
        website_url: website_url || null,
      })
      .eq('id', studentProfile.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
