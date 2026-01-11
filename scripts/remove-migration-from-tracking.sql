-- Remove migration 20250115000004 from schema_migrations tracking
-- This allows you to re-run the migration if needed
-- Run this in Supabase SQL Editor

-- Check if it exists first
SELECT version, name, inserted_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';

-- Remove it (uncomment to execute)
-- DELETE FROM supabase_migrations.schema_migrations 
-- WHERE version = '20250115000004';

-- After removing, you can re-run the migration file
