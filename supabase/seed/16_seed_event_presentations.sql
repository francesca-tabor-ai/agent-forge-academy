-- Seed event_presentations: Links students to projects they're presenting at events
-- NOTE: This table requires existing events, student_profiles, and portfolio_projects
-- This script provides example queries that can be run AFTER events, student_profiles, and portfolio_projects exist
-- Uses hardcoded UUIDs to reference events from 03_seed_events.sql
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Reference UUIDs from 03_seed_events.sql:
-- Events: Use 'b1b2c3d4-e5f6-4789-a012-3456789abc01' through 'b1b2c3d4-e5f6-4789-a012-3456789abc04'
-- Example: Q1 2025 Demo Day = 'b1b2c3d4-e5f6-4789-a012-3456789abc01'

-- Dependencies:
-- - events (seeded in 03_seed_events.sql)
-- - student_profiles (depends on profiles - cannot be seeded directly)
-- - portfolio_projects (depends on student_profiles - cannot be seeded directly)
-- - event_presentations (depends on events + student_profiles + portfolio_projects)

-- IMPORTANT: Presentations are typically only for demo_day events, not workshops or networking events.
-- Each student can present multiple projects at the same event (different presentation_order).

-- Example 1: Seed event_presentations for demo_day events
-- Creates presentations linking students with their visible portfolio projects
-- Uncomment and modify when you have events, student_profiles, and portfolio_projects:
/*
DO $$
DECLARE
  -- Reference event UUIDs (demo_day events only)
  event_demo_day_q1 UUID := 'b1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid;  -- Q1 2025 Demo Day
  event_demo_day_q4 UUID := 'b1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;  -- Q4 2024 Demo Day Recording
  
  event_record RECORD;
  presentation_counter INTEGER;
  order_counter INTEGER;
BEGIN
  -- Loop through demo_day events
  FOR event_record IN 
    SELECT e.id as event_id, e.title, e.start_time
    FROM events e
    WHERE e.event_type = 'demo_day'
    ORDER BY e.start_time
  LOOP
    order_counter := 1;
    
    -- Create presentations for students with visible portfolio projects
    -- Each student can present 1-2 projects at a demo day
    FOR presentation_counter IN 1..15 LOOP
      INSERT INTO event_presentations (
        event_id,
        student_profile_id,
        portfolio_project_id,
        presentation_title,
        presentation_order
      )
      SELECT 
        event_record.event_id,
        sp.id,
        pp.id,
        -- Use project title as presentation title, or create a custom one
        CASE 
          WHEN RANDOM() < 0.3 THEN pp.title || ' - Demo & Q&A'
          WHEN RANDOM() < 0.6 THEN pp.title || ' - Project Showcase'
          ELSE pp.title
        END,
        order_counter
      FROM student_profiles sp
      JOIN portfolio_projects pp ON pp.student_profile_id = sp.id
      WHERE pp.visibility IN ('public', 'recruiters_only')
        -- Avoid duplicate presentations for the same student at the same event
        AND NOT EXISTS (
          SELECT 1 FROM event_presentations ep
          WHERE ep.event_id = event_record.event_id
            AND ep.student_profile_id = sp.id
        )
      ORDER BY RANDOM()
      LIMIT 1
      ON CONFLICT DO NOTHING;
      
      -- Only increment order if we actually inserted a row
      IF FOUND THEN
        order_counter := order_counter + 1;
      END IF;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 2: Seed event_presentations with specific projects for Q1 2025 Demo Day
-- More controlled seeding with specific students and projects
-- Uncomment and modify when you have events, student_profiles, and portfolio_projects:
/*
DO $$
DECLARE
  event_demo_day_q1 UUID := 'b1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid;
  
  student_project RECORD;
  order_counter INTEGER := 1;
BEGIN
  -- Get students with visible portfolio projects
  FOR student_project IN 
    SELECT 
      sp.id as student_profile_id,
      pp.id as portfolio_project_id,
      pp.title as project_title
    FROM student_profiles sp
    JOIN portfolio_projects pp ON pp.student_profile_id = sp.id
    WHERE pp.visibility IN ('public', 'recruiters_only')
    ORDER BY RANDOM()
    LIMIT 10
  LOOP
    INSERT INTO event_presentations (
      event_id,
      student_profile_id,
      portfolio_project_id,
      presentation_title,
      presentation_order
    )
    VALUES (
      event_demo_day_q1,
      student_project.student_profile_id,
      student_project.portfolio_project_id,
      student_project.project_title || ' - Live Demo',
      order_counter
    )
    ON CONFLICT DO NOTHING;
    
    IF FOUND THEN
      order_counter := order_counter + 1;
    END IF;
  END LOOP;
END $$;
*/

-- Example 3: Seed event_presentations for past demo day (Q4 2024)
-- Creates historical presentations for the recorded demo day
-- Uncomment and modify when you have events, student_profiles, and portfolio_projects:
/*
DO $$
DECLARE
  event_demo_day_q4 UUID := 'b1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  
  student_project RECORD;
  order_counter INTEGER := 1;
  presentation_titles TEXT[] := ARRAY[
    'Project Demo & Walkthrough',
    'Technical Deep Dive',
    'Live Coding Session',
    'Architecture Overview',
    'Product Showcase'
  ];
BEGIN
  -- Get students with visible portfolio projects (limit to 8 for past event)
  FOR student_project IN 
    SELECT 
      sp.id as student_profile_id,
      pp.id as portfolio_project_id,
      pp.title as project_title
    FROM student_profiles sp
    JOIN portfolio_projects pp ON pp.student_profile_id = sp.id
    WHERE pp.visibility IN ('public', 'recruiters_only')
      AND pp.created_at < NOW() - INTERVAL '60 days'  -- Projects created before the event
    ORDER BY RANDOM()
    LIMIT 8
  LOOP
    INSERT INTO event_presentations (
      event_id,
      student_profile_id,
      portfolio_project_id,
      presentation_title,
      presentation_order
    )
    VALUES (
      event_demo_day_q4,
      student_project.student_profile_id,
      student_project.portfolio_project_id,
      student_project.project_title || ' - ' || presentation_titles[1 + FLOOR(RANDOM() * array_length(presentation_titles, 1))::INTEGER],
      order_counter
    )
    ON CONFLICT DO NOTHING;
    
    IF FOUND THEN
      order_counter := order_counter + 1;
    END IF;
  END LOOP;
END $$;
*/

-- Example 4: Simple seed - Create presentations for all demo_day events
-- Most straightforward approach - creates presentations for all visible projects
-- Uncomment and modify when you have events, student_profiles, and portfolio_projects:
/*
INSERT INTO event_presentations (event_id, student_profile_id, portfolio_project_id, presentation_title, presentation_order)
SELECT 
  event_id,
  student_profile_id,
  portfolio_project_id,
  presentation_title,
  presentation_order
FROM (
  SELECT 
    e.id as event_id,
    sp.id as student_profile_id,
    pp.id as portfolio_project_id,
    pp.title as presentation_title,
    ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY pp.created_at) as presentation_order
  FROM events e
  CROSS JOIN student_profiles sp
  JOIN portfolio_projects pp ON pp.student_profile_id = sp.id
  WHERE e.event_type = 'demo_day'
    AND pp.visibility IN ('public', 'recruiters_only')
) ranked
WHERE presentation_order <= 10  -- Limit to 10 presentations per event
ON CONFLICT DO NOTHING;
*/

COMMIT;
