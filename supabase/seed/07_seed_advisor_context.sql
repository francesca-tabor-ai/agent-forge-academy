-- Seed advisor_context: active context for students
-- NOTE: This table requires existing student_profiles from auth.users
-- This script provides example queries that can be run AFTER users have signed up
-- Uses hardcoded UUIDs to reference parent records (courses, jobs, etc.)
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Reference UUIDs from other seed scripts:
-- Courses: Use 'a1b2c3d4-e5f6-4789-a012-3456789abc01' through 'a1b2c3d4-e5f6-4789-a012-3456789abc14'
-- Jobs: Use 'c1b2c3d4-e5f6-4789-a012-3456789abc01' through 'c1b2c3d4-e5f6-4789-a012-3456789abc06'
-- Portfolio projects: Created dynamically per student_profile_id

-- Dependencies:
-- - student_profiles (depends on profiles, which depend on auth.users)
-- - courses (seeded in 02_seed_content.sql)
-- - jobs (seeded in 04_seed_jobs_offers.sql)
-- - portfolio_projects (depends on student_profiles)

-- Example: Seed advisor_context for students
-- Creates context entries with various combinations of active course, project, and job
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  -- Reference course UUIDs
  course_multi_agent UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid;
  course_agentic_rag UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc05'::uuid;
  course_vibe_coding UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  course_ai_visibility UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc0c'::uuid;
  course_prompt_eng UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  
  -- Reference job UUIDs
  job_ai_engineer UUID := 'c1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid;
  job_fullstack UUID := 'c1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid;
  job_ai_visibility UUID := 'c1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  job_ecommerce UUID := 'c1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  
  student_record RECORD;
  project_id_var UUID;
  context_counter INTEGER := 0;
BEGIN
  -- Loop through student profiles and create context entries
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    ORDER BY sp.created_at
    LIMIT 20
  LOOP
    -- Get a random portfolio project for this student (if any exist)
    SELECT pp.id INTO project_id_var
    FROM portfolio_projects pp
    WHERE pp.student_profile_id = student_record.student_profile_id
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- Create context with different scenarios based on counter
    CASE (context_counter % 5)
      WHEN 0 THEN
        -- Scenario 1: Active course only (Multi-Agent Systems)
        INSERT INTO advisor_context (
          student_profile_id,
          active_course_id,
          active_project_id,
          active_job_id
        )
        VALUES (
          student_record.student_profile_id,
          course_multi_agent,
          NULL,
          NULL
        )
        ON CONFLICT (student_profile_id) DO UPDATE SET
          active_course_id = EXCLUDED.active_course_id,
          active_project_id = EXCLUDED.active_project_id,
          active_job_id = EXCLUDED.active_job_id,
          updated_at = NOW();
      
      WHEN 1 THEN
        -- Scenario 2: Active course + project (Agentic RAG)
        INSERT INTO advisor_context (
          student_profile_id,
          active_course_id,
          active_project_id,
          active_job_id
        )
        VALUES (
          student_record.student_profile_id,
          course_agentic_rag,
          project_id_var,
          NULL
        )
        ON CONFLICT (student_profile_id) DO UPDATE SET
          active_course_id = EXCLUDED.active_course_id,
          active_project_id = EXCLUDED.active_project_id,
          active_job_id = EXCLUDED.active_job_id,
          updated_at = NOW();
      
      WHEN 2 THEN
        -- Scenario 3: Active course + job (Vibe Coding + Full-Stack job)
        INSERT INTO advisor_context (
          student_profile_id,
          active_course_id,
          active_project_id,
          active_job_id
        )
        VALUES (
          student_record.student_profile_id,
          course_vibe_coding,
          NULL,
          job_fullstack
        )
        ON CONFLICT (student_profile_id) DO UPDATE SET
          active_course_id = EXCLUDED.active_course_id,
          active_project_id = EXCLUDED.active_project_id,
          active_job_id = EXCLUDED.active_job_id,
          updated_at = NOW();
      
      WHEN 3 THEN
        -- Scenario 4: Active job only (AI Engineer)
        INSERT INTO advisor_context (
          student_profile_id,
          active_course_id,
          active_project_id,
          active_job_id
        )
        VALUES (
          student_record.student_profile_id,
          NULL,
          NULL,
          job_ai_engineer
        )
        ON CONFLICT (student_profile_id) DO UPDATE SET
          active_course_id = EXCLUDED.active_course_id,
          active_project_id = EXCLUDED.active_project_id,
          active_job_id = EXCLUDED.active_job_id,
          updated_at = NOW();
      
      WHEN 4 THEN
        -- Scenario 5: All three active (AI Visibility course + project + job)
        INSERT INTO advisor_context (
          student_profile_id,
          active_course_id,
          active_project_id,
          active_job_id
        )
        VALUES (
          student_record.student_profile_id,
          course_ai_visibility,
          project_id_var,
          job_ai_visibility
        )
        ON CONFLICT (student_profile_id) DO UPDATE SET
          active_course_id = EXCLUDED.active_course_id,
          active_project_id = EXCLUDED.active_project_id,
          active_job_id = EXCLUDED.active_job_id,
          updated_at = NOW();
    END CASE;
    
    context_counter := context_counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Seeded advisor_context for % students', context_counter;
END $$;
*/

-- Alternative: Simple seed with just active courses
-- Uncomment and modify when you have student profiles:
/*
DO $$
DECLARE
  -- Reference course UUIDs
  course_multi_agent UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc06'::uuid;
  course_agentic_rag UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc05'::uuid;
  course_vibe_coding UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  course_prompt_eng UUID := 'a1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
BEGIN
  -- Assign random courses to students
  INSERT INTO advisor_context (student_profile_id, active_course_id)
  SELECT 
    sp.id,
    CASE (ROW_NUMBER() OVER () % 4)
      WHEN 0 THEN course_multi_agent
      WHEN 1 THEN course_agentic_rag
      WHEN 2 THEN course_vibe_coding
      ELSE course_prompt_eng
    END
  FROM student_profiles sp
  LIMIT 20
  ON CONFLICT (student_profile_id) DO UPDATE SET
    active_course_id = EXCLUDED.active_course_id,
    updated_at = NOW();
END $$;
*/

COMMIT;
