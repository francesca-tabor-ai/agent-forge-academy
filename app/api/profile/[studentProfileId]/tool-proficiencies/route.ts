import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { calculateProficiencyLevel } from '@/lib/utils/tool-proficiency';

interface RouteParams {
  params: Promise<{ studentProfileId: string }>;
}

// GET: Get all tool proficiencies for a student profile
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { studentProfileId } = await params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify student profile ownership
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, profile_id')
      .eq('id', studentProfileId)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Verify ownership (user's profile should match)
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', studentProfile.profile_id)
      .single();

    if (!profile || profile.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all tools
    const { data: tools } = await supabase
      .from('tools')
      .select('id, name, slug');

    if (!tools || tools.length === 0) {
      return NextResponse.json({ proficiencies: [] });
    }

    // Get all tool-course relationships
    const { data: toolCourses } = await supabase
      .from('tool_courses')
      .select('tool_id, course_id');

    if (!toolCourses || toolCourses.length === 0) {
      return NextResponse.json({ proficiencies: [] });
    }

    // Get completed courses for this student
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id, completed_at, progress_percentage')
      .eq('student_profile_id', studentProfileId);

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ proficiencies: [] });
    }

    // Create a set of completed course IDs
    const completedCourseIds = new Set(
      enrollments
        .filter(e => e.completed_at !== null || (e.progress_percentage !== null && e.progress_percentage >= 100))
        .map(e => e.course_id)
    );

    // Calculate proficiency for each tool
    const proficiencies = tools
      .map(tool => {
        // Count completed courses for this tool
        const toolCourseIds = toolCourses
          .filter(tc => tc.tool_id === tool.id)
          .map(tc => tc.course_id);

        const completedCount = toolCourseIds.filter(courseId => completedCourseIds.has(courseId)).length;

        if (completedCount === 0) {
          return null;
        }

        return {
          toolId: tool.id,
          toolName: tool.name,
          toolSlug: tool.slug,
          level: calculateProficiencyLevel(completedCount),
          completedCoursesCount: completedCount,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    return NextResponse.json({ proficiencies });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
