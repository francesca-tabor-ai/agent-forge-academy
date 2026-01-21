-- Seed the Multi-Agent Systems course
-- This course was moved from the root course/ directory to course/multi-agent-systems/

INSERT INTO courses (slug, title, description, duration_weeks, difficulty_level, is_published)
VALUES (
  'multi-agent-systems',
  'Multi-Agent Systems',
  'Complete 12-week professional course on deploying multi-agent AI systems at scale. Master LangGraph, CrewAI, AutoGen, Kubernetes deployment, security, monitoring, and production operations.',
  12,
  'intermediate',
  true
)
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_weeks = EXCLUDED.duration_weeks,
  difficulty_level = EXCLUDED.difficulty_level,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();
