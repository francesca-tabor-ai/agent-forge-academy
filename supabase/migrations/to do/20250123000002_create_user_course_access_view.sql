-- Create view to return courses accessible to each user based on subscription tier
-- This view joins: auth.users → profiles → student_profiles → subscriptions → courses
-- Only includes active subscriptions with valid current_period_end
-- Returns: user_id, tier, course_id, course_slug, course_title

BEGIN;

-- Drop view if it exists (for idempotency)
DROP VIEW IF EXISTS public.user_course_access;

-- Create the view
CREATE VIEW public.user_course_access AS
WITH active_subscriptions AS (
    -- Get active subscriptions with valid period
    SELECT DISTINCT
        p.user_id,
        s.tier
    FROM public.subscriptions s
    INNER JOIN public.student_profiles sp ON sp.id = s.student_profile_id
    INNER JOIN public.profiles p ON p.id = sp.profile_id
    WHERE s.status = 'active'::subscription_status
    AND s.current_period_end > NOW()
)
-- All-access tiers: include all published courses
SELECT DISTINCT
    asub.user_id,
    asub.tier,
    c.id AS course_id,
    c.slug AS course_slug,
    c.title AS course_title
FROM active_subscriptions asub
INNER JOIN public.subscription_tier_config stc 
    ON stc.tier = asub.tier
CROSS JOIN public.courses c
WHERE stc.has_all_access = true
AND c.is_published = true

UNION

-- Limited-access tiers: include only explicitly mapped courses
SELECT DISTINCT
    asub.user_id,
    asub.tier,
    c.id AS course_id,
    c.slug AS course_slug,
    c.title AS course_title
FROM active_subscriptions asub
INNER JOIN public.subscription_tier_config stc 
    ON stc.tier = asub.tier
INNER JOIN public.subscription_tier_courses stc_courses 
    ON stc_courses.tier = asub.tier
INNER JOIN public.courses c 
    ON c.id = stc_courses.course_id
WHERE stc.has_all_access = false
AND c.is_published = true

ORDER BY user_id, tier, course_slug;

-- Add comment for documentation
COMMENT ON VIEW public.user_course_access IS 
'Returns all courses accessible to each user based on their active subscription tier. 
Includes tier-specific courses for Essential Access and all published courses for Professional Access.';

-- Grant SELECT to authenticated users (RLS will be enforced by underlying tables)
GRANT SELECT ON public.user_course_access TO authenticated;
GRANT SELECT ON public.user_course_access TO anon;

-- Note: RLS is automatically enforced through the underlying tables:
-- - subscriptions: Users can only see their own subscriptions
-- - student_profiles: Users can only see their own profile
-- - profiles: Users can only see their own profile
-- - courses: All authenticated users can view published courses
-- - subscription_tier_config: Public read access
-- - subscription_tier_courses: Public read access
--
-- Usage examples:
--   -- Get all courses accessible to the current user
--   SELECT * FROM public.user_course_access WHERE user_id = auth.uid();
--
--   -- Get courses for a specific user (admin only, due to RLS)
--   SELECT * FROM public.user_course_access WHERE user_id = '...';
--
--   -- Check if user has access to a specific course
--   SELECT EXISTS (
--     SELECT 1 FROM public.user_course_access
--     WHERE user_id = auth.uid() AND course_slug = 'prompt-engineering'
--   );

COMMIT;
