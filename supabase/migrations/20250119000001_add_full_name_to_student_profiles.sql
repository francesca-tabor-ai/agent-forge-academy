-- Add full_name column to student_profiles table
-- This migration is idempotent and safe to run multiple times

ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(80);

-- Add comment for documentation
COMMENT ON COLUMN student_profiles.full_name IS 'Full name of the student (displayed on public profile)';

-- Note: After running this migration, refresh Supabase schema cache:
-- 1. In Supabase Dashboard: Settings → API → Refresh schema cache
-- 2. Or restart local Supabase instance if using local development
