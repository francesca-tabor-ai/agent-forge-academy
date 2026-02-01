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

    const body = await request.json();
    const { title, description, github_url, demo_url, visibility } = body;

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
          headline: '',
          bio: null,
          skills: [],
          location: null,
          city: null,
          country: null,
          linkedin_url: null,
          github_url: null,
          website_url: null,
          headshot_image_url: null,
        })
        .select('id')
        .single();

      if (createError) {
        console.error('[Projects POST] Failed to create student profile:', createError);
        return NextResponse.json(
          { error: `Failed to create student profile: ${createError.message}` },
          { status: 500 }
        );
      }

      studentProfile = newProfile;
    }

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Validate visibility value
    const validVisibilityValues = ['private', 'recruiters_only', 'public'];
    const projectVisibility = visibility || 'private';
    if (!validVisibilityValues.includes(projectVisibility)) {
      return NextResponse.json(
        { error: `Invalid visibility value. Must be one of: ${validVisibilityValues.join(', ')}` },
        { status: 400 }
      );
    }

    // Create project (RLS will enforce permissions)
    const { data: project, error } = await supabase
      .from('portfolio_projects')
      .insert({
        student_profile_id: studentProfile.id,
        title: title.trim(),
        description: description?.trim() || null,
        github_url: github_url?.trim() || null,
        demo_url: demo_url?.trim() || null,
        visibility: projectVisibility,
      })
      .select()
      .single();

    if (error) {
      console.error('[Projects POST] Failed to create project:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        studentProfileId: studentProfile.id,
      });
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

