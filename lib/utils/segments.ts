/**
 * Segment utilities: Get all segments and their included courses
 */

import type { Segment, SegmentType } from '@/lib/types/segment';
import { courseMetadata } from '@/lib/course-metadata';
import { INDUSTRIES } from '@/lib/utils/industries';
import { getSegmentKey } from '@/lib/types/segment';
import { 
  getTrackHeroImage as getTrackHeroImageFromResolver,
  getIndustryHeroImage as getIndustryHeroImageFromResolver,
  getRoleHeroImage as getRoleHeroImageFromResolver,
  getDefaultHeroImage,
} from '@/lib/utils/hero-image-resolver';

/**
 * Get all unique tracks (categories) from course metadata
 */
function getAllTracks(): string[] {
  const tracks = new Set<string>();
  Object.values(courseMetadata).forEach((course) => {
    if (course.category) {
      tracks.add(course.category);
    }
  });
  return Array.from(tracks).sort();
}

/**
 * Get all unique job roles from "bestFor" fields
 * Extracts role keywords from bestFor strings or arrays
 */
function getAllJobRoles(): string[] {
  const roles = new Set<string>();
  
  Object.values(courseMetadata).forEach((course) => {
    if (course.bestFor) {
      // Handle bestFor as string or array
      const bestForArray = Array.isArray(course.bestFor) 
        ? course.bestFor 
        : [course.bestFor];
      
      bestForArray.forEach((bestForEntry) => {
        // Extract role keywords from bestFor strings
        // Common patterns: "Engineers", "PMs", "Data Scientists", "Product Managers", etc.
        const bestForLower = String(bestForEntry).toLowerCase();
      
      // Common role keywords
      const roleKeywords = [
        'engineer', 'engineers',
        'pm', 'pms', 'product manager', 'product managers',
        'data scientist', 'data scientists',
        'designer', 'designers',
        'marketer', 'marketers', 'marketing',
        'founder', 'founders',
        'operator', 'operators',
        'analyst', 'analysts',
        'leader', 'leaders',
        'director', 'directors',
        'manager', 'managers',
        'executive', 'executives',
        'developer', 'developers',
        'architect', 'architects',
        'specialist', 'specialists',
        'consultant', 'consultants',
        'advisor', 'advisors',
        'officer', 'officers',
        'strategist', 'strategists',
      ];
      
      roleKeywords.forEach((keyword) => {
        if (bestForLower.includes(keyword)) {
          // Normalize to singular form for consistency
          const normalized = keyword.replace(/s$/, '');
          if (normalized === 'pm' || normalized === 'pms') {
            roles.add('Product Manager');
          } else if (normalized === 'engineer' || normalized === 'engineers') {
            roles.add('Engineer');
          } else if (normalized === 'data scientist' || normalized === 'data scientists') {
            roles.add('Data Scientist');
          } else {
            // Capitalize first letter
            roles.add(normalized.charAt(0).toUpperCase() + normalized.slice(1));
          }
        }
      });
      });
    }
  });
  
  return Array.from(roles).sort();
}

/**
 * Get courses that match a track (category)
 * Filters by isLive if specified (defaults to true - only live courses)
 */
function getCoursesForTrack(track: string, onlyLive: boolean = true): string[] {
  return Object.values(courseMetadata)
    .filter((course) => {
      // Check track match
      if (course.category !== track) return false;
      // Check if live (defaults to true if not specified)
      if (onlyLive && course.isLive === false) return false;
      return true;
    })
    .map((course) => course.slug);
}

/**
 * Get courses that match an industry
 * Filters by isLive if specified (defaults to true - only live courses)
 */
function getCoursesForIndustry(industry: string, onlyLive: boolean = true): string[] {
  return Object.values(courseMetadata)
    .filter((course) => {
      const courseIndustries = course.industries || [];
      // Check industry match (industry is string; courseIndustries may be a typed union)
      if (!(courseIndustries as readonly string[]).includes(industry)) return false;
      // Check if live (defaults to true if not specified)
      if (onlyLive && course.isLive === false) return false;
      return true;
    })
    .map((course) => course.slug);
}

/**
 * Get courses that match a job role (bestFor contains role keywords)
 * Filters by isLive if specified (defaults to true - only live courses)
 * Handles bestFor as both string and array
 */
function getCoursesForRole(role: string, onlyLive: boolean = true): string[] {
  const roleLower = role.toLowerCase();
  const roleKeywords = roleLower.split(' ');
  
  return Object.values(courseMetadata)
    .filter((course) => {
      if (!course.bestFor) return false;
      
      // Handle bestFor as string or array
      const bestForArray = Array.isArray(course.bestFor) 
        ? course.bestFor 
        : [course.bestFor];
      
      // Check if any role keyword appears in any bestFor entry
      const matches = bestForArray.some((bestForEntry) => {
        const bestForLower = String(bestForEntry).toLowerCase();
        return roleKeywords.some((keyword) => bestForLower.includes(keyword));
      });
      
      if (!matches) return false;
      
      // Check if live (defaults to true if not specified)
      if (onlyLive && course.isLive === false) return false;
      
      return true;
    })
    .map((course) => course.slug);
}

/**
 * Get hero image URL for a track
 * Uses the hero image resolver to get image by track display name (normalized to slug)
 */
function getTrackHeroImage(track: string): string {
  // Normalize track name to slug format
  const trackSlug = track.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return getTrackHeroImageFromResolver(trackSlug);
}

/**
 * Get hero image URL for an industry
 * Uses the hero image resolver to get image by industry display name (normalized to slug)
 */
function getIndustryHeroImage(industry: string): string {
  // Normalize industry name to slug format
  const industrySlug = industry.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return getIndustryHeroImageFromResolver(industrySlug);
}

/**
 * Get hero image URL for a job role
 * Uses the hero image resolver to get image by role display name (normalized to slug)
 */
function getRoleHeroImage(role: string): string {
  // Normalize role name to slug format
  const roleSlug = role.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return getRoleHeroImageFromResolver(roleSlug);
}

/**
 * Generate description for a track segment
 */
function getTrackDescription(track: string, courseCount: number): string {
  return `Explore ${courseCount} course${courseCount !== 1 ? 's' : ''} in ${track}. Master the skills and frameworks you need to build production-ready systems.`;
}

/**
 * Generate description for an industry segment
 */
function getIndustryDescription(industry: string, courseCount: number): string {
  return `Discover ${courseCount} course${courseCount !== 1 ? 's' : ''} tailored for ${industry}. Learn industry-specific AI applications and best practices.`;
}

/**
 * Generate description for a role segment
 */
function getRoleDescription(role: string, courseCount: number): string {
  return `Access ${courseCount} course${courseCount !== 1 ? 's' : ''} designed for ${role}s. Build the skills and knowledge you need to excel in your role.`;
}

/**
 * Get all segments of a specific type
 */
export function getSegmentsByType(type: SegmentType): Segment[] {
  const segments: Segment[] = [];
  
  if (type === 'track') {
    const tracks = getAllTracks();
    tracks.forEach((track) => {
      const courseSlugs = getCoursesForTrack(track);
      if (courseSlugs.length > 0) {
        segments.push({
          type: 'track',
          key: getSegmentKey('track', track),
          displayName: track,
          heroImageUrl: getTrackHeroImage(track),
          description: getTrackDescription(track, courseSlugs.length),
          includedCourseSlugs: courseSlugs,
        });
      }
    });
  } else if (type === 'industry') {
    INDUSTRIES.forEach((industry) => {
      const courseSlugs = getCoursesForIndustry(industry);
      if (courseSlugs.length > 0) {
        segments.push({
          type: 'industry',
          key: getSegmentKey('industry', industry),
          displayName: industry,
          heroImageUrl: getIndustryHeroImage(industry),
          description: getIndustryDescription(industry, courseSlugs.length),
          includedCourseSlugs: courseSlugs,
        });
      }
    });
  } else if (type === 'role') {
    const roles = getAllJobRoles();
    roles.forEach((role) => {
      const courseSlugs = getCoursesForRole(role);
      if (courseSlugs.length > 0) {
        segments.push({
          type: 'role',
          key: getSegmentKey('role', role),
          displayName: role,
          heroImageUrl: getRoleHeroImage(role),
          description: getRoleDescription(role, courseSlugs.length),
          includedCourseSlugs: courseSlugs,
        });
      }
    });
  }
  
  return segments;
}

/**
 * Get a specific segment by type and key
 */
export function getSegment(type: SegmentType, key: string): Segment | null {
  const segments = getSegmentsByType(type);
  return segments.find((s) => s.key === key) || null;
}

/**
 * Get all segments (all types)
 */
export function getAllSegments(): Segment[] {
  return [
    ...getSegmentsByType('track'),
    ...getSegmentsByType('industry'),
    ...getSegmentsByType('role'),
  ];
}
