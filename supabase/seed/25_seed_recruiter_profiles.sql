-- Seed recruiter_profiles: Recruiter profiles linked to profiles
-- NOTE: This table requires existing profiles with role='recruiter'
-- This script provides example queries that can be run AFTER profiles with recruiter role exist
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Dependencies:
-- - profiles (depends on auth.users - must have role='recruiter')
-- - recruiter_profiles (depends on profiles with role='recruiter')

-- IMPORTANT: 
-- - Recruiter profiles extend the base profiles table with recruiter-specific data
-- - Each recruiter profile belongs to exactly one profile (profile_id is UNIQUE)
-- - Profile must have role='recruiter' (enforced by triggers)
-- - Company name is optional but recommended

-- Example 1: Seed recruiter_profiles for existing recruiter profiles
-- Creates recruiter profiles for users who have profiles with role='recruiter'
-- Uncomment and modify when you have profiles with recruiter role:
/*
DO $$
DECLARE
  profile_record RECORD;
  company_names TEXT[] := ARRAY[
    'TechCorp AI',
    'AI Talent Solutions',
    'RecruitAI',
    'TechRecruit Pro',
    'AI Career Hub',
    'TalentBridge',
    'TechHire',
    'AI Recruiting Partners',
    'CareerConnect AI',
    'TechTalent Network',
    'AI Jobs Hub',
    'RecruitTech Solutions',
    'TalentForge',
    'TechRecruiters Inc',
    'AI Career Network'
  ];
  company_name_var VARCHAR(255);
BEGIN
  -- Loop through profiles with recruiter role who don't have recruiter_profiles yet
  FOR profile_record IN 
    SELECT p.id as profile_id, p.created_at as profile_created_at
    FROM profiles p
    LEFT JOIN recruiter_profiles rp ON rp.profile_id = p.id
    WHERE p.role = 'recruiter'
      AND rp.id IS NULL
    LIMIT 10
  LOOP
    -- 80% have company names
    IF RANDOM() < 0.8 THEN
      company_name_var := company_names[1 + FLOOR(RANDOM() * (array_length(company_names, 1) - 1))::INTEGER];
    ELSE
      company_name_var := NULL;
    END IF;
    
    INSERT INTO recruiter_profiles (
      profile_id,
      company_name,
      created_at
    )
    VALUES (
      profile_record.profile_id,
      company_name_var,
      profile_record.profile_created_at  -- Use profile's creation time
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      company_name = COALESCE(EXCLUDED.company_name, recruiter_profiles.company_name);
  END LOOP;
END $$;
*/

-- Example 2: Seed recruiter_profiles with specific company names
-- More controlled seeding with specific company assignments
-- Uncomment and modify when you have profiles with recruiter role:
/*
DO $$
DECLARE
  profile_record RECORD;
  company_names TEXT[] := ARRAY[
    'TechCorp AI',
    'AI Talent Solutions',
    'RecruitAI',
    'TechRecruit Pro',
    'AI Career Hub'
  ];
  company_index INTEGER := 0;
BEGIN
  -- Get recruiter profiles without recruiter_profiles
  FOR profile_record IN 
    SELECT p.id as profile_id, p.created_at as profile_created_at
    FROM profiles p
    LEFT JOIN recruiter_profiles rp ON rp.profile_id = p.id
    WHERE p.role = 'recruiter'
      AND rp.id IS NULL
    ORDER BY p.created_at
    LIMIT 5
  LOOP
    company_index := company_index + 1;
    
    INSERT INTO recruiter_profiles (
      profile_id,
      company_name,
      created_at
    )
    VALUES (
      profile_record.profile_id,
      company_names[1 + (company_index - 1) % array_length(company_names, 1)],
      profile_record.profile_created_at
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      company_name = EXCLUDED.company_name;
  END LOOP;
END $$;
*/

-- Example 3: Seed recruiter_profiles with realistic company names
-- Creates recruiter profiles with varied company names
-- Uncomment and modify when you have profiles with recruiter role:
/*
DO $$
DECLARE
  profile_record RECORD;
  company_name_var VARCHAR(255);
  company_types TEXT[] := ARRAY['AI', 'Tech', 'Recruiting', 'Talent', 'Career'];
  company_suffixes TEXT[] := ARRAY['Solutions', 'Partners', 'Network', 'Hub', 'Pro', 'Inc', 'LLC'];
BEGIN
  -- Get recruiter profiles without recruiter_profiles
  FOR profile_record IN 
    SELECT p.id as profile_id, p.created_at as profile_created_at
    FROM profiles p
    LEFT JOIN recruiter_profiles rp ON rp.profile_id = p.id
    WHERE p.role = 'recruiter'
      AND rp.id IS NULL
    LIMIT 8
  LOOP
    -- 90% have company names
    IF RANDOM() < 0.9 THEN
      -- Generate company name: [Type] [Suffix] or [Type]Recruit [Suffix]
      IF RANDOM() < 0.5 THEN
        company_name_var := company_types[1 + FLOOR(RANDOM() * (array_length(company_types, 1) - 1))::INTEGER] || 
                           company_suffixes[1 + FLOOR(RANDOM() * (array_length(company_suffixes, 1) - 1))::INTEGER];
      ELSE
        company_name_var := company_types[1 + FLOOR(RANDOM() * (array_length(company_types, 1) - 1))::INTEGER] || 
                           'Recruit ' || 
                           company_suffixes[1 + FLOOR(RANDOM() * (array_length(company_suffixes, 1) - 1))::INTEGER];
      END IF;
    ELSE
      company_name_var := NULL;
    END IF;
    
    INSERT INTO recruiter_profiles (
      profile_id,
      company_name,
      created_at
    )
    VALUES (
      profile_record.profile_id,
      company_name_var,
      profile_record.profile_created_at
    )
    ON CONFLICT (profile_id) DO UPDATE SET
      company_name = COALESCE(EXCLUDED.company_name, recruiter_profiles.company_name);
  END LOOP;
END $$;
*/

-- Example 4: Simple seed - Create recruiter_profiles for all recruiter profiles
-- Most straightforward approach - creates recruiter profiles for all recruiters missing them
-- Uncomment and modify when you have profiles with recruiter role:
/*
INSERT INTO recruiter_profiles (profile_id, company_name, created_at)
SELECT 
  p.id as profile_id,
  CASE 
    WHEN RANDOM() < 0.8 THEN 'Company ' || row_number() OVER (ORDER BY p.created_at)
    ELSE NULL
  END as company_name,
  p.created_at as created_at
FROM profiles p
LEFT JOIN recruiter_profiles rp ON rp.profile_id = p.id
WHERE p.role = 'recruiter'
  AND rp.id IS NULL
ON CONFLICT (profile_id) DO UPDATE SET
  company_name = COALESCE(EXCLUDED.company_name, recruiter_profiles.company_name);
*/

-- Example 5: Update existing recruiter_profiles with company names
-- Updates recruiter profiles that exist but may have missing company names
-- Uncomment and modify when you have recruiter_profiles:
/*
UPDATE recruiter_profiles
SET company_name = 'Company ' || row_number() OVER (ORDER BY created_at)
WHERE company_name IS NULL
LIMIT 5;
*/

-- Note: In production, recruiter_profiles are created automatically:
-- 1. User signs up via Supabase Auth
-- 2. User selects role='recruiter' during onboarding
-- 3. Profile is created with role='recruiter'
-- 4. Recruiter profile is created (either automatically or when recruiter fills out their profile)
-- 5. Company name is set when recruiter completes their profile
--
-- This seed file is useful for:
-- - Testing with existing recruiter profiles
-- - Migrating data from other systems
-- - Creating recruiter profiles for users who signed up before recruiter profile creation was automated

COMMIT;
