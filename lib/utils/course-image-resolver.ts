/**
 * Course image URL resolution with industry and track-based fallbacks
 */

import type { CourseMetadata as CourseSyncMetadata } from '@/lib/course-sync/types';
import type { CourseMetadata as DashboardMetadata } from '@/lib/course-metadata';

/**
 * Default image URLs by industry
 * Industry images take priority over track images
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
 * 1. course.imageUrl (if provided)
 * 2. course.thumbnail_url (if provided)
 * 3. Industry-based default image (based on industries array - takes priority over track)
 * 4. Track-based default image (based on category/track)
 * 5. Global fallback image
 */
export function resolveCourseImageUrl(course: CourseWithImage): string {
  // Helper to validate URL is not empty or invalid
  const isValidUrl = (url: string | null | undefined): url is string => {
    return !!url && typeof url === 'string' && url.trim().length > 0;
  };

  // Priority 1: Direct imageUrl
  if (isValidUrl(course.imageUrl)) {
    return course.imageUrl;
  }

  // Priority 2: thumbnail_url from database
  if (isValidUrl(course.thumbnail_url)) {
    return course.thumbnail_url;
  }

  // Priority 3: Industry-based fallback (takes priority over track)
  const industries = course.industries || course.metadata?.industries || [];
  for (const industry of industries) {
    if (industry && INDUSTRY_DEFAULT_IMAGES[industry]) {
      return INDUSTRY_DEFAULT_IMAGES[industry];
    }
  }

  // Priority 4: Track-based fallback
  const track = course.category || course.metadata?.category;
  if (track && TRACK_DEFAULT_IMAGES[track]) {
    return TRACK_DEFAULT_IMAGES[track];
  }

  // Priority 5: Global fallback
  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Get default image URL for an industry
 */
export function getDefaultImageForIndustry(industry: string): string {
  return INDUSTRY_DEFAULT_IMAGES[industry] || DEFAULT_FALLBACK_IMAGE;
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
