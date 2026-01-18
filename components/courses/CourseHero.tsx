'use client';

import Link from 'next/link';
import { Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';

/**
 * Standard CourseHero Component Pattern
 * 
 * This is the SINGLE REUSABLE component for all course landing pages.
 * All course landing pages MUST use this component - no per-course hacks.
 * 
 * Standard Structure:
 * 1. Hero wrapper with reliable height (min-height at all breakpoints)
 * 2. Background image layer (full-bleed, bg-cover bg-center)
 * 3. Fallback background color (bg-gray-900) if image fails
 * 4. Gradient overlay for text readability
 * 5. Constrained inner content container (max-w-7xl, responsive padding)
 * 6. Title + metadata + actions
 * 
 * This ensures consistent UI across all courses and prevents layout issues.
 */

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
}

/**
 * Default fallback image URL (matches course-image-resolver.ts)
 * This ensures every course always has a background image, even if track image fails
 */
const DEFAULT_FALLBACK_IMAGE = 'https://wallpaperaccess.com/full/340554.png';

/**
 * Gradient fallback pattern - always visible as last resort
 * This ensures the hero is NEVER blank, even if all images fail
 */
const GRADIENT_FALLBACK = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

/**
 * Validate if an image URL is valid
 * Filters out placeholder strings and invalid URLs
 */
function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 0 && 
         trimmed !== 'image' && 
         trimmed !== 'placeholder' &&
         !trimmed.startsWith('http://placeholder') &&
         !trimmed.startsWith('placeholder');
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
}: CourseHeroProps) {
  // Validate and handle image loading errors
  // Multiple fallback layers ensure hero is NEVER blank
  const [imageError, setImageError] = useState(false);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(() => {
    // Validate initial image URL
    if (isValidImageUrl(imageUrl)) {
      return imageUrl;
    }
    // Use fallback if invalid
    return DEFAULT_FALLBACK_IMAGE;
  });

  // Update image URL when prop changes
  useEffect(() => {
    if (isValidImageUrl(imageUrl)) {
      setCurrentImageUrl(imageUrl);
      setImageError(false);
      setFallbackAttempted(false);
    } else {
      setCurrentImageUrl(DEFAULT_FALLBACK_IMAGE);
      setImageError(false);
      setFallbackAttempted(false);
    }
  }, [imageUrl]);

  // Handle image load error - switches to fallback
  // This ensures if the image URL fails to load, we use the default fallback
  const handleImageError = () => {
    if (!fallbackAttempted && currentImageUrl !== DEFAULT_FALLBACK_IMAGE) {
      // First error: switch to default fallback image
      setImageError(true);
      setFallbackAttempted(true);
      setCurrentImageUrl(DEFAULT_FALLBACK_IMAGE);
    } else if (fallbackAttempted && currentImageUrl === DEFAULT_FALLBACK_IMAGE) {
      // Second error: default fallback also failed, but gradient background will show
      // Don't update URL again to prevent infinite loop
      setImageError(true);
    }
  };

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
    <div 
      className="relative w-full min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] overflow-hidden"
      role="banner"
      aria-label="Course hero banner"
    >
      {/* 
        STANDARD PATTERN: Fallback Background Layer (Always Visible)
        - Gradient/neutral background that's ALWAYS visible
        - Ensures hero is NEVER blank, even if all images fail
        - This is the last resort fallback
      */}
      <div
        className="absolute inset-0"
        style={{ 
          background: GRADIENT_FALLBACK,
        }}
        aria-hidden="true"
      />

      {/* 
        STANDARD PATTERN: Background Image Layer
        - Full-bleed background image (absolute inset-0)
        - bg-cover bg-center ensures image fills container
        - Renders on top of gradient fallback
        - If image fails, gradient fallback shows through
      */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${currentImageUrl})`,
          // Ensure gradient shows through if image fails
          backgroundColor: imageError ? 'transparent' : undefined,
        }}
        aria-hidden="true"
      >
        {/* 
          Hidden img element to detect load errors
          - onError handler switches to fallback image
          - If fallback also fails, gradient background is visible
        */}
        <img
          src={currentImageUrl}
          alt=""
          className="hidden"
          onError={handleImageError}
          onLoad={() => {
            setImageError(false);
            setFallbackAttempted(false);
          }}
        />
      </div>
      
      {/* 
        Additional solid color fallback (if gradient fails)
        - bg-gray-900 provides neutral background
        - Only visible if both image and gradient fail (unlikely)
      */}
      <div
        className="absolute inset-0 bg-gray-900"
        style={{ 
          opacity: imageError && fallbackAttempted ? 1 : 0,
        }}
        aria-hidden="true"
      />
      
      {/* 
        STANDARD PATTERN: Gradient Overlay for Readability
        - Ensures text is always readable over any background image
        - Transparent top to dark bottom gradient
        - Applied as separate layer (absolute inset-0)
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" aria-hidden="true" />
      
      {/* 
        STANDARD PATTERN: Content Container
        - Reliable height: min-height matches wrapper at all breakpoints
        - Flex layout: flex-col justify-end (content at bottom)
        - Constrained width: max-w-7xl mx-auto (centered, max width)
        - Responsive padding: px-4 sm:px-6 md:px-8 lg:px-12 (horizontal)
        - Responsive padding: pb-8 sm:pb-12 md:pb-16 lg:pb-20 (bottom)
        - Relative positioning: Creates stacking context for content above overlay
      */}
      <div className="relative h-full min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] flex flex-col justify-end z-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
        {/* Mobile: Stacked Layout */}
        <div className="md:hidden space-y-6">
          {/* Title - Largest, clear hierarchy */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white line-clamp-3 break-words leading-tight drop-shadow-lg">
            {title}
          </h1>
          
          {/* Metadata Row - Pill-style, muted */}
          <div className="flex flex-wrap items-center gap-2.5">
            {trackCategory && (
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white/90 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 whitespace-nowrap">
                {trackCategory}
              </span>
            )}
            {difficultyLevel && (
              <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white/90 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 capitalize whitespace-nowrap">
                {difficultyLevel}
              </span>
            )}
            {durationWeeks && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white/90 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 whitespace-nowrap">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}
              </span>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {isEnrolled ? (
              <>
                <Link
                  href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug || firstLessonSlug || ''}`}
                  className="flex-1 inline-flex items-center justify-center px-5 py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap shadow-lg min-h-[44px]"
                >
                  Continue {progressPercentage !== undefined && `(${progressPercentage}%)`}
                </Link>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm whitespace-nowrap border border-white/30 min-h-[44px] min-w-[44px]"
                  aria-label="Share course"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </>
            ) : courseId ? (
              <>
                <form action={`/api/courses/enroll?course_id=${courseId}`} method="POST" className="flex-1">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center px-5 py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap shadow-lg min-h-[44px]"
                  >
                    Enroll
                  </button>
                </form>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm whitespace-nowrap border border-white/30 min-h-[44px] min-w-[44px]"
                  aria-label="Share course"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-sm whitespace-nowrap border border-white/30 min-h-[44px]"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            )}
          </div>
        </div>

        {/* Desktop: Hero Layout with clear hierarchy */}
        <div className="hidden md:block">
          <div className="flex items-end justify-between gap-8">
            {/* Left: Title and Metadata */}
            <div className="flex-1 min-w-0">
              {/* Course Title - Largest, clear typographic scale */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 lg:mb-8 line-clamp-3 break-words leading-tight drop-shadow-lg">
                {title}
              </h1>
              
              {/* Metadata Row - Pill-style, muted text beneath title */}
              <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                {trackCategory && (
                  <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-white/90 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 whitespace-nowrap">
                    {trackCategory}
                  </span>
                )}
                {difficultyLevel && (
                  <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-white/90 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 capitalize whitespace-nowrap">
                    {difficultyLevel}
                  </span>
                )}
                {durationWeeks && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/90 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 whitespace-nowrap">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Primary Action (Share) - Aligned right */}
            <div className="flex-shrink-0 flex flex-col gap-3">
              {isEnrolled ? (
                <>
                  <Link
                    href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug || firstLessonSlug || ''}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-base whitespace-nowrap shadow-lg"
                  >
                    Continue {progressPercentage !== undefined && `(${progressPercentage}%)`}
                  </Link>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-base whitespace-nowrap border border-white/30"
                    aria-label="Share course"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </>
              ) : courseId ? (
                <>
                  <form action={`/api/courses/enroll?course_id=${courseId}`} method="POST" className="inline-block">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-6 py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-base whitespace-nowrap shadow-lg"
                    >
                      Enroll
                    </button>
                  </form>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-base whitespace-nowrap border border-white/30"
                    aria-label="Share course"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </>
              ) : (
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-colors text-base whitespace-nowrap border border-white/30"
                  aria-label="Share course"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
