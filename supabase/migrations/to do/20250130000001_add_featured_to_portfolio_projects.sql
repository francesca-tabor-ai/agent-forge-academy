-- Add featured field to portfolio_projects
-- Allows users to pin 2-4 projects as "Featured" (LinkedIn-style)

-- Add featured column
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster queries of featured projects
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured 
  ON portfolio_projects(student_profile_id, featured)
  WHERE featured = true;

-- Add comment for documentation
COMMENT ON COLUMN portfolio_projects.featured IS 'Whether this project is featured (pinned) on the profile. Users can feature 2-4 projects.';
