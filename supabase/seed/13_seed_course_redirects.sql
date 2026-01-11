-- Seed course_redirects: redirects for renamed or merged courses
-- NOTE: This table is used to handle course renames and merges
-- This script provides example queries for seeding course redirects
-- Typically used when courses are renamed or merged to maintain backward compatibility
--
-- NOTE: This script should be run using a direct database connection (psql)
-- which bypasses Row Level Security (RLS). The connection string should be
-- the "Direct connection" or "Transaction pooler" from Supabase Dashboard.

BEGIN;

-- Reference UUIDs from 02_seed_content.sql:
-- Courses: Use 'a1b2c3d4-e5f6-4789-a012-3456789abc01' through 'a1b2c3d4-e5f6-4789-a012-3456789abc14'

-- Dependencies:
-- - courses (seeded in 02_seed_content.sql)
-- - course_redirects (depends on courses)

-- IMPORTANT: 
-- - Course redirects are typically created when courses are renamed or merged
-- - The old_course_id should reference a course that no longer exists or has been renamed
-- - The new_course_id should reference the current/active course
-- - This seed file provides examples, but in practice, redirects are created when actual renames occur

-- Example: Seed course_redirects for renamed courses
-- This simulates course renames that might have occurred
-- Uncomment and modify when you have courses that have been renamed:
/*
DO $$
DECLARE
  -- Example: Simulate a course rename scenario
  -- In practice, you would use actual old and new course IDs from your database
  -- This example assumes some courses were renamed (you would need to create "old" courses first)
  
  -- Note: For seed data, we typically wouldn't create redirects unless courses were actually renamed
  -- This is just an example of how to create redirects when needed
  
  old_course_id_var UUID;
  new_course_id_var UUID;
  old_slug_var VARCHAR(255);
  new_slug_var VARCHAR(255);
BEGIN
  -- Example redirect: If "multi-agent-systems" was renamed from "multi-agent-deployment"
  -- (This is just an example - in practice, you'd have the actual old course ID)
  
  -- Get the current course
  SELECT id, slug INTO new_course_id_var, new_slug_var
  FROM courses
  WHERE slug = 'multi-agent-systems'
  LIMIT 1;
  
  -- In a real scenario, you would have the old course ID
  -- For seed data, we'll skip this example since we don't have old courses
  
  -- Example structure (commented out since we don't have old courses):
  /*
  INSERT INTO course_redirects (
    old_course_id,
    new_course_id,
    old_slug,
    new_slug,
    created_at
  )
  VALUES (
    old_course_id_var,
    new_course_id_var,
    'multi-agent-deployment',  -- Old slug
    new_slug_var,              -- New slug
    NOW() - INTERVAL '30 days' -- When the redirect was created
  )
  ON CONFLICT (old_course_id, new_course_id) DO NOTHING;
  */
  
  RAISE NOTICE 'Course redirects seed skipped - no old courses to redirect from';
END $$;
*/

-- Alternative: Create redirects if you have old course records
-- This would be used when you actually rename courses in your system
-- Uncomment and modify when you have old courses that need redirecting:
/*
DO $$
DECLARE
  old_course_record RECORD;
  new_course_record RECORD;
BEGIN
  -- Example: Redirect old course slugs to new ones
  -- This assumes you have old courses in your database that need redirecting
  
  FOR old_course_record IN 
    SELECT id, slug
    FROM courses
    WHERE slug IN ('old-course-slug-1', 'old-course-slug-2') -- Old slugs
  LOOP
    -- Find the corresponding new course
    SELECT id, slug INTO new_course_record
    FROM courses
    WHERE slug = CASE old_course_record.slug
      WHEN 'old-course-slug-1' THEN 'new-course-slug-1'
      WHEN 'old-course-slug-2' THEN 'new-course-slug-2'
      -- Add more mappings as needed
    END
    LIMIT 1;
    
    IF new_course_record.id IS NOT NULL THEN
      INSERT INTO course_redirects (
        old_course_id,
        new_course_id,
        old_slug,
        new_slug,
        created_at
      )
      VALUES (
        old_course_record.id,
        new_course_record.id,
        old_course_record.slug,
        new_course_record.slug,
        NOW() - INTERVAL '30 days' -- When the redirect was created
      )
      ON CONFLICT (old_course_id, new_course_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;
*/

-- Example: Simple redirect creation
-- Use this when you know the exact old and new course IDs
-- Uncomment and modify when you have specific courses to redirect:
/*
INSERT INTO course_redirects (
  old_course_id,
  new_course_id,
  old_slug,
  new_slug,
  created_at
)
SELECT 
  old_c.id as old_course_id,
  new_c.id as new_course_id,
  old_c.slug as old_slug,
  new_c.slug as new_slug,
  NOW() - INTERVAL '30 days' as created_at
FROM courses old_c
CROSS JOIN courses new_c
WHERE old_c.slug = 'old-course-slug'  -- Replace with actual old slug
  AND new_c.slug = 'new-course-slug'  -- Replace with actual new slug
ON CONFLICT (old_course_id, new_course_id) DO NOTHING;
*/

-- Note: In practice, course redirects are typically created:
-- 1. When a course is renamed (slug changes)
-- 2. When courses are merged (multiple old courses → one new course)
-- 3. When course structure is reorganized
--
-- For seed data, redirects are usually not needed unless you're migrating
-- from an old course structure to a new one.

COMMIT;
