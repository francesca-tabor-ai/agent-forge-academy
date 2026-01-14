-- Add source tracking fields to portfolio_projects for deduplication
-- Allows tracking where projects came from (github, manual, etc.) and prevents duplicates

-- Add source and source_id columns
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS source VARCHAR(50),
  ADD COLUMN IF NOT EXISTS source_id TEXT; -- Using TEXT to support various ID types (GitHub uses numeric IDs as strings)

-- Create unique constraint for deduplication: (student_profile_id, source, source_id)
-- This ensures one project per source per student
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_projects_source_unique 
  ON portfolio_projects(student_profile_id, source, source_id)
  WHERE source IS NOT NULL AND source_id IS NOT NULL;

-- Add index for faster lookups by source
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_source 
  ON portfolio_projects(student_profile_id, source, source_id);

-- Add comment for documentation
COMMENT ON COLUMN portfolio_projects.source IS 'Source of the project: github, manual, etc.';
COMMENT ON COLUMN portfolio_projects.source_id IS 'External ID from the source (e.g., GitHub repo ID)';
