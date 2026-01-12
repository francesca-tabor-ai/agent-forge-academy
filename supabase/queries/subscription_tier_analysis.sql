-- Subscription Tier to Course Access Analysis
-- This file contains queries to inspect how subscription tiers map to course access

-- ============================================================================
-- 1. ENUM VALUES FOR subscription_tier
-- ============================================================================
-- Query to see all possible subscription tier enum values
SELECT 
    e.enumlabel AS tier_value,
    CASE 
        WHEN e.enumlabel = 'essential' THEN '✅ Essential Access'
        WHEN e.enumlabel = 'professional' THEN '✅ Professional Access'
        ELSE e.enumlabel
    END AS tier_label
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'subscription_tier'
ORDER BY e.enumsortorder;

-- ============================================================================
-- 2. ALL TIERS + THEIR CONFIGURATION
-- ============================================================================
-- Query to show all subscription tiers with their complete configuration
SELECT 
    stc.tier,
    stc.name,
    stc.description,
    stc.price_monthly,
    stc.currency,
    stc.has_all_access,
    stc.stripe_product_id,
    stc.stripe_price_id,
    stc.created_at,
    stc.updated_at,
    CASE 
        WHEN stc.has_all_access THEN '✅ All courses'
        ELSE '❌ Limited courses (see subscription_tier_courses)'
    END AS access_type
FROM subscription_tier_config stc
ORDER BY 
    CASE stc.tier
        WHEN 'essential' THEN 1
        WHEN 'professional' THEN 2
        ELSE 3
    END;

-- ============================================================================
-- 3. COURSE ENTITLEMENTS BY TIER
-- ============================================================================
-- Query to show for each tier, the list of course slugs/titles currently entitled

-- For Essential tier (limited courses)
SELECT 
    stc.tier,
    stc.name AS tier_name,
    stc.has_all_access,
    CASE 
        WHEN stc.has_all_access THEN 'ALL COURSES' 
        ELSE 'LIMITED COURSES'
    END AS access_type,
    COALESCE(
        json_agg(
            json_build_object(
                'course_id', c.id,
                'slug', c.slug,
                'title', c.title,
                'is_published', c.is_published
            ) ORDER BY c.slug
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
    ) AS entitled_courses,
    COUNT(c.id) AS course_count
FROM subscription_tier_config stc
LEFT JOIN subscription_tier_courses stc_courses 
    ON stc.tier = stc_courses.tier 
    AND stc.has_all_access = false
LEFT JOIN courses c 
    ON stc_courses.course_id = c.id
GROUP BY stc.tier, stc.name, stc.has_all_access
ORDER BY 
    CASE stc.tier
        WHEN 'essential' THEN 1
        WHEN 'professional' THEN 2
        ELSE 3
    END;

-- Alternative: Detailed view showing each course mapping
SELECT 
    stc.tier,
    stc.name AS tier_name,
    stc.has_all_access,
    CASE 
        WHEN stc.has_all_access THEN 'ALL COURSES (no explicit mapping needed)'
        ELSE c.slug
    END AS course_slug,
    CASE 
        WHEN stc.has_all_access THEN 'All published courses'
        ELSE c.title
    END AS course_title,
    CASE 
        WHEN stc.has_all_access THEN NULL
        ELSE c.is_published
    END AS is_published
FROM subscription_tier_config stc
LEFT JOIN subscription_tier_courses stc_courses 
    ON stc.tier = stc_courses.tier 
    AND stc.has_all_access = false
LEFT JOIN courses c 
    ON stc_courses.course_id = c.id
ORDER BY 
    CASE stc.tier
        WHEN 'essential' THEN 1
        WHEN 'professional' THEN 2
        ELSE 3
    END,
    c.slug;

-- ============================================================================
-- 4. SUMMARY: WHAT'S IN PLACE VS MISSING
-- ============================================================================
-- Query to check what's configured and what might be missing

WITH tier_summary AS (
    SELECT 
        stc.tier,
        stc.name,
        stc.has_all_access,
        COUNT(DISTINCT stc_courses.course_id) AS explicit_course_count,
        COUNT(DISTINCT c.id) FILTER (WHERE c.is_published = true) AS total_published_courses
    FROM subscription_tier_config stc
    LEFT JOIN subscription_tier_courses stc_courses 
        ON stc.tier = stc_courses.tier
    LEFT JOIN courses c 
        ON stc_courses.course_id = c.id
    CROSS JOIN (SELECT COUNT(*) AS total FROM courses WHERE is_published = true) total_courses
    GROUP BY stc.tier, stc.name, stc.has_all_access
)
SELECT 
    tier,
    name,
    has_all_access,
    explicit_course_count,
    CASE 
        WHEN has_all_access THEN '✅ All courses accessible'
        WHEN explicit_course_count > 0 THEN 
            CONCAT('✅ ', explicit_course_count, ' courses explicitly mapped')
        ELSE '⚠️  No courses mapped'
    END AS status,
    CASE 
        WHEN has_all_access THEN NULL
        WHEN explicit_course_count = 0 THEN '⚠️  Missing: Course mappings'
        WHEN stripe_product_id IS NULL THEN '⚠️  Missing: Stripe Product ID'
        WHEN stripe_price_id IS NULL THEN '⚠️  Missing: Stripe Price ID'
        ELSE '✅ Complete'
    END AS missing_items
FROM tier_summary ts
JOIN subscription_tier_config stc ON ts.tier = stc.tier
ORDER BY 
    CASE tier
        WHEN 'essential' THEN 1
        WHEN 'professional' THEN 2
        ELSE 3
    END;

-- ============================================================================
-- 5. VERIFICATION: Check if Essential Access courses exist
-- ============================================================================
-- Verify that all 5 courses expected for Essential Access actually exist
SELECT 
    'Expected Essential Access Courses' AS check_type,
    c.slug,
    c.title,
    c.is_published,
    CASE 
        WHEN c.id IS NULL THEN '❌ MISSING'
        WHEN c.is_published = false THEN '⚠️  EXISTS BUT NOT PUBLISHED'
        WHEN EXISTS (
            SELECT 1 FROM subscription_tier_courses stc_courses
            WHERE stc_courses.tier = 'essential'::subscription_tier
            AND stc_courses.course_id = c.id
        ) THEN '✅ MAPPED'
        ELSE '⚠️  EXISTS BUT NOT MAPPED'
    END AS status
FROM (VALUES
    ('prompt-engineering'),
    ('ai-content-pipelines'),
    ('reddit-ai-visibility'),
    ('seo-to-aeo'),
    ('ai-governance-eu-ai-act')
) AS expected(slug)
LEFT JOIN courses c ON c.slug = expected.slug
ORDER BY status, c.slug;
