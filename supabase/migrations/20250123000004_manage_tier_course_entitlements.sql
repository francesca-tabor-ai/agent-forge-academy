-- Manage tier-to-course entitlements
-- Provides both function-based and seed script patterns for maintainability

BEGIN;

-- ============================================================================
-- RECOMMENDED CONSTRAINTS & INDEXES
-- ============================================================================

-- Ensure unique constraint exists (should already exist, but verify)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.subscription_tier_courses'::regclass
        AND contype = 'u'
        AND array_length(conkey, 1) = 2
    ) THEN
        ALTER TABLE public.subscription_tier_courses
        ADD CONSTRAINT subscription_tier_courses_tier_course_id_key
        UNIQUE (tier, course_id);
    END IF;
END $$;

-- Composite index for common lookup pattern (tier + course_id)
-- This supports fast lookups in has_course_access() function
CREATE INDEX IF NOT EXISTS idx_subscription_tier_courses_tier_course_id 
ON public.subscription_tier_courses(tier, course_id);

-- Index on tier for filtering by tier (already exists, but ensure it's there)
CREATE INDEX IF NOT EXISTS idx_subscription_tier_courses_tier 
ON public.subscription_tier_courses(tier);

-- Index on course_id for reverse lookups (which tiers have access to a course)
CREATE INDEX IF NOT EXISTS idx_subscription_tier_courses_course_id 
ON public.subscription_tier_courses(course_id);

-- ============================================================================
-- OPTION A: ADMIN-FRIENDLY SQL FUNCTION (Replace-All Semantics)
-- ============================================================================
-- Use this for programmatic updates, admin panels, or one-off changes
-- Replaces all courses for a tier with the provided list

DROP FUNCTION IF EXISTS public.set_tier_course_entitlements(
    p_tier subscription_tier,
    p_course_slugs TEXT[]
);

CREATE OR REPLACE FUNCTION public.set_tier_course_entitlements(
    p_tier subscription_tier,
    p_course_slugs TEXT[]
) RETURNS JSONB AS $$
DECLARE
    v_tier_config RECORD;
    v_course_record RECORD;
    v_inserted_count INTEGER := 0;
    v_deleted_count INTEGER := 0;
    v_not_found_slugs TEXT[];
    v_result JSONB;
BEGIN
    -- Validate tier exists and doesn't have all_access
    SELECT * INTO v_tier_config
    FROM subscription_tier_config
    WHERE tier = p_tier;

    IF v_tier_config IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Tier %s does not exist', p_tier)
        );
    END IF;

    IF v_tier_config.has_all_access THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Tier %s has all_access=true. Cannot set specific course entitlements.', p_tier)
        );
    END IF;

    -- Start transaction (function runs in transaction context)
    -- Delete existing entitlements for this tier
    DELETE FROM subscription_tier_courses
    WHERE tier = p_tier;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Insert new entitlements
    INSERT INTO subscription_tier_courses (tier, course_id)
    SELECT 
        p_tier,
        c.id
    FROM courses c
    WHERE c.slug = ANY(p_course_slugs)
    ON CONFLICT (tier, course_id) DO NOTHING;
    
    GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

    -- Check for slugs that weren't found
    SELECT ARRAY_AGG(slug) INTO v_not_found_slugs
    FROM unnest(p_course_slugs) AS slug
    WHERE NOT EXISTS (
        SELECT 1 FROM courses WHERE courses.slug = slug
    );

    -- Build result
    v_result := jsonb_build_object(
        'success', true,
        'tier', p_tier,
        'requested_courses', array_length(p_course_slugs, 1),
        'inserted_courses', v_inserted_count,
        'deleted_courses', v_deleted_count,
        'not_found_slugs', COALESCE(v_not_found_slugs, ARRAY[]::TEXT[])
    );

    IF v_not_found_slugs IS NOT NULL AND array_length(v_not_found_slugs, 1) > 0 THEN
        v_result := v_result || jsonb_build_object(
            'warning', format('Some course slugs were not found: %s', array_to_string(v_not_found_slugs, ', '))
        );
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (admins will use this)
GRANT EXECUTE ON FUNCTION public.set_tier_course_entitlements(subscription_tier, TEXT[]) TO authenticated;

COMMENT ON FUNCTION public.set_tier_course_entitlements(subscription_tier, TEXT[]) IS 
'Replaces all course entitlements for a tier with the provided list of course slugs.
Uses replace-all semantics: deletes existing entitlements and inserts new ones.
Only works for tiers with has_all_access=false.
Returns JSONB with success status and counts.';

COMMIT;
