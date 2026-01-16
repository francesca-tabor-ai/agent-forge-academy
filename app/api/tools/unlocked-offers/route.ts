import { NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { type UnlockedOfferRecommendation } from '@/lib/utils/tool-recommendations';

// GET: Get offers that would be unlocked by completing courses
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
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ recommendations: [] });
    }

    // Get enrolled courses (not completed)
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id, completed_at, progress_percentage')
      .eq('student_profile_id', studentProfile.id);

    const enrolledButNotCompleted = (enrollments || [])
      .filter(e => e.completed_at === null && (e.progress_percentage === null || e.progress_percentage < 100))
      .map(e => e.course_id);

    if (enrolledButNotCompleted.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Get gated offers that require these courses
    const { data: toolOffers } = await supabase
      .from('tool_offers')
      .select(`
        id,
        title,
        value_display,
        requires_course_completion,
        required_course_id,
        tool_id,
        tools:tool_id (
          id,
          name,
          slug
        )
      `)
      .eq('requires_course_completion', true)
      .eq('is_active', true)
      .in('required_course_id', enrolledButNotCompleted);

    if (!toolOffers || toolOffers.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Get course details
    const courseIds = Array.from(new Set(toolOffers.map(to => to.required_course_id).filter(Boolean)));
    const { data: courses } = await supabase
      .from('courses')
      .select('id, slug, title')
      .in('id', courseIds);

    const courseMap = new Map(
      (courses || []).map(c => [c.id, c])
    );

    // Build recommendations
    const recommendations: UnlockedOfferRecommendation[] = toolOffers
      .map((offer: any) => {
        const course = courseMap.get(offer.required_course_id);
        if (!course || !offer.tools) return null;

        return {
          offerId: offer.id,
          offerTitle: offer.title,
          toolName: offer.tools.name,
          toolSlug: offer.tools.slug,
          requiredCourseId: offer.required_course_id,
          requiredCourseTitle: course.title,
          requiredCourseSlug: course.slug,
          valueDisplay: offer.value_display,
          reason: `Complete "${course.title}" to unlock this offer`,
        };
      })
      .filter((r): r is UnlockedOfferRecommendation => r !== null)
      .slice(0, 10); // Top 10

    return NextResponse.json({ recommendations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
