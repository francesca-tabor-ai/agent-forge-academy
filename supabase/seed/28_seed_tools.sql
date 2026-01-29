-- Seed tools table with popular developer and AI tools
-- This seed data provides a catalog of tools that students can add to their projects
-- Using ON CONFLICT to make this seed idempotent

-- ============================================================================
-- ENSURE TOOLS TABLE EXISTS
-- ============================================================================
-- Create tools table if it doesn't exist (in case migration hasn't been run)

CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  docs_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);

-- Create trigger to update updated_at (if function exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'update_updated_at_column'
  ) THEN
    DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
    CREATE TRIGGER update_tools_updated_at
      BEFORE UPDATE ON tools
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- DATABASE TOOLS
-- ============================================================================

INSERT INTO tools (name, slug, description, category, logo_url, website_url, docs_url)
VALUES
  (
    'Supabase',
    'supabase',
    'Open source Firebase alternative. PostgreSQL database with real-time subscriptions, authentication, and storage.',
    'db',
    'https://supabase.com/favicon.ico',
    'https://supabase.com',
    'https://supabase.com/docs'
  ),
  (
    'PostgreSQL',
    'postgresql',
    'Advanced open source relational database with extensibility and SQL compliance.',
    'db',
    'https://www.postgresql.org/favicon.ico',
    'https://www.postgresql.org',
    'https://www.postgresql.org/docs'
  ),
  (
    'MongoDB',
    'mongodb',
    'NoSQL document database designed for modern application development.',
    'db',
    'https://www.mongodb.com/favicon.ico',
    'https://www.mongodb.com',
    'https://docs.mongodb.com'
  ),
  (
    'Redis',
    'redis',
    'In-memory data structure store used as a database, cache, and message broker.',
    'db',
    'https://redis.io/favicon.ico',
    'https://redis.io',
    'https://redis.io/docs'
  ),
  (
    'Prisma',
    'prisma',
    'Next-generation ORM for Node.js and TypeScript with type safety and auto-generated queries.',
    'db',
    'https://www.prisma.io/favicon.ico',
    'https://www.prisma.io',
    'https://www.prisma.io/docs'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  docs_url = EXCLUDED.docs_url,
  updated_at = NOW();

-- ============================================================================
-- LLM / AI TOOLS
-- ============================================================================

INSERT INTO tools (name, slug, description, category, logo_url, website_url, docs_url)
VALUES
  (
    'OpenAI',
    'openai',
    'AI research and deployment company. Provides GPT models, embeddings, and other AI services.',
    'llm',
    'https://openai.com/favicon.ico',
    'https://openai.com',
    'https://platform.openai.com/docs'
  ),
  (
    'Anthropic Claude',
    'anthropic-claude',
    'AI assistant developed by Anthropic, focused on safety and helpfulness.',
    'llm',
    'https://www.anthropic.com/favicon.ico',
    'https://www.anthropic.com',
    'https://docs.anthropic.com'
  ),
  (
    'LangChain',
    'langchain',
    'Framework for developing applications powered by language models.',
    'llm',
    'https://www.langchain.com/favicon.ico',
    'https://www.langchain.com',
    'https://python.langchain.com/docs'
  ),
  (
    'LlamaIndex',
    'llamaindex',
    'Data framework for LLM applications. Connect custom data sources to LLMs.',
    'llm',
    'https://www.llamaindex.ai/favicon.ico',
    'https://www.llamaindex.ai',
    'https://docs.llamaindex.ai'
  ),
  (
    'Pinecone',
    'pinecone',
    'Vector database for building AI applications with embeddings and semantic search.',
    'llm',
    'https://www.pinecone.io/favicon.ico',
    'https://www.pinecone.io',
    'https://docs.pinecone.io'
  ),
  (
    'Weaviate',
    'weaviate',
    'Open-source vector database that stores both objects and vectors, allowing for combining vector search with structured filtering.',
    'llm',
    'https://weaviate.io/favicon.ico',
    'https://weaviate.io',
    'https://weaviate.io/developers/weaviate'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  docs_url = EXCLUDED.docs_url,
  updated_at = NOW();

-- ============================================================================
-- HOSTING / CLOUD PLATFORMS
-- ============================================================================

INSERT INTO tools (name, slug, description, category, logo_url, website_url, docs_url)
VALUES
  (
    'Vercel',
    'vercel',
    'Platform for frontend frameworks and static sites, built to integrate with your headless content, commerce, or database.',
    'hosting',
    'https://vercel.com/favicon.ico',
    'https://vercel.com',
    'https://vercel.com/docs'
  ),
  (
    'Netlify',
    'netlify',
    'Platform for deploying modern web projects. Build, deploy, and manage web applications.',
    'hosting',
    'https://www.netlify.com/favicon.ico',
    'https://www.netlify.com',
    'https://docs.netlify.com'
  ),
  (
    'AWS',
    'aws',
    'Amazon Web Services - comprehensive cloud computing platform with over 200 services.',
    'hosting',
    'https://aws.amazon.com/favicon.ico',
    'https://aws.amazon.com',
    'https://docs.aws.amazon.com'
  ),
  (
    'Google Cloud',
    'google-cloud',
    'Cloud computing services by Google. Infrastructure, data analytics, and machine learning.',
    'hosting',
    'https://cloud.google.com/favicon.ico',
    'https://cloud.google.com',
    'https://cloud.google.com/docs'
  ),
  (
    'Railway',
    'railway',
    'Deploy your code in minutes. Simple cloud platform for developers.',
    'hosting',
    'https://railway.app/favicon.ico',
    'https://railway.app',
    'https://docs.railway.app'
  ),
  (
    'Render',
    'render',
    'Cloud platform to build and run all your apps and websites with free SSL, a global CDN, and auto-deployments.',
    'hosting',
    'https://render.com/favicon.ico',
    'https://render.com',
    'https://render.com/docs'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  docs_url = EXCLUDED.docs_url,
  updated_at = NOW();

-- ============================================================================
-- DEVELOPMENT TOOLS
-- ============================================================================

INSERT INTO tools (name, slug, description, category, logo_url, website_url, docs_url)
VALUES
  (
    'Cursor',
    'cursor',
    'AI-powered code editor built for pair programming with AI.',
    'tooling',
    'https://cursor.sh/favicon.ico',
    'https://cursor.sh',
    'https://cursor.sh/docs'
  ),
  (
    'GitHub',
    'github',
    'Code hosting platform for version control and collaboration.',
    'tooling',
    'https://github.com/favicon.ico',
    'https://github.com',
    'https://docs.github.com'
  ),
  (
    'GitLab',
    'gitlab',
    'DevOps platform that provides a complete toolchain for software development.',
    'tooling',
    'https://about.gitlab.com/favicon.ico',
    'https://gitlab.com',
    'https://docs.gitlab.com'
  ),
  (
    'Docker',
    'docker',
    'Platform for developing, shipping, and running applications in containers.',
    'tooling',
    'https://www.docker.com/favicon.ico',
    'https://www.docker.com',
    'https://docs.docker.com'
  ),
  (
    'VS Code',
    'vscode',
    'Lightweight but powerful source code editor with built-in support for JavaScript, TypeScript, and Node.js.',
    'tooling',
    'https://code.visualstudio.com/favicon.ico',
    'https://code.visualstudio.com',
    'https://code.visualstudio.com/docs'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  docs_url = EXCLUDED.docs_url,
  updated_at = NOW();

-- ============================================================================
-- FRAMEWORKS & LIBRARIES
-- ============================================================================

INSERT INTO tools (name, slug, description, category, logo_url, website_url, docs_url)
VALUES
  (
    'Next.js',
    'nextjs',
    'React framework for production with server-side rendering, static site generation, and API routes.',
    'framework',
    'https://nextjs.org/favicon.ico',
    'https://nextjs.org',
    'https://nextjs.org/docs'
  ),
  (
    'React',
    'react',
    'JavaScript library for building user interfaces, particularly web applications.',
    'framework',
    'https://react.dev/favicon.ico',
    'https://react.dev',
    'https://react.dev/learn'
  ),
  (
    'TypeScript',
    'typescript',
    'Typed superset of JavaScript that compiles to plain JavaScript.',
    'language',
    'https://www.typescriptlang.org/favicon.ico',
    'https://www.typescriptlang.org',
    'https://www.typescriptlang.org/docs'
  ),
  (
    'Python',
    'python',
    'High-level programming language known for its simplicity and versatility.',
    'language',
    'https://www.python.org/favicon.ico',
    'https://www.python.org',
    'https://docs.python.org'
  ),
  (
    'Node.js',
    'nodejs',
    'JavaScript runtime built on Chrome''s V8 JavaScript engine for building scalable network applications.',
    'framework',
    'https://nodejs.org/favicon.ico',
    'https://nodejs.org',
    'https://nodejs.org/docs'
  ),
  (
    'FastAPI',
    'fastapi',
    'Modern, fast web framework for building APIs with Python based on standard Python type hints.',
    'framework',
    'https://fastapi.tiangolo.com/favicon.ico',
    'https://fastapi.tiangolo.com',
    'https://fastapi.tiangolo.com'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  docs_url = EXCLUDED.docs_url,
  updated_at = NOW();

-- ============================================================================
-- ANALYTICS & MONITORING
-- ============================================================================

INSERT INTO tools (name, slug, description, category, logo_url, website_url, docs_url)
VALUES
  (
    'PostHog',
    'posthog',
    'Open-source product analytics platform that helps you understand user behavior.',
    'analytics',
    'https://posthog.com/favicon.ico',
    'https://posthog.com',
    'https://posthog.com/docs'
  ),
  (
    'Sentry',
    'sentry',
    'Error tracking and performance monitoring for modern applications.',
    'monitoring',
    'https://sentry.io/favicon.ico',
    'https://sentry.io',
    'https://docs.sentry.io'
  ),
  (
    'Datadog',
    'datadog',
    'Monitoring and analytics platform for cloud-scale applications.',
    'monitoring',
    'https://www.datadoghq.com/favicon.ico',
    'https://www.datadoghq.com',
    'https://docs.datadoghq.com'
  ),
  (
    'Plausible',
    'plausible',
    'Simple, privacy-friendly Google Analytics alternative.',
    'analytics',
    'https://plausible.io/favicon.ico',
    'https://plausible.io',
    'https://plausible.io/docs'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  docs_url = EXCLUDED.docs_url,
  updated_at = NOW();

-- ============================================================================
-- AUTHENTICATION & SECURITY
-- ============================================================================

INSERT INTO tools (name, slug, description, category, logo_url, website_url, docs_url)
VALUES
  (
    'Auth0',
    'auth0',
    'Identity platform for developers. Add authentication and authorization to your applications.',
    'tooling',
    'https://auth0.com/favicon.ico',
    'https://auth0.com',
    'https://auth0.com/docs'
  ),
  (
    'Clerk',
    'clerk',
    'Complete user management and authentication solution for modern applications.',
    'tooling',
    'https://clerk.com/favicon.ico',
    'https://clerk.com',
    'https://clerk.com/docs'
  ),
  (
    'Stripe',
    'stripe',
    'Payment processing platform for internet businesses. APIs for payments, subscriptions, and more.',
    'tooling',
    'https://stripe.com/favicon.ico',
    'https://stripe.com',
    'https://stripe.com/docs'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  docs_url = EXCLUDED.docs_url,
  updated_at = NOW();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify seed data
DO $$
DECLARE
  tool_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tool_count FROM tools;
  RAISE NOTICE 'Seeded % tools', tool_count;
END $$;
