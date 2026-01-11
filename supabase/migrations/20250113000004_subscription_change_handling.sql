-- Subscription Change Handling
-- Handles upgrades, downgrades, and access consistency

-- Create subscription_change_log table for audit trail
CREATE TABLE IF NOT EXISTS subscription_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  old_tier subscription_tier,
  new_tier subscription_tier NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- 'upgrade', 'downgrade', 'renewal', 'cancellation'
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prorated_amount NUMERIC(10, 2), -- For billing adjustments
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for querying changes
CREATE INDEX IF NOT EXISTS idx_subscription_change_log_subscription_id ON subscription_change_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_change_log_student_profile_id ON subscription_change_log(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_subscription_change_log_effective_at ON subscription_change_log(effective_at DESC);

-- Enable RLS
ALTER TABLE subscription_change_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own change log
DROP POLICY IF EXISTS "Users can view their own subscription change log" ON subscription_change_log;
CREATE POLICY "Users can view their own subscription change log"
  ON subscription_change_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = subscription_change_log.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can view all change logs
DROP POLICY IF EXISTS "Admins can view all subscription change logs" ON subscription_change_log;
CREATE POLICY "Admins can view all subscription change logs"
  ON subscription_change_log
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Function to log subscription changes
CREATE OR REPLACE FUNCTION log_subscription_change(
  p_subscription_id UUID,
  p_old_tier subscription_tier,
  p_new_tier subscription_tier,
  p_change_type VARCHAR(50),
  p_prorated_amount NUMERIC(10, 2) DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_student_profile_id UUID;
  v_log_id UUID;
BEGIN
  -- Get student profile ID from subscription
  SELECT student_profile_id INTO v_student_profile_id
  FROM subscriptions
  WHERE id = p_subscription_id;

  IF v_student_profile_id IS NULL THEN
    RAISE EXCEPTION 'Subscription not found: %', p_subscription_id;
  END IF;

  -- Insert change log entry
  INSERT INTO subscription_change_log (
    subscription_id,
    student_profile_id,
    old_tier,
    new_tier,
    change_type,
    prorated_amount,
    notes
  ) VALUES (
    p_subscription_id,
    v_student_profile_id,
    p_old_tier,
    p_new_tier,
    p_change_type,
    p_prorated_amount,
    p_notes
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle subscription tier change
-- This function updates the subscription and logs the change
CREATE OR REPLACE FUNCTION change_subscription_tier(
  p_subscription_id UUID,
  p_new_tier subscription_tier,
  p_effective_immediately BOOLEAN DEFAULT true,
  p_prorated_amount NUMERIC(10, 2) DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_old_tier subscription_tier;
  v_student_profile_id UUID;
  v_change_type VARCHAR(50);
  v_result JSONB;
BEGIN
  -- Get current subscription
  SELECT tier, student_profile_id INTO v_old_tier, v_student_profile_id
  FROM subscriptions
  WHERE id = p_subscription_id
    AND status = 'active';

  IF v_old_tier IS NULL THEN
    RAISE EXCEPTION 'Active subscription not found: %', p_subscription_id;
  END IF;

  -- Don't allow changing to the same tier
  IF v_old_tier = p_new_tier THEN
    RAISE EXCEPTION 'Subscription is already on tier: %', p_new_tier;
  END IF;

  -- Determine change type
  IF (v_old_tier = 'essential' AND p_new_tier = 'professional') THEN
    v_change_type := 'upgrade';
  ELSIF (v_old_tier = 'professional' AND p_new_tier = 'essential') THEN
    v_change_type := 'downgrade';
  ELSE
    v_change_type := 'change';
  END IF;

  -- Update subscription tier
  UPDATE subscriptions
  SET
    tier = p_new_tier,
    price_monthly = (SELECT price_monthly FROM subscription_tier_config WHERE tier = p_new_tier),
    updated_at = NOW()
  WHERE id = p_subscription_id;

  -- If effective immediately, update period dates
  IF p_effective_immediately THEN
    -- For upgrades: immediate access
    -- For downgrades: access continues until period end (grace period)
    IF v_change_type = 'upgrade' THEN
      -- Upgrade takes effect immediately
      UPDATE subscriptions
      SET current_period_start = NOW()
      WHERE id = p_subscription_id;
    END IF;
    -- Downgrades take effect at period end (handled by access checks)
  END IF;

  -- Log the change
  PERFORM log_subscription_change(
    p_subscription_id,
    v_old_tier,
    p_new_tier,
    v_change_type,
    p_prorated_amount,
    format('Tier changed from %s to %s', v_old_tier, p_new_tier)
  );

  -- Return result
  v_result := jsonb_build_object(
    'subscription_id', p_subscription_id,
    'old_tier', v_old_tier,
    'new_tier', p_new_tier,
    'change_type', v_change_type,
    'effective_immediately', p_effective_immediately,
    'student_profile_id', v_student_profile_id
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION change_subscription_tier(UUID, subscription_tier, BOOLEAN, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION log_subscription_change(UUID, subscription_tier, subscription_tier, VARCHAR, NUMERIC, TEXT) TO authenticated;

-- Trigger to invalidate access cache on subscription changes
-- This could trigger a webhook or cache invalidation event
CREATE OR REPLACE FUNCTION notify_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on tier changes
  IF OLD.tier IS DISTINCT FROM NEW.tier THEN
    -- In a production system, this would:
    -- 1. Send webhook to application server
    -- 2. Invalidate Redis cache
    -- 3. Notify connected clients via WebSocket
    -- For now, we'll use a notification channel (if using Supabase Realtime)
    
    -- Log the change for processing
    PERFORM pg_notify(
      'subscription_tier_changed',
      json_build_object(
        'subscription_id', NEW.id,
        'student_profile_id', NEW.student_profile_id,
        'old_tier', OLD.tier,
        'new_tier', NEW.tier,
        'timestamp', NOW()
      )::text
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS subscription_tier_change_notification ON subscriptions;
CREATE TRIGGER subscription_tier_change_notification
  AFTER UPDATE OF tier ON subscriptions
  FOR EACH ROW
  WHEN (OLD.tier IS DISTINCT FROM NEW.tier)
  EXECUTE FUNCTION notify_subscription_change();

-- Function to get courses that will lose access on downgrade
CREATE OR REPLACE FUNCTION get_courses_losing_access_on_downgrade(
  p_student_profile_id UUID
) RETURNS TABLE (
  course_id UUID,
  course_slug VARCHAR(255),
  course_title VARCHAR(255),
  enrolled_at TIMESTAMPTZ,
  progress_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS course_id,
    c.slug AS course_slug,
    c.title AS course_title,
    ce.enrolled_at,
    ce.progress_percentage
  FROM course_enrollments ce
  JOIN courses c ON c.id = ce.course_id
  WHERE ce.student_profile_id = p_student_profile_id
    AND c.slug NOT IN (
      'prompt-engineering',
      'ai-content-pipelines',
      'reddit-ai-visibility',
      'seo-to-aeo',
      'ai-governance-eu-ai-act'
    )
    AND ce.completed_at IS NULL; -- Only in-progress courses
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_courses_losing_access_on_downgrade(UUID) TO authenticated;
