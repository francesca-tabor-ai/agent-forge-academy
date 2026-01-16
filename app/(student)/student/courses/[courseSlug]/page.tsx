import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { loadAllLessons } from '@/lib/lessons';
import { getCourseCover } from '@/lib/courseCovers';
import { extractCourseMetadata } from '@/lib/course-sync/extract-metadata';
import { courseMetadata } from '@/lib/course-metadata';

interface CoursePageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { courseSlug } = await params;

  // Get course from database
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', courseSlug)
    .single();

  if (error || !course) {
    // Course might not be in database yet, check if it exists in file system
    const lessons = loadAllLessons(undefined, courseSlug);
    if (lessons.length === 0) {
      notFound();
    }

    // Course exists in file system but not in database
    // Show it anyway (for backward compatibility)
  }

  // Get student profile to check enrollment
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  // Load lessons for this course (needed for progress calculation)
  const lessons = loadAllLessons(undefined, courseSlug);

  let enrollment = null;
  let studentProfileId: string | null = null;
  let completedLessons = 0;
  let nextLessonSlug: string | null = null;
  let completedLessonSlugs = new Set<string>();

  if (profile && course?.id) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (studentProfile) {
      studentProfileId = studentProfile.id;

      const { data: enrollmentData } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', course.id)
        .eq('student_profile_id', studentProfile.id)
        .single();

      enrollment = enrollmentData;

      // Get lesson progress for this course
      if (enrollmentData) {
        const { data: lessonProgress } = await supabase
          .from('lesson_progress')
          .select('lesson_slug, status')
          .eq('student_profile_id', studentProfile.id)
          .eq('course_id', course.id);

        const completedProgress = lessonProgress?.filter(lp => lp.status === 'completed') || [];
        completedLessons = completedProgress.length;
        completedLessonSlugs = new Set(completedProgress.map(lp => lp.lesson_slug));

        // Find next uncompleted lesson
        const nextLesson = lessons.find(l => !completedLessonSlugs.has(l.slug));
        nextLessonSlug = nextLesson?.slug || null;
      }
    }
  }

  // Get course metadata (category, industries) from file system
  const dynamicMetadata = extractCourseMetadata(courseSlug);
  const metadata = dynamicMetadata?.metadata;

  // Get static metadata (outcome, build, bestFor)
  const staticMetadata = courseMetadata[courseSlug];

  const courseTitle = course?.title || metadata?.title || staticMetadata?.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const courseDescription = course?.description || metadata?.description || null;
  const courseCoverImage = getCourseCover(course || { category: metadata?.category || staticMetadata?.category, industries: metadata?.industries || staticMetadata?.industries });

  // Prepare metadata for display
  const durationWeeks = course?.duration_weeks || metadata?.duration_weeks;
  const difficultyLevel = course?.difficulty_level || metadata?.difficulty_level;
  const trackCategory = course?.category || metadata?.category || staticMetadata?.category;
  const industries = course?.industries || metadata?.industries || staticMetadata?.industries || [];

  // Get overview fields (outcome, build, bestFor)
  // Priority: database fields > dynamic metadata > static metadata
  const outcome = course?.outcome && course.outcome.length > 0 
    ? course.outcome 
    : ((metadata as any)?.outcome || staticMetadata?.outcome);
  const build = course?.youll_build && course.youll_build.length > 0
    ? course.youll_build
    : ((metadata as any)?.build || staticMetadata?.build);
  const bestFor = course?.best_for && course.best_for.length > 0
    ? course.best_for
    : ((metadata as any)?.bestFor || staticMetadata?.bestFor);

  // Helper to parse text into bullet points (handles arrays, comma-separated, newline-separated, or single string)
  const parseIntoBullets = (input: string | string[] | undefined | null): string[] => {
    if (!input) return [];
    // If already an array, return it
    if (Array.isArray(input)) {
      return input.filter(s => s && s.trim().length > 0).map(s => s.trim());
    }
    // If string, parse it
    const text = String(input);
    // Try splitting by newlines first
    if (text.includes('\n')) {
      return text.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    }
    // Then try splitting by commas
    if (text.includes(',')) {
      return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    // Single item
    return [text.trim()].filter(s => s.length > 0);
  };

  const outcomeBullets = parseIntoBullets(outcome);
  const buildBullets = parseIntoBullets(build);
  const bestForItems = parseIntoBullets(bestFor);

  // Identify Course Index/Reference Guide lesson
  const isCourseIndex = (lesson: typeof lessons[0]) => {
    const title = lesson.frontmatter.title?.toLowerCase() || '';
    const slug = lesson.slug.toLowerCase();
    return title.includes('course index') || 
           title.includes('reference guide') || 
           slug.includes('index') || 
           slug.includes('_course_metadata');
  };

  // Separate Course Index from regular lessons
  const courseIndexLesson = lessons.find(isCourseIndex);
  const regularLessons = lessons.filter(l => !isCourseIndex(l));

  return (
    <div>
      {/* Back link - above banner */}
      <div className="mb-4">
        <Link
          href="/student/courses"
          className="text-sm text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1"
        >
          ← Back to Courses
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="relative w-full h-40 sm:h-52 md:h-[220px] rounded-xl overflow-hidden mb-8 -mx-6 shadow-md">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${courseCoverImage})` }}
        />
        
        {/* Gradient Overlay - transparent top to dark bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
        
        {/* Content Container */}
        <div className="relative h-full flex flex-col justify-end p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
            {/* Left: Title and Metadata */}
            <div className="flex-1 min-w-0 max-w-full sm:max-w-[calc(100%-180px)] md:max-w-[calc(100%-200px)]">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 line-clamp-2 break-words leading-tight drop-shadow-lg">
                {courseTitle}
              </h1>
              
              {/* Metadata Line */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white drop-shadow-md">
                {durationWeeks && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <span>{durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}</span>
                  </span>
                )}
                {durationWeeks && difficultyLevel && (
                  <span className="text-white/60">•</span>
                )}
                {difficultyLevel && (
                  <span className="capitalize px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm whitespace-nowrap">
                    {difficultyLevel}
                  </span>
                )}
                {(durationWeeks || difficultyLevel) && (trackCategory || industries.length > 0) && (
                  <span className="text-white/60">•</span>
                )}
                {trackCategory && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm whitespace-nowrap">
                    {trackCategory}
                  </span>
                )}
                {!trackCategory && industries.length > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm whitespace-nowrap">
                    {industries[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px]">
              {enrollment ? (
                <Link
                  href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug || lessons[0]?.slug || ''}`}
                  className="block w-full sm:w-auto text-center px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm sm:text-base whitespace-nowrap shadow-lg"
                >
                  Continue ({enrollment.progress_percentage}%)
                </Link>
              ) : course?.id ? (
                <form action={`/api/courses/enroll?course_id=${course.id}`} method="POST" className="w-full sm:w-auto">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm sm:text-base whitespace-nowrap shadow-lg"
                  >
                    Enroll
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Card - Top on mobile (appears immediately after banner) */}
      {(enrollment || course?.id) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 lg:hidden shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
          
          {enrollment ? (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {enrollment.progress_percentage}% Complete
                  </span>
                  <span className="text-xs text-gray-500">
                    {completedLessons} / {lessons.length} lessons
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-brand-light h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Time Spent & Remaining */}
              {lessons.length > 0 && (
                <div className="space-y-2 text-sm">
                  {completedLessons > 0 && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Time spent</span>
                      <span className="font-medium">
                        {Math.round(completedLessons * 30 / 60) > 0 
                          ? `${Math.round(completedLessons * 30 / 60)}h`
                          : `${completedLessons * 30}m`
                        }
                      </span>
                    </div>
                  )}
                  {completedLessons < lessons.length && (
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Est. remaining</span>
                      <span className="font-medium">
                        {Math.round((lessons.length - completedLessons) * 30 / 60) > 0
                          ? `${Math.round((lessons.length - completedLessons) * 30 / 60)}h`
                          : `${(lessons.length - completedLessons) * 30}m`
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Enrolled Date */}
              {enrollment.enrolled_at && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              )}

              {/* Primary CTA */}
              {lessons.length === 0 ? (
                <div className="px-4 py-2.5 bg-gray-50 text-gray-600 font-medium rounded-lg text-center text-sm sm:text-base border border-gray-200">
                  No lessons available
                </div>
              ) : nextLessonSlug ? (
                <Link
                  href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug}`}
                  className="block w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-center text-sm sm:text-base"
                >
                  Continue Learning
                </Link>
              ) : completedLessons === lessons.length ? (
                <div className="px-4 py-2.5 bg-green-50 text-green-700 font-semibold rounded-lg text-center text-sm sm:text-base border border-green-200">
                  Course Complete! 🎉
                </div>
              ) : (
                <Link
                  href={`/student/courses/${courseSlug}/lessons/${lessons[0].slug}`}
                  className="block w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-center text-sm sm:text-base"
                >
                  Start Course
                </Link>
              )}
            </div>
          ) : course?.id ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">Ready to start learning?</p>
                <p className="text-xs text-gray-500">
                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} available
                </p>
              </div>
              <form action={`/api/courses/enroll?course_id=${course.id}`} method="POST" className="w-full">
            <button
              type="submit"
                  className="w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm sm:text-base"
            >
                  Enroll to Start
            </button>
          </form>
            </div>
          ) : null}
        </div>
      )}

      {/* Layout: Progress card on top (mobile) or right (desktop), Overview and Lessons on left */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left Column: Course Overview and Lessons */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Overview Section */}
          {(courseDescription || outcomeBullets.length > 0 || buildBullets.length > 0 || bestForItems.length > 0) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Overview</h2>
              
              <div className="space-y-6">
                {/* Description */}
                {courseDescription && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Description</h3>
                    <p className="text-base text-gray-700 leading-relaxed">{courseDescription}</p>
                  </div>
                )}

                {/* Outcome */}
                {outcomeBullets.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Outcome</h3>
                    <ul className="space-y-2.5">
                      {outcomeBullets.map((bullet, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-brand-light mt-1.5 flex-shrink-0">•</span>
                          <span className="text-base text-gray-700 leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* You'll Build */}
                {buildBullets.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">You'll Build</h3>
                    <ul className="space-y-2.5">
                      {buildBullets.map((bullet, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-brand-light mt-1.5 flex-shrink-0">•</span>
                          <span className="text-base text-gray-700 leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Best For */}
                {bestForItems.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Best For</h3>
                    <div className="flex flex-wrap gap-2">
                      {bestForItems.map((item, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 py-1.5 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lessons Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Modules</h2>
        
        {lessons.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-600">No lessons available for this course yet.</p>
          </div>
        ) : (
              <div className="space-y-3">
                {/* Quick Start / Course Index */}
                {courseIndexLesson && (
                  <Link
                    href={`/student/courses/${courseSlug}/lessons/${courseIndexLesson.slug}`}
                    className="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-brand-light hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Quick Start Icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-light/10 flex items-center justify-center">
                          <span className="text-brand-light text-lg">⚡</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {courseIndexLesson.frontmatter.title || 'Quick Start'}
                            </h3>
                            {completedLessonSlugs.has(courseIndexLesson.slug) && (
                              <span className="text-green-600 text-sm">✓</span>
                            )}
                          </div>
                          {courseIndexLesson.frontmatter.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                              {courseIndexLesson.frontmatter.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 rounded">Quick Start</span>
                            <span>~15 min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <span className="text-brand-light text-sm font-medium">View →</span>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Regular Modules */}
                {regularLessons.map((lesson, index) => {
                  const isCompleted = completedLessonSlugs.has(lesson.slug);
                  const moduleNumber = lesson.frontmatter.module || (index + 1).toString();
                  
                  return (
              <Link
                key={lesson.slug}
                href={`/student/courses/${courseSlug}/lessons/${lesson.slug}`}
                      className="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-brand-light hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Module Number Badge */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${
                            isCompleted 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {isCompleted ? '✓' : moduleNumber}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">
                      {lesson.frontmatter.title || lesson.slug}
                    </h3>
                              {isCompleted && (
                                <span className="text-green-600 text-sm">✓</span>
                              )}
                            </div>
                    {lesson.frontmatter.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                        {lesson.frontmatter.description}
                      </p>
                    )}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                      {lesson.frontmatter.module && (
                                <span className="px-2 py-0.5 bg-gray-100 rounded">
                                  Module {lesson.frontmatter.module}
                                </span>
                      )}
                      {lesson.frontmatter.week && (
                        <span>Week {lesson.frontmatter.week}</span>
                      )}
                              <span>~30 min</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <span className="text-brand-light text-sm font-medium">View →</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Progress Card (desktop) */}
        <div className="lg:col-span-1">
          {(enrollment || course?.id) && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-8 hidden lg:block shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
              
              {enrollment ? (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {enrollment.progress_percentage}% Complete
                      </span>
                      <span className="text-xs text-gray-500">
                        {completedLessons} / {lessons.length} lessons
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-brand-light h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Time Spent & Remaining */}
                  {lessons.length > 0 && (
                    <div className="space-y-2 text-sm">
                      {/* Estimate: ~30 minutes per lesson */}
                      {completedLessons > 0 && (
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Time spent</span>
                          <span className="font-medium">
                            {Math.round(completedLessons * 30 / 60) > 0 
                              ? `${Math.round(completedLessons * 30 / 60)}h`
                              : `${completedLessons * 30}m`
                            }
                          </span>
                        </div>
                      )}
                      {completedLessons < lessons.length && (
                        <div className="flex items-center justify-between text-gray-600">
                          <span>Est. remaining</span>
                          <span className="font-medium">
                            {Math.round((lessons.length - completedLessons) * 30 / 60) > 0
                              ? `${Math.round((lessons.length - completedLessons) * 30 / 60)}h`
                              : `${(lessons.length - completedLessons) * 30}m`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Enrolled Date */}
                  {enrollment.enrolled_at && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                      Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  )}

                  {/* Primary CTA */}
                  {lessons.length === 0 ? (
                    <div className="px-4 py-2.5 bg-gray-50 text-gray-600 font-medium rounded-lg text-center text-sm sm:text-base border border-gray-200">
                      No lessons available
                    </div>
                  ) : nextLessonSlug ? (
                    <Link
                      href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug}`}
                      className="block w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-center text-sm sm:text-base"
                    >
                      Continue Learning
                    </Link>
                  ) : completedLessons === lessons.length ? (
                    <div className="px-4 py-2.5 bg-green-50 text-green-700 font-semibold rounded-lg text-center text-sm sm:text-base border border-green-200">
                      Course Complete! 🎉
                    </div>
                  ) : (
                    <Link
                      href={`/student/courses/${courseSlug}/lessons/${lessons[0].slug}`}
                      className="block w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-center text-sm sm:text-base"
                    >
                      Start Course
                    </Link>
                  )}
                </div>
              ) : course?.id ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Ready to start learning?</p>
                    <p className="text-xs text-gray-500">
                      {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} available
                    </p>
                  </div>
                  <form action={`/api/courses/enroll?course_id=${course.id}`} method="POST" className="w-full">
                    <button
                      type="submit"
                      className="w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm sm:text-base"
                    >
                      Enroll to Start
                    </button>
                  </form>
                </div>
              ) : null}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
