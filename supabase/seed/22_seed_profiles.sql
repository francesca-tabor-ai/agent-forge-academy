-- Seed profiles: User profiles linked to auth.users
-- NOTE: This table REQUIRES existing auth.users - cannot be seeded without user accounts
-- Profiles are typically created automatically when users sign up via Supabase Auth
-- This script provides example queries that can be run AFTER users exist
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Dependencies:
-- - auth.users (REQUIRED - profiles.user_id references auth.users(id))
-- - profiles (depends on auth.users)
-- - Optional: sales_referral_links, sales_reps (for referral attribution)

-- IMPORTANT: 
-- - Profiles cannot be created without existing auth.users
-- - In production, profiles are created automatically when users sign up
-- - Each user can have exactly one profile (user_id is UNIQUE)
-- - Roles: 'student', 'tutor', 'recruiter'
-- - Optional referral attribution: referral_link_id, sales_rep_id, referred_at

-- Example 1: Seed profiles for existing auth.users
-- Creates profiles for users who don't already have one
-- Uncomment and modify when you have auth.users:
/*
DO $$
DECLARE
  user_record RECORD;
  role_var user_role;
  role_counter INTEGER := 0;
BEGIN
  -- Loop through users who don't have profiles yet
  FOR user_record IN 
    SELECT au.id as user_id, au.created_at as user_created_at
    FROM auth.users au
    LEFT JOIN profiles p ON p.user_id = au.id
    WHERE p.id IS NULL
    LIMIT 20
  LOOP
    -- Assign roles: 70% students, 20% tutors, 10% recruiters
    role_counter := role_counter + 1;
    IF role_counter % 10 <= 7 THEN
      role_var := 'student';
    ELSIF role_counter % 10 <= 9 THEN
      role_var := 'tutor';
    ELSE
      role_var := 'recruiter';
    END IF;
    
    INSERT INTO profiles (
      user_id,
      role,
      created_at
    )
    VALUES (
      user_record.user_id,
      role_var,
      user_record.user_created_at  -- Use user's creation time
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role;
  END LOOP;
END $$;
*/

-- Example 2: Seed profiles with specific role distribution
-- More controlled seeding with specific role assignments
-- Uncomment and modify when you have auth.users:
/*
DO $$
DECLARE
  user_record RECORD;
  role_var user_role;
  user_index INTEGER := 0;
BEGIN
  -- Get users without profiles
  FOR user_record IN 
    SELECT au.id as user_id, au.created_at as user_created_at
    FROM auth.users au
    LEFT JOIN profiles p ON p.user_id = au.id
    WHERE p.id IS NULL
    ORDER BY au.created_at
    LIMIT 15
  LOOP
    user_index := user_index + 1;
    
    -- Assign roles: first 10 students, next 3 tutors, last 2 recruiters
    IF user_index <= 10 THEN
      role_var := 'student';
    ELSIF user_index <= 13 THEN
      role_var := 'tutor';
    ELSE
      role_var := 'recruiter';
    END IF;
    
    INSERT INTO profiles (
      user_id,
      role,
      created_at
    )
    VALUES (
      user_record.user_id,
      role_var,
      user_record.user_created_at
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role;
  END LOOP;
END $$;
*/

-- Example 3: Seed profiles with referral attribution
-- Creates profiles with referral link and sales rep attribution
-- Uncomment and modify when you have auth.users, sales_referral_links, and sales_reps:
/*
DO $$
DECLARE
  user_record RECORD;
  role_var user_role;
  referral_link_id_var UUID;
  sales_rep_id_var UUID;
  user_index INTEGER := 0;
BEGIN
  -- Get referral links and sales reps (if they exist)
  SELECT id INTO referral_link_id_var FROM sales_referral_links LIMIT 1;
  SELECT id INTO sales_rep_id_var FROM sales_reps LIMIT 1;
  
  -- Get users without profiles
  FOR user_record IN 
    SELECT au.id as user_id, au.created_at as user_created_at
    FROM auth.users au
    LEFT JOIN profiles p ON p.user_id = au.id
    WHERE p.id IS NULL
    ORDER BY au.created_at
    LIMIT 10
  LOOP
    user_index := user_index + 1;
    
    -- Assign roles: mostly students
    IF user_index % 3 = 0 THEN
      role_var := 'tutor';
    ELSE
      role_var := 'student';
    END IF;
    
    -- 30% have referral attribution
    INSERT INTO profiles (
      user_id,
      role,
      referral_link_id,
      sales_rep_id,
      referred_at,
      created_at
    )
    VALUES (
      user_record.user_id,
      role_var,
      CASE WHEN RANDOM() < 0.3 AND referral_link_id_var IS NOT NULL THEN referral_link_id_var ELSE NULL END,
      CASE WHEN RANDOM() < 0.3 AND sales_rep_id_var IS NOT NULL THEN sales_rep_id_var ELSE NULL END,
      CASE WHEN RANDOM() < 0.3 THEN user_record.user_created_at ELSE NULL END,
      user_record.user_created_at
    )
    ON CONFLICT (user_id) DO UPDATE SET
      role = EXCLUDED.role,
      referral_link_id = COALESCE(EXCLUDED.referral_link_id, profiles.referral_link_id),
      sales_rep_id = COALESCE(EXCLUDED.sales_rep_id, profiles.sales_rep_id),
      referred_at = COALESCE(EXCLUDED.referred_at, profiles.referred_at);
  END LOOP;
END $$;
*/

-- Example 4: Simple seed - Create profiles for all users without profiles
-- Most straightforward approach - creates profiles for all users missing them
-- Uncomment and modify when you have auth.users:
/*
INSERT INTO profiles (user_id, role, created_at)
SELECT 
  au.id as user_id,
  CASE 
    WHEN RANDOM() < 0.7 THEN 'student'::user_role
    WHEN RANDOM() < 0.9 THEN 'tutor'::user_role
    ELSE 'recruiter'::user_role
  END as role,
  au.created_at as created_at
FROM auth.users au
LEFT JOIN profiles p ON p.user_id = au.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role;
*/

-- Example 5: Update existing profiles with roles
-- Updates profiles that exist but may have incorrect or missing roles
-- Uncomment and modify when you have profiles:
/*
UPDATE profiles
SET role = CASE 
  WHEN RANDOM() < 0.7 THEN 'student'::user_role
  WHEN RANDOM() < 0.9 THEN 'tutor'::user_role
  ELSE 'recruiter'::user_role
END
WHERE role IS NULL OR role = 'student'  -- Only update if needed
LIMIT 10;
*/

-- Note: In production, profiles are created automatically:
-- 1. User signs up via Supabase Auth
-- 2. Auth trigger or application code creates profile
-- 3. Profile role is set during onboarding
-- 4. Referral attribution is set if user signed up via referral link
--
-- This seed file is useful for:
-- - Testing with existing auth.users
-- - Migrating data from other systems
-- - Creating profiles for users who signed up before profile creation was automated

COMMIT;
