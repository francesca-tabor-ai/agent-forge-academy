import Link from 'next/link';
import { loadAllLessons } from '@/lib/lessons';
import { courseMetadata } from '@/lib/course-metadata';

interface CourseWithMetadata {
  id: string | null;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_weeks: number | null;
  difficulty_level: string | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  hasContent: boolean;
  metadata?: typeof courseMetadata[string];
}

interface CoursesSectionProps {
  courses: CourseWithMetadata[];
  enrollments: Record<string, { progress_percentage: number; enrolled_at: string }>;
  studentProfileId: string | null;
}

export async function CoursesSection({ courses, enrollments, studentProfileId }: CoursesSectionProps) {
  // Separate active and inactive courses
  const activeCourses = courses.filter(c => c.id && enrollments[c.id] && enrollments[c.id].progress_percentage < 100);
  const completedCourses = courses.filter(c => c.id && enrollments[c.id] && enrollments[c.id].progress_percentage === 100);
  const unenrolledCourses = courses.filter(c => !c.id || !enrollments[c.id]);

  // Sort active courses by progress (descending) then by enrollment date
  activeCourses.sort((a, b) => {
    if (!a.id || !b.id) return 0;
    const progressA = enrollments[a.id]?.progress_percentage || 0;
    const progressB = enrollments[b.id]?.progress_percentage || 0;
    if (progressB !== progressA) return progressB - progressA;
    const dateA = new Date(enrollments[a.id]?.enrolled_at || 0).getTime();
    const dateB = new Date(enrollments[b.id]?.enrolled_at || 0).getTime();
    return dateB - dateA;
  });

  // Get next lesson for each active course
  const activeCoursesWithNextLesson = await Promise.all(
    activeCourses.map(async (course) => {
      if (!course.slug) return { course, nextLesson: null, timeEstimate: null };
      
      const lessons = loadAllLessons(undefined, course.slug);
      if (lessons.length === 0) return { course, nextLesson: null, timeEstimate: null };

      // Find next lesson based on progress
      const enrollment = course.id ? enrollments[course.id] : null;
      const progress = enrollment?.progress_percentage || 0;
      
      // Estimate which lesson they should be on (rough calculation)
      const estimatedLessonIndex = Math.floor((progress / 100) * lessons.length);
      const nextLesson = lessons[estimatedLessonIndex] || lessons[0];

      // Calculate time estimate to next milestone (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100];
      const nextMilestone = milestones.find(m => m > progress) || 100;
      const progressToMilestone = nextMilestone - progress;
      const lessonsPerPercent = lessons.length / 100;
      const lessonsToMilestone = Math.ceil(progressToMilestone * lessonsPerPercent);
      // Estimate 30-60 minutes per lesson
      const avgMinutesPerLesson = 45;
      const totalMinutes = lessonsToMilestone * avgMinutesPerLesson;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeEstimate = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      return { course, nextLesson, timeEstimate, nextMilestone };
    })
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Courses</h2>
        <Link
          href="/student/courses"
          className="text-sm font-medium text-brand-light hover:text-brand-light/90"
        >
          View All →
        </Link>
      </div>

      {/* Active Courses First */}
      {activeCoursesWithNextLesson.length > 0 ? (
        <div className="space-y-4">
          {activeCoursesWithNextLesson.map(({ course, nextLesson, timeEstimate, nextMilestone }) => {
            const enrollment = course.id ? enrollments[course.id] : null;
            const progress = enrollment?.progress_percentage || 0;
            const displayTitle = course.metadata?.title || course.title;

            return (
              <div
                key={course.slug}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-light transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{displayTitle}</h3>
                      {course.metadata?.category && (
                        <span className="px-2 py-1 text-xs font-medium text-brand-light bg-brand-light/10 rounded-full">
                          {course.metadata.category}
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {progress}% Complete
                        </span>
                        <span className="text-xs text-gray-500">
                          {nextMilestone}% milestone in ~{timeEstimate}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-brand-light h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Next Lesson */}
                    {nextLesson && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Next Lesson
                        </p>
                        <Link
                          href={course.slug 
                            ? `/student/courses/${course.slug}/lessons/${nextLesson.slug}`
                            : `/student/lessons/${nextLesson.slug}`
                          }
                          className="text-sm font-medium text-gray-900 hover:text-brand-light"
                        >
                          {nextLesson.frontmatter.title || nextLesson.slug}
                        </Link>
                        {nextLesson.frontmatter.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {nextLesson.frontmatter.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Upcoming Capstone/Assessment */}
                    {progress >= 75 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs font-medium text-yellow-800 mb-1">
                          🎯 Upcoming Capstone
                        </p>
                        <p className="text-sm text-yellow-700">
                          You're approaching the final assessment. Complete remaining lessons to unlock.
                        </p>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/student/courses/${course.slug}`}
                    className="ml-4 text-sm font-medium text-brand-light hover:text-brand-light/90 whitespace-nowrap"
                  >
                    Continue →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Recommend a course if nothing is active */
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">You don't have any active courses.</p>
          <p className="text-sm text-gray-500 mb-6">
            Start learning to build your AI skills and advance your career.
          </p>
          <Link
            href="/student/courses"
            className="btn-primary inline-block"
          >
            Browse Courses →
          </Link>
        </div>
      )}

      {/* Completed Courses (Collapsed by default, can expand) */}
      {completedCourses.length > 0 && (
        <details className="bg-white border border-gray-200 rounded-lg p-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            Completed Courses ({completedCourses.length})
          </summary>
          <div className="mt-4 space-y-2">
            {completedCourses.map((course) => {
              const displayTitle = course.metadata?.title || course.title;
              return (
                <Link
                  key={course.slug}
                  href={`/student/courses/${course.slug}`}
                  className="block p-3 hover:bg-gray-50 rounded text-sm text-gray-700"
                >
                  {displayTitle} ✓
                </Link>
              );
            })}
          </div>
        </details>
      )}
    </section>
  );
}
