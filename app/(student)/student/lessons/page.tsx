import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { loadAllLessons, getAllCourseSlugs, type Lesson } from '@/lib/lessons';
import { CourseFilter } from '@/components/lessons/CourseFilter';

interface LessonsPageProps {
  searchParams: Promise<{ course?: string }>;
}

export default async function LessonsPage({ searchParams }: LessonsPageProps) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const params = await searchParams;
  const courseSlug = typeof params.course === 'string' ? params.course : undefined;

  // Load lessons (filtered by course if specified)
  let lessons: ReturnType<typeof loadAllLessons> = [];

  try {
    lessons = loadAllLessons(undefined, courseSlug);
    // Sort by order if available, otherwise by title
    lessons.sort((a, b) => {
      const orderA = a.frontmatter.order ?? 999;
      const orderB = b.frontmatter.order ?? 999;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      // If same order, sort by title
      const titleA = a.frontmatter.title || a.slug;
      const titleB = b.frontmatter.title || b.slug;
      return titleA.localeCompare(titleB);
    });
  } catch (error) {
    console.error('Error loading lessons:', error);
    lessons = [];
  }

  // Get all courses for filter dropdown
  const courseSlugs = getAllCourseSlugs();
  const { data: courses } = await supabase
    .from('courses')
    .select('slug, title')
    .eq('is_published', true)
    .order('title', { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Lessons</h1>
            <p className="text-sm text-gray-600 mt-2">
              {courseSlug 
                ? `Lessons for ${courses?.find(c => c.slug === courseSlug)?.title || courseSlug}`
                : 'Browse and access all course materials'}
            </p>
          </div>
          <Link
            href="/student/courses"
            className="text-sm text-brand-light hover:text-brand-light/90"
          >
            Browse Courses →
          </Link>
        </div>

        {/* Course filter */}
        <CourseFilter
          courses={courses || undefined}
          courseSlugs={courseSlugs}
          currentCourseSlug={courseSlug}
        />
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No lessons available at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson) => {
            const lessonUrl = lesson.courseSlug
              ? `/student/courses/${lesson.courseSlug}/lessons/${lesson.slug}`
              : `/student/lessons/${lesson.slug}`;
            
            return (
              <Link
                key={lesson.courseSlug ? `${lesson.courseSlug}-${lesson.slug}` : lesson.slug}
                href={lessonUrl}
                className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-light hover:shadow-md transition-all"
              >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {lesson.frontmatter.title || lesson.slug}
                  </h3>
                  {lesson.frontmatter.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {lesson.frontmatter.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {lesson.courseSlug && (
                      <span className="text-brand-light">
                        {courses?.find(c => c.slug === lesson.courseSlug)?.title || lesson.courseSlug}
                      </span>
                    )}
                    {lesson.frontmatter.module && (
                      <span>Module {lesson.frontmatter.module}</span>
                    )}
                    {lesson.frontmatter.week && (
                      <span>Week {lesson.frontmatter.week}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <span className="text-brand-light">View →</span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

