import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { calculateProficiencyLevel } from '@/lib/utils/tool-proficiency';

interface RouteParams {
  params: Promise<{ toolId: string }>;
}

// GET: Get tool proficiency for current user
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { toolId } = await params;
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
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ 
        level: 'beginner',
        completedCoursesCount: 0,
      });
    }

    // Get tool info
    const { data: tool } = await supabase
      .from('tools')
      .select('id, name')
      .eq('id', toolId)
      .single();

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Get courses that teach this tool
    const { data: toolCourses } = await supabase
      .from('tool_courses')
      .select('course_id')
      .eq('tool_id', toolId);

    if (!toolCourses || toolCourses.length === 0) {
      return NextResponse.json({
        level: 'beginner',
        completedCoursesCount: 0,
      });
    }

    const courseIds = toolCourses.map(tc => tc.course_id);

    // Get completed courses for this student
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id, completed_at, progress_percentage')
      .eq('student_profile_id', studentProfile.id)
      .in('course_id', courseIds);

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        level: 'beginner',
        completedCoursesCount: 0,
      });
    }

    // Count completed courses (completed_at IS NOT NULL OR progress_percentage >= 100)
    const completedCourses = enrollments.filter(
      e => e.completed_at !== null || (e.progress_percentage !== null && e.progress_percentage >= 100)
    );

    const completedCoursesCount = completedCourses.length;
    const level = calculateProficiencyLevel(completedCoursesCount);

    return NextResponse.json({
      level,
      completedCoursesCount,
      toolName: tool.name,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
