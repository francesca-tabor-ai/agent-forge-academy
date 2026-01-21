-- Combined migration file for jobs table and seed data
-- Run this file if you want to execute both migrations at once

-- ============================================
-- Migration 1: Create jobs table
-- ============================================

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
  location VARCHAR(255),
  is_remote BOOLEAN NOT NULL DEFAULT false,
  salary_range VARCHAR(100),
  status job_status NOT NULL DEFAULT 'recommended',
  matching_score INTEGER DEFAULT 0,
  skills TEXT[] NOT NULL,
  skills_missing TEXT[],
  recommended_for_courses TEXT[],
  external_url TEXT,
  application_deadline TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_matching_score ON jobs(matching_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Create trigger
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Students can view active jobs" ON jobs;
CREATE POLICY "Students can view active jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (is_active = true);

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

-- ============================================
-- Migration 2: Seed jobs data
-- ============================================

-- Only insert if table is empty (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM jobs LIMIT 1) THEN
    INSERT INTO jobs (title, company, description, job_type, experience_level, location, is_remote, salary_range, status, matching_score, skills, skills_missing, recommended_for_courses, external_url, is_featured) VALUES
    ('Senior AI Engineer', 'Tech Corp', 'Lead development of AI-powered products using multi-agent systems, RAG, and LLMs. Work on cutting-edge agentic commerce solutions and help shape product strategy.', 'full_time', 'senior', 'San Francisco, CA', true, '$150k - $200k', 'new', 85, ARRAY['Multi-Agent Systems', 'RAG', 'LLMs', 'Product Strategy'], NULL, ARRAY['multi-agent-systems', 'agentic-rag', 'agentic-commerce'], 'https://example.com/jobs/senior-ai-engineer', true),
    ('AI Product Manager', 'StartupXYZ', 'Drive product strategy for AI-powered commerce platforms. Collaborate with engineering teams to build agentic commerce solutions that transform customer experiences.', 'full_time', 'mid', 'Remote', true, '$120k - $160k', 'unlocked', 72, ARRAY['Agentic Commerce', 'Product Strategy', 'AI/ML'], NULL, ARRAY['agentic-commerce', 'conversational-commerce-intelligence'], 'https://example.com/jobs/ai-product-manager', false),
    ('ML Engineer', 'DataCo', 'Build and deploy recommender systems and ML models at scale. Work with Python, TensorFlow, and modern ML infrastructure to power personalized experiences.', 'full_time', 'mid', 'New York, NY', false, '$130k - $170k', 'recommended', 68, ARRAY['Recommender Systems', 'Python', 'TensorFlow'], NULL, ARRAY['ai-recommender-systems', 'multi-agent-systems'], 'https://example.com/jobs/ml-engineer', false),
    ('AI Content Engineer', 'MediaFlow', 'Design and implement AI-driven content pipelines for automated content generation. Work with synthetic media and video generation technologies.', 'full_time', 'mid', 'Remote', true, '$110k - $150k', 'recommended', 65, ARRAY['AI Content Pipelines', 'Synthetic Media', 'Video Generation'], NULL, ARRAY['ai-content-pipelines', 'ai-driven-video-synthetic-media'], 'https://example.com/jobs/ai-content-engineer', false),
    ('Conversational AI Developer', 'ChatTech', 'Build intelligent conversational commerce systems using LLMs and agentic architectures. Create engaging customer experiences through AI-powered chat interfaces.', 'full_time', 'mid', 'Austin, TX', true, '$125k - $165k', 'unlocked', 70, ARRAY['Conversational AI', 'LLMs', 'Agentic Systems'], NULL, ARRAY['conversational-commerce-intelligence', 'multi-agent-systems'], 'https://example.com/jobs/conversational-ai-developer', false),
    ('3D Commerce Engineer', 'ImmersiveRetail', 'Develop 3D product experiences for e-commerce platforms. Work with Amazon 3D ASIN integration and optimize 3D assets for web performance.', 'full_time', 'mid', 'Seattle, WA', false, '$140k - $180k', 'recommended', 60, ARRAY['3D Graphics', 'E-commerce', 'Amazon Integration'], NULL, ARRAY['3d-for-ecommerce'], 'https://example.com/jobs/3d-commerce-engineer', false),
    ('AI Visibility Specialist', 'GrowthAI', 'Optimize AI-powered content for search engines and platforms like Reddit. Build systems for AI-driven SEO and content distribution.', 'full_time', 'mid', 'Remote', true, '$100k - $140k', 'recommended', 58, ARRAY['SEO', 'Content Strategy', 'AI Optimization'], NULL, ARRAY['ai-visibility', 'reddit-ai-visibility', 'seo-to-aeo'], 'https://example.com/jobs/ai-visibility-specialist', false),
    ('AI Research Scientist', 'ResearchLab', 'Conduct cutting-edge research in multi-agent systems, RAG, and LLMs. Publish papers and contribute to open-source AI projects.', 'full_time', 'senior', 'Cambridge, MA', false, '$180k - $250k', 'stretch', 45, ARRAY['Multi-Agent Systems', 'RAG', 'LLMs', 'Research'], ARRAY['Research', 'Advanced ML'], ARRAY['multi-agent-systems', 'agentic-rag'], 'https://example.com/jobs/ai-research-scientist', false),
    ('Head of AI Products', 'EnterpriseAI', 'Lead AI product strategy and development for enterprise customers. Build and manage teams working on agentic systems and AI-native applications.', 'full_time', 'lead', 'Remote', true, '$200k - $300k', 'stretch', 40, ARRAY['Product Strategy', 'Team Leadership', 'AI/ML'], ARRAY['Team Leadership', 'Enterprise Experience'], ARRAY['agentic-commerce', 'multi-agent-systems'], 'https://example.com/jobs/head-of-ai-products', false),
    ('Senior ML Engineer', 'BigTech', 'Build large-scale ML systems using deep learning frameworks. Work on distributed systems and production ML infrastructure.', 'full_time', 'senior', 'Mountain View, CA', false, '$200k - $280k', 'locked', 30, ARRAY['Deep Learning', 'PyTorch', 'Distributed Systems'], ARRAY['Deep Learning', 'PyTorch'], ARRAY['ai-recommender-systems'], 'https://example.com/jobs/senior-ml-engineer', false),
    ('LLM Infrastructure Engineer', 'CloudAI', 'Design and build infrastructure for deploying LLMs at scale. Optimize inference pipelines and manage GPU clusters.', 'full_time', 'senior', 'Remote', true, '$180k - $240k', 'locked', 35, ARRAY['LLM Infrastructure', 'GPU Computing', 'Distributed Systems'], ARRAY['GPU Computing', 'Infrastructure'], ARRAY['agentic-rag', 'multi-agent-systems'], 'https://example.com/jobs/llm-infrastructure-engineer', false),
    ('AI Governance Specialist', 'ComplianceAI', 'Help organizations navigate AI regulations including EU AI Act. Build compliance frameworks and governance systems for AI products.', 'full_time', 'mid', 'Brussels, Belgium', true, '$100k - $140k', 'recommended', 55, ARRAY['AI Governance', 'Compliance', 'Regulations'], NULL, ARRAY['ai-governance-eu-ai-act'], 'https://example.com/jobs/ai-governance-specialist', false),
    ('Hyper-Personalization Engineer', 'PersonalizeAI', 'Build hyper-personalized marketing and advertising systems using AI. Create recommendation engines and personalization algorithms.', 'full_time', 'mid', 'Remote', true, '$130k - $170k', 'recommended', 62, ARRAY['Personalization', 'Marketing AI', 'Recommendation Systems'], NULL, ARRAY['hyper-personalised-marketing-advertising', 'ai-recommender-systems'], 'https://example.com/jobs/hyper-personalization-engineer', false),
    ('AI-Native Software Architect', 'NextGenDev', 'Design and build AI-native software delivery pipelines. Work with spec-driven development and agentic DevOps practices.', 'full_time', 'senior', 'Remote', true, '$160k - $210k', 'unlocked', 75, ARRAY['AI-Native Development', 'Spec-Driven Development', 'DevOps'], NULL, ARRAY['ai-native-software-delivery-pipelines', 'spec-driven-development'], 'https://example.com/jobs/ai-native-software-architect', true),
    ('Prompt Engineering Lead', 'PromptStudio', 'Lead prompt engineering initiatives and develop advanced reasoning techniques. Build prompt libraries and optimize LLM interactions.', 'full_time', 'mid', 'Remote', true, '$120k - $160k', 'recommended', 70, ARRAY['Prompt Engineering', 'LLMs', 'Advanced Reasoning'], NULL, ARRAY['prompt-engineering'], 'https://example.com/jobs/prompt-engineering-lead', false);
  END IF;
END $$;
