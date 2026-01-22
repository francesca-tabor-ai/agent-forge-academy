/**
 * Course image URL resolution with track-based fallbacks
 * 
 * Course images always use Track images. Industry and Role images
 * are reserved for landing pages only.
 */

import type { CourseMetadata as CourseSyncMetadata } from '@/lib/course-sync/types';
import type { CourseMetadata as DashboardMetadata } from '@/lib/course-metadata';
import { TRACK_COVERS } from '@/lib/courseCovers';

/**
 * Default image URLs by track/category
 * @deprecated Use TRACK_COVERS from @/lib/courseCovers instead
 */
const TRACK_DEFAULT_IMAGES: Record<string, string> = {
  'Vibe Engineering': 'https://www.windowsnoticias.com/wp-content/uploads/2025/04/0_vOaWDgTmVpMfi9ws.png',
  'Agentic Systems': 'https://cdn.mos.cms.futurecdn.net/8L4whkBm9JWJDnEd7XSd8B.jpg',
  'AI Search & Visibility': 'https://fueled.com/wp-content/uploads/2025/07/AI-Brand-Visibility-Header.webp?w=1920',
  'Shopping & E-Commerce': 'https://www.mirakl.com/_ipx/w_3840,q_100/https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png?url=https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png&w=3840&q=100',
  'Media & Content Ops': 'https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png',
  'Trust & Regulation': 'https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg',
  'GTM & Revenue Operations': 'https://wp.sfdcdigital.com/en-us/wp-content/uploads/sites/4/2024/08/revenue-ops.jpg?w=1024',
  'ML Engineering': 'https://www.databricks.com/sites/default/files/styles/max_1000x1000/public/2025-12/machine-learning-engineering-complete-guide-building-production-ml-systems-og-image.png?itok=mhHGdHwy&v=1765535043',
  'Platform Engineering': 'https://8allocate.com/wp-content/uploads/2024/01/The-Future-of-Software-Engineering_-Predictions-for-2024.jpg',
  'Economics & Maths': 'https://industrytoday.com/wp-content/uploads/2022/12/economic-growth.jpg',
};

/**
 * Fallback image URL if no track or industry match is found
 */
const DEFAULT_FALLBACK_IMAGE = 'https://wallpaperaccess.com/full/340554.png';

/**
 * Course data that may have image information
 */
interface CourseWithImage {
  imageUrl?: string | null;
  thumbnailUrl?: string | null; // camelCase (preferred)
  thumbnail_url?: string | null; // snake_case (for backward compatibility with DB queries)
  track?: string | null; // Track field (preferred over category)
  category?: string;
  industries?: string[];
  metadata?: DashboardMetadata;
}

/**
 * Resolves the image URL for a course with fallback logic:
 * 1. course.imageUrl (if provided and valid - per-course override)
 * 2. course.thumbnailUrl (if provided and valid - per-course override)
 * 3. Track-based image (ALWAYS use track image for courses)
 * 4. Global fallback image
 * 
 * Note: Course images always use the Track image. Industry and Role images
 * are reserved for landing pages only.
 * 
 * This function matches the logic of getCourseCover() to ensure
 * hero images and thumbnail images are the same.
 */
export function resolveCourseImageUrl(course: CourseWithImage): string {
  // Helper to validate URL is not empty, invalid, or a placeholder
  const isValidUrl = (url: string | null | undefined): url is string => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    // Filter out common placeholder values
    return trimmed.length > 0 && 
           trimmed !== 'image' && 
           trimmed !== 'placeholder' &&
           !trimmed.startsWith('http://placeholder');
  };

  // Priority 1: Direct imageUrl (per-course override)
  // Only use if it's a valid URL and not a placeholder
  if (isValidUrl(course.imageUrl)) {
    return course.imageUrl;
  }

  // Priority 2: Direct thumbnailUrl (per-course override)
  // Accept both camelCase (preferred) and snake_case (backward compatibility)
  const thumbnailUrl = course.thumbnailUrl || course.thumbnail_url;
  if (isValidUrl(thumbnailUrl)) {
    return thumbnailUrl;
  }

  // Priority 3: Track-based image (ALWAYS use track for courses)
  // Match getCourseCover() logic: track || category || metadata.category
  const track = course.track || course.category || course.metadata?.category;
  // Use TRACK_COVERS from courseCovers (supports local images with external fallback)
  if (track && TRACK_COVERS[track]) {
    return TRACK_COVERS[track];
  }

  // Priority 4: Global fallback
  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Get default image URL for an industry
 * @deprecated Industry images are now only used for landing pages, not courses.
 * Use getIndustryCover from @/lib/courseCovers for landing pages.
 */
export function getDefaultImageForIndustry(industry: string): string {
  // This function is deprecated - industry images are for landing pages only
  // Keeping for backward compatibility but should not be used for course images
  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Get default image URL for a track/category
 * Uses TRACK_COVERS which supports local images with external fallback
 */
export function getDefaultImageForTrack(track: string): string {
  return TRACK_COVERS[track] || TRACK_DEFAULT_IMAGES[track] || DEFAULT_FALLBACK_IMAGE;
}

/**
 * Get all available industries with their default images
 * @deprecated Industry images are now only used for landing pages, not courses.
 */
export function getIndustryImageMap(): Record<string, string> {
  // This function is deprecated - industry images are for landing pages only
  return {};
}

/**
 * Get all available tracks with their default images
 */
export function getTrackImageMap(): Record<string, string> {
  return { ...TRACK_DEFAULT_IMAGES };
}
