-- Handle Subscription Edge Cases
-- Auto-update expired subscriptions, handle payment failures, etc.

-- Function to auto-update expired subscriptions
CREATE OR REPLACE FUNCTION update_expired_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update subscriptions where period has ended but status is still 'active'
  UPDATE subscriptions
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'active'
    AND current_period_end <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to run expiration check (if using pg_cron)
-- This would run daily to update expired subscriptions
-- COMMENT: Uncomment if pg_cron extension is available
-- SELECT cron.schedule(
--   'update-expired-subscriptions',
--   '0 0 * * *', -- Daily at midnight
--   $$SELECT update_expired_subscriptions()$$
-- );

-- Function to check and handle payment failures
-- This would integrate with payment provider webhooks
CREATE OR REPLACE FUNCTION handle_payment_failure(
  p_subscription_id UUID,
  p_grace_period_days INTEGER DEFAULT 7
) RETURNS void AS $$
DECLARE
  v_grace_period_end TIMESTAMPTZ;
BEGIN
  -- Calculate grace period end
  SELECT current_period_end + (p_grace_period_days || ' days')::INTERVAL
  INTO v_grace_period_end
  FROM subscriptions
  WHERE id = p_subscription_id;

  -- Update subscription with payment failure flag
  -- Note: We might want to add a payment_status field
  -- For now, we'll use a notes field or create a separate payment_status table
  UPDATE subscriptions
  SET updated_at = NOW()
  WHERE id = p_subscription_id;

  -- Log payment failure
  INSERT INTO subscription_change_log (
    subscription_id,
    student_profile_id,
    old_tier,
    new_tier,
    change_type,
    notes
  )
  SELECT 
    id,
    student_profile_id,
    tier,
    tier, -- No tier change, just status change
    'payment_failure',
    format('Payment failed. Grace period ends: %s', v_grace_period_end)
  FROM subscriptions
  WHERE id = p_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle course redirects (for renamed courses)
CREATE TABLE IF NOT EXISTS course_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  new_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  old_slug VARCHAR(255) NOT NULL,
  new_slug VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(old_course_id, new_course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_redirects_old_course_id ON course_redirects(old_course_id);
CREATE INDEX IF NOT EXISTS idx_course_redirects_old_slug ON course_redirects(old_slug);

-- Enable RLS
ALTER TABLE course_redirects ENABLE ROW LEVEL SECURITY;

-- Anyone can view redirects (needed for redirect logic)
DROP POLICY IF EXISTS "Anyone can view course redirects" ON course_redirects;
CREATE POLICY "Anyone can view course redirects"
  ON course_redirects
  FOR SELECT
  USING (true);

-- Only admins can manage redirects
DROP POLICY IF EXISTS "Admins can manage course redirects" ON course_redirects;
CREATE POLICY "Admins can manage course redirects"
  ON course_redirects
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Function to get course redirect
CREATE OR REPLACE FUNCTION get_course_redirect(
  p_course_id UUID
) RETURNS UUID AS $$
DECLARE
  v_new_course_id UUID;
BEGIN
  SELECT new_course_id INTO v_new_course_id
  FROM course_redirects
  WHERE old_course_id = p_course_id
  LIMIT 1;

  RETURN v_new_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_course_redirect(UUID) TO authenticated;

-- Update has_course_access function to handle course redirects
-- (This would be added to the existing function)
-- For now, we'll create a wrapper that checks redirects first

-- Function to check subscription status with detailed error info
CREATE OR REPLACE FUNCTION get_subscription_access_status(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_subscription RECORD;
  v_result JSONB;
BEGIN
  -- Get subscription with all relevant fields
  SELECT s.*, stc.has_all_access
  INTO v_subscription
  FROM subscriptions s
  JOIN student_profiles sp ON sp.id = s.student_profile_id
  JOIN profiles p ON p.id = sp.profile_id
  LEFT JOIN subscription_tier_config stc ON stc.tier = s.tier
  WHERE p.user_id = p_user_id
    AND s.status IN ('active', 'trial', 'canceled')
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_subscription IS NULL THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'reason', 'no_subscription',
      'status_code', 403
    );
  END IF;

  -- Check if expired
  IF v_subscription.current_period_end <= NOW() THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'reason', 'expired',
      'status_code', 403,
      'period_end', v_subscription.current_period_end
    );
  END IF;

  -- Check status
  IF v_subscription.status = 'paused' THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'reason', 'paused',
      'status_code', 403
    );
  END IF;

  IF v_subscription.status = 'expired' THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'reason', 'expired',
      'status_code', 403
    );
  END IF;

  IF v_subscription.status = 'canceled' AND v_subscription.current_period_end <= NOW() THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'reason', 'canceled',
      'status_code', 403
    );
  END IF;

  -- Active subscription
  RETURN jsonb_build_object(
    'has_access', true,
    'tier', v_subscription.tier,
    'status', v_subscription.status,
    'period_end', v_subscription.current_period_end,
    'has_all_access', v_subscription.has_all_access
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_subscription_access_status(UUID) TO authenticated;
