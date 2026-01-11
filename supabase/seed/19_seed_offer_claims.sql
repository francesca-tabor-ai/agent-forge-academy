-- Seed offer_claims: Student claims for tool discounts and offers
-- NOTE: This table requires existing offers and student_profiles from auth.users
-- This script provides example queries that can be run AFTER offers and students exist
-- Uses hardcoded UUIDs to reference offers from 04_seed_jobs_offers.sql
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Reference UUIDs from 04_seed_jobs_offers.sql:
-- Offers: Use 'd1b2c3d4-e5f6-4789-a012-3456789abc01' through 'd1b2c3d4-e5f6-4789-a012-3456789abc05'
-- Example: Supabase Pro = 'd1b2c3d4-e5f6-4789-a012-3456789abc01'

-- Dependencies:
-- - offers (seeded in 04_seed_jobs_offers.sql)
-- - student_profiles (depends on profiles, which depend on auth.users)
-- - portfolio_projects (optional - for linking claims to projects)
-- - offer_claims (depends on offers + student_profiles)

-- IMPORTANT: There is a unique constraint on (student_profile_id, offer_id).
-- Each student can only claim each offer once.

-- Example 1: Seed offer_claims for students
-- Creates realistic claim records with mix of statuses
-- Uncomment and modify when you have offers and student profiles:
/*
DO $$
DECLARE
  -- Reference offer UUIDs
  offer_supabase UUID := 'd1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid;
  offer_openai UUID := 'd1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid;
  offer_vercel UUID := 'd1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  offer_pinecone UUID := 'd1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid;
  offer_langsmith UUID := 'd1b2c3d4-e5f6-4789-a012-3456789abc05'::uuid;
  
  student_record RECORD;
  offer_record RECORD;
  offer_list UUID[] := ARRAY[offer_supabase, offer_openai, offer_vercel, offer_pinecone, offer_langsmith];
  offer_id_var UUID;
  status_var offer_claim_status;
  claimed_at_var TIMESTAMPTZ;
  project_id_var UUID;
  notes_var TEXT;
  claim_counter INTEGER;
BEGIN
  -- Loop through students
  FOR student_record IN 
    SELECT sp.id as student_profile_id
    FROM student_profiles sp
    LIMIT 10
  LOOP
    claim_counter := 0;
    
    -- Each student claims 1-3 offers
    FOR claim_index IN 1..(1 + FLOOR(RANDOM() * 2)::INTEGER) LOOP
      offer_id_var := offer_list[1 + FLOOR(RANDOM() * array_length(offer_list, 1))::INTEGER];
      
      -- Get offer details to determine status
      SELECT o.id, o.eligibility INTO offer_record
      FROM offers o
      WHERE o.id = offer_id_var;
      
      IF offer_record IS NULL THEN
        CONTINUE;
      END IF;
      
      -- Determine status based on eligibility
      -- 70% claimed, 20% requires_verification, 10% not_claimed
      IF offer_record.eligibility ILIKE '%student%' OR offer_record.eligibility ILIKE '%verification%' THEN
        IF RANDOM() < 0.8 THEN
          status_var := 'requires_verification';
        ELSE
          status_var := 'claimed';
        END IF;
      ELSE
        IF RANDOM() < 0.7 THEN
          status_var := 'claimed';
        ELSIF RANDOM() < 0.9 THEN
          status_var := 'requires_verification';
        ELSE
          status_var := 'not_claimed';
        END IF;
      END IF;
      
      -- Set claimed_at timestamp (within last 30 days)
      claimed_at_var := NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)::INTEGER;
      
      -- 30% chance to link to a portfolio project
      IF RANDOM() < 0.3 THEN
        SELECT pp.id INTO project_id_var
        FROM portfolio_projects pp
        WHERE pp.student_profile_id = student_record.student_profile_id
        ORDER BY RANDOM()
        LIMIT 1;
      ELSE
        project_id_var := NULL;
      END IF;
      
      -- 20% chance to have notes
      IF RANDOM() < 0.2 THEN
        notes_var := CASE (FLOOR(RANDOM() * 3)::INTEGER)
          WHEN 0 THEN 'Using this for my final project'
          WHEN 1 THEN 'Great offer, thanks!'
          ELSE 'Will use for portfolio project'
        END;
      ELSE
        notes_var := NULL;
      END IF;
      
      INSERT INTO offer_claims (
        student_profile_id,
        offer_id,
        status,
        claimed_at,
        project_id,
        notes
      )
      VALUES (
        student_record.student_profile_id,
        offer_id_var,
        status_var,
        claimed_at_var,
        project_id_var,
        notes_var
      )
      ON CONFLICT (student_profile_id, offer_id) DO UPDATE SET
        status = EXCLUDED.status,
        claimed_at = EXCLUDED.claimed_at,
        project_id = EXCLUDED.project_id,
        notes = EXCLUDED.notes,
        updated_at = NOW();
      
      claim_counter := claim_counter + 1;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 2: Seed offer_claims for specific popular offers
-- More controlled seeding with specific offers
-- Uncomment and modify when you have offers and student profiles:
/*
DO $$
DECLARE
  offer_supabase UUID := 'd1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid;
  offer_openai UUID := 'd1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid;
  
  student_record RECORD;
  status_var offer_claim_status;
  claimed_at_var TIMESTAMPTZ;
BEGIN
  -- Get students with portfolio projects (more likely to claim offers)
  FOR student_record IN 
    SELECT DISTINCT sp.id as student_profile_id
    FROM student_profiles sp
    JOIN portfolio_projects pp ON pp.student_profile_id = sp.id
    LIMIT 5
  LOOP
    -- Claim Supabase offer (most popular)
    status_var := 'claimed';
    claimed_at_var := NOW() - INTERVAL '1 day' * (5 + FLOOR(RANDOM() * 20)::INTEGER);
    
    INSERT INTO offer_claims (
      student_profile_id,
      offer_id,
      status,
      claimed_at
    )
    VALUES (
      student_record.student_profile_id,
      offer_supabase,
      status_var,
      claimed_at_var
    )
    ON CONFLICT (student_profile_id, offer_id) DO UPDATE SET
      status = EXCLUDED.status,
      claimed_at = EXCLUDED.claimed_at,
      updated_at = NOW();
    
    -- Claim OpenAI offer (requires verification)
    IF RANDOM() < 0.6 THEN
      status_var := 'requires_verification';
      claimed_at_var := NOW() - INTERVAL '1 day' * (3 + FLOOR(RANDOM() * 15)::INTEGER);
      
      INSERT INTO offer_claims (
        student_profile_id,
        offer_id,
        status,
        claimed_at
      )
      VALUES (
        student_record.student_profile_id,
        offer_openai,
        status_var,
        claimed_at_var
      )
      ON CONFLICT (student_profile_id, offer_id) DO UPDATE SET
        status = EXCLUDED.status,
        claimed_at = EXCLUDED.claimed_at,
        updated_at = NOW();
    END IF;
  END LOOP;
END $$;
*/

-- Example 3: Seed offer_claims with project links
-- Demonstrates linking claims to portfolio projects
-- Uncomment and modify when you have offers, student profiles, and portfolio projects:
/*
DO $$
DECLARE
  offer_supabase UUID := 'd1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid;
  offer_vercel UUID := 'd1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid;
  
  student_project RECORD;
  status_var offer_claim_status;
  claimed_at_var TIMESTAMPTZ;
BEGIN
  -- Get students with portfolio projects
  FOR student_project IN 
    SELECT 
      sp.id as student_profile_id,
      pp.id as project_id
    FROM student_profiles sp
    JOIN portfolio_projects pp ON pp.student_profile_id = sp.id
    WHERE pp.visibility IN ('public', 'recruiters_only')
    LIMIT 8
  LOOP
    -- Claim Supabase for project (full-stack projects)
    IF RANDOM() < 0.7 THEN
      status_var := 'claimed';
      claimed_at_var := NOW() - INTERVAL '1 day' * (10 + FLOOR(RANDOM() * 20)::INTEGER);
      
      INSERT INTO offer_claims (
        student_profile_id,
        offer_id,
        status,
        claimed_at,
        project_id,
        notes
      )
      VALUES (
        student_project.student_profile_id,
        offer_supabase,
        status_var,
        claimed_at_var,
        student_project.project_id,
        'Using for ' || (SELECT title FROM portfolio_projects WHERE id = student_project.project_id)
      )
      ON CONFLICT (student_profile_id, offer_id) DO UPDATE SET
        status = EXCLUDED.status,
        claimed_at = EXCLUDED.claimed_at,
        project_id = EXCLUDED.project_id,
        notes = EXCLUDED.notes,
        updated_at = NOW();
    END IF;
    
    -- Claim Vercel for project (hosting)
    IF RANDOM() < 0.5 THEN
      status_var := 'claimed';
      claimed_at_var := NOW() - INTERVAL '1 day' * (5 + FLOOR(RANDOM() * 15)::INTEGER);
      
      INSERT INTO offer_claims (
        student_profile_id,
        offer_id,
        status,
        claimed_at,
        project_id
      )
      VALUES (
        student_project.student_profile_id,
        offer_vercel,
        status_var,
        claimed_at_var,
        student_project.project_id
      )
      ON CONFLICT (student_profile_id, offer_id) DO UPDATE SET
        status = EXCLUDED.status,
        claimed_at = EXCLUDED.claimed_at,
        project_id = EXCLUDED.project_id,
        updated_at = NOW();
    END IF;
  END LOOP;
END $$;
*/

-- Example 4: Simple seed - Create claims for all active offers
-- Most straightforward approach - creates claims for students
-- Uncomment and modify when you have offers and student profiles:
/*
INSERT INTO offer_claims (student_profile_id, offer_id, status, claimed_at)
SELECT 
  sp.id as student_profile_id,
  o.id as offer_id,
  CASE 
    WHEN o.eligibility ILIKE '%student%' OR o.eligibility ILIKE '%verification%' THEN 'requires_verification'::offer_claim_status
    WHEN RANDOM() < 0.8 THEN 'claimed'::offer_claim_status
    ELSE 'not_claimed'::offer_claim_status
  END as status,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)::INTEGER as claimed_at
FROM student_profiles sp
CROSS JOIN offers o
WHERE o.is_active = true
  AND RANDOM() < 0.3  -- 30% chance per student-offer combination
ON CONFLICT (student_profile_id, offer_id) DO UPDATE SET
  status = EXCLUDED.status,
  claimed_at = EXCLUDED.claimed_at,
  updated_at = NOW();
*/

COMMIT;
