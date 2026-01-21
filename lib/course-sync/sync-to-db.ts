/**
 * Sync course metadata to Supabase database
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CourseMetadata,
  SyncResult,
  SyncOptions,
} from './types';
import { extractAllCourseMetadata } from './extract-metadata';
import { validateCourseMetadata } from './validate';

/**
 * Get all courses from database
 */
async function getDatabaseCourses(
  supabase: SupabaseClient
): Promise<Map<string, CourseMetadata>> {
  const { data, error } = await supabase
    .from('courses')
    .select('slug, title, description, thumbnail_url, duration_weeks, difficulty_level, is_published, is_live, industries')
    .order('slug');

  if (error) {
    throw new Error(`Failed to fetch courses from database: ${error.message}`);
  }

  const coursesMap = new Map<string, CourseMetadata>();
  if (data) {
    for (const course of data) {
      // Map database snake_case to TypeScript camelCase
      coursesMap.set(course.slug, {
        slug: course.slug,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnail_url || null, // Map thumbnail_url -> thumbnailUrl
        duration_weeks: course.duration_weeks,
        difficulty_level: course.difficulty_level,
        is_published: course.is_published,
        is_live: course.is_live ?? course.is_published ?? false, // Default to is_published if is_live is null/undefined
        industries: course.industries || [],
      });
    }
  }

  return coursesMap;
}

/**
 * Compare two course metadata objects to determine if they're different
 */
function coursesAreDifferent(
  fileMetadata: CourseMetadata,
  dbMetadata: CourseMetadata
): boolean {
  // Compare industries arrays (order doesn't matter)
  const fileIndustries = (fileMetadata.industries || []).sort().join(',');
  const dbIndustries = (dbMetadata.industries || []).sort().join(',');
  
  // Compare best_for arrays (order doesn't matter)
  const fileBestFor = (fileMetadata.best_for || []).sort().join(',');
  const dbBestFor = (dbMetadata.best_for || []).sort().join(',');
  
  return (
    fileMetadata.title !== dbMetadata.title ||
    fileMetadata.description !== dbMetadata.description ||
    fileMetadata.thumbnailUrl !== dbMetadata.thumbnailUrl || // Use camelCase
    fileMetadata.duration_weeks !== dbMetadata.duration_weeks ||
    fileMetadata.difficulty_level !== dbMetadata.difficulty_level ||
    fileMetadata.is_published !== dbMetadata.is_published ||
    (fileMetadata.is_live !== undefined ? fileMetadata.is_live : fileMetadata.is_published) !== (dbMetadata.is_live !== undefined ? dbMetadata.is_live : dbMetadata.is_published) ||
    (fileMetadata.category || null) !== (dbMetadata.category || null) ||
    fileIndustries !== dbIndustries ||
    fileBestFor !== dbBestFor
  );
}

/**
 * Sync courses from filesystem to database
 */
export async function syncCoursesToDatabase(
  supabase: SupabaseClient,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const { dryRun = false, deleteMissing = false, skipValidation = false } = options;

  // Extract metadata from files
  const fileMetadataSources = extractAllCourseMetadata();
  const fileMetadataMap = new Map<string, CourseMetadata>();
  
  for (const source of fileMetadataSources) {
    fileMetadataMap.set(source.courseSlug, source.metadata);
  }

  // Get existing courses from database
  const dbCoursesMap = await getDatabaseCourses(supabase);

  const result: SyncResult = {
    created: [],
    updated: [],
    deleted: [],
    unchanged: [],
    errors: [],
    summary: {
      total: fileMetadataSources.length,
      created: 0,
      updated: 0,
      deleted: 0,
      unchanged: 0,
      errors: 0,
    },
  };

  // Validate all metadata before syncing
  if (!skipValidation) {
    for (const source of fileMetadataSources) {
      const validation = validateCourseMetadata(
        source.metadata as unknown as any,
        source.courseSlug
      );
      
      if (!validation.valid) {
        result.errors.push({
          course: source.courseSlug,
          error: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`,
        });
        result.summary.errors++;
        continue;
      }
    }
  }

  // Process each course from files
  for (const source of fileMetadataSources) {
    const fileMetadata = source.metadata;
    const dbMetadata = dbCoursesMap.get(fileMetadata.slug);

    if (!dbMetadata) {
      // New course - needs to be created
      if (!dryRun) {
        const { error } = await supabase
          .from('courses')
          .insert({
            slug: fileMetadata.slug,
            title: fileMetadata.title,
            description: fileMetadata.description,
            thumbnail_url: fileMetadata.thumbnailUrl, // Map thumbnailUrl -> thumbnail_url for DB
            duration_weeks: fileMetadata.duration_weeks,
            difficulty_level: fileMetadata.difficulty_level,
            is_published: fileMetadata.is_published,
            is_live: fileMetadata.is_live !== undefined ? fileMetadata.is_live : fileMetadata.is_published, // Default to published status
            industries: fileMetadata.industries || [],
            category: fileMetadata.category || null,
            best_for: fileMetadata.best_for || [],
          });

        if (error) {
          result.errors.push({
            course: fileMetadata.slug,
            error: `Failed to create: ${error.message}`,
          });
          result.summary.errors++;
          continue;
        }
      }

      result.created.push(fileMetadata);
      result.summary.created++;
    } else if (coursesAreDifferent(fileMetadata, dbMetadata)) {
      // Existing course - needs to be updated
      if (!dryRun) {
        const { error } = await supabase
          .from('courses')
          .update({
            title: fileMetadata.title,
            description: fileMetadata.description,
            thumbnail_url: fileMetadata.thumbnailUrl, // Map thumbnailUrl -> thumbnail_url for DB
            duration_weeks: fileMetadata.duration_weeks,
            difficulty_level: fileMetadata.difficulty_level,
            is_published: fileMetadata.is_published,
            is_live: fileMetadata.is_live !== undefined ? fileMetadata.is_live : fileMetadata.is_published, // Default to published status
            industries: fileMetadata.industries || [],
            category: fileMetadata.category || null,
            best_for: fileMetadata.best_for || [],
            updated_at: new Date().toISOString(),
          })
          .eq('slug', fileMetadata.slug);

        if (error) {
          result.errors.push({
            course: fileMetadata.slug,
            error: `Failed to update: ${error.message}`,
          });
          result.summary.errors++;
          continue;
        }
      }

      result.updated.push(fileMetadata);
      result.summary.updated++;
    } else {
      // No changes needed
      result.unchanged.push(fileMetadata);
      result.summary.unchanged++;
    }

    // Remove from map to track what's left
    dbCoursesMap.delete(fileMetadata.slug);
  }

  // Handle courses that exist in DB but not in files
  if (deleteMissing && dbCoursesMap.size > 0) {
    for (const [slug, dbMetadata] of dbCoursesMap.entries()) {
      if (!dryRun) {
        const { error } = await supabase
          .from('courses')
          .delete()
          .eq('slug', slug);

        if (error) {
          result.errors.push({
            course: slug,
            error: `Failed to delete: ${error.message}`,
          });
          result.summary.errors++;
          continue;
        }
      }

      result.deleted.push(dbMetadata);
      result.summary.deleted++;
    }
  } else if (dbCoursesMap.size > 0) {
    // Just warn about missing courses, don't delete
    for (const [slug] of dbCoursesMap.entries()) {
      result.errors.push({
        course: slug,
        error: 'Course exists in database but not in filesystem (use deleteMissing option to remove)',
      });
    }
  }

  return result;
}
