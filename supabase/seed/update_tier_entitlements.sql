-- Update Tier Course Entitlements
-- ============================================================================
-- This is a lightweight "seed/update" script pattern for managing tier entitlements.
-- 
-- USAGE:
--   psql "$SUPABASE_DB_URL" -f supabase/seed/update_tier_entitlements.sql
--
-- PATTERN:
--   1. List all course slugs for a tier in the VALUES clause
--   2. Script uses replace-all semantics (deletes old, inserts new)
--   3. Idempotent - safe to run multiple times
--   4. Version-controlled - changes are tracked in git
--
-- WHEN TO USE THIS vs FUNCTION:
--   - Use this script for: version-controlled updates, migrations, bulk changes
--   - Use set_tier_course_entitlements() for: admin panels, one-off changes, automation
-- ============================================================================

BEGIN;

-- ============================================================================
-- ESSENTIAL ACCESS TIER ENTITLEMENTS
-- ============================================================================
-- Update Essential Access tier course entitlements
-- Replace-all semantics: removes old entitlements, adds new ones

-- Step 1: Delete existing entitlements for Essential tier
DELETE FROM subscription_tier_courses
WHERE tier = 'essential'::subscription_tier;

-- Step 2: Insert new entitlements based on course slugs
-- Add or remove course slugs from the list below to update entitlements
INSERT INTO subscription_tier_courses (tier, course_id)
SELECT 
    'essential'::subscription_tier,
    c.id
FROM courses c
WHERE c.slug IN (
    -- Essential Access courses (update this list as needed)
    'prompt-engineering',
    'ai-content-pipelines',
    'reddit-ai-visibility',
    'seo-to-aeo',
    'ai-governance-eu-ai-act'
)
ON CONFLICT (tier, course_id) DO NOTHING;

-- Verification: Show what was inserted
DO $$
DECLARE
    v_count INTEGER;
    v_courses TEXT;
BEGIN
    SELECT COUNT(*), string_agg(c.slug, ', ' ORDER BY c.slug)
    INTO v_count, v_courses
    FROM subscription_tier_courses stc
    JOIN courses c ON c.id = stc.course_id
    WHERE stc.tier = 'essential'::subscription_tier;
    
    RAISE NOTICE 'Essential Access: % courses mapped', v_count;
    RAISE NOTICE 'Courses: %', v_courses;
END $$;

-- ============================================================================
-- ADDITIONAL TIERS (if needed in the future)
-- ============================================================================
-- Example: If you add a "Starter" tier later, uncomment and modify:

-- DELETE FROM subscription_tier_courses
-- WHERE tier = 'starter'::subscription_tier;
--
-- INSERT INTO subscription_tier_courses (tier, course_id)
-- SELECT 
--     'starter'::subscription_tier,
--     c.id
-- FROM courses c
-- WHERE c.slug IN (
--     'prompt-engineering',
--     'ai-content-pipelines'
-- )
-- ON CONFLICT (tier, course_id) DO NOTHING;

-- ============================================================================
-- NOTES
-- ============================================================================
-- - Professional Access doesn't need entries here (has_all_access = true)
-- - Always use course slugs, not IDs, for maintainability
-- - Script is idempotent - safe to run multiple times
-- - Changes are version-controlled in git
-- - Test in staging before running in production

COMMIT;
