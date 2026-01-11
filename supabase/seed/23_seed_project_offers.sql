-- Seed project_offers: Links offers to portfolio projects
-- NOTE: This table requires existing portfolio_projects and offers
-- This script provides example queries that can be run AFTER projects and offers exist
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Dependencies:
-- - portfolio_projects (from 21_seed_portfolio_projects.sql)
-- - offers (from 04_seed_jobs_offers.sql)
-- - Optional: auth.users (for created_by)

-- IMPORTANT: 
-- - Links portfolio projects to offers so students can track which offers they use for which projects
-- - UNIQUE constraint on (project_id, offer_id) prevents duplicate links
-- - Each project can be linked to multiple offers
-- - Each offer can be linked to multiple projects

-- Example 1: Seed project_offers for projects
-- Creates realistic links between projects and offers
-- Uncomment and modify when you have portfolio_projects and offers:
/*
DO $$
DECLARE
  project_record RECORD;
  offer_record RECORD;
  offer_counter INTEGER;
  selected_offers UUID[];
  offer_id_var UUID;
BEGIN
  -- Loop through projects
  FOR project_record IN 
    SELECT pp.id as project_id
    FROM portfolio_projects pp
    LIMIT 20
  LOOP
    -- Each project uses 1-3 offers
    offer_counter := 0;
    selected_offers := ARRAY[]::UUID[];
    
    -- Select 1-3 random offers for this project
    FOR offer_record IN 
      SELECT o.id as offer_id
      FROM offers o
      WHERE o.is_active = true
      ORDER BY RANDOM()
      LIMIT (1 + FLOOR(RANDOM() * 2)::INTEGER)
    LOOP
      -- Avoid duplicates
      IF NOT (offer_record.offer_id = ANY(selected_offers)) THEN
        selected_offers := array_append(selected_offers, offer_record.offer_id);
        
        INSERT INTO project_offers (
          project_id,
          offer_id,
          created_at
        )
        VALUES (
          project_record.project_id,
          offer_record.offer_id,
          NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)::INTEGER
        )
        ON CONFLICT (project_id, offer_id) DO NOTHING;
        
        offer_counter := offer_counter + 1;
      END IF;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 2: Seed project_offers with specific offer categories
-- Links projects to offers based on project type or category
-- Uncomment and modify when you have portfolio_projects and offers:
/*
DO $$
DECLARE
  project_record RECORD;
  offer_record RECORD;
  project_title_lower TEXT;
BEGIN
  -- Loop through projects
  FOR project_record IN 
    SELECT pp.id as project_id, pp.title as project_title
    FROM portfolio_projects pp
    LIMIT 15
  LOOP
    project_title_lower := LOWER(project_record.project_title);
    
    -- Match offers to projects based on keywords
    FOR offer_record IN 
      SELECT o.id as offer_id, o.category, o.title as offer_title
      FROM offers o
      WHERE o.is_active = true
      AND (
        -- Database offers for projects with "database", "backend", "api" keywords
        (o.category = 'database' AND (
          project_title_lower LIKE '%database%' OR
          project_title_lower LIKE '%backend%' OR
          project_title_lower LIKE '%api%'
        ))
        OR
        -- Vector database offers for RAG projects
        (o.category = 'vector_database' AND (
          project_title_lower LIKE '%rag%' OR
          project_title_lower LIKE '%vector%' OR
          project_title_lower LIKE '%search%'
        ))
        OR
        -- Hosting offers for web projects
        (o.category = 'hosting' AND (
          project_title_lower LIKE '%web%' OR
          project_title_lower LIKE '%app%' OR
          project_title_lower LIKE '%site%'
        ))
        OR
        -- AI/LLM offers for AI projects
        (o.category = 'ai_llm' AND (
          project_title_lower LIKE '%ai%' OR
          project_title_lower LIKE '%llm%' OR
          project_title_lower LIKE '%gpt%' OR
          project_title_lower LIKE '%agent%'
        ))
        OR
        -- Monitoring offers for production projects
        (o.category = 'monitoring' OR o.category = 'observability')
      )
      ORDER BY RANDOM()
      LIMIT 2
    LOOP
      INSERT INTO project_offers (
        project_id,
        offer_id,
        created_at
      )
      VALUES (
        project_record.project_id,
        offer_record.offer_id,
        NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 60)::INTEGER
      )
      ON CONFLICT (project_id, offer_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 3: Seed project_offers with hardcoded offer UUIDs
-- Uses specific offers from the seed data (04_seed_jobs_offers.sql)
-- Uncomment and modify when you have portfolio_projects:
/*
DO $$
DECLARE
  project_record RECORD;
  offer_id_var UUID;
  offer_index INTEGER;
  -- Hardcoded offer UUIDs from 04_seed_jobs_offers.sql
  popular_offers UUID[] := ARRAY[
    'd1b2c3d4-e5f6-4789-a012-3456789abc01'::uuid, -- Supabase Pro
    'd1b2c3d4-e5f6-4789-a012-3456789abc02'::uuid, -- OpenAI API Credits
    'd1b2c3d4-e5f6-4789-a012-3456789abc03'::uuid, -- Vercel Pro
    'd1b2c3d4-e5f6-4789-a012-3456789abc04'::uuid, -- Pinecone Starter
    'd1b2c3d4-e5f6-4789-a012-3456789abc07'::uuid, -- Anthropic Claude API
    'd1b2c3d4-e5f6-4789-a012-3456789abc18'::uuid  -- GitHub Copilot
  ];
BEGIN
  -- Loop through projects
  FOR project_record IN 
    SELECT pp.id as project_id
    FROM portfolio_projects pp
    LIMIT 10
  LOOP
    -- Each project gets 1-2 popular offers
    FOR offer_index IN 1..(1 + FLOOR(RANDOM() * 1)::INTEGER) LOOP
      offer_id_var := popular_offers[1 + FLOOR(RANDOM() * (array_length(popular_offers, 1) - 1))::INTEGER];
      
      INSERT INTO project_offers (
        project_id,
        offer_id,
        created_at
      )
      VALUES (
        project_record.project_id,
        offer_id_var,
        NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 45)::INTEGER
      )
      ON CONFLICT (project_id, offer_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 4: Seed project_offers with created_by
-- Links projects to offers and tracks which user created the link
-- Uncomment and modify when you have portfolio_projects, offers, and auth.users:
/*
DO $$
DECLARE
  project_record RECORD;
  offer_record RECORD;
  user_record RECORD;
  user_id_var UUID;
BEGIN
  -- Get a user for created_by (optional)
  SELECT au.id INTO user_id_var FROM auth.users LIMIT 1;
  
  -- Loop through projects
  FOR project_record IN 
    SELECT 
      pp.id as project_id,
      sp.profile_id,
      p.user_id
    FROM portfolio_projects pp
    JOIN student_profiles sp ON sp.id = pp.student_profile_id
    JOIN profiles p ON p.id = sp.profile_id
    LIMIT 10
  LOOP
    -- Each project uses 1-2 offers
    FOR offer_record IN 
      SELECT o.id as offer_id
      FROM offers o
      WHERE o.is_active = true
      ORDER BY RANDOM()
      LIMIT (1 + FLOOR(RANDOM() * 1)::INTEGER)
    LOOP
      INSERT INTO project_offers (
        project_id,
        offer_id,
        created_by,
        created_at
      )
      VALUES (
        project_record.project_id,
        offer_record.offer_id,
        COALESCE(project_record.user_id, user_id_var), -- Use project owner or fallback user
        NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30)::INTEGER
      )
      ON CONFLICT (project_id, offer_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
*/

-- Example 5: Simple seed - Link all active offers to random projects
-- Most straightforward approach - links offers to projects randomly
-- Uncomment and modify when you have portfolio_projects and offers:
/*
INSERT INTO project_offers (project_id, offer_id, created_at)
SELECT 
  pp.id as project_id,
  o.id as offer_id,
  NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 60)::INTEGER as created_at
FROM portfolio_projects pp
CROSS JOIN offers o
WHERE o.is_active = true
  AND RANDOM() < 0.3  -- 30% chance to link each offer to each project
ON CONFLICT (project_id, offer_id) DO NOTHING;
*/

COMMIT;
