-- Seed platform_tools table with tools from the registry
-- This seed data matches the tools defined in lib/tools/registry.ts

-- Insert platform tools
-- Using ON CONFLICT to make this migration idempotent

-- 1. GTM System Designer
INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses
) VALUES (
  'gtm-system-designer',
  'GTM System Designer',
  'Design and architect go-to-market systems with AI-native approaches. Build scalable GTM strategies and workflows.',
  '/student/tools/gtm-system-designer',
  'active',
  ARRAY['gtm', 'strategy', 'sales', 'marketing', 'architecture'],
  ARRAY['ai-native-go-to-market-systems']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  updated_at = NOW();

-- 2. Agent Boundary & Safety Designer
INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses
) VALUES (
  'agent-boundary-safety-designer',
  'Agent Boundary & Safety Designer',
  'Design safe boundaries and safety mechanisms for AI agents. Ensure reliable and secure agent behavior.',
  '/student/tools/agent-boundary-safety-designer',
  'active',
  ARRAY['safety', 'security', 'agents', 'boundaries', 'reliability'],
  ARRAY['healthcare-agentic-ai-voice-systems', 'agentic-rag']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  updated_at = NOW();

-- 3. RAG Trust Inspector
INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses
) VALUES (
  'rag-trust-inspector',
  'RAG Trust Inspector',
  'Inspect and validate RAG (Retrieval-Augmented Generation) systems for trust, accuracy, and reliability.',
  '/student/tools/rag-trust-inspector',
  'active',
  ARRAY['rag', 'trust', 'validation', 'inspection', 'reliability'],
  ARRAY['agentic-rag']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  updated_at = NOW();

-- 4. Content System Builder
INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses
) VALUES (
  'content-system-builder',
  'Content System Builder',
  'Build scalable content systems and workflows. Design content architectures for AI-native applications.',
  '/student/tools/content-system-builder',
  'active',
  ARRAY['content', 'cms', 'architecture', 'workflows', 'systems'],
  ARRAY['ai-native-go-to-market-systems']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  updated_at = NOW();

-- 5. Decision Trade-off Simulator
INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses
) VALUES (
  'decision-tradeoff-simulator',
  'Decision Trade-off Simulator',
  'Simulate and analyze trade-offs in decision-making processes. Evaluate different architectural and strategic choices.',
  '/student/tools/decision-tradeoff-simulator',
  'active',
  ARRAY['decision-making', 'trade-offs', 'simulation', 'analysis', 'strategy'],
  ARRAY['ai-native-go-to-market-systems', 'platform-os']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  updated_at = NOW();

-- 6. AI Product Review Bot
INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses
) VALUES (
  'ai-product-review-bot',
  'AI Product Review Bot',
  'Automated product review and analysis using AI. Generate comprehensive product reviews and insights.',
  '/student/tools/ai-product-review-bot',
  'active',
  ARRAY['reviews', 'analysis', 'automation', 'ai', 'products'],
  ARRAY['agentic-commerce', 'ai-native-go-to-market-systems']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  updated_at = NOW();

-- 7. AI Product Pricing & Revenue Modeler Pro
INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses
) VALUES (
  'ai-product-pricing-revenue-modeler-pro',
  'AI Product Pricing & Revenue Modeler Pro',
  'Advanced ARC-O framework analysis with enhanced features. Model pricing strategies and revenue forecasts for AI products.',
  '/student/tools/ai-product-pricing-revenue-modeler-pro',
  'active',
  ARRAY['pricing', 'revenue', 'modeling', 'analysis', 'strategy', 'forecasting'],
  ARRAY['gtm-and-revenue-operations', 'ai-native-go-to-market-systems']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  updated_at = NOW();

-- 8. Governance Requirements Documents (GRDs)
INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses
) VALUES (
  'grd-generator',
  'Governance Requirements Documents (GRDs)',
  'Automatically generate Governance Requirements Documents (GRDs) from Product Requirements Documents (PRDs). Operationalize CLEAR-G governance by making governance decisions early, explicit, and enforceable.',
  '/student/tools/grd-generator',
  'active',
  ARRAY['governance', 'compliance', 'risk', 'regulatory', 'ai-safety', 'documentation'],
  ARRAY['trust-and-regulation', 'agentic-rag']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  updated_at = NOW();

-- 9. Agentic Systems Planner
INSERT INTO platform_tools (
  id,
  name,
  description,
  href,
  status,
  tags,
  recommended_for_courses
) VALUES (
  'agentic-systems-planner',
  'Agentic Systems Planner',
  'Comprehensive discovery & documentation generator for planning agentic AI applications. Generate PDD, SDD, evaluation frameworks, and more.',
  '/student/tools/agentic-systems-planner',
  'active',
  ARRAY['planning', 'documentation', 'agents', 'discovery', 'architecture', 'design'],
  ARRAY['agentic-rag', 'agentic-systems']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  href = EXCLUDED.href,
  status = EXCLUDED.status,
  tags = EXCLUDED.tags,
  recommended_for_courses = EXCLUDED.recommended_for_courses,
  updated_at = NOW();
