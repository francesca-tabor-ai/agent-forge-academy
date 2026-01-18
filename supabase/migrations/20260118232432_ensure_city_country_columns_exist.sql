-- Ensure city and country columns exist in student_profiles
-- This migration is idempotent and safe to run multiple times
-- Fixes schema cache issues by explicitly ensuring columns exist
-- This addresses the error: "Could not find the 'city' column of 'student_profiles' in the schema cache"

-- Add city column (nullable text, e.g., "london")
-- Using TEXT type as recommended for flexibility
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS city TEXT;

-- Add country column (optional, nullable text, e.g., "UK")
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS country TEXT;

-- Create index on city for faster lookups (for banner image matching)
-- Only create if it doesn't exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_student_profiles_city'
  ) THEN
    CREATE INDEX idx_student_profiles_city ON student_profiles(city) WHERE city IS NOT NULL;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN student_profiles.city IS 'Normalized city name (lowercase key, e.g., "london") parsed from location field';
COMMENT ON COLUMN student_profiles.country IS 'Country name (e.g., "UK") parsed from location field';

-- Note: After running this migration, refresh Supabase schema cache:
-- 1. In Supabase Dashboard: Settings → API → Refresh schema cache
-- 2. Or restart local Supabase instance if using local development
