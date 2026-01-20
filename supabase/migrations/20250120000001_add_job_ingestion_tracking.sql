-- Migration: Add job ingestion tracking and fingerprinting
-- Supports low-quota job ingestion system with deduplication

-- Add fingerprinting and tracking fields to jobs table
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS external_job_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS job_fingerprint VARCHAR(64) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source_cluster VARCHAR(50);

-- Create index on fingerprint for fast deduplication lookups
CREATE INDEX IF NOT EXISTS idx_jobs_fingerprint ON jobs(job_fingerprint);
CREATE INDEX IF NOT EXISTS idx_jobs_external_id ON jobs(external_job_id) WHERE external_job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_source_cluster ON jobs(source_cluster) WHERE source_cluster IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_first_seen_at ON jobs(first_seen_at DESC);

-- Create job_ingestion_state table for tracking rotation and quota
CREATE TABLE IF NOT EXISTS job_ingestion_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_cluster_index INTEGER NOT NULL DEFAULT 0,
  monthly_request_count INTEGER NOT NULL DEFAULT 0,
  monthly_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_run_at TIMESTAMPTZ,
  last_run_cluster VARCHAR(50),
  last_run_new_jobs_count INTEGER DEFAULT 0,
  should_skip_next_run BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Insert initial state (single row)
INSERT INTO job_ingestion_state (id, current_cluster_index, monthly_request_count, monthly_reset_date)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 0, 0, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Create job_ingestion_runs table for logging each run
CREATE TABLE IF NOT EXISTS job_ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cluster_name VARCHAR(50) NOT NULL,
  query_used TEXT NOT NULL,
  api_requests_made INTEGER NOT NULL DEFAULT 1,
  jobs_fetched INTEGER NOT NULL DEFAULT 0,
  jobs_new INTEGER NOT NULL DEFAULT 0,
  jobs_updated INTEGER NOT NULL DEFAULT 0,
  jobs_errors INTEGER NOT NULL DEFAULT 0,
  monthly_request_count_after INTEGER NOT NULL,
  was_skipped BOOLEAN NOT NULL DEFAULT false,
  skip_reason TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for ingestion runs
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_run_at ON job_ingestion_runs(run_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_cluster ON job_ingestion_runs(cluster_name);

-- Create trigger to update updated_at for job_ingestion_state
DROP TRIGGER IF EXISTS update_ingestion_state_updated_at ON job_ingestion_state;
CREATE TRIGGER update_ingestion_state_updated_at
  BEFORE UPDATE ON job_ingestion_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE job_ingestion_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_ingestion_runs ENABLE ROW LEVEL SECURITY;

-- RLS: Only service role can access ingestion state
DROP POLICY IF EXISTS "Service role can manage ingestion state" ON job_ingestion_state;
CREATE POLICY "Service role can manage ingestion state"
  ON job_ingestion_state
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS: Authenticated users can read ingestion runs (for monitoring)
DROP POLICY IF EXISTS "Authenticated users can read ingestion runs" ON job_ingestion_runs;
CREATE POLICY "Authenticated users can read ingestion runs"
  ON job_ingestion_runs
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS: Service role can manage ingestion runs
DROP POLICY IF EXISTS "Service role can manage ingestion runs" ON job_ingestion_runs;
CREATE POLICY "Service role can manage ingestion runs"
  ON job_ingestion_runs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
