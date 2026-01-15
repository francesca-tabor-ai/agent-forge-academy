import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAllCourseSlugs, loadAllLessons } from '@/lib/lessons';
import { courseMetadata } from '@/lib/course-metadata';
import { extractCourseMetadata } from '@/lib/course-sync/extract-metadata';
import { CoursesPageClient } from '@/components/courses/CoursesPageClient';
import { getUserSubscriptionTier } from '@/lib/utils/subscription-access';

export default async function CoursesPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get student profile to check enrollments
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  let studentProfileId: string | null = null;
  if (profile) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();
    studentProfileId = studentProfile?.id || null;
  }

  // Get all published courses from database
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
  }

  // Get enrollments for this student
  let enrollments: Record<string, { progress_percentage: number; enrolled_at: string }> = {};
  if (studentProfileId) {
    const { data: enrollmentData } = await supabase
      .from('course_enrollments')
      .select('course_id, progress_percentage, enrolled_at')
      .eq('student_profile_id', studentProfileId);

    if (enrollmentData) {
      enrollments = enrollmentData.reduce((acc, e) => {
        acc[e.course_id] = {
          progress_percentage: e.progress_percentage,
          enrolled_at: e.enrolled_at,
        };
        return acc;
      }, {} as Record<string, { progress_percentage: number; enrolled_at: string }>);
    }
  }

  // Get course slugs from file system (for courses that might not be in DB yet)
  const courseSlugs = getAllCourseSlugs();
  const courseSlugSet = new Set(courseSlugs);

  // Merge database courses with file system courses
  type CourseWithMetadata = {
    id: string | null;
    slug: string;
    title: string;
    description: string | null;
    thumbnail_url: string | null;
    imageUrl?: string | null;
    duration_weeks: number | null;
    difficulty_level: string | null;
    is_published: boolean;
    created_at: string | null;
    updated_at: string | null;
    hasContent: boolean;
    industries: string[];
    category?: string;
    metadata?: typeof courseMetadata[string];
  };

  const allCourses: CourseWithMetadata[] = (courses || []).map((course) => {
    // Try dynamic metadata extraction first (from _COURSE_METADATA.md)
    const dynamicMetadata = extractCourseMetadata(course.slug);
    // Fallback to static metadata if dynamic extraction fails
    const staticMetadata = courseMetadata[course.slug];
    const metadata = dynamicMetadata?.metadata || staticMetadata;
    
    return {
      ...course,
      // Use dynamic metadata description if available, otherwise use database description
      description: dynamicMetadata?.metadata?.description || course.description,
      industries: course.industries || dynamicMetadata?.metadata?.industries || [],
      hasContent: courseSlugSet.has(course.slug),
      category: metadata?.category || dynamicMetadata?.metadata?.category,
      imageUrl: dynamicMetadata?.metadata?.imageUrl || metadata?.imageUrl,
      metadata: staticMetadata, // Keep static metadata for backward compatibility
    };
  });

  // Also include courses from file system that aren't in database yet
  for (const slug of courseSlugs) {
    if (!allCourses.find((c) => c.slug === slug)) {
      // Try to get lesson count
      const lessons = loadAllLessons(undefined, slug);
      // Try dynamic metadata extraction first (from _COURSE_METADATA.md)
      const dynamicMetadata = extractCourseMetadata(slug);
      // Fallback to static metadata if dynamic extraction fails
      const staticMetadata = courseMetadata[slug];
      const metadata = dynamicMetadata?.metadata || staticMetadata;
      
      allCourses.push({
        id: null, // Not in database yet
        slug,
        title: dynamicMetadata?.metadata?.title || metadata?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        description: dynamicMetadata?.metadata?.description || metadata?.outcome || null,
        thumbnail_url: dynamicMetadata?.metadata?.thumbnail_url || null,
        imageUrl: dynamicMetadata?.metadata?.imageUrl || metadata?.imageUrl,
        duration_weeks: dynamicMetadata?.metadata?.duration_weeks || null,
        difficulty_level: dynamicMetadata?.metadata?.difficulty_level || null,
        is_published: dynamicMetadata?.metadata?.is_published || false,
        created_at: null,
        updated_at: null,
        hasContent: lessons.length > 0,
        industries: dynamicMetadata?.metadata?.industries || metadata?.industries || [],
        category: dynamicMetadata?.metadata?.category || metadata?.category,
        metadata: staticMetadata, // Keep static metadata for backward compatibility
      });
    }
  }

  // Get user's subscription tier
  const subscriptionTier = await getUserSubscriptionTier(user.id);

  return (
    <CoursesPageClient
      courses={allCourses}
      enrollments={enrollments}
      subscriptionTier={subscriptionTier}
    />
  );
}
