import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/entitlements/courses
 * 
 * Get all courses with their access tier information.
 * Requires admin role.
 * 
 * Returns:
 * - courses: Array of { id, slug, title, access_tier }
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    const supabase = createServerSupabaseClient();

    // Get all courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, slug, title, is_published')
      .order('title');

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to fetch courses', details: coursesError.message },
        { status: 500 }
      );
    }

    // Get Essential tier course mappings
    const { data: essentialCourses, error: essentialError } = await supabase
      .from('subscription_tier_courses')
      .select('course_id')
      .eq('tier', 'essential');

    if (essentialError) {
      console.error('Error fetching essential courses:', essentialError);
      // Continue without essential course mappings
    }

    // Get tier config to check has_all_access
    const { data: tierConfig, error: tierError } = await supabase
      .from('subscription_tier_config')
      .select('tier, has_all_access');

    if (tierError) {
      console.error('Error fetching tier config:', tierError);
      // Continue without tier config
    }

    // Build essential course IDs set
    const essentialCourseIds = new Set(
      (essentialCourses || []).map(ec => ec.course_id)
    );

    // Determine access tier for each course
    const coursesWithTier = (courses || []).map(course => {
      let accessTier: 'Essential' | 'Professional' | 'None' = 'None';

      // Check if course is in Essential tier
      if (essentialCourseIds.has(course.id)) {
        accessTier = 'Essential';
      } else {
        // Check if Professional tier has all access
        const professionalConfig = (tierConfig || []).find(tc => tc.tier === 'professional');
        if (professionalConfig?.has_all_access) {
          accessTier = 'Professional';
        } else {
          // Check if course is published (might be accessible to Professional)
          accessTier = course.is_published ? 'Professional' : 'None';
        }
      }

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        access_tier: accessTier,
        is_published: course.is_published,
      };
    });

    return NextResponse.json({
      courses: coursesWithTier,
    });
  } catch (error) {
    console.error('Error in admin entitlements courses handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
