-- Seed lesson_progress: Individual lesson progress tracking for students
-- NOTE: This table requires existing courses and student_profiles from auth.users
-- This script provides example queries that can be run AFTER courses and students exist
-- Uses hardcoded UUIDs to reference courses from 02_seed_content.sql
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Reference UUIDs from 02_seed_content.sql:
-- Courses: Use 'a1b2c3d4-e5f6-4789-a012-3456789abc01' through 'a1b2c3d4-e5f6-4789-a012-3456789abc14'
-- Example: Multi-Agent Systems = 'a1b2c3d4-e5f6-4789-a012-3456789abc06'

-- Dependencies:
-- - courses (seeded in 02_seed_content.sql)
-- - student_profiles (depends on profiles, which depend on auth.users)
-- - lesson_progress (depends on courses + student_profiles)

-- IMPORTANT: There is a unique constraint on (student_profile_id, course_id, lesson_slug).
-- Each student can only have one progress record per lesson.

-- Example 1: Seed lesson_progress for enrolled students
-- Creates realistic progress records with mix of started and completed lessons
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  -- Reference course UUIDs
  course_vibe_coding UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  course_prompt_eng UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  course_multi_agent UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid;
  course_ai_visibility UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc0c'::uuid;
  
  student_record RECORD;
  course_record RECORD;
  lesson_slugs TEXT[] := ARRAY['Module_01_Introduction', 'Module_02_Fundamentals', 'Module_03_Advanced', 'Module_04_Practice'];
  lesson_slug_var TEXT;
  status_var lesson_progress_status;
  last_seen_var TIMESTAMPTZ;
  completed_at_var TIMESTAMPTZ;
  progress_counter INTEGER;
BEGIN
  -- Loop through students enrolled in courses
  FOR student_record IN 
    SELECT DISTINCT sp.id as student_profile_id, ce.course_id
    FROM student_profiles sp
    JOIN course_enrollments ce ON ce.student_profile_id = sp.id
    LIMIT 10
  LOOP
    -- Get course details
    SELECT c.id, c.slug INTO course_record
    FROM courses c
    WHERE c.id = student_record.course_id;
    
    IF course_record IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Create progress for 2-4 lessons per course
    progress_counter := 0;
    FOR lesson_index IN 1..(2 + FLOOR(RANDOM() * 2)::INTEGER) LOOP
      lesson_slug_var := lesson_slugs[lesson_index];
      -- Determine status: 60% completed, 40% started
      IF RANDOM() < 0.6 THEN
        status_var := 'completed';
        -- Completed lessons: completed_at is 1-30 days after last_seen_at
        last_seen_var := NOW() - INTERVAL '1 day' * (1 + FLOOR(RANDOM() * 30)::INTEGER);
        completed_at_var := last_seen_var + INTERVAL '1 hour' * (1 + FLOOR(RANDOM() * 3)::INTEGER);
      ELSE
        status_var := 'started';
        -- Started lessons: last_seen_at is within last 7 days
        last_seen_var := NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 7)::INTEGER;
        completed_at_var := NULL;
      END IF;
      
      INSERT INTO lesson_progress (
        student_profile_id,
        course_id,
        lesson_slug,
        status,
        last_seen_at,
        completed_at
      )
      VALUES (
        student_record.student_profile_id,
        course_record.id,
        lesson_slug_var,
        status_var,
        last_seen_var,
        completed_at_var
      )
      ON CONFLICT (student_profile_id, course_id, lesson_slug) DO UPDATE SET
        status = EXCLUDED.status,
        last_seen_at = EXCLUDED.last_seen_at,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW();
      
      progress_counter := progress_counter + 1;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 2: Seed lesson_progress for specific courses
-- More controlled seeding with specific courses and lesson patterns
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  course_vibe_coding UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  course_prompt_eng UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  
  student_record RECORD;
  lesson_slug_var TEXT;
  status_var lesson_progress_status;
  last_seen_var TIMESTAMPTZ;
  completed_at_var TIMESTAMPTZ;
BEGIN
  -- Get students enrolled in specific courses
  FOR student_record IN 
    SELECT sp.id as student_profile_id, ce.course_id
    FROM student_profiles sp
    JOIN course_enrollments ce ON ce.student_profile_id = sp.id
    WHERE ce.course_id IN (course_vibe_coding, course_prompt_eng)
    LIMIT 5
  LOOP
    -- Create progress for first 3 lessons
    FOR lesson_slug_var IN 
      SELECT unnest(ARRAY['Module_01_Introduction', 'Module_02_Fundamentals', 'Module_03_Advanced'])
    LOOP
      -- First lesson: completed, second: completed, third: started
      IF lesson_slug_var = 'Module_01_Introduction' THEN
        status_var := 'completed';
        last_seen_var := NOW() - INTERVAL '10 days';
        completed_at_var := last_seen_var + INTERVAL '2 hours';
      ELSIF lesson_slug_var = 'Module_02_Fundamentals' THEN
        status_var := 'completed';
        last_seen_var := NOW() - INTERVAL '5 days';
        completed_at_var := last_seen_var + INTERVAL '3 hours';
      ELSE
        status_var := 'started';
        last_seen_var := NOW() - INTERVAL '1 day';
        completed_at_var := NULL;
      END IF;
      
      INSERT INTO lesson_progress (
        student_profile_id,
        course_id,
        lesson_slug,
        status,
        last_seen_at,
        completed_at
      )
      VALUES (
        student_record.student_profile_id,
        student_record.course_id,
        lesson_slug_var,
        status_var,
        last_seen_var,
        completed_at_var
      )
      ON CONFLICT (student_profile_id, course_id, lesson_slug) DO UPDATE SET
        status = EXCLUDED.status,
        last_seen_at = EXCLUDED.last_seen_at,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW();
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 3: Seed lesson_progress with sequential completion pattern
-- Demonstrates students progressing through lessons in order
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  course_multi_agent UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid;
  
  student_record RECORD;
  lesson_slugs TEXT[] := ARRAY[
    'Module_01_Introduction',
    'Module_02_Architecture',
    'Module_03_LangGraph',
    'Module_04_Deployment',
    'Module_05_Monitoring'
  ];
  lesson_index INTEGER;
  lesson_slug_var TEXT;
  status_var lesson_progress_status;
  last_seen_var TIMESTAMPTZ;
  completed_at_var TIMESTAMPTZ;
  base_time TIMESTAMPTZ;
BEGIN
  -- Get students enrolled in multi-agent systems course
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    JOIN course_enrollments ce ON ce.student_profile_id = sp.id
    WHERE ce.course_id = course_multi_agent
    LIMIT 3
  LOOP
    base_time := NOW() - INTERVAL '30 days';
    
    -- Create progress for lessons sequentially
    FOR lesson_index IN 1..array_length(lesson_slugs, 1) LOOP
      lesson_slug_var := lesson_slugs[lesson_index];
      
      -- First 3 lessons: completed, rest: started
      IF lesson_index <= 3 THEN
        status_var := 'completed';
        last_seen_var := base_time + INTERVAL '1 day' * (lesson_index * 2);
        completed_at_var := last_seen_var + INTERVAL '2 hours';
      ELSE
        status_var := 'started';
        last_seen_var := base_time + INTERVAL '1 day' * (lesson_index * 2);
        completed_at_var := NULL;
      END IF;
      
      INSERT INTO lesson_progress (
        student_profile_id,
        course_id,
        lesson_slug,
        status,
        last_seen_at,
        completed_at
      )
      VALUES (
        student_record.student_profile_id,
        course_multi_agent,
        lesson_slug_var,
        status_var,
        last_seen_var,
        completed_at_var
      )
      ON CONFLICT (student_profile_id, course_id, lesson_slug) DO UPDATE SET
        status = EXCLUDED.status,
        last_seen_at = EXCLUDED.last_seen_at,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW();
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 4: Simple seed - Create progress for all enrolled students
-- Most straightforward approach - creates progress for first lesson of each enrolled course
-- Uncomment and modify when you have student profiles:
/*
INSERT INTO lesson_progress (student_profile_id, course_id, lesson_slug, status, last_seen_at, completed_at)
SELECT 
  ce.student_profile_id,
  ce.course_id,
  'Module_01_Introduction' as lesson_slug,
  CASE 
    WHEN RANDOM() < 0.5 THEN 'completed'::lesson_progress_status
    ELSE 'started'::lesson_progress_status
  END as status,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 14)::INTEGER as last_seen_at,
  CASE 
    WHEN RANDOM() < 0.5 THEN NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 7)::INTEGER
    ELSE NULL
  END as completed_at
FROM course_enrollments ce
WHERE ce.progress_percentage > 0  -- Only for students who have started
ON CONFLICT (student_profile_id, course_id, lesson_slug) DO UPDATE SET
  status = EXCLUDED.status,
  last_seen_at = EXCLUDED.last_seen_at,
  completed_at = EXCLUDED.completed_at,
  updated_at = NOW();
*/

COMMIT;
