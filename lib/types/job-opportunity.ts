/**
 * Shared JobOpportunity type used across all job-related components.
 * This ensures type consistency and prevents duplicate type definitions.
 * 
 * Fields support both snake_case (from API) and camelCase (legacy) for backward compatibility.
 */
export type JobOpportunity = {
  id: string;
  title: string;
  company: string;
  
  // Computed matching fields (from API)
  matching_score: number; // Primary field from API
  status: 'new' | 'unlocked' | 'recommended' | 'locked' | 'stretch';
  skills_missing: string[]; // Computed from API
  
  // Required skills
  skills: string[];
  
  // Optional fields
  explanation?: string; // Computed explanation from API
  job_type?: string;
  experience_level?: string;
  location?: string;
  is_remote?: boolean;
  salary_range?: string;
  category_id?: string | null; // For "Best for" filter
  
  // Legacy camelCase fields for backward compatibility
  matchingScore?: number; // Alias for matching_score (will be normalized)
  skillsMissing?: string[]; // Alias for skills_missing
  
  // Legacy boolean flags (deprecated, use status instead)
  isLocked?: boolean;
  isStretch?: boolean;
};

/**
 * Normalized JobOpportunity type with required matchingScore and skillsMissing.
 * Use this type for components that require these fields to be guaranteed.
 */
export type NormalizedJobOpportunity = Omit<JobOpportunity, 'matchingScore' | 'skillsMissing'> & {
  matchingScore: number; // Required, always set
  skillsMissing: string[]; // Required, always set
};

/**
 * Normalizes a JobOpportunity to ensure matchingScore and skillsMissing are always set.
 * Use this when passing a job to components that require these fields.
 * 
 * @returns NormalizedJobOpportunity with guaranteed matchingScore and skillsMissing, or null
 */
export function normalizeJobOpportunity(job: JobOpportunity | null): NormalizedJobOpportunity | null {
  if (!job) return null;
  
  return {
    ...job,
    // Ensure matchingScore is always set from matching_score
    matchingScore: job.matching_score ?? job.matchingScore ?? 0,
    // Ensure skillsMissing is always set from skills_missing
    skillsMissing: job.skills_missing ?? job.skillsMissing ?? [],
  };
}
