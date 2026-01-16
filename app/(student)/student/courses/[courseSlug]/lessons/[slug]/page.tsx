import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { loadLessonBySlug, getLessonNavigation } from '@/lib/lessons';
import LessonContent from '@/components/lessons/LessonContent';
import { LessonCompletionButton } from '@/components/lessons/LessonCompletionButton';
import { NextLessonNavigation } from '@/components/lessons/NextLessonNavigation';
import { hasCourseAccess, getSegmentsForCourse } from '@/lib/utils/course-access';
import { CoursePaywall } from '@/components/courses/CoursePaywall';
import { extractCourseMetadata } from '@/lib/course-sync/extract-metadata';
import { courseMetadata } from '@/lib/course-metadata';

interface CourseLessonPageProps {
  params: Promise<{ courseSlug: string; slug: string }>;
}

export default async function CourseLessonPage({ params }: CourseLessonPageProps) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { courseSlug, slug } = await params;
  
  // Check course access before loading lesson
  const accessResult = await hasCourseAccess(user.id, courseSlug);
  
  if (!accessResult.hasAccess) {
    // Get segments that include this course for paywall
    const segments = await getSegmentsForCourse(courseSlug);
    
    // Get course metadata for display
    const dynamicMetadata = extractCourseMetadata(courseSlug);
    const metadata = dynamicMetadata?.metadata || courseMetadata[courseSlug];
    const courseTitle = metadata?.title || courseSlug;
    
    return (
      <CoursePaywall 
        courseTitle={courseTitle}
        courseSlug={courseSlug}
        segments={segments}
      />
    );
  }

  const lesson = loadLessonBySlug(slug, undefined, courseSlug);

  if (!lesson) {
    notFound();
  }

  // Get course info (optional - course may exist only in file system)
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseSlug)
    .single();

  const courseTitle = course?.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  
  // Don't require course to be in database - allow file system only courses

  // Get navigation info for next lesson
  const navigation = getLessonNavigation(slug, courseSlug);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Constrained width container */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section - above the fold */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <Link
              href={`/student/courses/${courseSlug}`}
              className="text-sm text-brand-light hover:text-brand-light/90 inline-block"
            >
              ← Back to {courseTitle}
            </Link>
            {/* Top navigation button */}
            <NextLessonNavigation
              nextLesson={navigation.nextLesson}
              isLastLesson={navigation.isLastLesson}
              courseSlug={courseSlug}
              variant="top"
            />
          </div>
          
          {/* Module title (H1) */}
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            {lesson.frontmatter.title || lesson.slug}
          </h1>
          
          {/* Description */}
          {lesson.frontmatter.description && (
            <p className="text-base text-gray-600 mb-6" style={{ lineHeight: '1.6' }}>
              {lesson.frontmatter.description}
            </p>
          )}
          
          {/* Meta information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="text-brand-light">{courseTitle}</span>
            {lesson.frontmatter.module && (
              <span>Module: {lesson.frontmatter.module}</span>
            )}
            {lesson.frontmatter.week && <span>Week {lesson.frontmatter.week}</span>}
          </div>
        </div>

        {/* Lesson content */}
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="text-base" style={{ fontSize: '17px', lineHeight: '1.6' }}>
            <LessonContent content={lesson.content} />
          </div>
          <LessonCompletionButton lessonId={slug} />
          {/* Bottom navigation button */}
          <NextLessonNavigation
            nextLesson={navigation.nextLesson}
            isLastLesson={navigation.isLastLesson}
            courseSlug={courseSlug}
            variant="bottom"
          />
        </div>
      </div>
    </div>
  );
}

// Generate static params for all course lessons
export async function generateStaticParams() {
  const { getAllLessonSlugs } = await import('@/lib/lessons');
  const slugs = getAllLessonSlugs();
  
  return slugs
    .filter((item) => item.courseSlug) // Only course-based lessons
    .map((item) => ({
      courseSlug: item.courseSlug!,
      slug: item.slug,
    }));
}
