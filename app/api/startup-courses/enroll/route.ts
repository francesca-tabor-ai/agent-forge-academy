import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get course_id from query params or form data
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('course_id');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('startup_courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if already enrolled
    const { data: existingProgress } = await supabase
      .from('startup_progress_tracking')
      .select('id, progress_percent')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existingProgress) {
      // Already enrolled, return success
      return NextResponse.json({
        success: true,
        message: 'Already enrolled',
        progress: existingProgress.progress_percent,
      });
    }

    // Create enrollment (progress tracking record)
    const { data: progress, error: progressError } = await supabase
      .from('startup_progress_tracking')
      .insert({
        user_id: user.id,
        course_id: courseId,
        progress_percent: 0,
      })
      .select()
      .single();

    if (progressError) {
      console.error('Error creating enrollment:', progressError);
      return NextResponse.json(
        { error: 'Failed to enroll in course' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully enrolled in course',
      progress: 0,
    });
  } catch (error) {
    console.error('Error in POST /api/startup-courses/enroll:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
