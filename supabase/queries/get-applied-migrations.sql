-- Query to get all applied migrations
-- Run this in Supabase SQL Editor and save the results
-- Then use the results with: tsx scripts/organize-migrations.ts

-- Option 1: Get just the versions (one per line) - easiest for the script
SELECT version
FROM supabase_migrations.schema_migrations 
ORDER BY version;

-- Option 2: Get versions with names for reference
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations 
ORDER BY version;

-- To export as CSV:
-- 1. Run the query above
-- 2. Click "Download" → "CSV" in Supabase SQL Editor
-- 3. Extract just the version column to a text file
-- 4. Run: tsx scripts/organize-migrations.ts path/to/versions.txt
