-- Seed recommended tool discounts for students
-- These are curated offers that support building AI projects across various courses

-- Add unique constraint for idempotency (if it doesn't exist)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'offers_provider_title_unique'
    ) THEN
        ALTER TABLE offers 
        ADD CONSTRAINT offers_provider_title_unique 
        UNIQUE (provider, title);
    END IF;
END $$;

-- Insert recommended tool discounts
-- Using ON CONFLICT to make this migration idempotent (based on provider + title uniqueness)

-- 1. Supabase Pro
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    discount_value,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'Supabase Pro',
    'Supabase',
    'Auth, Postgres, storage, and edge functions for AI-powered apps.',
    'database',
    '20% off first 3 months',
    'percentage',
    20.00,
    'New users only',
    ARRAY['vibe-coding-cursor-supabase', 'multi-agent-systems', 'agentic-rag'],
    true,
    ARRAY['PostgreSQL database', 'Authentication', 'Storage', 'Edge functions', 'Real-time subscriptions']
)
ON CONFLICT (provider, title) DO NOTHING;

-- 2. OpenAI API Credits
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    discount_value,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'OpenAI API Credits',
    'OpenAI',
    'Production-grade language and reasoning models for AI features.',
    'ai_llm',
    '15% bonus credits on first top-up',
    'free_credits',
    15.00,
    'First-time API users',
    ARRAY['agentic-rag', 'ai-content-pipelines', 'multi-agent-systems', 'prompt-engineering', 'agentic-commerce'],
    true,
    ARRAY['GPT-4 access', 'Embeddings API', 'Function calling', 'Vision API', 'Whisper API']
)
ON CONFLICT (provider, title) DO NOTHING;

-- 3. Pinecone
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'Pinecone',
    'Pinecone',
    'Managed vector search for retrieval-augmented generation and agents.',
    'vector_database',
    'Free starter tier + extended usage credits',
    'extended_trial',
    'Students and developers',
    ARRAY['agentic-rag', 'multi-agent-systems', 'ai-recommender-systems'],
    true,
    ARRAY['Managed vector database', 'Semantic search', 'Metadata filtering', 'Real-time updates', 'Serverless scaling']
)
ON CONFLICT (provider, title) DO NOTHING;

-- 4. Weaviate Cloud
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'Weaviate Cloud',
    'Weaviate',
    'Open-source vector DB with hybrid search and filtering.',
    'vector_database',
    'Free cloud sandbox for students',
    'extended_trial',
    'Student email required',
    ARRAY['agentic-rag', 'multi-agent-systems'],
    true,
    ARRAY['Hybrid search', 'GraphQL API', 'Structured data support', 'Open source', 'Self-hosted option']
)
ON CONFLICT (provider, title) DO NOTHING;

-- 5. LangSmith
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'LangSmith',
    'LangChain',
    'Debug, trace, and evaluate LLM chains and agents.',
    'observability',
    'Extended free tier for students',
    'extended_trial',
    'Student verification required',
    ARRAY['multi-agent-systems', 'agentic-rag', 'prompt-engineering', 'ai-content-pipelines'],
    true,
    ARRAY['LLM tracing', 'Prompt testing', 'Evaluation workflows', 'Agent debugging', 'Production monitoring']
)
ON CONFLICT (provider, title) DO NOTHING;

-- 6. Vercel Pro
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    discount_value,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'Vercel Pro',
    'Vercel',
    'Frontend and edge deployment for AI-powered apps.',
    'hosting',
    '50% off first 2 months',
    'percentage',
    50.00,
    'New Pro accounts',
    ARRAY['llm-first-websites', 'vibe-coding-cursor-supabase', 'multi-agent-systems'],
    true,
    ARRAY['Edge functions', 'Automatic deployments', 'Preview deployments', 'Analytics', 'Team collaboration']
)
ON CONFLICT (provider, title) DO NOTHING;

-- 7. Railway
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    discount_value,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'Railway',
    'Railway',
    'Simple deployment for APIs, workers, and databases.',
    'hosting',
    '$20 free credits',
    'free_credits',
    20.00,
    'New accounts',
    ARRAY['multi-agent-systems', 'ai-native-software-delivery-pipelines', 'vibe-coding-cursor-supabase'],
    true,
    ARRAY['One-click deploys', 'Database hosting', 'Background workers', 'GitHub integration', 'Environment variables']
)
ON CONFLICT (provider, title) DO NOTHING;

-- 8. Sentry
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'Sentry',
    'Sentry',
    'Error tracking and performance monitoring.',
    'monitoring',
    'Free team upgrade',
    'tier_upgrade',
    'Student teams',
    ARRAY['multi-agent-systems', 'ai-native-software-delivery-pipelines', 'spec-driven-development'],
    true,
    ARRAY['Error tracking', 'Performance monitoring', 'Release tracking', 'User context', 'Team collaboration']
)
ON CONFLICT (provider, title) DO NOTHING;

-- 9. PostHog
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'PostHog',
    'PostHog',
    'Event tracking, funnels, and feature flags.',
    'analytics',
    'Extended free tier',
    'extended_trial',
    'Open to all',
    ARRAY['ai-content-pipelines', 'hyper-personalised-marketing-advertising', 'conversational-commerce-intelligence'],
    true,
    ARRAY['Event tracking', 'Funnel analysis', 'Feature flags', 'Session recordings', 'A/B testing']
)
ON CONFLICT (provider, title) DO NOTHING;

-- 10. Weights & Biases
INSERT INTO offers (
    title,
    provider,
    description,
    category,
    discount_text,
    discount_type,
    eligibility,
    recommended_for_courses,
    is_recommended,
    features
) VALUES (
    'Weights & Biases',
    'Weights & Biases',
    'Track experiments, datasets, and evaluations.',
    'ml_tools',
    'Free student workspace',
    'extended_trial',
    'Student email verification',
    ARRAY['ai-recommender-systems', 'multi-agent-systems'],
    true,
    ARRAY['Experiment tracking', 'Dataset versioning', 'Model evaluation', 'Hyperparameter tuning', 'Team collaboration']
)
ON CONFLICT (provider, title) DO NOTHING;
