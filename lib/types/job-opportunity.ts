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
  
  // Legacy camelCase fields for backward compatibility
  matchingScore?: number; // Alias for matching_score (will be normalized)
  skillsMissing?: string[]; // Alias for skills_missing
  
  // Legacy boolean flags (deprecated, use status instead)
  isLocked?: boolean;
  isStretch?: boolean;
};

/**
 * Normalizes a JobOpportunity to ensure matchingScore is always a number.
 * Use this when passing a job to components that require matchingScore.
 */
export function normalizeJobOpportunity(job: JobOpportunity | null): JobOpportunity | null {
  if (!job) return null;
  
  return {
    ...job,
    // Ensure matchingScore is always set from matching_score
    matchingScore: job.matching_score ?? job.matchingScore ?? 0,
    // Ensure skillsMissing is always set from skills_missing
    skillsMissing: job.skills_missing ?? job.skillsMissing ?? [],
  };
}
