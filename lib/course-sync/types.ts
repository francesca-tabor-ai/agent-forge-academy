/**
 * Types for course synchronization system
 * Syncs course metadata from MD files to Supabase
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Course metadata as stored in Supabase
 */
export interface CourseMetadata {
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_weeks: number | null;
  difficulty_level: DifficultyLevel | null;
  is_published: boolean;
  industries: string[];
  // Optional fields for tracking
  category?: string; // Not in DB yet, but useful for metadata
  imageUrl?: string; // Optional direct image URL (takes precedence over thumbnail_url)
}

/**
 * Raw metadata extracted from MD files
 * May have additional fields that need to be normalized
 */
export interface RawCourseMetadata {
  slug?: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  imageUrl?: string;
  duration_weeks?: number | string;
  difficulty_level?: string;
  is_published?: boolean | string;
  category?: string;
  [key: string]: unknown; // Allow other fields
}

/**
 * Validation result for course metadata
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Result of syncing courses to database
 */
export interface SyncResult {
  created: CourseMetadata[];
  updated: CourseMetadata[];
  deleted: CourseMetadata[];
  unchanged: CourseMetadata[];
  errors: Array<{
    course: string;
    error: string;
  }>;
  summary: {
    total: number;
    created: number;
    updated: number;
    deleted: number;
    unchanged: number;
    errors: number;
  };
}

/**
 * Options for sync operation
 */
export interface SyncOptions {
  dryRun?: boolean;
  deleteMissing?: boolean; // Delete courses from DB that don't exist in files
  skipValidation?: boolean;
}

/**
 * Course metadata source information
 */
export interface CourseMetadataSource {
  courseSlug: string;
  sourceFile: string; // Which file the metadata came from
  metadata: CourseMetadata;
}
