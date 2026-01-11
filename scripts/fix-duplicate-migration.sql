-- Fix Duplicate Migration Error for 20250115000004
-- Run this in Supabase SQL Editor

-- Step 1: Check if migration was actually applied
-- Look for columns that should exist if migration ran successfully
DO $$
DECLARE
  columns_exist BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'student_profiles' 
      AND column_name = 'weekly_jobs_emails_enabled'
  ) INTO columns_exist;
  
  IF columns_exist THEN
    RAISE NOTICE 'Migration appears to be applied - columns exist. You can skip this migration.';
  ELSE
    RAISE NOTICE 'Migration was NOT fully applied - columns are missing.';
    RAISE NOTICE 'You should run the migration SQL directly or remove it from schema_migrations.';
  END IF;
END $$;

-- Step 2: If migration was NOT applied, you have two options:

-- OPTION A: Remove from schema_migrations and re-run (if you want to use migration system)
-- Uncomment the line below ONLY if columns don't exist:
-- DELETE FROM supabase_migrations.schema_migrations WHERE version = '20250115000004';

-- OPTION B: Just run the migration SQL directly (recommended if columns are missing)
-- Copy the contents of supabase/migrations/20250115000004_update_email_preferences_add_jobs.sql
-- and run it directly in SQL Editor - it won't cause duplicate errors since it uses IF NOT EXISTS

-- Step 3: Verify current migration status
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations 
WHERE version >= '20250115000000'
ORDER BY version DESC
LIMIT 10;
