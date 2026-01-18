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

/**
 * Strips leading headings from markdown content that duplicate lesson metadata.
 * This prevents duplication since lesson title, description, and module info are already
 * rendered in the header section above.
 * 
 * Removes:
 * - Leading H1 that matches lesson title
 * - Leading H2 that contains "Module" and lesson title
 */
function stripLeadingH1(content: string, lessonTitle: string): string {
  const lines = content.split('\n');
  let startIndex = 0;
  
  // Skip leading blank lines
  while (startIndex < lines.length && lines[startIndex]?.trim() === '') {
    startIndex++;
  }
  
  if (startIndex >= lines.length) {
    return content;
  }
  
  const firstLine = lines[startIndex]?.trim() || '';
  
  // Check if first line is an H1 heading
  const h1Match = firstLine.match(/^#\s+(.+)$/);
  if (h1Match) {
    const h1Title = h1Match[1].trim();
    // If the H1 matches the lesson title (case-insensitive, allowing for minor variations),
    // remove it along with any following blank lines
    if (h1Title.toLowerCase() === lessonTitle.toLowerCase() || 
        h1Title.toLowerCase().includes(lessonTitle.toLowerCase()) ||
        lessonTitle.toLowerCase().includes(h1Title.toLowerCase())) {
      startIndex++;
      // Remove any immediately following blank lines
      while (startIndex < lines.length && lines[startIndex]?.trim() === '') {
        startIndex++;
      }
      return lines.slice(startIndex).join('\n');
    }
  }
  
  // Check if first line is an H2 heading with "Module" pattern
  const h2Match = firstLine.match(/^##\s+(.+)$/);
  if (h2Match) {
    const h2Title = h2Match[1].trim();
    // Check if it contains "Module" and the lesson title
    const lowerH2 = h2Title.toLowerCase();
    const lowerTitle = lessonTitle.toLowerCase();
    if ((lowerH2.includes('module') || lowerH2.includes('module:')) && 
        (lowerH2.includes(lowerTitle) || lowerTitle.includes(h2Title.split(':')[1]?.trim() || ''))) {
      startIndex++;
      // Remove any immediately following blank lines
      while (startIndex < lines.length && lines[startIndex]?.trim() === '') {
        startIndex++;
      }
      return lines.slice(startIndex).join('\n');
    }
  }
  
  return content;
}

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

  const courseTitle = course?.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  
  // Don't require course to be in database - allow file system only courses

  // Get navigation info for next lesson
  const navigation = getLessonNavigation(slug, courseSlug);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Constrained width container */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 section-spacing">
        {/* Header section - above the fold */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start justify-between mb-6">
            <Link
              href={`/student/courses/${courseSlug}`}
              className="text-metadata text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1.5 min-h-[44px] touch-manipulation"
              aria-label={`Back to ${courseTitle}`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to {courseTitle}</span>
              <span className="sm:hidden">Back</span>
            </Link>
            {/* Top navigation button */}
            <div className="hidden md:block">
              <NextLessonNavigation
                nextLesson={navigation.nextLesson}
                isLastLesson={navigation.isLastLesson}
                courseSlug={courseSlug}
                variant="top"
              />
            </div>
          </div>
          
          {/* Module title (H1) - Page title scale */}
          <h1 className="text-page-title mb-6 leading-tight">
            {lesson.frontmatter.title || lesson.slug}
          </h1>
          
          {/* Description */}
          {lesson.frontmatter.description && (
            <p className="text-body mb-6">
              {lesson.frontmatter.description}
            </p>
          )}
          
          {/* Meta information - Muted */}
          <div className="flex flex-wrap items-center gap-3 text-metadata mb-6">
            <span className="text-brand-light">{courseTitle}</span>
            {lesson.frontmatter.module && (
              <span>Module: {lesson.frontmatter.module}</span>
            )}
            {lesson.frontmatter.week && <span>Week {lesson.frontmatter.week}</span>}
          </div>
        </div>

        {/* Lesson content - Responsive reading width */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
          <div 
            className="prose prose-sm sm:prose-base max-w-none"
            style={{ 
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              lineHeight: '1.7',
            }}
          >
            {/* Lesson metadata is rendered in the header section above.
                Strip any leading H1 from markdown content to prevent duplication. */}
            <LessonContent content={stripLeadingH1(lesson.content, lesson.frontmatter.title || lesson.slug)} />
          </div>
          <div className="mt-8">
            <LessonCompletionButton lessonId={slug} />
          </div>
          {/* Bottom navigation button */}
          <div className="mt-8">
            <NextLessonNavigation
              nextLesson={navigation.nextLesson}
              isLastLesson={navigation.isLastLesson}
              courseSlug={courseSlug}
              variant="bottom"
            />
          </div>
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
