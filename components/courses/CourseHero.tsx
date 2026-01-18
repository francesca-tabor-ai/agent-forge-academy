'use client';

import Link from 'next/link';
import { Share2 } from 'lucide-react';

interface CourseHeroProps {
  title: string;
  imageUrl: string;
  trackCategory?: string | null;
  difficultyLevel?: string | null;
  durationWeeks?: number | null;
  industries?: string[];
  isEnrolled: boolean;
  progressPercentage?: number;
  courseSlug: string;
  courseId?: string | null;
  nextLessonSlug?: string | null;
  firstLessonSlug?: string | null;
  showBackLink?: boolean;
}

export function CourseHero({
  title,
  imageUrl,
  trackCategory,
  difficultyLevel,
  durationWeeks,
  industries = [],
  isEnrolled,
  progressPercentage,
  courseSlug,
  courseId,
  nextLessonSlug,
  firstLessonSlug,
  showBackLink = true,
}: CourseHeroProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href,
      }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="relative w-full min-h-[180px] sm:min-h-[220px] md:min-h-[260px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      
      {/* Gradient Overlay - transparent top to dark bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
      
      {/* Back Link - Overlay on top */}
      {showBackLink && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 md:top-6 md:left-6 z-10">
          <Link
            href="/student/courses"
            className="text-sm text-white hover:text-white/90 inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 transition-colors min-h-[44px] touch-manipulation"
            aria-label="Back to Courses"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Courses</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      )}
      
      {/* Content Container */}
      <div className="relative h-full min-h-[180px] sm:min-h-[220px] md:min-h-[260px] flex flex-col justify-end p-4 sm:p-6 md:p-8">
        {/* Mobile: Stacked Layout */}
        <div className="md:hidden space-y-4">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white line-clamp-2 break-words leading-tight drop-shadow-lg">
            {title}
          </h1>
          
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {trackCategory && (
              <span className="inline-flex items-center px-2 py-0.5 font-medium text-white bg-white/20 backdrop-blur-sm rounded-full border border-white/30 whitespace-nowrap">
                {trackCategory}
              </span>
            )}
            {difficultyLevel && (
              <span className="inline-flex items-center px-2 py-0.5 font-medium text-white bg-white/20 backdrop-blur-sm rounded-full border border-white/30 capitalize whitespace-nowrap">
                {difficultyLevel}
              </span>
            )}
            {durationWeeks && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 font-medium text-white bg-white/20 backdrop-blur-sm rounded-full border border-white/30 whitespace-nowrap">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {isEnrolled ? (
              <>
                <Link
                  href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug || firstLessonSlug || ''}`}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap shadow-lg min-h-[44px]"
                >
                  Continue {progressPercentage !== undefined && `(${progressPercentage}%)`}
                </Link>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm whitespace-nowrap border border-white/30 min-h-[44px] min-w-[44px]"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </>
            ) : courseId ? (
              <>
                <form action={`/api/courses/enroll?course_id=${courseId}`} method="POST" className="flex-1">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap shadow-lg min-h-[44px]"
                  >
                    Enroll
                  </button>
                </form>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm whitespace-nowrap border border-white/30 min-h-[44px] min-w-[44px]"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm whitespace-nowrap border border-white/30 min-h-[44px]"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-[1fr_auto] gap-4 lg:gap-6 items-end">
          {/* Left: Title and Metadata */}
          <div className="min-w-0">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 lg:mb-4 line-clamp-2 break-words leading-tight drop-shadow-lg">
              {title}
            </h1>
            
            {/* Metadata Chips */}
            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              {trackCategory && (
                <span className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-full border border-white/30 whitespace-nowrap">
                  {trackCategory}
                </span>
              )}
              {difficultyLevel && (
                <span className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-full border border-white/30 capitalize whitespace-nowrap">
                  {difficultyLevel}
                </span>
              )}
              {durationWeeks && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-full border border-white/30 whitespace-nowrap">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}
                </span>
              )}
              {industries.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-full border border-white/30 whitespace-nowrap">
                  {industries[0]}
                </span>
              )}
            </div>
          </div>

          {/* Right: CTAs */}
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 flex-shrink-0">
            {isEnrolled ? (
              <>
                <Link
                  href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug || firstLessonSlug || ''}`}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm sm:text-base whitespace-nowrap shadow-lg"
                >
                  Continue {progressPercentage !== undefined && `(${progressPercentage}%)`}
                </Link>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm sm:text-base whitespace-nowrap border border-white/30"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </>
            ) : courseId ? (
              <>
                <form action={`/api/courses/enroll?course_id=${courseId}`} method="POST" className="inline-block">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm sm:text-base whitespace-nowrap shadow-lg"
                  >
                    Enroll
                  </button>
                </form>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm sm:text-base whitespace-nowrap border border-white/30"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </>
            ) : (
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm sm:text-base whitespace-nowrap border border-white/30"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
