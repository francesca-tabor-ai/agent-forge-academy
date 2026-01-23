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
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-4 pb-6" role="banner" aria-label="Course hero banner">
      {/* Banner Image - Fixed aspect ratio, no overlap */}
      <div className="overflow-hidden rounded-2xl bg-muted">
        <div className="aspect-[16/5] relative">
          {/* Fallback Background Layer */}
          <div
            className="absolute inset-0"
            style={{ 
              background: GRADIENT_FALLBACK,
            }}
            aria-hidden="true"
          />
          
          {/* Background Image Layer */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${currentImageUrl})`,
              backgroundColor: imageError ? 'transparent' : undefined,
            }}
            aria-hidden="true"
          >
            {/* Hidden img element to detect load errors */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
          
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" aria-hidden="true" />
        </div>
      </div>

      {/* Title and Metadata - Below banner with consistent spacing */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-gray-900">{title}</h1>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-gray-600">
            {trackCategory && (
              <>
                <span>{trackCategory}</span>
                {(difficultyLevel || durationWeeks) && <span>•</span>}
              </>
            )}
            {difficultyLevel && (
              <>
                <span className="capitalize">{difficultyLevel}</span>
                {durationWeeks && <span>•</span>}
              </>
            )}
            {durationWeeks && (
              <span>{durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isEnrolled ? (
            <>
              <Link
                href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug || firstLessonSlug || ''}`}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap"
              >
                Continue {progressPercentage !== undefined && `(${progressPercentage}%)`}
              </Link>
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap border border-gray-200"
                aria-label="Share course"
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
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap"
                >
                  Enroll
                </button>
              </form>
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap border border-gray-200"
                aria-label="Share course"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </>
          ) : (
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap border border-gray-200"
              aria-label="Share course"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
