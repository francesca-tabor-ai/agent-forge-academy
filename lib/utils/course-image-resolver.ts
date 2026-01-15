/**
 * Course image URL resolution with industry and track-based fallbacks
 */

import type { CourseMetadata as CourseSyncMetadata } from '@/lib/course-sync/types';
import type { CourseMetadata as DashboardMetadata } from '@/lib/course-metadata';
import { getCoverFromIndustries, INDUSTRY_COVERS } from '@/lib/courseCovers';

/**
 * Default image URLs by industry
 * Industry images take priority over track images
 * @deprecated Use INDUSTRY_COVERS from @/lib/courseCovers instead
 */
const INDUSTRY_DEFAULT_IMAGES: Record<string, string> = {
  'Finance': 'https://www.esri.com/about/newsroom/app/uploads/2022/03/is-spatial-finance-coming-to-your-company-wherenext-article-wide-1920x1080-1.jpg',
  'Healthcare': 'https://www.sutherlandglobal.com/wp-content/uploads/sites/2/AI-in-Healthcare-859x507-1.jpg',
};

/**
 * Default image URLs by track/category
 */
const TRACK_DEFAULT_IMAGES: Record<string, string> = {
  'Vibe Engineering': 'https://www.windowsnoticias.com/wp-content/uploads/2025/04/0_vOaWDgTmVpMfi9ws.png',
  'Agentic Systems': 'https://cdn.mos.cms.futurecdn.net/8L4whkBm9JWJDnEd7XSd8B.jpg',
  'AI Search & Visibility': 'https://fueled.com/wp-content/uploads/2025/07/AI-Brand-Visibility-Header.webp?w=1920',
  'Shopping & E-Commerce': 'https://www.mirakl.com/_ipx/w_3840,q_100/https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png?url=https%3A%2F%2Fimages.ctfassets.net%2Fg4kjd861vrk6%2F1jW1XHRdewRgjGZP8f1OyG%2F4b62fe4f1adc0bf7d3c80668161e67d1%2FWinning_in_the_age_of_agentic_commerce-_How_retailers_can_thrive_in_the_AI-powered_future.png&w=3840&q=100',
  'Media & Content Ops': 'https://markerly.com/pulse/wp-content/uploads/2023/12/teammarkerly_create_a_very_simple_photo_depicting_social_media__dbe58354-7c33-4169-aaf7-1ce358baad7f.png',
  'Trust & Regulation': 'https://primathon.in/blog/wp-content/uploads/2024/04/Defining-AI-Ethics-in-the-Modern-World.jpg',
  'GTM & Revenue Operations': '/images/tracks/gtm-revenue-ops.jpg',
  'ML Engineering': '/images/tracks/ml-engineering.jpg',
  'Platform Engineering': '/images/tracks/platform-engineering.jpg',
};

/**
 * Fallback image URL if no track or industry match is found
 */
const DEFAULT_FALLBACK_IMAGE = '/images/tracks/default.jpg';

/**
 * Course data that may have image information
 */
interface CourseWithImage {
  imageUrl?: string | null;
  thumbnail_url?: string | null;
  category?: string;
  industries?: string[];
  metadata?: DashboardMetadata;
}

/**
 * Resolves the image URL for a course with fallback logic:
 * 1. course.imageUrl (if provided and valid - per-course override)
 * 2. Industry-based default image (primary source - all courses in same industry share same image)
 * 3. Track-based default image (based on category/track)
 * 4. Global fallback image
 * 
 * Note: Industry images are the default source. Course-specific imageUrl is only used as an override.
 * The alt text remains the course title for accessibility.
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
           !trimmed.startsWith('http://placeholder') &&
           trimmed !== course.title; // Don't use course title as image source
  };

  // Priority 1: Direct imageUrl (per-course override)
  // Only use if it's a valid URL and not a placeholder
  if (isValidUrl(course.imageUrl)) {
    return course.imageUrl;
  }

  // Priority 2: Industry-based default image (primary source)
  // All courses in the same industry share the same cover image
  const industries = course.industries || course.metadata?.industries || [];
  if (industries.length > 0) {
    const industryCover = getCoverFromIndustries(industries);
    if (industryCover && industryCover !== INDUSTRY_COVERS.Default) {
      return industryCover;
    }
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
 * Get default image URL for an industry
 * @deprecated Use getIndustryCover from @/lib/courseCovers instead
 */
export function getDefaultImageForIndustry(industry: string): string {
  return INDUSTRY_DEFAULT_IMAGES[industry] || INDUSTRY_COVERS[industry] || DEFAULT_FALLBACK_IMAGE;
}

/**
 * Get default image URL for a track/category
 */
export function getDefaultImageForTrack(track: string): string {
  return TRACK_DEFAULT_IMAGES[track] || DEFAULT_FALLBACK_IMAGE;
}

/**
 * Get all available industries with their default images
 */
export function getIndustryImageMap(): Record<string, string> {
  return { ...INDUSTRY_DEFAULT_IMAGES };
}

/**
 * Get all available tracks with their default images
 */
export function getTrackImageMap(): Record<string, string> {
  return { ...TRACK_DEFAULT_IMAGES };
}
