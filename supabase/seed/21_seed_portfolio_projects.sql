-- Seed portfolio_projects: Student portfolio projects
-- NOTE: This table requires existing student_profiles from auth.users
-- This script provides example queries that can be run AFTER student_profiles exist
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Dependencies:
-- - student_profiles (depends on profiles, which depend on auth.users)
-- - portfolio_projects (depends on student_profiles)

-- IMPORTANT: 
-- - Each project belongs to exactly one student via student_profile_id
-- - Projects can have independent visibility from the student profile
-- - Visibility levels: 'private', 'recruiters_only', 'public'

-- Example 1: Seed portfolio_projects for students
-- Creates realistic portfolio projects with various visibility levels
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  student_record RECORD;
  project_titles TEXT[] := ARRAY[
    'AI-Powered E-commerce Recommender',
    'Multi-Agent Task Management System',
    'RAG-Powered Knowledge Base',
    '3D Product Visualization Platform',
    'Conversational Commerce Chatbot',
    'LLM-First Portfolio Website',
    'AI Content Generation Pipeline',
    'Vector Search Application',
    'Agentic Workflow Automation',
    'Real-time Analytics Dashboard'
  ];
  project_descriptions TEXT[] := ARRAY[
    'A recommendation system that uses collaborative filtering and content-based approaches to suggest products to users.',
    'A multi-agent system built with LangGraph that coordinates tasks across multiple specialized AI agents.',
    'A retrieval-augmented generation system that provides accurate answers by combining vector search with LLM generation.',
    'An interactive 3D product viewer built with Three.js that allows customers to explore products in detail.',
    'An intelligent chatbot that helps customers find products and complete purchases through natural conversation.',
    'A website optimized for AI intermediaries with structured data, semantic HTML, and intent-driven APIs.',
    'An automated content pipeline that generates, reviews, and publishes content while maintaining brand consistency.',
    'A semantic search application that uses vector embeddings to find similar documents and content.',
    'An autonomous workflow system that uses AI agents to automate complex business processes.',
    'A real-time dashboard that visualizes key metrics and provides actionable insights for decision-making.'
  ];
  github_urls TEXT[] := ARRAY[
    'https://github.com/student/ecommerce-recommender',
    'https://github.com/student/multi-agent-system',
    'https://github.com/student/rag-knowledge-base',
    'https://github.com/student/3d-product-viewer',
    'https://github.com/student/commerce-chatbot',
    'https://github.com/student/llm-first-website',
    'https://github.com/student/content-pipeline',
    'https://github.com/student/vector-search-app',
    'https://github.com/student/workflow-automation',
    'https://github.com/student/analytics-dashboard'
  ];
  demo_urls TEXT[] := ARRAY[
    'https://demo.example.com/ecommerce-recommender',
    'https://demo.example.com/multi-agent-system',
    'https://demo.example.com/rag-knowledge-base',
    'https://demo.example.com/3d-product-viewer',
    'https://demo.example.com/commerce-chatbot',
    'https://demo.example.com/llm-first-website',
    'https://demo.example.com/content-pipeline',
    'https://demo.example.com/vector-search-app',
    'https://demo.example.com/workflow-automation',
    'https://demo.example.com/analytics-dashboard'
  ];
  project_index INTEGER;
  title_var TEXT;
  description_var TEXT;
  github_url_var TEXT;
  demo_url_var TEXT;
  visibility_var visibility_level;
  project_counter INTEGER;
BEGIN
  -- Loop through students
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    LIMIT 10
  LOOP
    -- Each student has 2-5 projects
    project_counter := 0;
    FOR project_index IN 1..(2 + FLOOR(RANDOM() * 3)::INTEGER) LOOP
      title_var := project_titles[1 + FLOOR(RANDOM() * (array_length(project_titles, 1) - 1))::INTEGER];
      description_var := project_descriptions[1 + FLOOR(RANDOM() * (array_length(project_descriptions, 1) - 1))::INTEGER];
      github_url_var := github_urls[1 + FLOOR(RANDOM() * (array_length(github_urls, 1) - 1))::INTEGER];
      
      -- 70% have demo URLs
      IF RANDOM() < 0.7 THEN
        demo_url_var := demo_urls[1 + FLOOR(RANDOM() * (array_length(demo_urls, 1) - 1))::INTEGER];
      ELSE
        demo_url_var := NULL;
      END IF;
      
      -- Visibility distribution: 30% private, 40% recruiters_only, 30% public
      IF RANDOM() < 0.3 THEN
        visibility_var := 'private';
      ELSIF RANDOM() < 0.7 THEN
        visibility_var := 'recruiters_only';
      ELSE
        visibility_var := 'public';
      END IF;
      
      INSERT INTO portfolio_projects (
        student_profile_id,
        title,
        description,
        github_url,
        demo_url,
        visibility,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        title_var,
        description_var,
        github_url_var,
        demo_url_var,
        visibility_var,
        NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 90)::INTEGER
      )
      ON CONFLICT DO NOTHING;
      
      project_counter := project_counter + 1;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 2: Seed portfolio_projects with specific project types
-- More controlled seeding with specific project categories
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  student_record RECORD;
  project_type INTEGER;
  title_var TEXT;
  description_var TEXT;
  github_url_var TEXT;
  demo_url_var TEXT;
  visibility_var visibility_level;
BEGIN
  -- Get students
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    LIMIT 5
  LOOP
    -- Create 3 projects per student with different types
    FOR project_type IN 1..3 LOOP
      IF project_type = 1 THEN
        -- AI/ML Project
        title_var := 'AI Recommendation Engine';
        description_var := 'Built a collaborative filtering recommendation system using Python and TensorFlow. Achieved 85% accuracy on test data.';
        github_url_var := 'https://github.com/student/ai-recommender';
        demo_url_var := 'https://demo.example.com/ai-recommender';
        visibility_var := 'public';
      ELSIF project_type = 2 THEN
        -- Full-Stack Project
        title_var := 'E-commerce Platform';
        description_var := 'Full-stack e-commerce application built with Next.js, Supabase, and Stripe. Features include product catalog, cart, and checkout.';
        github_url_var := 'https://github.com/student/ecommerce-platform';
        demo_url_var := 'https://demo.example.com/ecommerce';
        visibility_var := 'recruiters_only';
      ELSE
        -- Multi-Agent Project
        title_var := 'Multi-Agent Task Coordinator';
        description_var := 'Production-ready multi-agent system using LangGraph. Coordinates tasks across specialized agents with fault tolerance.';
        github_url_var := 'https://github.com/student/multi-agent-coordinator';
        demo_url_var := NULL;
        visibility_var := 'public';
      END IF;
      
      INSERT INTO portfolio_projects (
        student_profile_id,
        title,
        description,
        github_url,
        demo_url,
        visibility,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        title_var,
        description_var,
        github_url_var,
        demo_url_var,
        visibility_var,
        NOW() - INTERVAL '1 day' * (30 + project_type * 10)
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 3: Seed portfolio_projects with images
-- Demonstrates projects with cover images and image arrays
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  student_record RECORD;
  project_titles TEXT[] := ARRAY[
    'AI-Powered E-commerce Recommender',
    'Multi-Agent Task Management System',
    'RAG-Powered Knowledge Base'
  ];
  title_var TEXT;
  description_var TEXT;
  github_url_var TEXT;
  demo_url_var TEXT;
  visibility_var visibility_level;
  cover_image_var TEXT;
  images_var JSONB;
BEGIN
  -- Get students
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    LIMIT 3
  LOOP
    -- Create projects with images
    FOR title_var IN 
      SELECT unnest(project_titles)
    LOOP
      description_var := 'A comprehensive project showcasing ' || LOWER(title_var) || ' with production-ready features and best practices.';
      github_url_var := 'https://github.com/student/' || LOWER(REPLACE(title_var, ' ', '-'));
      demo_url_var := 'https://demo.example.com/' || LOWER(REPLACE(title_var, ' ', '-'));
      
      -- Visibility: mix of public and recruiters_only
      IF RANDOM() < 0.5 THEN
        visibility_var := 'public';
      ELSE
        visibility_var := 'recruiters_only';
      END IF;
      
      -- Cover image URL
      cover_image_var := 'https://images.example.com/projects/' || LOWER(REPLACE(title_var, ' ', '-')) || '-cover.jpg';
      
      -- Images array (2-4 images)
      images_var := jsonb_build_array(
        'https://images.example.com/projects/' || LOWER(REPLACE(title_var, ' ', '-')) || '-1.jpg',
        'https://images.example.com/projects/' || LOWER(REPLACE(title_var, ' ', '-')) || '-2.jpg',
        CASE WHEN RANDOM() < 0.7 THEN 'https://images.example.com/projects/' || LOWER(REPLACE(title_var, ' ', '-')) || '-3.jpg' ELSE NULL END,
        CASE WHEN RANDOM() < 0.5 THEN 'https://images.example.com/projects/' || LOWER(REPLACE(title_var, ' ', '-')) || '-4.jpg' ELSE NULL END
      );
      
      INSERT INTO portfolio_projects (
        student_profile_id,
        title,
        description,
        github_url,
        demo_url,
        visibility,
        cover_image_url,
        images,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        title_var,
        description_var,
        github_url_var,
        demo_url_var,
        visibility_var,
        cover_image_var,
        images_var,
        NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 60)::INTEGER
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 4: Simple seed - Create projects for all students
-- Most straightforward approach - creates 2-4 projects per student
-- Uncomment and modify when you have student profiles:
/*
INSERT INTO portfolio_projects (
  student_profile_id,
  title,
  description,
  github_url,
  demo_url,
  visibility,
  created_at
)
SELECT 
  sp.id as student_profile_id,
  'Project ' || row_number() OVER (PARTITION BY sp.id ORDER BY RANDOM()) as title,
  'A portfolio project showcasing skills in AI, web development, and software engineering. Built with modern technologies and best practices.' as description,
  'https://github.com/student/project-' || row_number() OVER (PARTITION BY sp.id ORDER BY RANDOM()) as github_url,
  CASE 
    WHEN RANDOM() < 0.7 THEN 'https://demo.example.com/project-' || row_number() OVER (PARTITION BY sp.id ORDER BY RANDOM())
    ELSE NULL
  END as demo_url,
  CASE 
    WHEN RANDOM() < 0.3 THEN 'private'::visibility_level
    WHEN RANDOM() < 0.7 THEN 'recruiters_only'::visibility_level
    ELSE 'public'::visibility_level
  END as visibility,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 90)::INTEGER as created_at
FROM student_profiles sp
CROSS JOIN generate_series(1, 2 + FLOOR(RANDOM() * 2)::INTEGER)  -- 2-4 projects per student
ON CONFLICT DO NOTHING;
*/

COMMIT;
