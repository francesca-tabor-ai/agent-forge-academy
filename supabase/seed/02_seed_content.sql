-- Seed content: courses
-- No dependencies - can be seeded independently
-- Uses deterministic UUIDs based on slug for easy reference

BEGIN;

-- Helper function to generate deterministic UUID from string
-- This ensures the same course always gets the same UUID across runs
CREATE OR REPLACE FUNCTION deterministic_uuid(input_text TEXT)
RETURNS UUID AS $$
BEGIN
  -- Generate UUID v5 from namespace and input text
  -- Using a fixed namespace UUID for courses
  RETURN uuid_generate_v5('6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid, input_text);
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: if uuid_generate_v5 doesn't exist, use md5 hash
    RETURN ('00000000-0000-0000-0000-' || substr(md5(input_text), 1, 12))::uuid;
END;
$$ LANGUAGE plpgsql;

-- Ensure uuid extension is available (for uuid_generate_v5)
DO $$ 
BEGIN
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
  WHEN OTHERS THEN
    -- Extension might not be available, that's okay - we have fallback
    NULL;
END $$;

-- Insert courses with deterministic UUIDs based on slug
-- This allows easy reference in other seed scripts
INSERT INTO courses (id, slug, title, description, duration_weeks, difficulty_level, is_published)
VALUES
  -- Vibe Engineering
  (deterministic_uuid('course:ai-native-software-delivery-pipelines'), 'ai-native-software-delivery-pipelines', 'AI-Native Software Delivery Pipelines', 'Ship AI features safely, repeatedly, and measurably. Build a CI/CD pipeline with eval gates, prompt/version control, model routing, and rollout strategy.', 1, 'intermediate', true),
  (deterministic_uuid('course:spec-driven-development'), 'spec-driven-development', 'Spec Driven Development', 'Turn vague ideas into executable specs that agents and humans can deliver. Build a spec template + workflow (requirements → acceptance tests → tasks → implementation).', 1, 'beginner', true),
  (deterministic_uuid('course:vibe-coding-cursor-supabase'), 'vibe-coding-cursor-supabase', 'Vibe Coding with Cursor & Supabase', 'Build full-stack apps fast without losing structure. Build a Supabase-backed app (auth, DB, storage, edge functions) using Cursor for iterative coding.', 1, 'beginner', true),
  
  -- Agentic Systems
  (deterministic_uuid('course:prompt-engineering'), 'prompt-engineering', 'Prompt Engineering', 'Write prompts that are reliable, testable, and reusable. Build a prompt library with patterns (role/task/context/output), test cases, and failure-mode checks.', 1, 'beginner', true),
  (deterministic_uuid('course:agentic-rag'), 'agentic-rag', 'Mastering Agentic RAG for Enterprise AI', 'Build self-correcting, adaptive agentic RAG systems that achieve 94.8% accuracy and strategic enterprise impact. Complete agentic RAG system with CRAG, Adaptive RAG, Graph-based RAG, specialized frameworks, evaluation metrics, security, and production deployment.', 7, 'advanced', true),
  (deterministic_uuid('course:multi-agent-systems'), 'multi-agent-systems', 'Multi-Agent Systems', 'Deploy multi-agent AI systems at scale with production-grade infrastructure. Complete multi-agent system with LangGraph, CrewAI, AutoGen, Kubernetes deployment, security, and monitoring.', 12, 'advanced', true),
  (deterministic_uuid('course:problem-shooting-change-drift-failure-multi-agent-systems'), 'problem-shooting-change-drift-failure-multi-agent-systems', 'Problem-Shooting Change, Drift, and Failure in Multi-Agent Systems', 'Design, deploy, and maintain autonomous multi-agent systems that continue to function as their environment, tools, models, and assumptions change. Production-first course on failure-tolerant agent systems with drift detection, tool contracts, replay systems, cost optimization, and resumable state management.', 12, 'advanced', true),
  
  -- AI Search & Viability
  (deterministic_uuid('course:amazon-rufus-optimisation'), 'amazon-rufus-optimisation', 'Amazon Rufus Optimisation', 'Make your listings win in Amazon''s AI shopping experiences. Build a listing optimisation checklist + experimentation loop (titles, bullets, A+ content, Q&A signals).', 1, 'beginner', true),
  (deterministic_uuid('course:reddit-ai-visibility'), 'reddit-ai-visibility', 'Reddit AI Visibility', 'Earn visibility in AI-driven discovery where authenticity matters. Build a playbook for community-first visibility (topic mapping, contribution cadence, measurement).', 1, 'beginner', true),
  (deterministic_uuid('course:seo-to-aeo'), 'seo-to-aeo', 'SEO → AEO (Search to Answer Engine Optimisation)', 'Rank for answers, not just clicks. Build content and structure patterns that improve citation/answer pickup (schema, Q&A blocks, entity coverage).', 1, 'intermediate', true),
  (deterministic_uuid('course:hyper-personalised-marketing-advertising'), 'hyper-personalised-marketing-advertising', 'Hyper-Personalised Marketing & Advertising', 'Personalise responsibly without creepy or chaotic automation. Build a segmentation + message matrix, plus guardrails for frequency, consent, and performance.', 1, 'intermediate', true),
  (deterministic_uuid('course:ai-visibility'), 'ai-visibility', 'Mastering the AI Visibility Playbook', 'Transform from traditional SEO to AI visibility architecture and achieve 40%+ visibility increases in AI Overviews. Complete AI visibility system with llms.txt, structured data, content engineering (Inverted Pyramid 2.0), entity authority, and hallucination defense.', 7, 'advanced', true),
  (deterministic_uuid('course:llm-first-websites'), 'llm-first-websites', 'Engineering for Machine Judgment (RX)', 'Build LLM-first websites optimized for AI intermediaries that achieve higher visibility and citation recognition. Complete RX system with ontology/taxonomy, intent-driven APIs, safety boundaries, observability, and governance frameworks.', 7, 'advanced', true),
  
  -- Shopping & E-Commerce
  (deterministic_uuid('course:agentic-commerce'), 'agentic-commerce', 'Mastering the Agentic Economy', 'Master the agentic economy from foundations to implementation, including trust-building, technical protocols, marketing strategy, and governance. Complete agentic commerce implementation with ACP protocols, AEO optimization, trust frameworks, organizational design, compliance, and bias auditing.', 8, 'advanced', true),
  (deterministic_uuid('course:conversational-commerce-intelligence'), 'conversational-commerce-intelligence', 'Conversational Commerce Intelligence Systems', 'Turn conversations into revenue intelligence. Build an insight pipeline (intent → objections → product gaps → next best action → reporting).', 1, 'intermediate', true),
  (deterministic_uuid('course:ai-recommender-systems'), 'ai-recommender-systems', 'AI Recommender Systems', 'Improve conversion with explainable recommendations. Build a recommender blueprint (signals, ranking, exploration, evaluation, cold start handling).', 2, 'intermediate', true),
  (deterministic_uuid('course:3d-for-ecommerce'), '3d-for-ecommerce', 'Mastering 3D Commerce and Cinematic Capitalism', 'Build production-ready 3D commerce platforms that drive 2x conversion and 9% sales lift. Full-stack 3D commerce platform with MERN stack, Three.js, Amazon SP-API integration, video shopping infrastructure, and enterprise scaling.', 8, 'advanced', true),
  
  -- Media & Content Ops
  (deterministic_uuid('course:ai-driven-video-synthetic-media'), 'ai-driven-video-synthetic-media', 'AI-Driven Video & Synthetic Media', 'Produce scalable video while keeping brand and ethics intact. Build a production pipeline (script → storyboard → generation → edit → QC → distribution).', 1, 'beginner', true),
  (deterministic_uuid('course:ai-content-pipelines'), 'ai-content-pipelines', 'AI-Content Pipelines', 'Scale content production with consistency, governance, and measurement. Build an end-to-end pipeline (brief → research → draft → review → publish → refresh) with QA gates and attribution.', 1, 'intermediate', true),
  
  -- Trust & Regulation
  (deterministic_uuid('course:ai-governance-eu-ai-act'), 'ai-governance-eu-ai-act', 'AI Governance & the EU AI Act', 'Ship compliant AI systems with real operational controls. Build a governance checklist (risk classification, documentation, human oversight, monitoring, incident response).', 1, 'intermediate', true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_weeks = EXCLUDED.duration_weeks,
  difficulty_level = EXCLUDED.difficulty_level,
  is_published = EXCLUDED.is_published,
  updated_at = NOW();

COMMIT;
