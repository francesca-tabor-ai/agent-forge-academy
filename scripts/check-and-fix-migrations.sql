-- =====================================================
-- COMPLETE MIGRATION FIX SCRIPT
-- =====================================================
-- Run this entire script in Supabase SQL Editor
-- It will check status and fix the duplicate issue

-- Step 1: Check current migration status
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations 
WHERE version >= '20250115000000'
ORDER BY version DESC;

-- Step 2: Check if migration 20250115000004 was actually applied
-- (Check if columns exist)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'student_profiles' 
        AND column_name = 'weekly_jobs_emails_enabled'
    ) THEN 'Migration WAS applied - columns exist'
    ELSE 'Migration was NOT applied - columns missing'
  END AS migration_status;

-- Step 3: Remove the duplicate entry
-- This allows you to re-run the migration if needed
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';

-- Step 4: Verify removal
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM supabase_migrations.schema_migrations 
      WHERE version = '20250115000004'
    ) THEN 'Still exists - deletion failed'
    ELSE 'Successfully removed'
  END AS removal_status;

-- Step 5: Show remaining migrations
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations 
WHERE version >= '20250115000000'
ORDER BY version DESC;
