-- Seed questions: Student questions about lessons, labs, and projects
-- NOTE: This table requires existing student_profiles
-- This script provides example queries that can be run AFTER student_profiles exist
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Dependencies:
-- - student_profiles (depends on profiles, which depend on auth.users)
-- - questions (depends on student_profiles)

-- IMPORTANT: 
-- - Questions belong to lessons, labs, or projects (context_type)
-- - context_id references lesson ID, lab ID, or project ID (VARCHAR(255))
-- - Context types: 'lesson', 'lab', 'project'
-- - Students can only edit their own questions

-- Example 1: Seed questions for students
-- Creates realistic questions about lessons, labs, and projects
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  student_record RECORD;
  context_type_var question_context_type;
  context_id_var VARCHAR(255);
  question_titles TEXT[] := ARRAY[
    'How do I implement vector search?',
    'What is the best way to structure a multi-agent system?',
    'How do I handle errors in LangGraph?',
    'What database should I use for RAG?',
    'How do I deploy a Next.js app to production?',
    'What is the difference between embeddings and fine-tuning?',
    'How do I optimize prompt performance?',
    'What is the best way to test AI features?',
    'How do I handle rate limiting in API calls?',
    'What is the recommended architecture for agentic systems?'
  ];
  question_bodies TEXT[] := ARRAY[
    'I''m working on a RAG application and need help implementing vector search. What are the best practices for indexing and querying vectors?',
    'I''m building a multi-agent system and wondering about the best architecture. Should I use a coordinator pattern or something else?',
    'I''m getting errors in my LangGraph workflow. How do I properly handle exceptions and retries?',
    'I need to choose a database for my RAG application. Should I use Pinecone, Weaviate, or something else?',
    'I''ve built a Next.js app and want to deploy it. What are the best practices for deployment and environment variables?',
    'I''m confused about the difference between embeddings and fine-tuning. When should I use each approach?',
    'My prompts are not performing well. How can I optimize them for better results?',
    'I want to test my AI features before deploying. What testing strategies work best for LLM applications?',
    'I''m making API calls to OpenAI and hitting rate limits. How should I handle this gracefully?',
    'I''m designing an agentic system and want to know the recommended architecture patterns. What should I consider?'
  ];
  title_var TEXT;
  body_var TEXT;
  question_counter INTEGER;
BEGIN
  -- Loop through students
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    LIMIT 15
  LOOP
    -- Each student asks 2-4 questions
    question_counter := 0;
    FOR question_counter IN 1..(2 + FLOOR(RANDOM() * 2)::INTEGER) LOOP
      -- 50% lesson questions, 30% lab questions, 20% project questions
      IF RANDOM() < 0.5 THEN
        context_type_var := 'lesson';
        -- Lesson context IDs (example: course-slug/lesson-slug or just lesson-slug)
        context_id_var := CASE 
          WHEN RANDOM() < 0.2 THEN 'prompt-engineering/Module_01_Introduction'
          WHEN RANDOM() < 0.4 THEN 'agentic-rag/Module_02_Vector_Search'
          WHEN RANDOM() < 0.6 THEN 'multi-agent-systems/Module_03_Coordination'
          WHEN RANDOM() < 0.8 THEN 'vibe-coding-cursor-supabase/Module_04_Database'
          ELSE 'ai-native-software-delivery-pipelines/Module_05_Deployment'
        END;
      ELSIF RANDOM() < 0.8 THEN
        context_type_var := 'lab';
        -- Lab context IDs
        context_id_var := 'lab-' || (100 + FLOOR(RANDOM() * 50)::INTEGER)::TEXT;
      ELSE
        context_type_var := 'project';
        -- Project context IDs (could reference portfolio project IDs or slugs)
        context_id_var := 'project-' || (1 + FLOOR(RANDOM() * 10)::INTEGER)::TEXT;
      END IF;
      
      title_var := question_titles[1 + FLOOR(RANDOM() * (array_length(question_titles, 1) - 1))::INTEGER];
      body_var := question_bodies[1 + FLOOR(RANDOM() * (array_length(question_bodies, 1) - 1))::INTEGER];
      
      INSERT INTO questions (
        student_profile_id,
        context_type,
        context_id,
        title,
        body,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        context_type_var,
        context_id_var,
        title_var,
        body_var,
        NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 60)::INTEGER
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 2: Seed questions with specific context types
-- More controlled seeding with specific question types
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  student_record RECORD;
  question_index INTEGER;
  context_type_var question_context_type;
  context_id_var VARCHAR(255);
  title_var TEXT;
  body_var TEXT;
BEGIN
  -- Get students
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    LIMIT 10
  LOOP
    -- Create 3 questions per student with different context types
    FOR question_index IN 1..3 LOOP
      IF question_index = 1 THEN
        -- Lesson question
        context_type_var := 'lesson';
        context_id_var := 'prompt-engineering/Module_02_Advanced_Prompts';
        title_var := 'How do I structure complex prompts?';
        body_var := 'I''m working through the prompt engineering course and need help structuring complex prompts with multiple steps. What are the best practices?';
      ELSIF question_index = 2 THEN
        -- Lab question
        context_type_var := 'lab';
        context_id_var := 'lab-101';
        title_var := 'Lab 101 not working as expected';
        body_var := 'I''m following the lab instructions but getting unexpected results. Has anyone else encountered this issue?';
      ELSE
        -- Project question
        context_type_var := 'project';
        context_id_var := 'project-rag-system';
        title_var := 'Best practices for RAG project architecture';
        body_var := 'I''m building a RAG system for my portfolio project. What architecture patterns should I consider?';
      END IF;
      
      INSERT INTO questions (
        student_profile_id,
        context_type,
        context_id,
        title,
        body,
        created_at
      )
      VALUES (
        student_record.student_profile_id,
        context_type_var,
        context_id_var,
        title_var,
        body_var,
        NOW() - INTERVAL '1 day' * (10 + question_index * 5)
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 3: Seed questions linked to enrolled courses
-- Creates questions for courses that students are enrolled in
-- Uncomment and modify when you have student profiles and course enrollments:
/*
DO $$
DECLARE
  enrollment_record RECORD;
  context_type_var question_context_type;
  context_id_var VARCHAR(255);
  title_var TEXT;
  body_var TEXT;
  lesson_slugs TEXT[] := ARRAY[
    'Module_01_Introduction',
    'Module_02_Fundamentals',
    'Module_03_Advanced',
    'Module_04_Practical',
    'Module_05_Deployment'
  ];
BEGIN
  -- Get course enrollments
  FOR enrollment_record IN 
    SELECT 
      ce.student_profile_id,
      c.slug as course_slug,
      c.title as course_title
    FROM course_enrollments ce
    JOIN courses c ON c.id = ce.course_id
    WHERE c.is_published = true
    LIMIT 20
  LOOP
    -- 70% chance to create a question for this enrollment
    IF RANDOM() < 0.7 THEN
      context_type_var := 'lesson';
      context_id_var := enrollment_record.course_slug || '/' || lesson_slugs[1 + FLOOR(RANDOM() * (array_length(lesson_slugs, 1) - 1))::INTEGER];
      title_var := 'Question about ' || enrollment_record.course_title;
      body_var := 'I''m working through ' || enrollment_record.course_title || ' and have a question about this lesson. Can someone help?';
      
      INSERT INTO questions (
        student_profile_id,
        context_type,
        context_id,
        title,
        body,
        created_at
      )
      VALUES (
        enrollment_record.student_profile_id,
        context_type_var,
        context_id_var,
        title_var,
        body_var,
        NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)::INTEGER
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
*/

-- Example 4: Seed questions linked to portfolio projects
-- Creates questions about students' portfolio projects
-- Uncomment and modify when you have student profiles and portfolio projects:
/*
DO $$
DECLARE
  project_record RECORD;
  title_var TEXT;
  body_var TEXT;
BEGIN
  -- Get portfolio projects
  FOR project_record IN 
    SELECT 
      pp.id as project_id,
      pp.title as project_title,
      pp.student_profile_id
    FROM portfolio_projects pp
    LIMIT 15
  LOOP
    -- 30% chance to create a question about this project
    IF RANDOM() < 0.3 THEN
      title_var := 'Question about ' || project_record.project_title;
      body_var := 'I''m working on ' || project_record.project_title || ' and need help with implementation. What are the best practices?';
      
      INSERT INTO questions (
        student_profile_id,
        context_type,
        context_id,
        title,
        body,
        created_at
      )
      VALUES (
        project_record.student_profile_id,
        'project',
        project_record.project_id::TEXT,
        title_var,
        body_var,
        NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 45)::INTEGER
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
*/

-- Example 5: Simple seed - Create questions for all students
-- Most straightforward approach - creates 2-3 questions per student
-- Uncomment and modify when you have student profiles:
/*
INSERT INTO questions (
  student_profile_id,
  context_type,
  context_id,
  title,
  body,
  created_at
)
SELECT 
  sp.id as student_profile_id,
  CASE 
    WHEN RANDOM() < 0.5 THEN 'lesson'::question_context_type
    WHEN RANDOM() < 0.8 THEN 'lab'::question_context_type
    ELSE 'project'::question_context_type
  END as context_type,
  CASE 
    WHEN RANDOM() < 0.5 THEN 'lesson-' || (1 + FLOOR(RANDOM() * 10)::INTEGER)::TEXT
    WHEN RANDOM() < 0.8 THEN 'lab-' || (100 + FLOOR(RANDOM() * 50)::INTEGER)::TEXT
    ELSE 'project-' || (1 + FLOOR(RANDOM() * 10)::INTEGER)::TEXT
  END as context_id,
  'Question ' || row_number() OVER (PARTITION BY sp.id ORDER BY RANDOM()) as title,
  'I have a question about this ' || 
  CASE 
    WHEN RANDOM() < 0.5 THEN 'lesson'
    WHEN RANDOM() < 0.8 THEN 'lab'
    ELSE 'project'
  END || 
  '. Can someone help me understand this better?' as body,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 60)::INTEGER as created_at
FROM student_profiles sp
CROSS JOIN generate_series(1, 2 + FLOOR(RANDOM() * 1)::INTEGER)  -- 2-3 questions per student
ON CONFLICT DO NOTHING;
*/

COMMIT;
