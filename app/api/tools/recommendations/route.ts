import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { calculateRecommendationScore, type ToolRecommendation } from '@/lib/utils/tool-recommendations';

// GET: Get personalized tool recommendations
export async function GET(request: Request) {
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
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, skills')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ recommendations: [] });
    }

    // Get enrolled and completed courses
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id, completed_at, progress_percentage')
      .eq('student_profile_id', studentProfile.id);

    const enrolledCourseIds = new Set(
      (enrollments || []).map(e => e.course_id)
    );

    const completedCourseIds = new Set(
      (enrollments || [])
        .filter(e => e.completed_at !== null || (e.progress_percentage !== null && e.progress_percentage >= 100))
        .map(e => e.course_id)
    );

    // Get user skills
    const userSkills: string[] = [];
    if (studentProfile.skills && Array.isArray(studentProfile.skills)) {
      userSkills.push(...studentProfile.skills.map((s: any) => 
        typeof s === 'string' ? s : s.name
      ).filter(Boolean));
    }

    // Get tools used in projects
    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('student_profile_id', studentProfile.id);

    const projectIds = (projects || []).map(p => p.id);
    let projectToolIds = new Set<string>();
    
    if (projectIds.length > 0) {
      const { data: projectTools } = await supabase
        .from('project_tools')
        .select('tool_id')
        .in('project_id', projectIds);

      projectToolIds = new Set(
        (projectTools || []).map(pt => pt.tool_id)
      );
    }

    // Get all tools with their course associations
    const { data: tools } = await supabase
      .from('tools')
      .select('id, name, slug, description, category, logo_url, website_url');

    if (!tools || tools.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Get tool-course relationships
    const { data: toolCourses } = await supabase
      .from('tool_courses')
      .select('tool_id, course_id');

    // Get tools with gated offers
    const { data: toolOffers } = await supabase
      .from('tool_offers')
      .select('tool_id, requires_course_completion')
      .eq('requires_course_completion', true)
      .eq('is_active', true);

    const toolsWithGatedOffers = new Set(
      (toolOffers || []).map(to => to.tool_id)
    );

    // Build tool map with course associations
    const toolMap = new Map<string, any>();
    tools.forEach(tool => {
      toolMap.set(tool.id, {
        ...tool,
        courseIds: [],
        hasGatedOffers: toolsWithGatedOffers.has(tool.id),
      });
    });

    // Add course associations
    (toolCourses || []).forEach(tc => {
      const tool = toolMap.get(tc.tool_id);
      if (tool) {
        tool.courseIds.push(tc.course_id);
      }
    });

    // Calculate recommendations
    const recommendations: ToolRecommendation[] = Array.from(toolMap.values())
      .map(tool => {
        const { score, reason, source } = calculateRecommendationScore(
          tool,
          enrolledCourseIds,
          completedCourseIds,
          userSkills,
          projectToolIds
        );

        return {
          toolId: tool.id,
          toolName: tool.name,
          toolSlug: tool.slug,
          description: tool.description,
          category: tool.category,
          logo_url: tool.logo_url,
          website_url: tool.website_url,
          reason,
          score,
          source,
        };
      })
      .filter(rec => rec.score > 0) // Only include tools with positive scores
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 10); // Top 10 recommendations

    return NextResponse.json({ recommendations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
