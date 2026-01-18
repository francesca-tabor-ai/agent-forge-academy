/**
 * Course image URL resolution with industry and track-based fallbacks
 */

import type { CourseMetadata as CourseSyncMetadata } from '@/lib/course-sync/types';
import type { CourseMetadata as DashboardMetadata } from '@/lib/course-metadata';
import { getCoverFromIndustries, getIndustryCover, INDUSTRY_COVERS, TRACK_COVERS } from '@/lib/courseCovers';

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
 * Tracks take priority over industries (except Healthcare and Finance)
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
  thumbnail_url?: string | null;
  category?: string;
  industries?: string[];
  metadata?: DashboardMetadata;
}

/**
 * Priority industries that take precedence over tracks
 */
const PRIORITY_INDUSTRIES = ['Healthcare', 'Finance'];

/**
 * Resolves the image URL for a course with fallback logic:
 * 1. course.imageUrl (if provided and valid - per-course override)
 * 2. Priority industries (Healthcare/Finance) - take priority over tracks
 * 3. Track-based image (tracks take priority over standard industries)
 * 4. Standard industry-based image
 * 5. Global fallback image
 * 
 * Note: Tracks take priority over industries, EXCEPT Healthcare and Finance
 * industries which take priority over tracks.
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

  const industries = course.industries || course.metadata?.industries || [];
  const track = course.category || course.metadata?.category;

  // Priority 2: Priority industries (Healthcare/Finance) - take priority over tracks
  if (industries.length > 0) {
    const priorityIndustry = industries.find(ind => PRIORITY_INDUSTRIES.includes(ind));
    if (priorityIndustry) {
      const industryCover = getIndustryCover(priorityIndustry);
      if (industryCover && industryCover !== INDUSTRY_COVERS.Default) {
        return industryCover;
      }
    }
  }

  // Priority 3: Track-based image (tracks take priority over standard industries)
  // Use TRACK_COVERS from courseCovers (supports local images with external fallback)
  if (track && TRACK_COVERS[track]) {
    return TRACK_COVERS[track];
  }

  // Priority 4: Standard industry-based image (non-priority industries)
  if (industries.length > 0) {
    const industryCover = getCoverFromIndustries(industries);
    if (industryCover && industryCover !== INDUSTRY_COVERS.Default) {
      return industryCover;
    }
  }

  // Priority 5: Global fallback
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
 * Uses TRACK_COVERS which supports local images with external fallback
 */
export function getDefaultImageForTrack(track: string): string {
  return TRACK_COVERS[track] || TRACK_DEFAULT_IMAGES[track] || DEFAULT_FALLBACK_IMAGE;
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
