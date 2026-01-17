import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getAllCourseSlugs, loadAllLessons } from '@/lib/lessons';
import { courseMetadata } from '@/lib/course-metadata';
import { extractCourseMetadata } from '@/lib/course-sync/extract-metadata';
import { CoursesSection } from '@/components/dashboard/CoursesSection';
import { PortfolioSection } from '@/components/dashboard/PortfolioSection';
import { ToolsToLearnNext } from '@/components/offers/ToolsToLearnNext';
import { UnlockedOffersRecommendations } from '@/components/offers/UnlockedOffersRecommendations';

export default async function StudentDashboard() {
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
      title: staticMetadata.title || dynamicMetadata?.metadata?.title,
      category: dynamicMetadata?.metadata?.category || staticMetadata.category,
      imageUrl: dynamicMetadata?.metadata?.imageUrl || staticMetadata.imageUrl,
    } : (dynamicMetadata?.metadata ? {
      // Create CourseMetadata from dynamic metadata for courses without static metadata
      slug: course.slug,
      title: dynamicMetadata.metadata.title || course.title,
      category: dynamicMetadata.metadata.category || course.category || '',
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
      const metadata = dynamicMetadata?.metadata || staticMetadata;
      
      allCourses.push({
        id: null, // Not in database yet
        slug,
        // Prioritize static metadata title (course-metadata.ts) over dynamic metadata title
        // to ensure we show the course name, not the first lesson title
        title: staticMetadata?.title || dynamicMetadata?.metadata?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: dynamicMetadata?.metadata?.description || staticMetadata?.outcome || null,
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

  // Get portfolio data
  let portfolioData = null;
  if (studentProfileId) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, visibility, bio')
      .eq('id', studentProfileId)
      .single();

    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('id, title, description, visibility, created_at')
      .eq('student_profile_id', studentProfileId)
      .order('created_at', { ascending: false });

    portfolioData = {
      profile: studentProfile,
      projects: projects || [],
    };
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      {/* (1) Courses Section - Primary reason users log in */}
      <CoursesSection 
        courses={allCourses}
        enrollments={enrollments}
        studentProfileId={studentProfileId}
      />

      {/* (2) Personalized Tool Recommendations */}
      <ToolsToLearnNext />
      <UnlockedOffersRecommendations />

      {/* (3) Portfolio Section - Career signal layer */}
      <PortfolioSection portfolioData={portfolioData} />
    </div>
  );
}
