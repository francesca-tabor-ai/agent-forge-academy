-- Seed content: courses
-- No dependencies - can be seeded independently
-- Uses hardcoded UUIDs for easy reference and consistency
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Insert courses with hardcoded deterministic UUIDs
-- These UUIDs are stable and can be referenced in other seed scripts
INSERT INTO courses (id, slug, title, description, thumbnail_url, duration_weeks, difficulty_level, is_published, industries)
VALUES
  -- Vibe Engineering
  ('a1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid, 'ai-native-software-delivery-pipelines', 'AI-Native Software Delivery Pipelines', 'Ship AI features safely, repeatedly, and measurably. Build a CI/CD pipeline with eval gates, prompt/version control, model routing, and rollout strategy.', NULL, 1, 'intermediate', true, ARRAY['SaaS', 'DevTools']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid, 'spec-driven-development', 'Spec Driven Development', 'Turn vague ideas into executable specs that agents and humans can deliver. Build a spec template + workflow (requirements → acceptance tests → tasks → implementation).', NULL, 1, 'beginner', true, ARRAY['SaaS', 'DevTools']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid, 'vibe-coding-cursor-supabase', 'Vibe Coding with Cursor & Supabase', 'Build full-stack apps fast without losing structure. Build a Supabase-backed app (auth, DB, storage, edge functions) using Cursor for iterative coding.', NULL, 1, 'beginner', true, ARRAY['SaaS', 'DevTools']),
  
  -- Agentic Systems
  ('a1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid, 'prompt-engineering', 'Prompt Engineering', 'Write prompts that are reliable, testable, and reusable. Build a prompt library with patterns (role/task/context/output), test cases, and failure-mode checks.', NULL, 1, 'beginner', true, ARRAY['SaaS', 'DevTools']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc05'::uuid, 'agentic-rag', 'Mastering Agentic RAG for Enterprise AI', 'Build self-correcting, adaptive agentic RAG systems that achieve 94.8% accuracy and strategic enterprise impact. Complete agentic RAG system with CRAG, Adaptive RAG, Graph-based RAG, specialized frameworks, evaluation metrics, security, and production deployment.', NULL, 7, 'advanced', true, ARRAY['SaaS', 'DevTools', 'Healthcare']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid, 'multi-agent-systems', 'Multi-Agent Systems', 'Deploy multi-agent AI systems at scale with production-grade infrastructure. Complete multi-agent system with LangGraph, CrewAI, AutoGen, Kubernetes deployment, security, and monitoring.', NULL, 12, 'advanced', true, ARRAY['SaaS', 'DevTools']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc07'::uuid, 'problem-shooting-change-drift-failure-multi-agent-systems', 'Problem-Shooting Change, Drift, and Failure in Multi-Agent Systems', 'Design, deploy, and maintain autonomous multi-agent systems that continue to function as their environment, tools, models, and assumptions change. Production-first course on failure-tolerant agent systems with drift detection, tool contracts, replay systems, cost optimization, and resumable state management.', NULL, 12, 'advanced', true, ARRAY['SaaS', 'DevTools']),
  
  -- AI Search & Visibility
  ('a1b2c3d4-e5f6-4789-a012-3456789abc08'::uuid, 'amazon-rufus-optimisation', 'Amazon Rufus Optimisation', 'Make your listings win in Amazon''s AI shopping experiences. Build a listing optimisation checklist + experimentation loop (titles, bullets, A+ content, Q&A signals).', NULL, 1, 'beginner', true, ARRAY['E-commerce', 'Marketplaces', 'Retail / CPG']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc09'::uuid, 'reddit-ai-visibility', 'Reddit AI Visibility', 'Earn visibility in AI-driven discovery where authenticity matters. Build a playbook for community-first visibility (topic mapping, contribution cadence, measurement).', NULL, 1, 'beginner', true, ARRAY['Media & Publishing', 'SaaS']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc0a'::uuid, 'seo-to-aeo', 'SEO → AEO (Search to Answer Engine Optimisation)', 'Rank for answers, not just clicks. Build content and structure patterns that improve citation/answer pickup (schema, Q&A blocks, entity coverage).', NULL, 1, 'intermediate', true, ARRAY['Media & Publishing', 'SaaS', 'E-commerce']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc0b'::uuid, 'hyper-personalised-marketing-advertising', 'Hyper-Personalised Marketing & Advertising', 'Personalise responsibly without creepy or chaotic automation. Build a segmentation + message matrix, plus guardrails for frequency, consent, and performance.', NULL, 1, 'intermediate', true, ARRAY['E-commerce', 'SaaS', 'Retail / CPG']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc0c'::uuid, 'ai-visibility', 'Mastering the AI Visibility Playbook', 'Transform from traditional SEO to AI visibility architecture and achieve 40%+ visibility increases in AI Overviews. Complete AI visibility system with llms.txt, structured data, content engineering (Inverted Pyramid 2.0), entity authority, and hallucination defense.', NULL, 7, 'advanced', true, ARRAY['Media & Publishing', 'SaaS', 'E-commerce']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc0d'::uuid, 'llm-first-websites', 'Engineering for Machine Judgment (RX)', 'Build LLM-first websites optimized for AI intermediaries that achieve higher visibility and citation recognition. Complete RX system with ontology/taxonomy, intent-driven APIs, safety boundaries, observability, and governance frameworks.', NULL, 7, 'advanced', true, ARRAY['SaaS', 'DevTools', 'Media & Publishing']),
  
  -- Shopping & E-Commerce
  ('a1b2c3d4-e5f6-4789-a012-3456789abc0e'::uuid, 'agentic-commerce', 'Mastering the Agentic Economy', 'Master the agentic economy from foundations to implementation, including trust-building, technical protocols, marketing strategy, and governance. Complete agentic commerce implementation with ACP protocols, AEO optimization, trust frameworks, organizational design, compliance, and bias auditing.', NULL, 8, 'advanced', true, ARRAY['E-commerce', 'Marketplaces', 'Retail / CPG']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc0f'::uuid, 'conversational-commerce-intelligence', 'Conversational Commerce Intelligence Systems', 'Turn conversations into revenue intelligence. Build an insight pipeline (intent → objections → product gaps → next best action → reporting).', NULL, 1, 'intermediate', true, ARRAY['E-commerce', 'B2B Sales / RevOps', 'SaaS']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc10'::uuid, 'ai-recommender-systems', 'AI Recommender Systems', 'Improve conversion with explainable recommendations. Build a recommender blueprint (signals, ranking, exploration, evaluation, cold start handling).', NULL, 2, 'intermediate', true, ARRAY['E-commerce', 'Marketplaces', 'Media & Publishing']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc11'::uuid, '3d-for-ecommerce', 'Mastering 3D Commerce and Cinematic Capitalism', 'Build production-ready 3D commerce platforms that drive 2x conversion and 9% sales lift. Full-stack 3D commerce platform with MERN stack, Three.js, Amazon SP-API integration, video shopping infrastructure, and enterprise scaling.', NULL, 8, 'advanced', true, ARRAY['E-commerce', 'Retail / CPG', 'Marketplaces']),
  
  -- Media & Content Ops
  ('a1b2c3d4-e5f6-4789-a012-3456789abc12'::uuid, 'ai-driven-video-synthetic-media', 'AI-Driven Video & Synthetic Media', 'Produce scalable video while keeping brand and ethics intact. Build a production pipeline (script → storyboard → generation → edit → QC → distribution).', NULL, 1, 'beginner', true, ARRAY['Media & Publishing', 'E-commerce']),
  ('a1b2c3d4-e5f6-4789-a012-3456789abc13'::uuid, 'ai-content-pipelines', 'AI-Content Pipelines', 'Scale content production with consistency, governance, and measurement. Build an end-to-end pipeline (brief → research → draft → review → publish → refresh) with QA gates and attribution.', NULL, 1, 'intermediate', true, ARRAY['Media & Publishing', 'SaaS']),
  
  -- Trust & Regulation
  ('a1b2c3d4-e5f6-4789-a012-3456789abc14'::uuid, 'ai-governance-eu-ai-act', 'AI Governance & the EU AI Act', 'Ship compliant AI systems with real operational controls. Build a governance checklist (risk classification, documentation, human oversight, monitoring, incident response).', NULL, 1, 'intermediate', true, ARRAY['Legal & Compliance', 'SaaS', 'Healthcare', 'Finance'])
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  thumbnail_url = EXCLUDED.thumbnail_url,
  duration_weeks = EXCLUDED.duration_weeks,
  difficulty_level = EXCLUDED.difficulty_level,
  is_published = EXCLUDED.is_published,
  industries = EXCLUDED.industries,
  updated_at = NOW();

COMMIT;
