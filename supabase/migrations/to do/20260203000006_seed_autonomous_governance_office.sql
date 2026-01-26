-- Seed autonomous-governance-office tool into platform_tools table
-- This tool automates the monitoring of AI models for performance and ethical compliance

INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses,
  category,
  difficulty_level,
  duration,
  industries,
  best_for
) VALUES (
  'autonomous-governance-office',
  'The Autonomous Governance Office',
  'Automate the monitoring of AI models for performance and ethical compliance. Manage hundreds of active AI agents simultaneously with real-time monitoring, compliance tracking, and automated governance workflows. Demonstrates how the AI Acceleration Office can scale governance operations across large-scale AI deployments.',
  '/student/tools/autonomous-governance-office',
  'active',
  ARRAY['governance', 'monitoring', 'compliance', 'ethics', 'ai-agents', 'automation', 'performance', 'risk-management', 'multi-agent', 'observability'],
  ARRAY['public-sector-governance', 'agentic-systems', 'trust-and-regulation'],
  'Public Sector Governance',
  'advanced',
  '~6-10 hours',
  ARRAY['Government', 'Public Sector', 'Enterprise Software', 'Financial Services', 'Healthcare'],
  ARRAY['AI Governance Officer', 'Compliance Manager', 'Tech Lead', 'PM', 'Architect', 'Risk Manager']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  category = EXCLUDED.category,
  difficulty_level = EXCLUDED.difficulty_level,
  duration = EXCLUDED.duration,
  industries = EXCLUDED.industries,
  best_for = EXCLUDED.best_for,
  updated_at = NOW();
