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
  thumbnailUrl: string | null; // camelCase for TypeScript/React (maps to thumbnail_url in DB)
  duration_weeks: number | null;
  difficulty_level: DifficultyLevel | null;
  is_published: boolean;
  is_live: boolean; // Indicates if course is live and available for enrollment
  industries: string[]; // Array of industry domains
  // Course overview fields
  outcome?: string[]; // Array of learning outcomes
  youll_build?: string[]; // Array of things students will build
  best_for?: string[]; // Array of target audiences (job roles)
  category?: string; // Course track/category (e.g., "Agentic Systems", "Vibe Engineering")
  imageUrl?: string; // Optional direct image URL (takes precedence over thumbnailUrl)
}

/**
 * Raw metadata extracted from MD files
 * May have additional fields that need to be normalized
 */
export interface RawCourseMetadata {
  slug?: string;
  title?: string;
  description?: string;
  thumbnail_url?: string; // Keep snake_case for raw data from MD files
  thumbnailUrl?: string; // Also accept camelCase
  imageUrl?: string;
  duration_weeks?: number | string;
  difficulty_level?: string;
  is_published?: boolean | string;
  is_live?: boolean | string; // Indicates if course is live
  category?: string; // Track/category
  industries?: string | string[]; // Industry domains (can be string or array)
  bestFor?: string | string[]; // Job roles (can be string or array)
  best_for?: string | string[]; // Alternative field name
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
