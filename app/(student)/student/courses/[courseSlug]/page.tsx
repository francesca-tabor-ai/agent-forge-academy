import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { loadAllLessons, type Lesson } from '@/lib/lessons';
import { getCourseCover } from '@/lib/courseCovers';
import { extractCourseMetadata } from '@/lib/course-sync/extract-metadata';
import { courseMetadata } from '@/lib/course-metadata';
import { hasCourseAccess, getSegmentsForCourse } from '@/lib/utils/course-access';
import { CoursePaywall } from '@/components/courses/CoursePaywall';
import { CourseHero } from '@/components/courses/CourseHero';
import { OverviewCards } from '@/components/courses/OverviewCards';
import { ProgressCard } from '@/components/courses/ProgressCard';
import { QuickActions } from '@/components/courses/QuickActions';
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

  // Normalize database fields from snake_case to camelCase
  const normalizedCourse = course ? {
    ...course,
    thumbnailUrl: course.thumbnail_url || undefined,
  } : null;

  if (error || !normalizedCourse) {
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

  if (profile && normalizedCourse?.id) {
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
        .eq('course_id', normalizedCourse.id)
        .eq('student_profile_id', studentProfile.id)
        .single();

      enrollment = enrollmentData;

      // Get lesson progress for this course
      if (enrollmentData) {
        const { data: lessonProgress } = await supabase
          .from('lesson_progress')
          .select('lesson_slug, status')
          .eq('student_profile_id', studentProfile.id)
          .eq('course_id', normalizedCourse.id);

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

  const courseTitle = normalizedCourse?.title || metadata?.title || staticMetadata?.title || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  const courseDescription = normalizedCourse?.description || metadata?.description || null;
  
  // Merge course data with metadata to ensure correct category/image resolution
  // Priority: metadata (file system) > static metadata > database
  // This ensures track images are always correct even if database has wrong/null category
  const categoryForImage = metadata?.category || staticMetadata?.category || normalizedCourse?.category;
  const courseCoverImage = getCourseCover({
    // Only use database imageUrl/thumbnailUrl if they're valid and metadata doesn't override
    imageUrl: metadata?.imageUrl || staticMetadata?.imageUrl || normalizedCourse?.imageUrl,
    thumbnailUrl: metadata?.thumbnailUrl || normalizedCourse?.thumbnailUrl,
    // Always prioritize metadata category (source of truth) over database category
    category: categoryForImage,
    track: categoryForImage, // Also set track field for compatibility
    industries: metadata?.industries || staticMetadata?.industries || normalizedCourse?.industries,
    // Include metadata object for fallback
    metadata: metadata ? { category: categoryForImage } : undefined,
  });

  // Prepare metadata for display
  const durationWeeks = normalizedCourse?.duration_weeks || metadata?.duration_weeks;
  const difficultyLevel = normalizedCourse?.difficulty_level || metadata?.difficulty_level;
  const trackCategory = normalizedCourse?.category || metadata?.category || staticMetadata?.category;
  const industries = normalizedCourse?.industries || metadata?.industries || staticMetadata?.industries || [];

  // Get overview fields (outcome, build, bestFor)
  // Priority: database fields > dynamic metadata > static metadata
  const outcome = normalizedCourse?.outcome && normalizedCourse.outcome.length > 0 
    ? normalizedCourse.outcome 
    : ((metadata as any)?.outcome || staticMetadata?.outcome);
  const build = normalizedCourse?.youll_build && normalizedCourse.youll_build.length > 0
    ? normalizedCourse.youll_build
    : ((metadata as any)?.build || staticMetadata?.build);
  const bestFor = normalizedCourse?.best_for && normalizedCourse.best_for.length > 0
    ? normalizedCourse.best_for
    : ((metadata as any)?.bestFor || staticMetadata?.bestFor);

  // Helper to parse text into bullet points
  // Handles: arrays, newline-separated, comma-separated, inline bullets (• separated), or single string
  // Ensures one idea per bullet - no fragmented lists
  const parseIntoBullets = (input: string | string[] | undefined | null): string[] => {
    if (!input) return [];
    // If already an array, return it (already clean)
    if (Array.isArray(input)) {
      return input.filter(s => s && s.trim().length > 0).map(s => s.trim());
    }
    // If string, parse it
    const text = String(input).trim();
    if (!text) return [];
    
    // Try splitting by newlines first (most common format)
    if (text.includes('\n')) {
      return text.split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        // Also check for inline bullets within each line
        .flatMap(line => {
          // Check if line contains inline bullets (• or * separated)
          if (line.includes('•') || (line.includes('*') && line.match(/\*\s+\w/))) {
            // Split by bullet character and filter out empty
            return line.split(/[•*]/)
              .map(s => s.trim())
              .filter(s => s.length > 0);
          }
          return [line];
        });
    }
    
    // Check for inline bullets (• separated) - e.g., "• Design • build • scale"
    if (text.includes('•') || (text.includes('*') && text.match(/\*\s+\w/))) {
      return text.split(/[•*]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    
    // Then try splitting by commas
    if (text.includes(',')) {
      return text.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    
    // Single item
    return [text].filter(s => s.length > 0);
  };

  const outcomeBullets = parseIntoBullets(outcome);
  const buildBullets = parseIntoBullets(build);
  const bestForItems = parseIntoBullets(bestFor);

  // Identify Course Index/Reference Guide lesson
  const isCourseIndex = (lesson: Lesson) => {
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
    <div className="pb-20 lg:pb-8 mb-16 md:mb-0 overflow-x-hidden">
      {/* Hero Banner - Sticky Header */}
      {/* 
        NON-OVERLAPPING LAYOUT RULES:
        1. Hero sits inside main content flow (respects sidebar grid on desktop)
        2. Hero accounts for header height (top-[64px] instead of top-0)
        3. No full-bleed breakout that could overlap sidebar
        4. Z-index ensures hero is above header but below modals
        5. Negative margin breaks out of main content padding on mobile only
      */}
      <div className="sticky top-[64px] z-[60] mb-0 -mx-4 sm:-mx-6 lg:mx-0 w-full lg:w-auto overflow-x-hidden">
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
          courseId={normalizedCourse?.id}
          nextLessonSlug={nextLessonSlug}
          firstLessonSlug={lessons[0]?.slug}
        />
      </div>

      {/* Full width section below hero */}
      <div className="w-full">
        {/* Inner grid: wide layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 lg:gap-8">
          {/* Left Column: Overview + Modules */}
          <div className="space-y-8">
          {/* Course Overview Section - De-emphasized since hero already shows course info */}
          {(courseDescription || outcomeBullets.length > 0 || buildBullets.length > 0 || bestForItems.length > 0) && (
            <div>
              <OverviewCards
                description={courseDescription}
                outcome={outcomeBullets}
                build={buildBullets}
                bestFor={bestForItems}
              />
            </div>
          )}

          {/* Modules Section - Primary content, keep prominent */}
          <div>
            <h2 className="text-section-header mb-4">Modules</h2>
            
            {lessons.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
            <p className="text-gray-600">No lessons available for this course yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
                {/* Quick Start / Course Index */}
                {courseIndexLesson && (
                  <Link
                    href={`/student/courses/${courseSlug}/lessons/${courseIndexLesson.slug}`}
                    className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-light hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 md:p-5"
                  >
                    {/* Mobile: Compact Layout */}
                    <div className="md:hidden">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-light/10 flex items-center justify-center">
                          <span className="text-brand-light text-lg">⚡</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                            {courseIndexLesson.frontmatter.title || 'Quick Start'}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span>~15 min</span>
                            {completedLessonSlugs.has(courseIndexLesson.slug) && (
                              <span className="text-green-600 text-xs font-medium">✓ Completed</span>
                            )}
                          </div>
                          <button className="w-full mt-2 px-4 py-2 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm min-h-[44px]">
                            {completedLessonSlugs.has(courseIndexLesson.slug) ? 'Review' : 'Start'} →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Expanded Layout */}
                    <div className="hidden md:flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
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
                      className="block bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-light hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 md:p-5"
                    >
                      {/* Mobile: Compact Layout */}
                      <div className="md:hidden">
                        <div className="flex items-start gap-3">
                          {/* Module Number Badge */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm ${statusColor}`}>
                            {isCompleted ? '✓' : moduleNumber}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                              {lesson.frontmatter.title || lesson.slug}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <span>~30 min</span>
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
                            <button className="w-full mt-2 px-4 py-2 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm min-h-[44px]">
                              {ctaText} →
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop: Expanded Layout */}
                      <div className="hidden md:flex items-start justify-between gap-4">
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

          {/* Right Column: Progress Card + Quick Actions */}
          <div className="space-y-6 lg:space-y-8">
            {/* Progress Card - Mobile (top) */}
            {(enrollment || normalizedCourse?.id) && (
              <div className="lg:hidden">
                <ProgressCard
                  enrollment={enrollment}
                  completedLessons={completedLessons}
                  totalLessons={lessons.length}
                  courseSlug={courseSlug}
                  courseId={normalizedCourse?.id}
                  nextLessonSlug={nextLessonSlug}
                  firstLessonSlug={lessons[0]?.slug}
                />
              </div>
            )}

            {/* Progress Card - Desktop (sidebar) */}
            {(enrollment || normalizedCourse?.id) && (
              <div className="hidden lg:block">
                <ProgressCard
                  enrollment={enrollment}
                  completedLessons={completedLessons}
                  totalLessons={lessons.length}
                  courseSlug={courseSlug}
                  courseId={normalizedCourse?.id}
                  nextLessonSlug={nextLessonSlug}
                  firstLessonSlug={lessons[0]?.slug}
                  isSticky={true}
                />
              </div>
            )}

            {/* Quick Actions - Desktop only */}
            <div className="hidden lg:block pt-4">
              <QuickActions
                courseSlug={courseSlug}
                courseId={normalizedCourse?.id}
                isEnrolled={!!enrollment}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA
        isEnrolled={!!enrollment}
        progressPercentage={enrollment?.progress_percentage}
        courseSlug={courseSlug}
        courseId={normalizedCourse?.id}
        nextLessonSlug={nextLessonSlug}
        firstLessonSlug={lessons[0]?.slug}
      />
    </div>
  );
}
