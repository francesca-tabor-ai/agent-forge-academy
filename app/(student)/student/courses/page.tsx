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
    
    // Create enhanced metadata that includes dynamic fields (outcome, build, bestFor)
    // For courses with static metadata, merge with dynamic fields
    // For courses without static metadata (like Finance), create metadata from dynamic fields
    const enhancedMetadata = staticMetadata ? {
      ...staticMetadata,
      // Override with dynamic metadata fields if available
      outcome: (dynamicMetadata?.metadata as any)?.outcome || staticMetadata.outcome,
      build: (dynamicMetadata?.metadata as any)?.build || staticMetadata.build,
      bestFor: (dynamicMetadata?.metadata as any)?.bestFor || staticMetadata.bestFor,
      // Prioritize static metadata title (course-metadata.ts) over dynamic metadata title
      // to ensure we show the course name, not the first lesson title
      // Ensure title is always a string with hard fallback
      title: staticMetadata.title || dynamicMetadata?.metadata?.title || course.title || course.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      // Ensure category is always a string with hard fallback
      category: dynamicMetadata?.metadata?.category || staticMetadata.category || course.category || "Uncategorized",
      imageUrl: dynamicMetadata?.metadata?.imageUrl || staticMetadata.imageUrl,
    } : (dynamicMetadata?.metadata ? {
      // Create CourseMetadata from dynamic metadata for courses without static metadata
      slug: course.slug,
      // Ensure title is always a string with hard fallback
      title: dynamicMetadata.metadata.title || course.title || course.slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      // Ensure category is always a string with hard fallback
      category: dynamicMetadata.metadata.category || course.category || "Uncategorized",
      outcome: (dynamicMetadata.metadata as any)?.outcome || dynamicMetadata.metadata.description || '',
      build: (dynamicMetadata.metadata as any)?.build || '',
      bestFor: (dynamicMetadata.metadata as any)?.bestFor || '',
      time: dynamicMetadata.metadata.duration_weeks ? `${dynamicMetadata.metadata.duration_weeks} weeks` : '',
      industries: dynamicMetadata.metadata.industries || [],
      imageUrl: (dynamicMetadata.metadata as any)?.imageUrl,
    } : undefined);
    
    return {
      ...course,
      // Use dynamic metadata description if available, otherwise use database description
      description: dynamicMetadata?.metadata?.description || course.description,
      // Use database industries if it has values, otherwise fall back to metadata industries
      industries: (course.industries && course.industries.length > 0) 
        ? course.industries 
        : (dynamicMetadata?.metadata?.industries || []),
      hasContent: courseSlugSet.has(course.slug),
      category: enhancedMetadata?.category || dynamicMetadata?.metadata?.category,
      imageUrl: dynamicMetadata?.metadata?.imageUrl || enhancedMetadata?.imageUrl,
      metadata: enhancedMetadata, // Pass enhanced metadata with dynamic fields
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
      
      // Create enhanced metadata for file system courses (same logic as database courses)
      const enhancedMetadata = staticMetadata ? {
        ...staticMetadata,
        outcome: (dynamicMetadata?.metadata as any)?.outcome || staticMetadata.outcome,
        build: (dynamicMetadata?.metadata as any)?.build || staticMetadata.build,
        bestFor: (dynamicMetadata?.metadata as any)?.bestFor || staticMetadata.bestFor,
        // Prioritize static metadata title (course-metadata.ts) over dynamic metadata title
        // to ensure we show the course name, not the first lesson title
        // Ensure title is always a string with hard fallback
        title: staticMetadata.title || dynamicMetadata?.metadata?.title || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        // Ensure category is always a string with hard fallback
        category: dynamicMetadata?.metadata?.category || staticMetadata.category || "Uncategorized",
        imageUrl: dynamicMetadata?.metadata?.imageUrl || staticMetadata.imageUrl,
      } : (dynamicMetadata?.metadata ? {
        slug,
        // Ensure title is always a string with hard fallback
        title: dynamicMetadata.metadata.title || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        // Ensure category is always a string with hard fallback
        category: dynamicMetadata.metadata.category || "Uncategorized",
        outcome: (dynamicMetadata.metadata as any)?.outcome || dynamicMetadata.metadata.description || '',
        build: (dynamicMetadata.metadata as any)?.build || '',
        bestFor: (dynamicMetadata.metadata as any)?.bestFor || '',
        time: dynamicMetadata.metadata.duration_weeks ? `${dynamicMetadata.metadata.duration_weeks} weeks` : '',
        industries: dynamicMetadata.metadata.industries || [],
        imageUrl: (dynamicMetadata.metadata as any)?.imageUrl,
      } : undefined);
      
      allCourses.push({
        id: null, // Not in database yet
        slug,
        // Prioritize static metadata title (course-metadata.ts) over dynamic metadata title
        // to ensure we show the course name, not the first lesson title
        title: enhancedMetadata?.title || dynamicMetadata?.metadata?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        description: dynamicMetadata?.metadata?.description || enhancedMetadata?.outcome || null,
        thumbnail_url: dynamicMetadata?.metadata?.thumbnail_url || null,
        imageUrl: dynamicMetadata?.metadata?.imageUrl || enhancedMetadata?.imageUrl,
        duration_weeks: dynamicMetadata?.metadata?.duration_weeks || null,
        difficulty_level: dynamicMetadata?.metadata?.difficulty_level || null,
        is_published: dynamicMetadata?.metadata?.is_published || false,
        created_at: null,
        updated_at: null,
        hasContent: lessons.length > 0,
        industries: dynamicMetadata?.metadata?.industries || enhancedMetadata?.industries || [],
        category: enhancedMetadata?.category || dynamicMetadata?.metadata?.category,
        metadata: enhancedMetadata, // Pass enhanced metadata with dynamic fields
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
