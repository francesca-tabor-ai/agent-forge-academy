-- Check Migration Status for 20250115000004
-- Run this in Supabase SQL Editor to diagnose the duplicate migration error

-- 1. Check if migration is recorded
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';

-- 2. Check if migration changes were actually applied
-- Check for columns added by migration 20250115000004
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
  AND column_name IN (
    'weekly_jobs_emails_enabled',
    'weekly_email_day',
    'weekly_email_hour',
    'weekly_learning_email_last_sent_at',
    'weekly_jobs_email_last_sent_at'
  )
ORDER BY column_name;

-- 3. Check if generate_unsubscribe_token function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'generate_unsubscribe_token';

-- 4. Check if unique constraint exists on unsubscribe_token
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'student_profiles'
  AND constraint_name = 'student_profiles_unsubscribe_token_unique';

-- If migration is recorded but changes aren't applied, you can:
-- Option A: Run the migration SQL directly (recommended)
-- Option B: Remove from schema_migrations and re-run (if needed):
-- DELETE FROM supabase_migrations.schema_migrations WHERE version = '20250115000004';
