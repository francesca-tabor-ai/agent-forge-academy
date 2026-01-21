-- Post-Migration Verification Queries
-- Run these in Supabase SQL Editor to verify your migrations completed successfully

-- 1. Count total applied migrations
SELECT 
  COUNT(*) as total_applied_migrations,
  MIN(version) as oldest_migration,
  MAX(version) as newest_migration,
  MIN(inserted_at) as first_migration_date,
  MAX(inserted_at) as last_migration_date
FROM supabase_migrations.schema_migrations;

-- 2. List all applied migrations (last 20)
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC
LIMIT 20;

-- 3. Check for key tables existence
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') 
    THEN '✅ profiles'
    ELSE '❌ profiles'
  END as profiles_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_profiles') 
    THEN '✅ student_profiles'
    ELSE '❌ student_profiles'
  END as student_profiles_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'courses') 
    THEN '✅ courses'
    ELSE '❌ courses'
  END as courses_table,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') 
    THEN '✅ subscriptions'
    ELSE '❌ subscriptions'
  END as subscriptions_table;

-- 4. Verify RLS is enabled on key tables
SELECT 
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'student_profiles', 'courses', 'subscriptions', 'portfolio_projects')
ORDER BY tablename;

-- 5. Count RLS policies on key tables
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'student_profiles', 'courses', 'subscriptions', 'portfolio_projects')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 6. Check for indexes on key columns
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'student_profiles', 'courses')
  AND indexname LIKE '%user_id%' OR indexname LIKE '%role%'
ORDER BY tablename, indexname;

-- 7. Verify enum types were created
SELECT 
  t.typname as enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('user_role', 'subscription_tier')
GROUP BY t.typname;

-- 8. Check for functions and triggers
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%update%' OR routine_name LIKE '%trigger%'
ORDER BY routine_name;

-- 9. Verify foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('profiles', 'student_profiles', 'courses')
ORDER BY tc.table_name;

-- 10. Quick data check (if tables have data)
SELECT 
  'profiles' as table_name,
  COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT 
  'student_profiles' as table_name,
  COUNT(*) as row_count
FROM student_profiles
UNION ALL
SELECT 
  'courses' as table_name,
  COUNT(*) as row_count
FROM courses;
