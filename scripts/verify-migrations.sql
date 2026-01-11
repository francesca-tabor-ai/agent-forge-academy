-- Verify Migration Status
-- Run this in Supabase SQL Editor to check which migrations have been applied
-- Compare the results with your local migration files in supabase/migrations/

-- 1. List all applied migrations
SELECT 
  version,
  name,
  inserted_at,
  inserted_at AT TIME ZONE 'UTC' as inserted_at_utc
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC;

-- 2. Count total migrations
SELECT 
  COUNT(*) as total_applied_migrations,
  MIN(version) as oldest_migration,
  MAX(version) as newest_migration
FROM supabase_migrations.schema_migrations;

-- 3. Check for specific migration (replace with your migration version)
-- Example: Check if project_images migration is applied
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM supabase_migrations.schema_migrations 
      WHERE version = '20250122000001'
    ) THEN '✅ Applied'
    ELSE '❌ Not Applied'
  END as migration_status,
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations 
WHERE version = '20250122000001';

-- 4. List all tables to verify schema was created
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'supabase_migrations')
ORDER BY table_schema, table_name;

-- 5. Check for project_images table specifically (from latest migration)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'project_images'
    ) THEN '✅ project_images table exists'
    ELSE '❌ project_images table missing'
  END as table_status;

-- 6. Verify project_images columns if table exists
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'project_images'
ORDER BY ordinal_position;
