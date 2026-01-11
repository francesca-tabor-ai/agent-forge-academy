-- Seed course_enrollments: student enrollments in courses
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
-- - course_enrollments (depends on courses + student_profiles)

-- IMPORTANT: There is a unique constraint on (course_id, student_profile_id).
-- Each student can only be enrolled once per course.

-- Example: Seed course_enrollments for students
-- Creates realistic enrollments with various progress levels
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  -- Reference course UUIDs
  course_vibe_coding UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  course_prompt_eng UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  course_agentic_rag UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc05'::uuid;
  course_multi_agent UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid;
  course_ai_visibility UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc0c'::uuid;
  course_spec_dev UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid;
  course_ai_pipelines UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid;
  
  student_record RECORD;
  course_id_var UUID;
  enrollment_time TIMESTAMPTZ;
  progress_var INTEGER;
  completed_var BOOLEAN;
  completed_time TIMESTAMPTZ;
  enrollment_counter INTEGER := 0;
  course_list UUID[] := ARRAY[
    course_vibe_coding,
    course_prompt_eng,
    course_agentic_rag,
    course_multi_agent,
    course_ai_visibility,
    course_spec_dev,
    course_ai_pipelines
  ];
BEGIN
  -- Loop through student profiles and create enrollments
  FOR student_record IN 
    SELECT sp.id as student_profile_id, sp.created_at
    FROM student_profiles sp
    ORDER BY sp.created_at
    LIMIT 20
  LOOP
    -- Each student enrolls in 2-5 courses
    FOR enrollment_counter IN 1..(2 + FLOOR(RANDOM() * 4)::INTEGER)
    LOOP
      -- Select a random course from the list
      course_id_var := course_list[1 + FLOOR(RANDOM() * (array_length(course_list, 1) - 1))::INTEGER];
      
      -- Check if already enrolled (respect unique constraint)
      IF NOT EXISTS (
        SELECT 1 FROM course_enrollments ce
        WHERE ce.course_id = course_id_var
          AND ce.student_profile_id = student_record.student_profile_id
      ) THEN
        -- Enrollment time is after student profile creation
        enrollment_time := student_record.created_at + INTERVAL '1 day' + (RANDOM() * INTERVAL '60 days');
        
        -- Determine progress and completion status
        -- 20% chance of completed, 30% chance of high progress (80-99%), 50% chance of low-mid progress (0-79%)
        IF RANDOM() < 0.2 THEN
          -- Completed course
          completed_var := true;
          progress_var := 100;
          completed_time := enrollment_time + INTERVAL '7 days' + (RANDOM() * INTERVAL '30 days');
        ELSIF RANDOM() < 0.5 THEN
          -- High progress (80-99%)
          completed_var := false;
          progress_var := 80 + FLOOR(RANDOM() * 20)::INTEGER;
          completed_time := NULL;
        ELSE
          -- Low-mid progress (0-79%)
          completed_var := false;
          progress_var := FLOOR(RANDOM() * 80)::INTEGER;
          completed_time := NULL;
        END IF;
        
        -- Insert enrollment
        INSERT INTO course_enrollments (
          course_id,
          student_profile_id,
          enrolled_at,
          completed_at,
          progress_percentage,
          created_at
        )
        VALUES (
          course_id_var,
          student_record.student_profile_id,
          enrollment_time,
          completed_time,
          progress_var,
          enrollment_time
        );
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Seeded course enrollments for students';
END $$;
*/

-- Alternative: Simple seed with enrollments in specific courses
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  -- Reference course by hardcoded UUID (Multi-Agent Systems)
  course_id_var UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid;
BEGIN
  -- Insert enrollments using the hardcoded course ID
  INSERT INTO course_enrollments (course_id, student_profile_id, progress_percentage)
  SELECT 
    course_id_var,
    sp.id,
    FLOOR(RANDOM() * 100)::INTEGER
  FROM student_profiles sp
  LIMIT 10
  ON CONFLICT (course_id, student_profile_id) DO NOTHING;
END $$;
*/

-- Example: Seed enrollments for beginner courses (most popular)
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  -- Beginner courses
  course_vibe_coding UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  course_prompt_eng UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  course_spec_dev UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid;
  
  student_record RECORD;
  course_id_var UUID;
  enrollment_time TIMESTAMPTZ;
BEGIN
  -- Enroll students in beginner courses
  FOR student_record IN 
    SELECT sp.id as student_profile_id, sp.created_at
    FROM student_profiles sp
    ORDER BY sp.created_at
    LIMIT 15
  LOOP
    -- Each student enrolls in at least one beginner course
    course_id_var := CASE (FLOOR(RANDOM() * 3)::INTEGER)
      WHEN 0 THEN course_vibe_coding
      WHEN 1 THEN course_prompt_eng
      ELSE course_spec_dev
    END;
    
    enrollment_time := student_record.created_at + INTERVAL '1 day' + (RANDOM() * INTERVAL '7 days');
    
    INSERT INTO course_enrollments (
      course_id,
      student_profile_id,
      enrolled_at,
      progress_percentage,
      created_at
    )
    VALUES (
      course_id_var,
      student_record.student_profile_id,
      enrollment_time,
      FLOOR(RANDOM() * 50)::INTEGER, -- Early progress for beginners
      enrollment_time
    )
    ON CONFLICT (course_id, student_profile_id) DO NOTHING;
  END LOOP;
END $$;
*/

-- Example: Seed completed enrollments
-- Creates enrollments that have been completed
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  course_vibe_coding UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  course_prompt_eng UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  
  student_record RECORD;
  enrollment_time TIMESTAMPTZ;
  completed_time TIMESTAMPTZ;
BEGIN
  -- Create completed enrollments
  FOR student_record IN 
    SELECT sp.id as student_profile_id, sp.created_at
    FROM student_profiles sp
    ORDER BY RANDOM()
    LIMIT 5
  LOOP
    enrollment_time := student_record.created_at + INTERVAL '1 day';
    completed_time := enrollment_time + INTERVAL '7 days' + (RANDOM() * INTERVAL '14 days');
    
    -- Enroll in Vibe Coding and complete it
    INSERT INTO course_enrollments (
      course_id,
      student_profile_id,
      enrolled_at,
      completed_at,
      progress_percentage,
      created_at
    )
    VALUES (
      course_vibe_coding,
      student_record.student_profile_id,
      enrollment_time,
      completed_time,
      100,
      enrollment_time
    )
    ON CONFLICT (course_id, student_profile_id) DO UPDATE SET
      completed_at = EXCLUDED.completed_at,
      progress_percentage = 100,
      updated_at = NOW();
  END LOOP;
END $$;
*/

COMMIT;
