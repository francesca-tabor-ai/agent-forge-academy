import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';
import { ESSENTIAL_TIER_COURSES } from '@/lib/utils/subscription-types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/entitlements/set-essential-allowlist
 * 
 * Sets the Essential tier allowlist to the 5 known Essential courses.
 * Requires admin role.
 * 
 * Returns:
 * - success: boolean
 * - updated: number - Number of courses added to allowlist
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    const adminUser = adminResult;
    const supabase = createServerSupabaseClient();

    // Get course IDs for the 5 Essential courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, slug')
      .in('slug', ESSENTIAL_TIER_COURSES);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to fetch courses', details: coursesError.message },
        { status: 500 }
      );
    }

    if (!courses || courses.length === 0) {
      return NextResponse.json(
        { error: 'No courses found with the specified slugs', details: `Looking for: ${ESSENTIAL_TIER_COURSES.join(', ')}` },
        { status: 404 }
      );
    }

    // Remove all existing Essential tier course mappings
    const { error: deleteError } = await supabase
      .from('subscription_tier_courses')
      .delete()
      .eq('tier', 'essential');

    if (deleteError) {
      console.error('Error deleting existing mappings:', deleteError);
      return NextResponse.json(
        { error: 'Failed to clear existing allowlist', details: deleteError.message },
        { status: 500 }
      );
    }

    // Insert new mappings for the 5 Essential courses
    const mappings = courses.map(course => ({
      tier: 'essential' as const,
      course_id: course.id,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('subscription_tier_courses')
      .insert(mappings)
      .select();

    if (insertError) {
      console.error('Error inserting mappings:', insertError);
      return NextResponse.json(
        { error: 'Failed to set allowlist', details: insertError.message },
        { status: 500 }
      );
    }

    // Log action to audit log
    try {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                       request.headers.get('x-real-ip') ||
                       null;
      const userAgent = request.headers.get('user-agent') || null;

      await supabase
        .from('admin_audit_log')
        .insert({
          admin_user_id: adminUser.id,
          action_type: 'set_essential_allowlist',
          resource_type: 'subscription_tier_courses',
          metadata: {
            course_slugs: ESSENTIAL_TIER_COURSES,
            course_ids: courses.map(c => c.id),
            courses_count: courses.length,
            ip_address: ipAddress,
            user_agent: userAgent,
          },
        });
    } catch (auditError) {
      // Log error but don't fail the request
      console.error('Failed to log audit:', auditError);
    }

    return NextResponse.json({
      success: true,
      updated: inserted?.length || 0,
      courses: courses.map(c => ({ slug: c.slug, id: c.id })),
    });
  } catch (error) {
    console.error('Error in set-essential-allowlist handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
