import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { guardCourseAccessViaDB } from '@/lib/middleware/course-access-guard';
import { hasCourseAccess, getSegmentsForCourse } from '@/lib/utils/course-access';

/**
 * GET /api/courses/:courseId
 * 
 * Fetches course details by ID with subscription access control.
 * 
 * Access Control:
 * - Requires authentication (401 if not logged in)
 * - Requires active subscription (403 if no subscription or insufficient tier)
 * - Returns 200 if access is allowed
 * - Returns 403 if access is denied
 * - Returns 404 if course not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    
    // Step 1: Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to access this course.' },
        { status: 401 }
      );
    }

    // Step 2: Guard course access (authenticates, checks subscription, verifies permissions)
    const guardResult = await guardCourseAccessViaDB(user.id, params.id);

    // Handle redirects (course renamed)
    if (guardResult.status === 301 && guardResult.redirectTo) {
      return NextResponse.redirect(new URL(guardResult.redirectTo, request.url));
    }

    // If access is denied, return the guard's response with error details
    if (!guardResult.allowed) {
      // Get course slug for segment lookup
      const { data: courseForSlug } = await supabase
        .from('courses')
        .select('slug')
        .eq('id', params.id)
        .single();
      
      const responseBody: any = { error: guardResult.error };
      
      // Add segment information for paywall if course slug is available
      if (courseForSlug?.slug) {
        const segments = await getSegmentsForCourse(courseForSlug.slug);
        if (segments.length > 0) {
          responseBody.segments = segments;
          responseBody.paywall = true;
        }
      }
      
      // Add action required if provided
      if (guardResult.actionRequired) {
        responseBody.actionRequired = guardResult.actionRequired;
      }
      
      // Add redirect suggestion if provided
      if (guardResult.redirectTo) {
        responseBody.redirectTo = guardResult.redirectTo;
      }
      
      // Add retry after for 503 errors
      if (guardResult.retryAfter) {
        return NextResponse.json(
          responseBody,
          { 
            status: guardResult.status,
            headers: {
              'Retry-After': guardResult.retryAfter.toString(),
            },
          }
        );
      }

      return NextResponse.json(
        responseBody,
        { status: guardResult.status }
      );
    }

    // If access allowed but with warning (e.g., canceled subscription in grace period)
    if (guardResult.warning) {
      // Still return course data, but include warning
      // This will be handled by the frontend to show warning banner
    }

    // Step 3: Fetch course details (access is granted)
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get course metadata from course-metadata.ts if available
    // For now, return basic course data
    return NextResponse.json({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnail_url,
      durationWeeks: course.duration_weeks,
      difficultyLevel: course.difficulty_level,
      isPublished: course.is_published,
      createdAt: course.created_at,
      updatedAt: course.updated_at,
      // Note: Modules/lessons would be loaded from markdown files
      // "You'll build" and other metadata would come from course-metadata.ts
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
