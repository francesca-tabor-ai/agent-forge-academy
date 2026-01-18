import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { loadLessonBySlug, getAllLessonSlugs, getLessonNavigation } from '@/lib/lessons';
import LessonContent from '@/components/lessons/LessonContent';
import { LessonCompletionButton } from '@/components/lessons/LessonCompletionButton';
import { NextLessonNavigation } from '@/components/lessons/NextLessonNavigation';
import { hasCourseAccess, getSegmentsForCourse } from '@/lib/utils/course-access';
import { CoursePaywall } from '@/components/courses/CoursePaywall';
import { extractCourseMetadata } from '@/lib/course-sync/extract-metadata';
import { courseMetadata } from '@/lib/course-metadata';

interface LessonPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ course?: string }>;
}

export default async function LessonPage({ params, searchParams }: LessonPageProps) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { slug } = await params;
  const params_search = await searchParams;
  const courseSlug = typeof params_search.course === 'string' ? params_search.course : undefined;
  const lesson = loadLessonBySlug(slug, undefined, courseSlug);

  if (!lesson) {
    notFound();
  }

  // Check course access if lesson is part of a course
  const effectiveCourseSlug = courseSlug || lesson.courseSlug;
  if (effectiveCourseSlug) {
    const accessResult = await hasCourseAccess(user.id, effectiveCourseSlug);
    
    if (!accessResult.hasAccess) {
      // Get segments that include this course for paywall
      const segments = await getSegmentsForCourse(effectiveCourseSlug);
      
      // Get course metadata for display
      const dynamicMetadata = extractCourseMetadata(effectiveCourseSlug);
      const metadata = dynamicMetadata?.metadata || courseMetadata[effectiveCourseSlug];
      const courseTitle = metadata?.title || effectiveCourseSlug;
      
      return (
        <CoursePaywall 
          courseTitle={courseTitle}
          courseSlug={effectiveCourseSlug}
          segments={segments}
        />
      );
    }
  }

  // Get course info if courseSlug is provided
  let courseId: string | null = null;
  if (courseSlug) {
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', courseSlug)
      .single();
    courseId = course?.id || null;
  }

  // Get navigation info for next lesson
  const navigation = getLessonNavigation(slug, effectiveCourseSlug);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Constrained width container */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header section - above the fold */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start justify-between mb-4 md:mb-6">
            {lesson.courseSlug ? (
              <Link
                href={`/student/courses/${lesson.courseSlug}`}
                className="text-sm text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1.5 min-h-[44px] touch-manipulation"
                aria-label="Back to Course"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Course</span>
                <span className="sm:hidden">Back</span>
              </Link>
            ) : (
              <Link
                href="/student/lessons"
                className="text-sm text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1.5 min-h-[44px] touch-manipulation"
                aria-label="Back to Lessons"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Back to Lessons</span>
                <span className="sm:hidden">Back</span>
              </Link>
            )}
            {/* Top navigation button */}
            <div className="hidden md:block">
              <NextLessonNavigation
                nextLesson={navigation.nextLesson}
                isLastLesson={navigation.isLastLesson}
                courseSlug={effectiveCourseSlug}
                variant="top"
              />
            </div>
          </div>
          
          {/* Module title (H1) - Responsive typography */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-3 md:mb-4 leading-tight">
            {lesson.frontmatter.title || lesson.slug}
          </h1>
          
          {/* Description */}
          {lesson.frontmatter.description && (
            <p className="text-sm sm:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed">
              {lesson.frontmatter.description}
            </p>
          )}
          
          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm text-gray-500 mb-4 md:mb-6">
            {lesson.courseSlug && (
              <span className="text-brand-light">
                {lesson.courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </span>
            )}
            {lesson.frontmatter.module && (
              <span>Module: {lesson.frontmatter.module}</span>
            )}
            {lesson.frontmatter.week && <span>Week {lesson.frontmatter.week}</span>}
          </div>
        </div>

        {/* Lesson content - Responsive reading width */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 md:p-8">
          <div 
            className="prose prose-sm sm:prose-base max-w-none"
            style={{ 
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              lineHeight: '1.7',
            }}
          >
            <LessonContent content={lesson.content} />
          </div>
          <div className="mt-6 md:mt-8">
            <LessonCompletionButton lessonId={slug} />
          </div>
          {/* Bottom navigation button */}
          <div className="mt-6 md:mt-8">
            <NextLessonNavigation
              nextLesson={navigation.nextLesson}
              isLastLesson={navigation.isLastLesson}
              courseSlug={effectiveCourseSlug}
              variant="bottom"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all lessons (legacy route - only non-course lessons)
// Note: Since this is an authenticated route, consider using dynamic rendering instead
// by adding: export const dynamic = 'force-dynamic';
export async function generateStaticParams() {
  const slugs = getAllLessonSlugs();
  // Filter to only legacy lessons (no courseSlug) and extract slug string
  // Ensure slug is always a string, not an object
  return slugs
    .filter((item) => !item.courseSlug && typeof item.slug === 'string') // Only legacy lessons without course context
    .map((item) => ({
      slug: item.slug, // Extract the slug string property (already verified as string above)
    }));
}
