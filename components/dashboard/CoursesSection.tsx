import Link from 'next/link';
import { loadAllLessons } from '@/lib/lessons';
import { courseMetadata } from '@/lib/course-metadata';

interface CourseWithMetadata {
  id: string | null;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl?: string | null; // camelCase (preferred)
  thumbnail_url?: string | null; // snake_case (for backward compatibility with DB queries)
  duration_weeks: number | null;
  difficulty_level: string | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  hasContent: boolean;
  industries: string[];
  category?: string;
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

  // Get detailed information for each active course
  const activeCoursesWithDetails = await Promise.all(
    activeCourses.map(async (course) => {
      if (!course.slug) {
        // Extract explicit course fields - NEVER derive card title from lesson data
        const courseTitle = course.metadata?.title || course.title; // Always use course title
        const courseSlug = course.slug || null;
        const courseTrack = course.metadata?.category || course.category || null;
        const courseDifficulty = course.difficulty_level || null;
        const courseDuration = course.metadata?.time || (course.duration_weeks ? `${course.duration_weeks} week${course.duration_weeks !== 1 ? 's' : ''}` : null);
        
        return { 
          course, 
          nextLesson: null, 
          // Explicit course fields - card title MUST use courseTitle, never nextLessonTitle
          courseTitle,
          courseSlug,
          courseTrack,
          courseDifficulty,
          courseDuration,
          // Explicit next lesson fields
          nextLessonTitle: null,
          nextLessonSlug: null,
          timeEstimate: null, 
          totalLessons: 0,
          completedLessons: 0,
          lessonsRemaining: 0,
          timeSpent: '0h',
          estimatedTimeRemaining: null,
          nextMilestone: null,
          streakDays: 0,
        };
      }
      
      const lessons = loadAllLessons(undefined, course.slug);
      if (lessons.length === 0) {
        // Extract explicit course fields - NEVER derive card title from lesson data
        const courseTitle = course.metadata?.title || course.title; // Always use course title
        const courseSlug = course.slug;
        const courseTrack = course.metadata?.category || course.category || null;
        const courseDifficulty = course.difficulty_level || null;
        const courseDuration = course.metadata?.time || (course.duration_weeks ? `${course.duration_weeks} week${course.duration_weeks !== 1 ? 's' : ''}` : null);
        
        return { 
          course, 
          nextLesson: null, 
          // Explicit course fields - card title MUST use courseTitle, never nextLessonTitle
          courseTitle,
          courseSlug,
          courseTrack,
          courseDifficulty,
          courseDuration,
          // Explicit next lesson fields
          nextLessonTitle: null,
          nextLessonSlug: null,
          timeEstimate: null,
          totalLessons: 0,
          completedLessons: 0,
          lessonsRemaining: 0,
          timeSpent: '0h',
          estimatedTimeRemaining: null,
          nextMilestone: null,
          streakDays: 0,
        };
      }

      // Find next lesson based on progress
      const enrollment = course.id ? enrollments[course.id] : null;
      const progress = enrollment?.progress_percentage || 0;
      
      // Calculate lesson completion
      const completedLessons = Math.floor((progress / 100) * lessons.length);
      const lessonsRemaining = lessons.length - completedLessons;
      
      // Estimate which lesson they should be on (rough calculation)
      const estimatedLessonIndex = Math.min(completedLessons, lessons.length - 1);
      const nextLesson = lessons[estimatedLessonIndex] || lessons[0];

      // Calculate time estimate to next milestone (25%, 50%, 75%, 100%)
      const milestones = [25, 50, 75, 100];
      const nextMilestone = milestones.find(m => m > progress) || 100;
      const progressToMilestone = nextMilestone - progress;
      const lessonsPerPercent = lessons.length / 100;
      const lessonsToMilestone = Math.ceil(progressToMilestone * lessonsPerPercent);
      
      // Estimate 30-60 minutes per lesson (average 45)
      const avgMinutesPerLesson = 45;
      const totalMinutes = lessonsToMilestone * avgMinutesPerLesson;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeEstimate = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      // Calculate total estimated time remaining
      const totalRemainingMinutes = lessonsRemaining * avgMinutesPerLesson;
      const totalRemainingHours = Math.floor(totalRemainingMinutes / 60);
      const totalRemainingMins = totalRemainingMinutes % 60;
      const estimatedTimeRemaining = totalRemainingHours > 0 
        ? `${totalRemainingHours}h ${totalRemainingMins}m`
        : `${totalRemainingMins}m`;

      // Estimate time spent (based on completed lessons)
      const timeSpentMinutes = completedLessons * avgMinutesPerLesson;
      const timeSpentHours = Math.floor(timeSpentMinutes / 60);
      const timeSpent = timeSpentHours > 0 ? `${timeSpentHours}h` : `${timeSpentMinutes}m`;

      // Calculate learning streak (mock - would come from database)
      const enrollmentDate = enrollment ? new Date(enrollment.enrolled_at) : new Date();
      const daysSinceEnrollment = Math.floor((Date.now() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));
      const streakDays = Math.min(daysSinceEnrollment, 7); // Mock: assume active for last 7 days

      // Extract explicit course fields - NEVER derive card title from lesson data
      const courseTitle = course.metadata?.title || course.title; // Always use course title, never lesson title
      const courseSlug = course.slug;
      const courseTrack = course.metadata?.category || course.category || null; // Track/category
      const courseDifficulty = course.difficulty_level || null;
      // Format duration for display
      const courseDuration = course.metadata?.time || (course.duration_weeks ? `${course.duration_weeks} week${course.duration_weeks !== 1 ? 's' : ''}` : null);
      
      // Next lesson fields (only for display, never for course title)
      const nextLessonTitle = nextLesson?.frontmatter?.title || nextLesson?.slug || null;
      const nextLessonSlug = nextLesson?.slug || null;

      return { 
        course, // Keep full course object for backward compatibility
        nextLesson, // Keep full nextLesson object for backward compatibility
        // Explicit course fields - card title MUST use courseTitle, never nextLessonTitle
        courseTitle,
        courseSlug,
        courseTrack,
        courseDifficulty,
        courseDuration,
        // Explicit next lesson fields
        nextLessonTitle,
        nextLessonSlug,
        timeEstimate, 
        nextMilestone,
        totalLessons: lessons.length,
        completedLessons,
        lessonsRemaining,
        timeSpent,
        estimatedTimeRemaining,
        streakDays,
      };
    })
  );

  // Calculate overall statistics
  const totalActiveCourses = activeCourses.length;
  const totalCompletedCourses = completedCourses.length;
  const overallProgress = activeCourses.length > 0
    ? Math.round(
        activeCourses.reduce((sum, c) => {
          const progress = c.id ? (enrollments[c.id]?.progress_percentage || 0) : 0;
          return sum + progress;
        }, 0) / activeCourses.length
      )
    : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Courses</h2>
          <p className="text-sm text-gray-600 mt-1">
            {totalActiveCourses} active • {totalCompletedCourses} completed • {overallProgress}% average progress
          </p>
        </div>
        <Link
          href="/student/courses"
          className="text-sm font-medium text-brand-light hover:text-brand-light/90"
        >
          View All →
        </Link>
      </div>

      {/* Active Courses First */}
      {activeCoursesWithDetails.length > 0 ? (
        <div className="space-y-4">
          {activeCoursesWithDetails.map(({ 
            course, 
            nextLesson, 
            // Explicit course fields - card title MUST use courseTitle, never nextLessonTitle
            courseTitle,
            courseSlug,
            courseTrack,
            courseDifficulty,
            courseDuration,
            // Explicit next lesson fields
            nextLessonTitle,
            nextLessonSlug,
            timeEstimate, 
            nextMilestone,
            totalLessons,
            completedLessons,
            lessonsRemaining,
            timeSpent,
            estimatedTimeRemaining,
            streakDays,
          }) => {
            const enrollment = course.id ? enrollments[course.id] : null;
            const progress = enrollment?.progress_percentage || 0;
            const enrolledDate = enrollment ? new Date(enrollment.enrolled_at) : null;
            const daysEnrolled = enrolledDate 
              ? Math.floor((Date.now() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24))
              : 0;

            return (
              <div
                key={courseSlug || course.slug}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-light transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Card Header: Course Title (primary) + Chips (secondary) */}
                    <div className="mb-3">
                      {/* Primary: Course Title - NEVER use lesson title here */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{courseTitle}</h3>
                      {/* Secondary: Track + Difficulty + Duration chips */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {courseTrack && (
                          <span className="px-2 py-1 text-xs font-medium text-brand-light bg-brand-light/10 rounded-full">
                            {courseTrack}
                          </span>
                        )}
                        {courseDifficulty && (
                          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full capitalize">
                            {courseDifficulty}
                          </span>
                        )}
                        {courseDuration && (
                          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                            {courseDuration}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Detailed Progress Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Progress</p>
                        <p className="text-sm font-semibold text-gray-900">{progress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Lessons</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {completedLessons}/{totalLessons}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Time Spent</p>
                        <p className="text-sm font-semibold text-gray-900">{timeSpent}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Remaining</p>
                        <p className="text-sm font-semibold text-gray-900">{estimatedTimeRemaining}</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar with Milestones */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {progress}% Complete
                        </span>
                        <div className="flex items-center gap-2">
                          {streakDays > 0 && (
                            <span className="flex items-center gap-1 text-xs text-orange-600">
                              <span>🔥</span>
                              <span>{streakDays} day streak</span>
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {nextMilestone}% milestone in ~{timeEstimate}
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-brand-light h-3 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                        {/* Milestone markers */}
                        {[25, 50, 75, 100].map((milestone) => (
                          <div
                            key={milestone}
                            className="absolute top-0 h-3 w-0.5 bg-gray-400"
                            style={{ left: `${milestone}%` }}
                            title={`${milestone}% milestone`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-400">
                        <span>{completedLessons} lessons done</span>
                        <span>{lessonsRemaining} lessons remaining</span>
                      </div>
                    </div>

                    {/* Next Lesson */}
                    {nextLesson && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">
                              Next Lesson
                            </p>
                            <Link
                              href={courseSlug && nextLessonSlug
                                ? `/student/courses/${courseSlug}/lessons/${nextLessonSlug}`
                                : nextLessonSlug
                                ? `/student/lessons/${nextLessonSlug}`
                                : '#'
                              }
                              className="text-sm font-semibold text-gray-900 hover:text-brand-light block mb-1"
                            >
                              {nextLessonTitle}
                            </Link>
                            {nextLesson.frontmatter.description && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {nextLesson.frontmatter.description}
                              </p>
                            )}
                            {nextLesson.frontmatter.module && (
                              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                {nextLesson.frontmatter.module}
                              </span>
                            )}
                          </div>
                          <Link
                            href={courseSlug && nextLessonSlug
                              ? `/student/courses/${courseSlug}/lessons/${nextLessonSlug}`
                              : nextLessonSlug
                              ? `/student/lessons/${nextLessonSlug}`
                              : '#'
                            }
                            className="ml-4 px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium whitespace-nowrap"
                          >
                            Start Lesson →
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Upcoming Capstone/Assessment */}
                    {progress >= 75 && progress < 100 && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="text-xl">🎯</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800 mb-1">
                              Upcoming Capstone Project
                            </p>
                            <p className="text-sm text-yellow-700 mb-2">
                              You&apos;re approaching the final assessment. Complete the remaining {lessonsRemaining} lesson{lessonsRemaining !== 1 ? 's' : ''} to unlock the capstone project.
                            </p>
                            <p className="text-xs text-yellow-600">
                              Estimated time to capstone: ~{estimatedTimeRemaining}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Course Completion Celebration */}
                    {progress === 100 && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎉</span>
                          <div>
                            <p className="text-sm font-medium text-green-800 mb-1">
                              Course Completed!
                            </p>
                            <p className="text-xs text-green-700">
                              Great work! You&apos;ve completed all {totalLessons} lessons. View your certificate and continue learning.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Course Statistics */}
                    {daysEnrolled > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Enrolled {daysEnrolled} day{daysEnrolled !== 1 ? 's' : ''} ago</span>
                          {course.metadata?.time && (
                            <span>• Estimated duration: {course.metadata.time}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <Link
                      href={courseSlug ? `/student/courses/${courseSlug}` : '#'}
                      className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium text-center whitespace-nowrap"
                    >
                      Continue →
                    </Link>
                    <Link
                      href={courseSlug ? `/student/courses/${courseSlug}` : '#'}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Recommend a course if nothing is active */
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
            <p className="text-gray-600 mb-4">
              You don&apos;t have any active courses. Browse our curriculum and start building your AI skills.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Choose from courses covering AI fundamentals, agentic systems, commerce, and more.
            </p>
            <Link
              href="/student/courses"
              className="btn-primary inline-block"
            >
              Browse Courses →
            </Link>
          </div>
        </div>
      )}

      {/* Completed Courses (Collapsed by default, can expand) */}
      {completedCourses.length > 0 && (
        <details className="bg-white border border-gray-200 rounded-lg p-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
            <span className="flex items-center gap-2">
              <span>✅ Completed Courses ({completedCourses.length})</span>
              <span className="text-xs text-gray-500">Click to expand</span>
            </span>
          </summary>
          <div className="mt-4 space-y-3">
            {completedCourses.map((course) => {
              const displayTitle = course.metadata?.title || course.title;
              const enrollment = course.id ? enrollments[course.id] : null;
              const completedDate = enrollment?.enrolled_at 
                ? new Date(enrollment.enrolled_at).toLocaleDateString()
                : null;

              return (
                <Link
                  key={course.slug}
                  href={`/student/courses/${course.slug}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-green-600">✓</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-brand-light">
                        {displayTitle}
                      </p>
                      {completedDate && (
                        <p className="text-xs text-gray-500">Completed on {completedDate}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-brand-light">View →</span>
                </Link>
              );
            })}
          </div>
        </details>
      )}
    </section>
  );
}
