-- Create jobs table for job opportunities
-- Provides job listings matched to student skills, courses, and portfolio

-- Create job status enum (idempotent)
DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('new', 'unlocked', 'recommended', 'locked', 'stretch');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create job type enum (idempotent)
DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create experience level enum (idempotent)
DO $$ BEGIN
    CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'lead', 'executive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  job_type job_type NOT NULL,
  experience_level experience_level NOT NULL,
  location VARCHAR(255), -- e.g., "Remote", "San Francisco, CA", "London, UK"
  is_remote BOOLEAN NOT NULL DEFAULT false,
  salary_range VARCHAR(100), -- e.g., "$100k - $150k", "£50k - £70k"
  status job_status NOT NULL DEFAULT 'recommended',
  matching_score INTEGER DEFAULT 0, -- 0-100 match score
  skills TEXT[] NOT NULL, -- Array of required/relevant skills
  skills_missing TEXT[], -- Array of missing skills (for locked/stretch roles)
  recommended_for_courses TEXT[], -- Array of course slugs that prepare for this job
  external_url TEXT, -- Link to apply
  application_deadline TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false, -- Can be manually flagged
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_matching_score ON jobs(matching_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Create trigger to update updated_at (idempotent)
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can read active jobs
-- Use DROP POLICY IF EXISTS to make this idempotent
DROP POLICY IF EXISTS "Students can view active jobs" ON jobs;
CREATE POLICY "Students can view active jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can manage all jobs
DROP POLICY IF EXISTS "Admins can manage jobs" ON jobs;
CREATE POLICY "Admins can manage jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
