import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, progressPercent } = body;

    if (!courseId || progressPercent === undefined) {
      return NextResponse.json(
        { error: 'Course ID and progress percent are required' },
        { status: 400 }
      );
    }

    if (progressPercent < 0 || progressPercent > 100) {
      return NextResponse.json(
        { error: 'Progress percent must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const { data: existingProgress } = await supabase
      .from('startup_progress_tracking')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (!existingProgress) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    // Update progress
    const { data: updatedProgress, error: updateError } = await supabase
      .from('startup_progress_tracking')
      .update({
        progress_percent: progressPercent,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating progress:', updateError);
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('Error in PATCH /api/startup-courses/progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
