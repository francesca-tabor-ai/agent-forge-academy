import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { loadAllLessons } from '@/lib/lessons';
import { getCourseCover } from '@/lib/courseCovers';
import { extractCourseMetadata } from '@/lib/course-sync/extract-metadata';
import { courseMetadata } from '@/lib/course-metadata';
import { hasCourseAccess, getSegmentsForCourse } from '@/lib/utils/course-access';
import { CoursePaywall } from '@/components/courses/CoursePaywall';
import { CourseHero } from '@/components/courses/CourseHero';
import { OverviewCards } from '@/components/courses/OverviewCards';
import { ProgressCard } from '@/components/courses/ProgressCard';
import { MobileStickyCTA } from '@/components/courses/MobileStickyCTA';

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

  // Check course access
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

  const courseTitle = course?.title || metadata?.title || staticMetadata?.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
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
    <div className="pb-20 lg:pb-8">
      {/* Back link - above banner */}
      <div className="mb-4">
        <Link
          href="/student/courses"
          className="text-sm text-brand-light hover:text-brand-light/90 inline-flex items-center gap-1"
        >
          ← Back to Courses
        </Link>
      </div>

      {/* Hero Banner */}
      <CourseHero
        title={courseTitle}
        imageUrl={courseCoverImage}
        trackCategory={trackCategory}
        difficultyLevel={difficultyLevel}
        durationWeeks={durationWeeks}
        industries={industries}
        isEnrolled={!!enrollment}
        progressPercentage={enrollment?.progress_percentage}
        courseSlug={courseSlug}
        courseId={course?.id}
        nextLessonSlug={nextLessonSlug}
        firstLessonSlug={lessons[0]?.slug}
      />

      {/* Layout: 2-column desktop, stacked mobile */}
      <div className="lg:grid lg:grid-cols-[65%_35%] lg:gap-8">
        {/* Left Column: Overview + Modules */}
        <div className="space-y-8">
          {/* Course Overview Section */}
          {(courseDescription || outcomeBullets.length > 0 || buildBullets.length > 0 || bestForItems.length > 0) && (
                  <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
              <OverviewCards
                description={courseDescription}
                outcome={outcomeBullets}
                build={buildBullets}
                bestFor={bestForItems}
              />
            </div>
          )}

          {/* Modules Section */}
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
                              <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                            )}
                          </div>
                          {courseIndexLesson.frontmatter.description && (
                            <p className="text-sm text-gray-600 line-clamp-1 mb-2 leading-relaxed">
                              {courseIndexLesson.frontmatter.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="px-2 py-0.5 bg-gray-100 rounded">Quick Start</span>
                            <span>~15 min</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {completedLessonSlugs.has(courseIndexLesson.slug) ? (
                          <span className="text-brand-light text-sm font-medium">Review →</span>
                        ) : (
                          <span className="text-brand-light text-sm font-medium">Start →</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )}

                {/* Regular Modules */}
                {regularLessons.map((lesson, index) => {
                  const isCompleted = completedLessonSlugs.has(lesson.slug);
                  const isInProgress = enrollment && !isCompleted && (index === 0 || completedLessonSlugs.has(regularLessons[index - 1]?.slug));
                  const moduleNumber = lesson.frontmatter.module || (index + 1).toString();
                  
                  // Determine status
                  let status = 'Not started';
                  let statusColor = 'bg-gray-100 text-gray-700';
                  let ctaText = 'Start';
                  
                  if (isCompleted) {
                    status = 'Completed';
                    statusColor = 'bg-green-100 text-green-700';
                    ctaText = 'Review';
                  } else if (isInProgress) {
                    status = 'In progress';
                    statusColor = 'bg-blue-100 text-blue-700';
                    ctaText = 'Continue';
                  }
                  
                  return (
              <Link
                key={lesson.slug}
                href={`/student/courses/${courseSlug}/lessons/${lesson.slug}`}
                      className="block bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-brand-light hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Module Number Badge */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${statusColor}`}>
                            {isCompleted ? '✓' : moduleNumber}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">
                      {lesson.frontmatter.title || lesson.slug}
                    </h3>
                            </div>
                    {lesson.frontmatter.description && (
                              <p className="text-sm text-gray-600 line-clamp-1 mb-2 leading-relaxed">
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
                              <span className="ml-auto">~30 min</span>
                              {enrollment && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  isCompleted 
                                    ? 'bg-green-50 text-green-700' 
                                    : isInProgress
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-gray-50 text-gray-600'
                                }`}>
                                  {status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <span className="text-brand-light text-sm font-medium">{ctaText} →</span>
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
          {/* Progress Card - Mobile (top) */}
          {(enrollment || course?.id) && (
            <div className="lg:hidden mb-8">
              <ProgressCard
                enrollment={enrollment}
                completedLessons={completedLessons}
                totalLessons={lessons.length}
                courseSlug={courseSlug}
                courseId={course?.id}
                nextLessonSlug={nextLessonSlug}
                firstLessonSlug={lessons[0]?.slug}
                      />
                    </div>
          )}

          {/* Progress Card - Desktop (sidebar) */}
          {(enrollment || course?.id) && (
            <div className="hidden lg:block">
              <ProgressCard
                enrollment={enrollment}
                completedLessons={completedLessons}
                totalLessons={lessons.length}
                courseSlug={courseSlug}
                courseId={course?.id}
                nextLessonSlug={nextLessonSlug}
                firstLessonSlug={lessons[0]?.slug}
                isSticky={true}
              />
          </div>
        )}
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA
        isEnrolled={!!enrollment}
        progressPercentage={enrollment?.progress_percentage}
        courseSlug={courseSlug}
        courseId={course?.id}
        nextLessonSlug={nextLessonSlug}
        firstLessonSlug={lessons[0]?.slug}
      />
    </div>
  );
}
