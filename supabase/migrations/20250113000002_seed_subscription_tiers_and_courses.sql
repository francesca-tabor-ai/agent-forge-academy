-- Seed subscription tier configurations and course mappings
-- Essential Access: £39/month, 5 specific courses
-- Professional Access: £79/month, all courses

-- Insert subscription tier configurations
INSERT INTO subscription_tier_config (tier, name, description, price_monthly, currency, has_all_access)
VALUES
  (
    'essential',
    'Essential Access',
    'Access to core AI courses: Prompt Engineering, AI-Content Pipelines, Reddit AI Visibility, SEO → AEO, and AI Governance & the EU AI Act',
    39.00,
    'GBP',
    false
  ),
  (
    'professional',
    'Professional Access',
    'Full access to all courses on the platform',
    79.00,
    'GBP',
    true
  )
ON CONFLICT (tier) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  currency = EXCLUDED.currency,
  has_all_access = EXCLUDED.has_all_access,
  updated_at = NOW();

-- Map Essential Access tier to specific courses
-- These are the 5 courses available in Essential Access:
-- 1. prompt-engineering
-- 2. ai-content-pipelines
-- 3. reddit-ai-visibility
-- 4. seo-to-aeo
-- 5. ai-governance-eu-ai-act

INSERT INTO subscription_tier_courses (tier, course_id)
SELECT 
  'essential'::subscription_tier,
  c.id
FROM courses c
WHERE c.slug IN (
  'prompt-engineering',
  'ai-content-pipelines',
  'reddit-ai-visibility',
  'seo-to-aeo',
  'ai-governance-eu-ai-act'
)
ON CONFLICT (tier, course_id) DO NOTHING;

-- Note: Professional Access doesn't need entries in subscription_tier_courses
-- because it has has_all_access = true, which grants access to all courses
