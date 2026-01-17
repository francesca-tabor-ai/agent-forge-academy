/**
 * Extract course metadata from MD files
 * Hybrid approach: checks _COURSE_METADATA.md first, then falls back to other files
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getAllCourseSlugs } from '../lessons';
import { courseMetadata } from '../course-metadata';
import type {
  CourseMetadata,
  RawCourseMetadata,
  CourseMetadataSource,
} from './types';
import { normalizeCourseMetadata, validateCourseMetadata } from './validate';

const DEFAULT_CONTENT_DIR = path.join(process.cwd(), 'course');

/**
 * Metadata file names to check in order of preference
 */
const METADATA_FILE_PRIORITY = [
  '_COURSE_METADATA.md',
  'INDEX.md',
  '_COURSE_OVERVIEW.md',
  'README.md',
];

/**
 * Extract metadata from a specific course directory
 */
export function extractCourseMetadata(
  courseSlug: string,
  contentDir: string = DEFAULT_CONTENT_DIR
): CourseMetadataSource | null {
  const courseDir = path.join(contentDir, courseSlug);

  if (!fs.existsSync(courseDir) || !fs.statSync(courseDir).isDirectory()) {
    return null;
  }

  // Try to find metadata in priority order
  for (const metadataFile of METADATA_FILE_PRIORITY) {
    const filePath = path.join(courseDir, metadataFile);
    if (fs.existsSync(filePath)) {
      try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContents);

        // If we found _COURSE_METADATA.md, use it directly
        if (metadataFile === '_COURSE_METADATA.md') {
          const rawMetadata: RawCourseMetadata = data;
          const normalized = normalizeCourseMetadata(rawMetadata, courseSlug);
          // Preserve additional fields (outcome, build, bestFor) that aren't in CourseMetadata type
          const metadataWithExtras = {
            ...normalized,
            // Preserve outcome, build, bestFor from raw metadata if they exist
            ...(data.outcome && { outcome: String(data.outcome) }),
            ...(data.build && { build: String(data.build) }),
            ...(data.bestFor && { bestFor: String(data.bestFor) }),
          };
          return {
            courseSlug,
            sourceFile: metadataFile,
            metadata: metadataWithExtras as any, // Cast to any to allow extra fields
          };
        }

        // For other files, extract what we can from frontmatter
        // Only use if it has course-relevant fields
        if (data.title || data.description || data.difficulty_level) {
          const rawMetadata: RawCourseMetadata = {
            title: data.title,
            description: data.description,
            difficulty_level: data.difficulty_level,
            duration_weeks: data.duration_weeks,
            is_published: data.is_published,
            thumbnail_url: data.thumbnail_url,
            imageUrl: data.imageUrl,
            category: data.category,
          };
          const normalized = normalizeCourseMetadata(rawMetadata, courseSlug);
          return {
            courseSlug,
            sourceFile: metadataFile,
            metadata: normalized,
          };
        }
      } catch (error) {
        console.warn(`Error reading ${filePath}:`, error);
        // Continue to next file
      }
    }
  }

  // Fallback: Try to get metadata from course-metadata.ts
  const legacyMetadata = courseMetadata[courseSlug];
  if (legacyMetadata) {
    // Convert legacy format to new format
    // Estimate duration_weeks from time string
    let durationWeeks: number | null = null;
    if (legacyMetadata.time) {
      const timeMatch = legacyMetadata.time.match(/(\d+)[-–]?(\d+)?\s*(week|hour)/i);
      if (timeMatch) {
        const num = parseInt(timeMatch[1], 10);
        if (timeMatch[3].toLowerCase() === 'week') {
          durationWeeks = num;
        } else if (timeMatch[3].toLowerCase() === 'hour') {
          // Estimate: ~10 hours per week
          durationWeeks = Math.ceil(num / 10);
        }
      }
    }

    // Estimate difficulty from category/content
    let difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | null = null;
    if (legacyMetadata.time?.includes('week')) {
      const weeks = durationWeeks || 0;
      if (weeks >= 8) {
        difficultyLevel = 'advanced';
      } else if (weeks >= 4) {
        difficultyLevel = 'intermediate';
      } else {
        difficultyLevel = 'beginner';
      }
    }

    const normalized: CourseMetadata = {
      slug: courseSlug,
      title: legacyMetadata.title,
      description: legacyMetadata.outcome || null,
      thumbnail_url: null,
      imageUrl: legacyMetadata.imageUrl,
      duration_weeks: durationWeeks,
      difficulty_level: difficultyLevel,
      is_published: true, // Assume published if in legacy metadata
      is_live: true, // Assume live when published in legacy format
      industries: legacyMetadata.industries || [],
      category: legacyMetadata.category,
    };

    return {
      courseSlug,
      sourceFile: 'course-metadata.ts (legacy)',
      metadata: normalized,
    };
  }

  // Last resort: Create minimal metadata from directory name
  const title = courseSlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    courseSlug,
    sourceFile: 'generated (no metadata found)',
    metadata: {
      slug: courseSlug,
      title,
      description: null,
      thumbnail_url: null,
      imageUrl: undefined,
      duration_weeks: null,
      difficulty_level: null,
      is_published: false, // Not published by default if no metadata
      is_live: false, // Not live when no metadata found
      industries: [], // Default to empty array if no metadata found
      category: '',
    },
  };
}

/**
 * Extract metadata from all courses
 */
export function extractAllCourseMetadata(
  contentDir: string = DEFAULT_CONTENT_DIR
): CourseMetadataSource[] {
  const courseSlugs = getAllCourseSlugs(contentDir);
  const results: CourseMetadataSource[] = [];

  for (const slug of courseSlugs) {
    const metadata = extractCourseMetadata(slug, contentDir);
    if (metadata) {
      results.push(metadata);
    }
  }

  return results;
}

/**
 * Validate all extracted metadata
 */
export function validateAllCourseMetadata(
  metadataSources: CourseMetadataSource[]
): Array<{
  source: CourseMetadataSource;
  validation: ReturnType<typeof validateCourseMetadata>;
}> {
  return metadataSources.map((source) => ({
    source,
    validation: validateCourseMetadata(
      source.metadata as unknown as RawCourseMetadata,
      source.courseSlug
    ),
  }));
}
