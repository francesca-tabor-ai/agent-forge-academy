/**
 * Storage bucket configuration utilities
 */

/**
 * Get the resume/CV storage bucket name from environment variable
 * Defaults to 'resumes' if not set
 */
export function getResumeBucketName(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET || 'resumes';
}

/**
 * Get the portfolio files bucket name from environment variable
 * Defaults to 'portfolio-files' if not set (for backward compatibility)
 */
export function getPortfolioFilesBucketName(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_PORTFOLIO_FILES_BUCKET || 'portfolio-files';
}
