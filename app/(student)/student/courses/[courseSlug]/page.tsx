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

  let enrollment = null;
  if (profile && course?.id) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (studentProfile) {
      const { data: enrollmentData } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', course.id)
        .eq('student_profile_id', studentProfile.id)
        .single();

      enrollment = enrollmentData;
    }
  }

  // Load lessons for this course
  const lessons = loadAllLessons(undefined, courseSlug);

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
  const outcome = (metadata as any)?.outcome || staticMetadata?.outcome;
  const build = (metadata as any)?.build || staticMetadata?.build;
  const bestFor = (metadata as any)?.bestFor || staticMetadata?.bestFor;

  // Helper to parse text into bullet points (handles comma-separated, newline-separated, or single string)
  const parseIntoBullets = (text: string | undefined | null): string[] => {
    if (!text) return [];
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
      <div className="relative w-full h-40 sm:h-52 md:h-[220px] rounded-lg overflow-hidden mb-8 -mx-6">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${courseCoverImage})` }}
        />
        
        {/* Gradient Overlay - transparent top to dark bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        
        {/* Content Container */}
        <div className="relative h-full flex flex-col justify-end p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* Left: Title and Metadata */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 line-clamp-2">
                {courseTitle}
              </h1>
              
              {/* Metadata Line */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/90">
                {durationWeeks && (
                  <span className="flex items-center gap-1">
                    <span>{durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}</span>
                  </span>
                )}
                {durationWeeks && difficultyLevel && (
                  <span className="text-white/60">•</span>
                )}
                {difficultyLevel && (
                  <span className="capitalize px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm">
                    {difficultyLevel}
                  </span>
                )}
                {(durationWeeks || difficultyLevel) && (trackCategory || industries.length > 0) && (
                  <span className="text-white/60">•</span>
                )}
                {trackCategory && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm">
                    {trackCategory}
                  </span>
                )}
                {!trackCategory && industries.length > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full backdrop-blur-sm">
                    {industries[0]}
                  </span>
                )}
              </div>
            </div>
            
            {/* Right: CTA Button */}
            <div className="flex-shrink-0">
              {enrollment ? (
                <Link
                  href={`/student/courses/${courseSlug}/lessons/${lessons[0]?.slug || ''}`}
                  className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm sm:text-base"
                >
                  Continue ({enrollment.progress_percentage}%)
                </Link>
              ) : course?.id ? (
                <form action={`/api/courses/enroll?course_id=${course.id}`} method="POST" className="inline-block">
                  <button
                    type="submit"
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm sm:text-base"
                  >
                    Enroll
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Course Overview Section */}
      {(courseDescription || outcomeBullets.length > 0 || buildBullets.length > 0 || bestForItems.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Overview</h2>
          
          <div className="space-y-6">
            {/* Description */}
            {courseDescription && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Description</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{courseDescription}</p>
              </div>
            )}

            {/* Outcome */}
            {outcomeBullets.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Outcome</h3>
                <ul className="space-y-2">
                  {outcomeBullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-brand-light mt-1.5 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base text-gray-600">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* You'll Build */}
            {buildBullets.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">You'll Build</h3>
                <ul className="space-y-2">
                  {buildBullets.map((bullet, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-brand-light mt-1.5 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base text-gray-600">{bullet}</span>
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

      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Lessons</h2>
        
        {lessons.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No lessons available for this course yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link
                key={lesson.slug}
                href={`/student/courses/${courseSlug}/lessons/${lesson.slug}`}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
