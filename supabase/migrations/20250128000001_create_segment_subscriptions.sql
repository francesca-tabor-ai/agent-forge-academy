-- Create segment subscriptions table
-- Tracks subscriptions to specific segments (track, industry, role)
-- Each subscription grants access to courses included in that segment

-- Create segment_type enum
DO $$ BEGIN
    CREATE TYPE segment_type AS ENUM ('track', 'industry', 'role');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create segment_subscriptions table
CREATE TABLE IF NOT EXISTS segment_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  segment_type segment_type NOT NULL,
  segment_key VARCHAR(255) NOT NULL, -- e.g., "agentic-systems", "fintech", "pm"
  stripe_subscription_id VARCHAR(255) UNIQUE, -- Stripe subscription ID
  stripe_price_id VARCHAR(255) NOT NULL, -- Stripe price ID (monthly or annual)
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
  billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, segment_type, segment_key) -- One subscription per user per segment
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_segment_subscriptions_user_id ON segment_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_segment_subscriptions_segment ON segment_subscriptions(segment_type, segment_key);
CREATE INDEX IF NOT EXISTS idx_segment_subscriptions_status ON segment_subscriptions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_segment_subscriptions_current_period_end ON segment_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_segment_subscriptions_stripe_subscription_id ON segment_subscriptions(stripe_subscription_id);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_segment_subscriptions_updated_at ON segment_subscriptions;
CREATE TRIGGER update_segment_subscriptions_updated_at
  BEFORE UPDATE ON segment_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE segment_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own segment subscriptions
DROP POLICY IF EXISTS "Users can view own segment subscriptions" ON segment_subscriptions;
CREATE POLICY "Users can view own segment subscriptions"
  ON segment_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all segment subscriptions (for webhooks)
DROP POLICY IF EXISTS "Service role can manage segment subscriptions" ON segment_subscriptions;
CREATE POLICY "Service role can manage segment subscriptions"
  ON segment_subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Helper function to check if user has access to a course via segment subscription
-- Returns true if:
-- 1. User has an active segment subscription
-- 2. The course is included in that segment's course list
CREATE OR REPLACE FUNCTION has_segment_course_access(
  p_user_id UUID,
  p_course_slug TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_segment_type segment_type;
  v_segment_key VARCHAR(255);
  v_course_exists BOOLEAN;
BEGIN
  -- Check if course exists and is published
  SELECT EXISTS(
    SELECT 1 FROM courses WHERE slug = p_course_slug AND is_published = true
  ) INTO v_course_exists;
  
  IF NOT v_course_exists THEN
    RETURN false;
  END IF;

  -- Get user's active segment subscriptions
  -- Check if any active subscription includes this course
  -- Note: This is a simplified check. In production, you'd want to store
  -- the included course slugs in the database or compute them dynamically
  -- For now, we'll rely on the application layer to check segment membership
  
  -- Check if user has any active segment subscription
  SELECT EXISTS(
    SELECT 1 FROM segment_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND current_period_end > NOW()
  ) INTO v_course_exists;

  -- If no active segment subscription, deny access
  -- Note: The actual course inclusion check happens in the application layer
  -- because we need to compute which courses belong to which segment
  RETURN v_course_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION has_segment_course_access(UUID, TEXT) TO authenticated;

-- Add comment
COMMENT ON TABLE segment_subscriptions IS 'Tracks user subscriptions to specific segments (track, industry, role)';
COMMENT ON COLUMN segment_subscriptions.segment_key IS 'URL-friendly slug for the segment (e.g., "agentic-systems", "fintech", "pm")';
COMMENT ON COLUMN segment_subscriptions.billing_cycle IS 'Billing cycle: "monthly" or "annual"';
