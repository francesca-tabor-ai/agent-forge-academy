-- Ensure Essential Access subscribers can access required courses
-- This migration is idempotent and can be run multiple times safely
--
-- Courses to map:
-- 1. Prompt Engineering
-- 2. AI Content Pipelines
-- 3. Reddit AI Visibility
-- 4. SEO → AEO
-- 5. AI Governance & EU AI Act

BEGIN;

-- Ensure unique constraint exists on (tier, course_id)
-- This constraint prevents duplicate mappings and is required for ON CONFLICT
-- Note: The original table creation (20250113000001) already includes UNIQUE(tier, course_id),
-- but we ensure it exists here for idempotency
DO $$
DECLARE
    v_constraint_exists BOOLEAN;
BEGIN
    -- Check if a unique constraint on (tier, course_id) exists
    SELECT EXISTS (
        SELECT 1
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
        AND rel.relname = 'subscription_tier_courses'
        AND con.contype = 'u'
        AND (
            -- Check if both tier and course_id are in the constraint
            SELECT COUNT(*) = 2
            FROM unnest(con.conkey) AS col_num
            JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = col_num
            WHERE att.attname IN ('tier', 'course_id')
        )
    ) INTO v_constraint_exists;
    
    IF NOT v_constraint_exists THEN
        -- Add unique constraint if it doesn't exist
        ALTER TABLE public.subscription_tier_courses
        ADD CONSTRAINT subscription_tier_courses_tier_course_id_key
        UNIQUE (tier, course_id);
        
        RAISE NOTICE 'Added unique constraint on (tier, course_id)';
    ELSE
        RAISE NOTICE 'Unique constraint on (tier, course_id) already exists';
    END IF;
END $$;

-- Map Essential Access tier to required courses
-- Strategy: Match by slug first, then fall back to title if slug doesn't exist
WITH expected_courses AS (
    SELECT * FROM (VALUES
        ('prompt-engineering', 'Prompt Engineering'),
        ('ai-content-pipelines', 'AI-Content Pipelines'),
        ('reddit-ai-visibility', 'Reddit AI Visibility'),
        ('seo-to-aeo', 'SEO → AEO (Search to Answer Engine Optimisation)'),
        ('ai-governance-eu-ai-act', 'AI Governance & the EU AI Act')
    ) AS t(expected_slug, expected_title)
),
course_mappings AS (
    -- First, try to match by slug (preferred method)
    SELECT 
        'essential'::subscription_tier AS tier,
        c.id AS course_id,
        ec.expected_slug,
        ec.expected_title,
        'slug' AS match_method
    FROM expected_courses ec
    INNER JOIN public.courses c ON c.slug = ec.expected_slug
    
    UNION
    
    -- Fallback: Match by title only if slug doesn't exist in database
    SELECT 
        'essential'::subscription_tier AS tier,
        c.id AS course_id,
        ec.expected_slug,
        ec.expected_title,
        'title' AS match_method
    FROM expected_courses ec
    INNER JOIN public.courses c ON c.title = ec.expected_title
    -- Only use title matching if the slug doesn't exist
    WHERE NOT EXISTS (
        SELECT 1 FROM public.courses c2
        WHERE c2.slug = ec.expected_slug
    )
)
INSERT INTO public.subscription_tier_courses (tier, course_id)
SELECT DISTINCT tier, course_id
FROM course_mappings
ON CONFLICT (tier, course_id) DO NOTHING;

-- Verification: Report what was inserted (for logging/debugging)
DO $$
DECLARE
    v_inserted_count INTEGER;
    v_expected_courses TEXT[] := ARRAY[
        'prompt-engineering',
        'ai-content-pipelines',
        'reddit-ai-visibility',
        'seo-to-aeo',
        'ai-governance-eu-ai-act'
    ];
    v_missing_courses TEXT[];
    v_course_record RECORD;
BEGIN
    -- Count how many courses are mapped
    SELECT COUNT(DISTINCT course_id) INTO v_inserted_count
    FROM public.subscription_tier_courses
    WHERE tier = 'essential'::subscription_tier;
    
    -- Check which expected courses are missing
    SELECT ARRAY_AGG(expected_slug) INTO v_missing_courses
    FROM unnest(v_expected_courses) AS expected_slug
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.subscription_tier_courses stc
        JOIN public.courses c ON c.id = stc.course_id
        WHERE stc.tier = 'essential'::subscription_tier
        AND c.slug = expected_slug
    );
    
    -- Log results
    RAISE NOTICE 'Essential Access course mapping complete';
    RAISE NOTICE 'Total courses mapped: %', v_inserted_count;
    
    IF v_missing_courses IS NOT NULL AND array_length(v_missing_courses, 1) > 0 THEN
        RAISE WARNING 'Some expected courses are not mapped: %', array_to_string(v_missing_courses, ', ');
        RAISE WARNING 'This may indicate that courses with these slugs do not exist in the database';
    ELSE
        RAISE NOTICE 'All expected courses are mapped successfully';
    END IF;
    
    -- List all mapped courses for verification
    RAISE NOTICE 'Mapped courses:';
    FOR v_course_record IN
        SELECT c.slug, c.title
        FROM public.subscription_tier_courses stc
        JOIN public.courses c ON c.id = stc.course_id
        WHERE stc.tier = 'essential'::subscription_tier
        ORDER BY c.slug
    LOOP
        RAISE NOTICE '  - % (%)', v_course_record.slug, v_course_record.title;
    END LOOP;
END $$;

COMMIT;
