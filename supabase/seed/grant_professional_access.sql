-- Grant Professional Access subscription to a specific user
-- User ID: 5d5182a0-f5ab-4f47-be2e-01fa70547bd6
-- This script ensures the user has an active Professional Access subscription
-- with access to all courses

BEGIN;

-- Grant Professional Access to user: 5d5182a0-f5ab-4f47-be2e-01fa70547bd6
DO $$
DECLARE
    v_user_id UUID := '5d5182a0-f5ab-4f47-be2e-01fa70547bd6'::uuid;
    v_user_exists BOOLEAN;
    v_profile_id UUID;
    v_student_profile_id UUID;
    v_tier_config RECORD;
    v_sub RECORD;
BEGIN
    -- Step 1: Verify user exists in auth.users
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE id = v_user_id
    ) INTO v_user_exists;

    IF NOT v_user_exists THEN
        RAISE EXCEPTION 'User % does not exist in auth.users', v_user_id;
    END IF;

    RAISE NOTICE 'User found: %', v_user_id;

    -- Step 2: Get or create profile
    SELECT id INTO v_profile_id
    FROM profiles
    WHERE user_id = v_user_id;

    IF v_profile_id IS NULL THEN
        -- Create profile with student role
        INSERT INTO profiles (user_id, role)
        VALUES (v_user_id, 'student'::user_role)
        RETURNING id INTO v_profile_id;
        
        RAISE NOTICE 'Created profile: %', v_profile_id;
    ELSE
        RAISE NOTICE 'Profile exists: %', v_profile_id;
    END IF;

    -- Step 3: Get or create student_profile
    SELECT id INTO v_student_profile_id
    FROM student_profiles
    WHERE profile_id = v_profile_id;

    IF v_student_profile_id IS NULL THEN
        -- Create student profile
        INSERT INTO student_profiles (profile_id)
        VALUES (v_profile_id)
        RETURNING id INTO v_student_profile_id;
        
        RAISE NOTICE 'Created student profile: %', v_student_profile_id;
    ELSE
        RAISE NOTICE 'Student profile exists: %', v_student_profile_id;
    END IF;

    -- Step 4: Get Professional Access tier config
    SELECT * INTO v_tier_config
    FROM subscription_tier_config
    WHERE tier = 'professional'::subscription_tier;

    IF v_tier_config IS NULL THEN
        RAISE EXCEPTION 'Professional Access tier configuration not found. Run seed scripts first.';
    END IF;

    RAISE NOTICE 'Professional Access tier config: % (has_all_access: %)', v_tier_config.tier, v_tier_config.has_all_access;

    -- Step 5: Create or update subscription to Professional Access
    INSERT INTO subscriptions (
        student_profile_id,
        tier,
        status,
        price_monthly,
        currency,
        started_at,
        current_period_start,
        current_period_end,
        canceled_at,
        trial_end_at
    ) VALUES (
        v_student_profile_id,
        'professional'::subscription_tier,
        'active'::subscription_status,
        v_tier_config.price_monthly,
        v_tier_config.currency,
        NOW(),
        NOW(),
        NOW() + INTERVAL '1 year',  -- Valid for 1 year
        NULL,  -- Not canceled
        NULL   -- No trial
    )
    ON CONFLICT (student_profile_id) DO UPDATE SET
        tier = 'professional'::subscription_tier,
        status = 'active'::subscription_status,
        price_monthly = v_tier_config.price_monthly,
        currency = v_tier_config.currency,
        current_period_start = NOW(),
        current_period_end = NOW() + INTERVAL '1 year',
        canceled_at = NULL,
        trial_end_at = NULL,
        updated_at = NOW();

    RAISE NOTICE 'Subscription set to Professional Access (active)';
    RAISE NOTICE 'Current period: % to %', NOW(), NOW() + INTERVAL '1 year';

    -- Step 6: Verify access
    RAISE NOTICE '';
    RAISE NOTICE 'Verification:';
    RAISE NOTICE '============';
    
    -- Check subscription
    SELECT s.*, stc.has_all_access
    INTO v_sub
    FROM subscriptions s
    JOIN subscription_tier_config stc ON stc.tier = s.tier
    WHERE s.student_profile_id = v_student_profile_id;
    
    IF v_sub IS NOT NULL THEN
        RAISE NOTICE 'Subscription ID: %', v_sub.id;
        RAISE NOTICE 'Tier: %', v_sub.tier;
        RAISE NOTICE 'Status: %', v_sub.status;
        RAISE NOTICE 'Has All Access: %', v_sub.has_all_access;
        RAISE NOTICE 'Period End: %', v_sub.current_period_end;
        RAISE NOTICE 'Is Active: %', (v_sub.status = 'active' AND v_sub.current_period_end > NOW());
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '✅ User % now has Professional Access with access to all courses', v_user_id;
END $$;

COMMIT;
