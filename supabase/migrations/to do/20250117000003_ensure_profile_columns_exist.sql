-- Ensure all profile columns exist in student_profiles
-- This migration is idempotent and safe to run multiple times
-- Fixes schema cache issues by explicitly ensuring columns exist

-- Add profile fields (idempotent - won't error if columns already exist)
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS headline VARCHAR(255),
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS location VARCHAR(255),
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS headshot_image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN student_profiles.headline IS 'Professional headline/tagline';
COMMENT ON COLUMN student_profiles.skills IS 'Array of skills (JSONB)';
COMMENT ON COLUMN student_profiles.location IS 'Location (city, country, etc.)';
COMMENT ON COLUMN student_profiles.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN student_profiles.github_url IS 'GitHub profile URL';
COMMENT ON COLUMN student_profiles.website_url IS 'Personal website URL';
COMMENT ON COLUMN student_profiles.headshot_image_url IS 'URL to profile headshot image';

-- Note: After running this migration, refresh Supabase schema cache:
-- 1. In Supabase Dashboard: Settings → API → Refresh schema cache
-- 2. Or restart local Supabase instance if using local development
