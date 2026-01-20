-- Create job categories and roles tables
-- Provides structured data for job filtering by category ("Best for") and specific roles

-- ============================================================================
-- 1. JOB CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE, -- e.g., "AI & Machine Learning"
  slug VARCHAR(255) NOT NULL UNIQUE, -- URL-friendly identifier
  description TEXT, -- e.g., "Core technical roles building models and intelligence"
  display_order INTEGER NOT NULL DEFAULT 0, -- For ordering in UI
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for job_categories
CREATE INDEX IF NOT EXISTS idx_job_categories_slug ON job_categories(slug);
CREATE INDEX IF NOT EXISTS idx_job_categories_display_order ON job_categories(display_order);
CREATE INDEX IF NOT EXISTS idx_job_categories_is_active ON job_categories(is_active) WHERE is_active = true;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_job_categories_updated_at ON job_categories;
CREATE TRIGGER update_job_categories_updated_at
  BEFORE UPDATE ON job_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. JOB ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES job_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- e.g., "Machine Learning Engineer"
  slug VARCHAR(255) NOT NULL, -- URL-friendly identifier
  display_order INTEGER NOT NULL DEFAULT 0, -- For ordering within category
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(category_id, slug) -- Ensure unique slug per category
);

-- Create indexes for job_roles
CREATE INDEX IF NOT EXISTS idx_job_roles_category_id ON job_roles(category_id);
CREATE INDEX IF NOT EXISTS idx_job_roles_slug ON job_roles(slug);
CREATE INDEX IF NOT EXISTS idx_job_roles_display_order ON job_roles(category_id, display_order);
CREATE INDEX IF NOT EXISTS idx_job_roles_is_active ON job_roles(is_active) WHERE is_active = true;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_job_roles_updated_at ON job_roles;
CREATE TRIGGER update_job_roles_updated_at
  BEFORE UPDATE ON job_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. OPTIONAL FILTER ENUMS
-- ============================================================================
-- These enums can be used to add filter columns to the jobs table later

-- Work arrangement filter
DO $$ BEGIN
    CREATE TYPE work_arrangement AS ENUM ('remote', 'hybrid', 'on_site');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Seniority level filter (more granular than experience_level)
DO $$ BEGIN
    CREATE TYPE seniority_level AS ENUM ('junior', 'mid', 'senior', 'principal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Company stage filter
DO $$ BEGIN
    CREATE TYPE company_stage AS ENUM ('startup', 'scaleup', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Research vs Applied filter
DO $$ BEGIN
    CREATE TYPE research_focus AS ENUM ('research', 'applied', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AI specialization filter
DO $$ BEGIN
    CREATE TYPE ai_specialization AS ENUM ('agentic', 'llm', 'multimodal', 'classical_ml', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 4. SEED DATA: JOB CATEGORIES
-- ============================================================================
INSERT INTO job_categories (name, slug, description, display_order) VALUES
  ('AI & Machine Learning', 'ai-machine-learning', 'Core technical roles building models and intelligence', 1),
  ('Data & Analytics', 'data-analytics', 'Data foundations that power AI systems', 2),
  ('AI Product & Strategy', 'ai-product-strategy', 'Roles translating AI capability into products and business value', 3),
  ('AI Agents & Automation', 'ai-agents-automation', 'Agentic systems, workflows, and autonomous operations', 4),
  ('Software Engineering (AI-Adjacent)', 'software-engineering-ai-adjacent', 'Engineering roles working closely with AI systems', 5),
  ('MLOps, DevOps & Infrastructure', 'mlops-devops-infrastructure', 'Scaling, deploying, and maintaining AI in production', 6),
  ('AI Research & Academia', 'ai-research-academia', 'Exploratory, experimental, and academic-facing roles', 7),
  ('Responsible AI, Ethics & Governance', 'responsible-ai-ethics-governance', 'Trust, safety, compliance, and societal impact', 8),
  ('Design & User Experience (AI)', 'design-user-experience-ai', 'Human-centered design for intelligent systems', 9),
  ('Sales, Marketing & Growth (AI)', 'sales-marketing-growth-ai', 'Commercializing AI products and platforms', 10),
  ('Operations, Finance & Legal (AI-Focused)', 'operations-finance-legal-ai', 'Business-critical roles adapted for AI companies', 11),
  ('Leadership & Executive', 'leadership-executive', 'Senior ownership of AI vision and execution', 12),
  ('Freelance, Contract & Advisory', 'freelance-contract-advisory', 'Flexible and advisory talent', 13)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 5. SEED DATA: JOB ROLES
-- ============================================================================

-- Category 1: AI & Machine Learning
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Machine Learning Engineer', 'machine-learning-engineer', 1
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Engineer', 'ai-engineer', 2
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Applied AI Engineer', 'applied-ai-engineer', 3
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Research Scientist (AI / ML)', 'research-scientist-ai-ml', 4
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Deep Learning Engineer', 'deep-learning-engineer', 5
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'NLP Engineer', 'nlp-engineer', 6
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Computer Vision Engineer', 'computer-vision-engineer', 7
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Reinforcement Learning Engineer', 'reinforcement-learning-engineer', 8
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Multimodal AI Engineer', 'multimodal-ai-engineer', 9
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'LLM Engineer', 'llm-engineer', 10
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Prompt Engineer', 'prompt-engineer', 11
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Algorithm Engineer', 'ai-algorithm-engineer', 12
FROM job_categories WHERE slug = 'ai-machine-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 2: Data & Analytics
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Data Scientist', 'data-scientist', 1
FROM job_categories WHERE slug = 'data-analytics'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Senior Data Scientist', 'senior-data-scientist', 2
FROM job_categories WHERE slug = 'data-analytics'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Data Analyst', 'data-analyst', 3
FROM job_categories WHERE slug = 'data-analytics'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Analytics Engineer', 'analytics-engineer', 4
FROM job_categories WHERE slug = 'data-analytics'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Data Engineer', 'data-engineer', 5
FROM job_categories WHERE slug = 'data-analytics'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Big Data Engineer', 'big-data-engineer', 6
FROM job_categories WHERE slug = 'data-analytics'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'BI Engineer / BI Analyst', 'bi-engineer-bi-analyst', 7
FROM job_categories WHERE slug = 'data-analytics'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Quantitative Analyst', 'quantitative-analyst', 8
FROM job_categories WHERE slug = 'data-analytics'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Decision Scientist', 'decision-scientist', 9
FROM job_categories WHERE slug = 'data-analytics'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 3: AI Product & Strategy
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Product Manager', 'ai-product-manager', 1
FROM job_categories WHERE slug = 'ai-product-strategy'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Technical Product Manager (AI)', 'technical-product-manager-ai', 2
FROM job_categories WHERE slug = 'ai-product-strategy'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Head of AI Product', 'head-of-ai-product', 3
FROM job_categories WHERE slug = 'ai-product-strategy'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Product Owner (AI)', 'product-owner-ai', 4
FROM job_categories WHERE slug = 'ai-product-strategy'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Program Manager', 'ai-program-manager', 5
FROM job_categories WHERE slug = 'ai-product-strategy'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Strategy Consultant', 'ai-strategy-consultant', 6
FROM job_categories WHERE slug = 'ai-product-strategy'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Innovation Manager (AI)', 'innovation-manager-ai', 7
FROM job_categories WHERE slug = 'ai-product-strategy'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Venture / Product Studio Lead (AI)', 'venture-product-studio-lead-ai', 8
FROM job_categories WHERE slug = 'ai-product-strategy'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 4: AI Agents & Automation
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Agent Engineer', 'ai-agent-engineer', 1
FROM job_categories WHERE slug = 'ai-agents-automation'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Autonomous Systems Engineer', 'autonomous-systems-engineer', 2
FROM job_categories WHERE slug = 'ai-agents-automation'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Workflow Automation Engineer', 'workflow-automation-engineer', 3
FROM job_categories WHERE slug = 'ai-agents-automation'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'RPA + AI Engineer', 'rpa-ai-engineer', 4
FROM job_categories WHERE slug = 'ai-agents-automation'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Agent Orchestration Engineer', 'agent-orchestration-engineer', 5
FROM job_categories WHERE slug = 'ai-agents-automation'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Tooling & Integrations Engineer (Agents)', 'tooling-integrations-engineer-agents', 6
FROM job_categories WHERE slug = 'ai-agents-automation'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Conversational AI Designer', 'conversational-ai-designer', 7
FROM job_categories WHERE slug = 'ai-agents-automation'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Chatbot Engineer', 'chatbot-engineer', 8
FROM job_categories WHERE slug = 'ai-agents-automation'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 5: Software Engineering (AI-Adjacent)
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Backend Engineer (AI Platforms)', 'backend-engineer-ai-platforms', 1
FROM job_categories WHERE slug = 'software-engineering-ai-adjacent'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Frontend Engineer (AI Products)', 'frontend-engineer-ai-products', 2
FROM job_categories WHERE slug = 'software-engineering-ai-adjacent'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Full-Stack Engineer', 'full-stack-engineer', 3
FROM job_categories WHERE slug = 'software-engineering-ai-adjacent'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Platform Engineer', 'platform-engineer', 4
FROM job_categories WHERE slug = 'software-engineering-ai-adjacent'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'API Engineer', 'api-engineer', 5
FROM job_categories WHERE slug = 'software-engineering-ai-adjacent'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Systems Engineer', 'systems-engineer', 6
FROM job_categories WHERE slug = 'software-engineering-ai-adjacent'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Cloud Engineer', 'cloud-engineer', 7
FROM job_categories WHERE slug = 'software-engineering-ai-adjacent'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Edge AI Engineer', 'edge-ai-engineer', 8
FROM job_categories WHERE slug = 'software-engineering-ai-adjacent'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 6: MLOps, DevOps & Infrastructure
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'MLOps Engineer', 'mlops-engineer', 1
FROM job_categories WHERE slug = 'mlops-devops-infrastructure'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Infrastructure Engineer', 'ai-infrastructure-engineer', 2
FROM job_categories WHERE slug = 'mlops-devops-infrastructure'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'DevOps Engineer (AI)', 'devops-engineer-ai', 3
FROM job_categories WHERE slug = 'mlops-devops-infrastructure'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Site Reliability Engineer (SRE)', 'site-reliability-engineer-sre', 4
FROM job_categories WHERE slug = 'mlops-devops-infrastructure'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Model Deployment Engineer', 'model-deployment-engineer', 5
FROM job_categories WHERE slug = 'mlops-devops-infrastructure'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'ML Platform Engineer', 'ml-platform-engineer', 6
FROM job_categories WHERE slug = 'mlops-devops-infrastructure'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Observability / Monitoring Engineer', 'observability-monitoring-engineer', 7
FROM job_categories WHERE slug = 'mlops-devops-infrastructure'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 7: AI Research & Academia
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Researcher', 'ai-researcher', 1
FROM job_categories WHERE slug = 'ai-research-academia'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Research Engineer', 'research-engineer', 2
FROM job_categories WHERE slug = 'ai-research-academia'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'PhD Researcher (AI)', 'phd-researcher-ai', 3
FROM job_categories WHERE slug = 'ai-research-academia'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Academic Liaison (AI)', 'academic-liaison-ai', 4
FROM job_categories WHERE slug = 'ai-research-academia'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Applied Research Lead', 'applied-research-lead', 5
FROM job_categories WHERE slug = 'ai-research-academia'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Scientific Computing Engineer', 'scientific-computing-engineer', 6
FROM job_categories WHERE slug = 'ai-research-academia'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 8: Responsible AI, Ethics & Governance
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Responsible AI Lead', 'responsible-ai-lead', 1
FROM job_categories WHERE slug = 'responsible-ai-ethics-governance'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Ethics Researcher', 'ai-ethics-researcher', 2
FROM job_categories WHERE slug = 'responsible-ai-ethics-governance'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Policy Analyst', 'ai-policy-analyst', 3
FROM job_categories WHERE slug = 'responsible-ai-ethics-governance'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Trust & Safety Engineer', 'trust-safety-engineer', 4
FROM job_categories WHERE slug = 'responsible-ai-ethics-governance'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Model Risk Manager', 'model-risk-manager', 5
FROM job_categories WHERE slug = 'responsible-ai-ethics-governance'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Governance Specialist', 'ai-governance-specialist', 6
FROM job_categories WHERE slug = 'responsible-ai-ethics-governance'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Compliance Manager (AI)', 'compliance-manager-ai', 7
FROM job_categories WHERE slug = 'responsible-ai-ethics-governance'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 9: Design & User Experience (AI)
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'UX Designer (AI Products)', 'ux-designer-ai-products', 1
FROM job_categories WHERE slug = 'design-user-experience-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Product Designer (AI)', 'product-designer-ai', 2
FROM job_categories WHERE slug = 'design-user-experience-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Conversational UX Designer', 'conversational-ux-designer', 3
FROM job_categories WHERE slug = 'design-user-experience-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Voice Interface Designer', 'voice-interface-designer', 4
FROM job_categories WHERE slug = 'design-user-experience-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Human–AI Interaction Designer', 'human-ai-interaction-designer', 5
FROM job_categories WHERE slug = 'design-user-experience-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'UX Researcher (AI)', 'ux-researcher-ai', 6
FROM job_categories WHERE slug = 'design-user-experience-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 10: Sales, Marketing & Growth (AI)
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Solutions Consultant', 'ai-solutions-consultant', 1
FROM job_categories WHERE slug = 'sales-marketing-growth-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Sales Engineer (AI)', 'sales-engineer-ai', 2
FROM job_categories WHERE slug = 'sales-marketing-growth-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Enterprise Account Executive (AI)', 'enterprise-account-executive-ai', 3
FROM job_categories WHERE slug = 'sales-marketing-growth-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Developer Advocate / DevRel', 'developer-advocate-devrel', 4
FROM job_categories WHERE slug = 'sales-marketing-growth-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Growth Marketer (AI)', 'growth-marketer-ai', 5
FROM job_categories WHERE slug = 'sales-marketing-growth-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Product Marketing Manager (AI)', 'product-marketing-manager-ai', 6
FROM job_categories WHERE slug = 'sales-marketing-growth-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Partnerships Manager (AI)', 'partnerships-manager-ai', 7
FROM job_categories WHERE slug = 'sales-marketing-growth-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 11: Operations, Finance & Legal (AI-Focused)
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Operations Manager', 'ai-operations-manager', 1
FROM job_categories WHERE slug = 'operations-finance-legal-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Chief of Staff (AI Startup)', 'chief-of-staff-ai-startup', 2
FROM job_categories WHERE slug = 'operations-finance-legal-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Finance Manager (AI)', 'finance-manager-ai', 3
FROM job_categories WHERE slug = 'operations-finance-legal-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Legal Counsel (AI / Data)', 'legal-counsel-ai-data', 4
FROM job_categories WHERE slug = 'operations-finance-legal-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Privacy & Data Protection Officer', 'privacy-data-protection-officer', 5
FROM job_categories WHERE slug = 'operations-finance-legal-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Vendor & Model Procurement Lead', 'vendor-model-procurement-lead', 6
FROM job_categories WHERE slug = 'operations-finance-legal-ai'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 12: Leadership & Executive
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Head of AI', 'head-of-ai', 1
FROM job_categories WHERE slug = 'leadership-executive'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Director of Machine Learning', 'director-of-machine-learning', 2
FROM job_categories WHERE slug = 'leadership-executive'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'VP of AI / Data', 'vp-of-ai-data', 3
FROM job_categories WHERE slug = 'leadership-executive'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Chief AI Officer (CAIO)', 'chief-ai-officer-caio', 4
FROM job_categories WHERE slug = 'leadership-executive'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'CTO (AI-first)', 'cto-ai-first', 5
FROM job_categories WHERE slug = 'leadership-executive'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Founder-in-Residence (AI)', 'founder-in-residence-ai', 6
FROM job_categories WHERE slug = 'leadership-executive'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Category 13: Freelance, Contract & Advisory
INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Fractional Head of AI', 'fractional-head-of-ai', 1
FROM job_categories WHERE slug = 'freelance-contract-advisory'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'AI Advisor / Consultant', 'ai-advisor-consultant', 2
FROM job_categories WHERE slug = 'freelance-contract-advisory'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Freelance ML Engineer', 'freelance-ml-engineer', 3
FROM job_categories WHERE slug = 'freelance-contract-advisory'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Prompt Engineering Consultant', 'prompt-engineering-consultant', 4
FROM job_categories WHERE slug = 'freelance-contract-advisory'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Interim AI Product Manager', 'interim-ai-product-manager', 5
FROM job_categories WHERE slug = 'freelance-contract-advisory'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO job_roles (category_id, name, slug, display_order)
SELECT id, 'Technical Due Diligence Expert (AI)', 'technical-due-diligence-expert-ai', 6
FROM job_categories WHERE slug = 'freelance-contract-advisory'
ON CONFLICT (category_id, slug) DO NOTHING;

-- ============================================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can read active categories and roles
DROP POLICY IF EXISTS "Users can view active job categories" ON job_categories;
CREATE POLICY "Users can view active job categories"
  ON job_categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Users can view active job roles" ON job_roles;
CREATE POLICY "Users can view active job roles"
  ON job_roles
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can manage all categories and roles
DROP POLICY IF EXISTS "Admins can manage job categories" ON job_categories;
CREATE POLICY "Admins can manage job categories"
  ON job_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage job roles" ON job_roles;
CREATE POLICY "Admins can manage job roles"
  ON job_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 7. COMMENTS
-- ============================================================================
COMMENT ON TABLE job_categories IS 'Job categories available as "Best for" filters on the jobs board';
COMMENT ON TABLE job_roles IS 'Specific job roles associated with job categories';
COMMENT ON TYPE work_arrangement IS 'Optional filter: Remote / Hybrid / On-site';
COMMENT ON TYPE seniority_level IS 'Optional filter: Junior / Mid / Senior / Principal';
COMMENT ON TYPE company_stage IS 'Optional filter: Startup / Scaleup / Enterprise';
COMMENT ON TYPE research_focus IS 'Optional filter: Research vs Applied';
COMMENT ON TYPE ai_specialization IS 'Optional filter: Agentic / LLM / Multimodal / Classical ML';
