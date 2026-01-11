import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/lessons/progress
 * Track lesson progress (started or completed)
 * 
 * Body: {
 *   courseId: string (UUID)
 *   lessonSlug: string
 *   status: 'started' | 'completed'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, lessonSlug, status } = body;

    if (!courseId || !lessonSlug || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, lessonSlug, status' },
        { status: 400 }
      );
    }

    if (status !== 'started' && status !== 'completed') {
      return NextResponse.json(
        { error: 'Status must be "started" or "completed"' },
        { status: 400 }
      );
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify course exists
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if progress record already exists
    const { data: existingProgress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_profile_id', studentProfile.id)
      .eq('course_id', courseId)
      .eq('lesson_slug', lessonSlug)
      .single();

    if (existingProgress) {
      // Update existing record
      const updateData: any = {
        status,
        last_seen_at: new Date().toISOString(),
      };

      // If marking as completed and not already completed, set completed_at
      if (status === 'completed' && existingProgress.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: updatedProgress, error: updateError } = await supabase
        .from('lesson_progress')
        .update(updateData)
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating lesson progress:', updateError);
        return NextResponse.json(
          { error: 'Failed to update lesson progress' },
          { status: 500 }
        );
      }

      return NextResponse.json({ progress: updatedProgress });
    } else {
      // Create new progress record
      const insertData: any = {
        student_profile_id: studentProfile.id,
        course_id: courseId,
        lesson_slug: lessonSlug,
        status,
        last_seen_at: new Date().toISOString(),
      };

      // If marking as completed, set completed_at
      if (status === 'completed') {
        insertData.completed_at = new Date().toISOString();
      }

      const { data: newProgress, error: insertError } = await supabase
        .from('lesson_progress')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating lesson progress:', insertError);
        return NextResponse.json(
          { error: 'Failed to create lesson progress' },
          { status: 500 }
        );
      }

      return NextResponse.json({ progress: newProgress });
    }
  } catch (error) {
    console.error('Error in lesson progress API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/lessons/progress
 * Get lesson progress for a student
 * 
 * Query params:
 *   courseId?: string (UUID) - filter by course
 *   lessonSlug?: string - filter by lesson
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const lessonSlug = searchParams.get('lessonSlug');

    // Build query
    let query = supabase
      .from('lesson_progress')
      .select('*')
      .eq('student_profile_id', studentProfile.id);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    if (lessonSlug) {
      query = query.eq('lesson_slug', lessonSlug);
    }

    const { data: progress, error } = await query.order('last_seen_at', { ascending: false });

    if (error) {
      console.error('Error fetching lesson progress:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lesson progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({ progress: progress || [] });
  } catch (error) {
    console.error('Error in lesson progress API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
