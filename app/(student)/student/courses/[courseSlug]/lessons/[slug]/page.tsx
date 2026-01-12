import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { loadLessonBySlug } from '@/lib/lessons';
import LessonContent from '@/components/lessons/LessonContent';
import { LessonCompletionButton } from '@/components/lessons/LessonCompletionButton';

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
  const lesson = loadLessonBySlug(slug, undefined, courseSlug);

  if (!lesson) {
    notFound();
  }

  // Get course info
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', courseSlug)
    .single();

  const courseTitle = course?.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  
  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Constrained width container */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header section - above the fold */}
        <div className="mb-8">
          <Link
            href={`/student/courses/${courseSlug}`}
            className="text-sm text-brand-light hover:text-brand-light/90 mb-6 inline-block"
          >
            ← Back to {courseTitle}
          </Link>
          
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
