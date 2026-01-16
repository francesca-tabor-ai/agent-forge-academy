import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hasCourseAccess, getSegmentsForCourse } from '@/lib/utils/course-access';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to get course_id from form data or query params
    const formData = await request.formData().catch(() => null);
    const courseId = formData?.get('course_id') as string || 
                     new URL(request.url).searchParams.get('course_id');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.role !== 'student') {
      return NextResponse.json({ error: 'Only students can enroll' }, { status: 403 });
    }

    // Get student profile
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (studentProfileError || !studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Check if course exists and is published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, is_published')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (!course.is_published) {
      return NextResponse.json({ error: 'Course is not available for enrollment' }, { status: 403 });
    }

    // Get course slug for access check
    const { data: courseForSlug } = await supabase
      .from('courses')
      .select('slug')
      .eq('id', courseId)
      .single();

    if (!courseForSlug?.slug) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check course access using new access function
    const accessResult = await hasCourseAccess(user.id, courseForSlug.slug);

    if (!accessResult.hasAccess) {
      // Get segments for paywall
      const segments = await getSegmentsForCourse(courseForSlug.slug);
      
      return NextResponse.json(
        { 
          error: 'Subscription required to enroll in this course',
          paywall: true,
          segments: segments,
        },
        { status: 403 }
      );
    }
      return NextResponse.json(
        { 
          error: 'Course access denied. Please upgrade your subscription to access this course.',
          requires_subscription: true 
        },
        { status: 403 }
      );
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_profile_id', studentProfile.id)
      .single();

    if (existingEnrollment) {
      // Already enrolled, redirect to course page
      const { data: courseData } = await supabase
        .from('courses')
        .select('slug')
        .eq('id', courseId)
        .single();

      return NextResponse.redirect(
        new URL(`/student/courses/${courseData?.slug || courseId}`, request.url)
      );
    }

    // Create enrollment
    const { error: enrollmentError } = await supabase
      .from('course_enrollments')
      .insert({
        course_id: courseId,
        student_profile_id: studentProfile.id,
        progress_percentage: 0,
      });

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError);
      return NextResponse.json(
        { error: 'Failed to enroll in course' },
        { status: 500 }
      );
    }

    // Track course → tool conversion for tools taught in this course
    try {
      const { data: toolCourses } = await supabase
        .from('tool_courses')
        .select('tool_id')
        .eq('course_id', courseId);

      if (toolCourses && toolCourses.length > 0) {
        // Track conversion for each tool taught in this course
        for (const tc of toolCourses) {
          await supabase
            .from('tool_analytics_events')
            .insert({
              event_type: 'course_tool_conversion',
              user_id: user.id,
              student_profile_id: studentProfile.id,
              course_id: courseId,
              tool_id: tc.tool_id,
              metadata: {
                enrollment_date: new Date().toISOString(),
              },
            });
        }
      }
    } catch (error) {
      // Don't fail enrollment if tracking fails
      console.error('Error tracking course-tool conversion:', error);
    }

    // Get course slug for redirect
    const { data: courseData } = await supabase
      .from('courses')
      .select('slug')
      .eq('id', courseId)
      .single();

    return NextResponse.redirect(
      new URL(`/student/courses/${courseData?.slug || courseId}`, request.url)
    );
  } catch (error) {
    console.error('Error in enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
