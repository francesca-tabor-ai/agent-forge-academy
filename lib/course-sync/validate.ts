/**
 * Validation utilities for course metadata
 */

import type {
  CourseMetadata,
  RawCourseMetadata,
  ValidationResult,
  DifficultyLevel,
} from './types';

const VALID_DIFFICULTY_LEVELS: DifficultyLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
];

/**
 * Validates course metadata
 */
export function validateCourseMetadata(
  metadata: RawCourseMetadata,
  courseSlug: string
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];
  const warnings: Array<{ field: string; message: string }> = [];

  // Required fields
  if (!metadata.title || typeof metadata.title !== 'string' || metadata.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required and must be a non-empty string',
    });
  }

  // Slug validation
  if (metadata.slug && metadata.slug !== courseSlug) {
    warnings.push({
      field: 'slug',
      message: `Slug in metadata (${metadata.slug}) doesn't match directory name (${courseSlug}). Using directory name.`,
    });
  }

  // Duration validation
  if (metadata.duration_weeks !== undefined && metadata.duration_weeks !== null) {
    const duration = typeof metadata.duration_weeks === 'string'
      ? parseInt(metadata.duration_weeks, 10)
      : metadata.duration_weeks;
    
    if (isNaN(duration) || duration < 0) {
      errors.push({
        field: 'duration_weeks',
        message: 'duration_weeks must be a positive number',
      });
    }
  }

  // Difficulty level validation
  if (metadata.difficulty_level !== undefined && metadata.difficulty_level !== null) {
    const difficulty = String(metadata.difficulty_level).toLowerCase();
    if (!VALID_DIFFICULTY_LEVELS.includes(difficulty as DifficultyLevel)) {
      errors.push({
        field: 'difficulty_level',
        message: `difficulty_level must be one of: ${VALID_DIFFICULTY_LEVELS.join(', ')}`,
      });
    }
  }

  // is_published validation
  if (metadata.is_published !== undefined && metadata.is_published !== null) {
    const isPublished = typeof metadata.is_published === 'string'
      ? metadata.is_published.toLowerCase() === 'true'
      : Boolean(metadata.is_published);
    
    if (typeof isPublished !== 'boolean') {
      errors.push({
        field: 'is_published',
        message: 'is_published must be a boolean or string "true"/"false"',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Normalizes raw metadata to CourseMetadata format
 */
export function normalizeCourseMetadata(
  raw: RawCourseMetadata,
  courseSlug: string
): CourseMetadata {
  // Normalize difficulty level
  let difficultyLevel: DifficultyLevel | null = null;
  if (raw.difficulty_level) {
    const normalized = String(raw.difficulty_level).toLowerCase();
    if (VALID_DIFFICULTY_LEVELS.includes(normalized as DifficultyLevel)) {
      difficultyLevel = normalized as DifficultyLevel;
    }
  }

  // Normalize duration
  let durationWeeks: number | null = null;
  if (raw.duration_weeks !== undefined && raw.duration_weeks !== null) {
    const duration = typeof raw.duration_weeks === 'string'
      ? parseInt(raw.duration_weeks, 10)
      : raw.duration_weeks;
    if (!isNaN(duration) && duration >= 0) {
      durationWeeks = duration;
    }
  }

  // Normalize is_published
  let isPublished = false;
  if (raw.is_published !== undefined && raw.is_published !== null) {
    isPublished = typeof raw.is_published === 'string'
      ? raw.is_published.toLowerCase() === 'true'
      : Boolean(raw.is_published);
  }

  return {
    slug: courseSlug, // Always use directory name as source of truth
    title: String(raw.title || courseSlug).trim(),
    description: raw.description ? String(raw.description).trim() : null,
    thumbnail_url: raw.thumbnail_url ? String(raw.thumbnail_url).trim() : null,
    duration_weeks: durationWeeks,
    difficulty_level: difficultyLevel,
    is_published: isPublished,
    industries: Array.isArray(raw.industries) ? raw.industries.map(String) : [],
    category: raw.category ? String(raw.category).trim() : undefined,
  };
}
