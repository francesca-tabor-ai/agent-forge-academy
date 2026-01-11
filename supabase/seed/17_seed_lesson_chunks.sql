-- Seed lesson_chunks: Chunked lesson content for RAG (Retrieval Augmented Generation)
-- NOTE: This table is typically populated programmatically via the indexLesson function
-- This script provides example chunks that demonstrate the structure
-- Uses hardcoded course slugs from 02_seed_content.sql
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Reference course slugs from 02_seed_content.sql:
-- Example courses: 'prompt-engineering', 'multi-agent-systems', 'vibe-coding-cursor-supabase', etc.

-- Dependencies:
-- - courses (seeded in 02_seed_content.sql) - for course_slug references
-- - lesson_chunks (depends on courses - course slugs must exist)

-- IMPORTANT: 
-- - Chunks are typically generated programmatically from markdown lesson files
-- - Embeddings are generated via OpenAI API and stored as vector(1536)
-- - For seed data, embeddings are left as NULL (can be generated later)
-- - Chunk content should be 200-1000 characters for optimal RAG performance
-- - chunk_index is 0-indexed (0, 1, 2, ...)
-- - Unique constraint on (course_slug, lesson_slug, chunk_index)

-- Example 1: Seed chunks for a prompt engineering lesson
-- Demonstrates basic chunk structure with metadata
-- Uncomment and modify when you have courses:
/*
INSERT INTO lesson_chunks (
  course_slug,
  lesson_slug,
  chunk_index,
  content,
  content_length,
  embedding,
  metadata
)
VALUES
  (
    'prompt-engineering',
    'Module_01_Introduction',
    0,
    'Prompt engineering is the practice of designing and optimizing prompts to effectively communicate with AI models. A well-crafted prompt can dramatically improve the quality and reliability of AI responses. This module covers the fundamentals of prompt design, including role definition, task specification, context provision, and output formatting.',
    345,
    NULL, -- Embeddings generated programmatically
    '{"title": "Introduction to Prompt Engineering", "module": "Module 1", "week": 1, "order": 1, "sectionHeaders": ["Introduction", "Fundamentals"]}'::jsonb
  ),
  (
    'prompt-engineering',
    'Module_01_Introduction',
    1,
    'The key components of an effective prompt include: Role (defining the AI''s persona), Task (what you want it to do), Context (relevant background information), and Output format (how you want the response structured). Each component plays a crucial role in guiding the model toward the desired outcome.',
    298,
    NULL,
    '{"title": "Introduction to Prompt Engineering", "module": "Module 1", "week": 1, "order": 1, "sectionHeaders": ["Key Components", "Prompt Structure"]}'::jsonb
  ),
  (
    'prompt-engineering',
    'Module_01_Introduction',
    2,
    'In this course, you will learn to build a comprehensive prompt library with reusable patterns. We will cover test cases, failure-mode checks, and best practices for maintaining prompt quality over time. By the end, you will be able to create reliable, testable prompts for any use case.',
    267,
    NULL,
    '{"title": "Introduction to Prompt Engineering", "module": "Module 1", "week": 1, "order": 1, "sectionHeaders": ["Course Overview", "Learning Objectives"]}'::jsonb
  )
ON CONFLICT (course_slug, lesson_slug, chunk_index) DO UPDATE SET
  content = EXCLUDED.content,
  content_length = EXCLUDED.content_length,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();
*/

-- Example 2: Seed chunks for a multi-agent systems lesson
-- Demonstrates chunks with technical content
-- Uncomment and modify when you have courses:
/*
INSERT INTO lesson_chunks (
  course_slug,
  lesson_slug,
  chunk_index,
  content,
  content_length,
  embedding,
  metadata
)
VALUES
  (
    'multi-agent-systems',
    'Module_01_Architecture_Overview',
    0,
    'Multi-agent systems enable complex AI applications by coordinating multiple specialized agents. Each agent has a specific role and can communicate with other agents to accomplish tasks that would be difficult for a single agent. This architecture is particularly powerful for applications requiring diverse expertise, parallel processing, or hierarchical decision-making.',
    312,
    NULL,
    '{"title": "Multi-Agent Architecture Overview", "module": "Module 1", "week": 1, "order": 1, "sectionHeaders": ["Introduction", "Architecture Concepts"]}'::jsonb
  ),
  (
    'multi-agent-systems',
    'Module_01_Architecture_Overview',
    1,
    'LangGraph provides a powerful framework for building multi-agent systems. It allows you to define agent workflows as graphs, where nodes represent agents or processing steps, and edges represent the flow of information. This graph-based approach makes it easy to visualize, debug, and modify complex agent interactions.',
    287,
    NULL,
    '{"title": "Multi-Agent Architecture Overview", "module": "Module 1", "week": 1, "order": 1, "sectionHeaders": ["LangGraph Framework", "Graph-Based Workflows"]}'::jsonb
  ),
  (
    'multi-agent-systems',
    'Module_01_Architecture_Overview',
    2,
    'When deploying multi-agent systems to production, you need to consider scalability, fault tolerance, and monitoring. Kubernetes provides excellent orchestration capabilities for running agents at scale, while observability tools help you track agent performance and debug issues in real-time.',
    256,
    NULL,
    '{"title": "Multi-Agent Architecture Overview", "module": "Module 1", "week": 1, "order": 1, "sectionHeaders": ["Production Deployment", "Scalability Considerations"]}'::jsonb
  )
ON CONFLICT (course_slug, lesson_slug, chunk_index) DO UPDATE SET
  content = EXCLUDED.content,
  content_length = EXCLUDED.content_length,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();
*/

-- Example 3: Seed chunks for a vibe coding lesson
-- Demonstrates chunks with practical, tutorial-style content
-- Uncomment and modify when you have courses:
/*
INSERT INTO lesson_chunks (
  course_slug,
  lesson_slug,
  chunk_index,
  content,
  content_length,
  embedding,
  metadata
)
VALUES
  (
    'vibe-coding-cursor-supabase',
    'Module_01_Getting_Started',
    0,
    'Vibe coding is an approach to building applications that combines rapid iteration with structural integrity. Using Cursor as your AI-powered editor and Supabase as your backend, you can build full-stack applications quickly without sacrificing code quality. This course will teach you to leverage AI assistance effectively while maintaining best practices.',
    301,
    NULL,
    '{"title": "Getting Started with Vibe Coding", "module": "Module 1", "week": 1, "order": 1, "sectionHeaders": ["Introduction", "What is Vibe Coding?"]}'::jsonb
  ),
  (
    'vibe-coding-cursor-supabase',
    'Module_01_Getting_Started',
    1,
    'Supabase provides a complete backend solution with authentication, database, storage, and edge functions. Setting up a new Supabase project is straightforward: create a project in the dashboard, configure your database schema, and set up authentication providers. The Supabase client libraries make it easy to integrate with your frontend application.',
    289,
    NULL,
    '{"title": "Getting Started with Vibe Coding", "module": "Module 1", "week": 1, "order": 1, "sectionHeaders": ["Supabase Setup", "Project Configuration"]}'::jsonb
  ),
  (
    'vibe-coding-cursor-supabase',
    'Module_01_Getting_Started',
    2,
    'Cursor enhances your development workflow by providing AI-powered code suggestions, refactoring assistance, and natural language code generation. When combined with Supabase, you can rapidly prototype features, iterate on designs, and build production-ready applications. The key is to use AI assistance strategically while maintaining code structure and testability.',
    298,
    NULL,
    '{"title": "Getting Started with Vibe Coding", "module": "Module 1", "week": 1, "order": 1, "sectionHeaders": ["Cursor Integration", "Best Practices"]}'::jsonb
  )
ON CONFLICT (course_slug, lesson_slug, chunk_index) DO UPDATE SET
  content = EXCLUDED.content,
  content_length = EXCLUDED.content_length,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();
*/

-- Example 4: Seed chunks for multiple lessons across different courses
-- Demonstrates bulk seeding pattern
-- Uncomment and modify when you have courses:
/*
DO $$
DECLARE
  course_record RECORD;
  lesson_slugs TEXT[] := ARRAY['Module_01_Introduction', 'Module_02_Fundamentals', 'Module_03_Advanced'];
  chunk_index_var INTEGER;
  content_templates TEXT[] := ARRAY[
    'This module introduces key concepts and foundational knowledge. You will learn the basics and understand how to apply them in practice.',
    'Building on the fundamentals, this section covers intermediate techniques and best practices. We explore real-world applications and common patterns.',
    'Advanced topics and expert-level techniques are covered here. This section prepares you for production deployment and optimization.'
  ];
  content_var TEXT;
BEGIN
  -- Loop through courses
  FOR course_record IN 
    SELECT slug FROM courses WHERE is_published = true LIMIT 3
  LOOP
    -- Create chunks for each lesson
    FOREACH content_var IN ARRAY content_templates
    LOOP
      chunk_index_var := 0;
      
      -- Create 2-3 chunks per lesson
      FOR chunk_index_var IN 0..2 LOOP
        INSERT INTO lesson_chunks (
          course_slug,
          lesson_slug,
          chunk_index,
          content,
          content_length,
          embedding,
          metadata
        )
        VALUES (
          course_record.slug,
          lesson_slugs[1 + (chunk_index_var % array_length(lesson_slugs, 1))],
          chunk_index_var,
          content_var || ' Chunk ' || (chunk_index_var + 1) || ' of lesson content. This demonstrates how lesson content is chunked for RAG retrieval.',
          LENGTH(content_var || ' Chunk ' || (chunk_index_var + 1) || ' of lesson content. This demonstrates how lesson content is chunked for RAG retrieval.'),
          NULL,
          jsonb_build_object(
            'title', 'Example Lesson',
            'module', 'Module ' || (chunk_index_var + 1),
            'week', 1,
            'order', chunk_index_var + 1
          )
        )
        ON CONFLICT (course_slug, lesson_slug, chunk_index) DO UPDATE SET
          content = EXCLUDED.content,
          content_length = EXCLUDED.content_length,
          metadata = EXCLUDED.metadata,
          updated_at = NOW();
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
*/

-- Note: In production, lesson chunks are typically generated programmatically:
-- 1. Load markdown lesson files from the course directory
-- 2. Chunk the content using the chunkLesson function (200-1000 chars per chunk)
-- 3. Generate embeddings via OpenAI API (1536 dimensions)
-- 4. Store chunks with metadata (title, module, section headers)
-- 
-- See lib/rag/indexLessons.ts for the implementation

COMMIT;
