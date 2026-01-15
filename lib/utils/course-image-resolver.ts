/**
 * Course image URL resolution with track-based fallbacks
 */

import type { CourseMetadata as CourseSyncMetadata } from '@/lib/course-sync/types';
import type { CourseMetadata as DashboardMetadata } from '@/lib/course-metadata';

/**
 * Default image URLs by track/category
 */
const TRACK_DEFAULT_IMAGES: Record<string, string> = {
  'Vibe Engineering': '/images/tracks/vibe-engineering.jpg',
  'Agentic Systems': '/images/tracks/agentic-systems.jpg',
  'AI Search & Visibility': '/images/tracks/ai-search-viability.jpg',
  'Shopping & E-Commerce': '/images/tracks/shopping-ecommerce.jpg',
  'Media & Content Ops': '/images/tracks/media-content-ops.jpg',
  'Trust & Regulation': '/images/tracks/trust-regulation.jpg',
  'GTM & Revenue Operations': '/images/tracks/gtm-revenue-ops.jpg',
  'ML Engineering': '/images/tracks/ml-engineering.jpg',
  'Platform Engineering': '/images/tracks/platform-engineering.jpg',
};

/**
 * Fallback image URL if no track match is found
 */
const DEFAULT_FALLBACK_IMAGE = '/images/tracks/default.jpg';

/**
 * Course data that may have image information
 */
interface CourseWithImage {
  imageUrl?: string | null;
  thumbnail_url?: string | null;
  category?: string;
  metadata?: DashboardMetadata;
}

/**
 * Resolves the image URL for a course with fallback logic:
 * 1. course.imageUrl (if provided)
 * 2. course.thumbnail_url (if provided)
 * 3. Track-based default image (based on category/track)
 * 4. Global fallback image
 */
export function resolveCourseImageUrl(course: CourseWithImage): string {
  // Priority 1: Direct imageUrl
  if (course.imageUrl) {
    return course.imageUrl;
  }

  // Priority 2: thumbnail_url from database
  if (course.thumbnail_url) {
    return course.thumbnail_url;
  }

  // Priority 3: Track-based fallback
  const track = course.category || course.metadata?.category;
  if (track && TRACK_DEFAULT_IMAGES[track]) {
    return TRACK_DEFAULT_IMAGES[track];
  }

  // Priority 4: Global fallback
  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Get default image URL for a track/category
 */
export function getDefaultImageForTrack(track: string): string {
  return TRACK_DEFAULT_IMAGES[track] || DEFAULT_FALLBACK_IMAGE;
}

/**
 * Get all available tracks with their default images
 */
export function getTrackImageMap(): Record<string, string> {
  return { ...TRACK_DEFAULT_IMAGES };
}
