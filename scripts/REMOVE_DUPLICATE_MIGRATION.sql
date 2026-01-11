-- =====================================================
-- FIX DUPLICATE MIGRATION ERROR
-- =====================================================
-- Run this in Supabase SQL Editor to remove the duplicate entry
-- This will allow you to re-run migration 20250115000004

-- Step 1: Check if migration exists
SELECT version, name, inserted_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';

-- Step 2: Remove the duplicate entry
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';

-- Step 3: Verify it's removed
SELECT version, name, inserted_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';
-- Should return 0 rows

-- After running this, you can re-run your migrations
