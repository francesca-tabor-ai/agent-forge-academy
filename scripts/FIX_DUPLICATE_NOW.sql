-- =====================================================
-- IMMEDIATE FIX - Run this NOW in Supabase SQL Editor
-- =====================================================

-- This will remove the duplicate migration entry
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';

-- Verify it's gone (should return 0 rows)
SELECT COUNT(*) as remaining_entries
FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';
