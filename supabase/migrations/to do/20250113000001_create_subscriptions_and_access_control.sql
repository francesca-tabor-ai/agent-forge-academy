-- Create subscription and access control system
-- Supports two tiers: Essential Access (£39/month) and Professional Access (£79/month)
-- Essential Access: Limited to 5 specific courses
-- Professional Access: All courses

-- Create subscription_tier enum (idempotent)
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('essential', 'professional');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create subscription_status enum (idempotent)
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'trial', 'paused', 'canceled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create subscriptions table
-- Links student profiles to their subscription tier and status
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL,
  status subscription_status NOT NULL DEFAULT 'trial',
  price_monthly NUMERIC(10, 2) NOT NULL, -- £39 or £79
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,
  trial_end_at TIMESTAMPTZ, -- NULL if no trial
  stripe_subscription_id VARCHAR(255), -- For payment provider integration
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_price CHECK (price_monthly > 0),
  CONSTRAINT valid_period CHECK (current_period_end > current_period_start)
);

-- Create subscription_tier_courses table
-- Maps subscription tiers to specific courses they can access
-- If a tier has has_all_access=true, it grants access to all courses (bypasses this table)
CREATE TABLE IF NOT EXISTS subscription_tier_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tier, course_id)
);

-- Create subscription_tier_config table
-- Stores tier metadata and whether tier has all-access
CREATE TABLE IF NOT EXISTS subscription_tier_config (
  tier subscription_tier PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP',
  has_all_access BOOLEAN NOT NULL DEFAULT false, -- If true, grants access to all courses
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_student_profile_id ON subscriptions(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscription_tier_courses_tier ON subscription_tier_courses(tier);
CREATE INDEX IF NOT EXISTS idx_subscription_tier_courses_course_id ON subscription_tier_courses(course_id);

-- Create trigger to update updated_at (idempotent)
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_tier_config_updated_at ON subscription_tier_config;
CREATE TRIGGER update_subscription_tier_config_updated_at
  BEFORE UPDATE ON subscription_tier_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tier_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tier_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions

-- Students can view their own subscription
DROP POLICY IF EXISTS "Students can view their own subscription" ON subscriptions;
CREATE POLICY "Students can view their own subscription"
  ON subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = subscriptions.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Admins can view all subscriptions
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Admins can manage subscriptions
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON subscriptions;
CREATE POLICY "Admins can manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for subscription_tier_courses

-- Anyone can view tier-course mappings (needed for access checks)
DROP POLICY IF EXISTS "Anyone can view tier-course mappings" ON subscription_tier_courses;
CREATE POLICY "Anyone can view tier-course mappings"
  ON subscription_tier_courses
  FOR SELECT
  USING (true);

-- Only admins can manage tier-course mappings
DROP POLICY IF EXISTS "Admins can manage tier-course mappings" ON subscription_tier_courses;
CREATE POLICY "Admins can manage tier-course mappings"
  ON subscription_tier_courses
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for subscription_tier_config

-- Anyone can view tier config (needed for access checks)
DROP POLICY IF EXISTS "Anyone can view tier config" ON subscription_tier_config;
CREATE POLICY "Anyone can view tier config"
  ON subscription_tier_config
  FOR SELECT
  USING (true);

-- Only admins can manage tier config
DROP POLICY IF EXISTS "Admins can manage tier config" ON subscription_tier_config;
CREATE POLICY "Admins can manage tier config"
  ON subscription_tier_config
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Helper function to check if user has access to a course
-- Returns true if:
-- 1. User has an active subscription
-- 2. Their tier either has all_access OR the course is in subscription_tier_courses
CREATE OR REPLACE FUNCTION has_course_access(
  p_user_id UUID,
  p_course_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_tier subscription_tier;
  v_has_all_access BOOLEAN;
  v_course_exists BOOLEAN;
BEGIN
  -- Check if course exists and is published
  SELECT EXISTS(
    SELECT 1 FROM courses WHERE id = p_course_id AND is_published = true
  ) INTO v_course_exists;
  
  IF NOT v_course_exists THEN
    RETURN false;
  END IF;

  -- Get user's active subscription tier
  SELECT s.tier INTO v_tier
  FROM subscriptions s
  JOIN student_profiles sp ON sp.id = s.student_profile_id
  JOIN profiles p ON p.id = sp.profile_id
  WHERE p.user_id = p_user_id
    AND s.status = 'active'
    AND s.current_period_end > NOW()
  LIMIT 1;

  -- If no active subscription, deny access
  IF v_tier IS NULL THEN
    RETURN false;
  END IF;

  -- Check if tier has all-access
  SELECT has_all_access INTO v_has_all_access
  FROM subscription_tier_config
  WHERE tier = v_tier;

  -- If tier has all-access, grant access
  IF v_has_all_access THEN
    RETURN true;
  END IF;

  -- Otherwise, check if course is in subscription_tier_courses
  SELECT EXISTS(
    SELECT 1 FROM subscription_tier_courses
    WHERE tier = v_tier AND course_id = p_course_id
  ) INTO v_course_exists;

  RETURN v_course_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION has_course_access(UUID, UUID) TO authenticated;
