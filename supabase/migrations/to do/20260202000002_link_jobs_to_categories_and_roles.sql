-- Link jobs table to job categories and roles
-- Adds foreign key relationships and optional filter columns

-- ============================================================================
-- 1. ADD FOREIGN KEY COLUMNS TO JOBS TABLE
-- ============================================================================
-- Add category_id (optional - a job can belong to a primary category)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES job_categories(id) ON DELETE SET NULL;

-- Add role_id (optional - a job can have a primary role)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES job_roles(id) ON DELETE SET NULL;

-- ============================================================================
-- 2. ADD OPTIONAL FILTER COLUMNS
-- ============================================================================
-- Work arrangement filter (can complement or replace is_remote boolean)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS work_arrangement work_arrangement;

-- Seniority level filter (more granular than experience_level)
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS seniority_level seniority_level;

-- Company stage filter
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS company_stage company_stage;

-- Research vs Applied filter
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS research_focus research_focus;

-- AI specialization filter
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS ai_specialization ai_specialization;

-- ============================================================================
-- 3. CREATE INDEXES FOR FILTERING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_role_id ON jobs(role_id) WHERE role_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_work_arrangement ON jobs(work_arrangement) WHERE work_arrangement IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_seniority_level ON jobs(seniority_level) WHERE seniority_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_company_stage ON jobs(company_stage) WHERE company_stage IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_research_focus ON jobs(research_focus) WHERE research_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_ai_specialization ON jobs(ai_specialization) WHERE ai_specialization IS NOT NULL;

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_jobs_category_role ON jobs(category_id, role_id) 
  WHERE category_id IS NOT NULL AND role_id IS NOT NULL;

-- ============================================================================
-- 4. COMMENTS
-- ============================================================================
COMMENT ON COLUMN jobs.category_id IS 'Primary job category (for "Best for" filter)';
COMMENT ON COLUMN jobs.role_id IS 'Primary job role';
COMMENT ON COLUMN jobs.work_arrangement IS 'Optional filter: Remote / Hybrid / On-site';
COMMENT ON COLUMN jobs.seniority_level IS 'Optional filter: Junior / Mid / Senior / Principal';
COMMENT ON COLUMN jobs.company_stage IS 'Optional filter: Startup / Scaleup / Enterprise';
COMMENT ON COLUMN jobs.research_focus IS 'Optional filter: Research vs Applied';
COMMENT ON COLUMN jobs.ai_specialization IS 'Optional filter: Agentic / LLM / Multimodal / Classical ML';
