-- Create course_entitlements table (optional)
-- Stores course access entitlements for faster lookups
-- Can be computed dynamically from subscriptions + segment course lists, but storing makes checks faster

CREATE TABLE IF NOT EXISTS course_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  course_slug VARCHAR(255) NOT NULL, -- Denormalized for faster lookups
  source VARCHAR(50) NOT NULL, -- 'track', 'industry', or 'role'
  source_key VARCHAR(255) NOT NULL, -- Segment key (e.g., "agentic-systems", "finance", "pm")
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_slug) -- One entitlement per user per course
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_course_entitlements_user_id ON course_entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_course_entitlements_course_slug ON course_entitlements(course_slug);
CREATE INDEX IF NOT EXISTS idx_course_entitlements_source ON course_entitlements(source, source_key);
CREATE INDEX IF NOT EXISTS idx_course_entitlements_user_course ON course_entitlements(user_id, course_slug);

-- Enable Row Level Security
ALTER TABLE course_entitlements ENABLE ROW LEVEL SECURITY;

-- Users can view their own entitlements
DROP POLICY IF EXISTS "Users can view own entitlements" ON course_entitlements;
CREATE POLICY "Users can view own entitlements"
  ON course_entitlements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all entitlements (for webhooks and admin)
DROP POLICY IF EXISTS "Service role can manage entitlements" ON course_entitlements;
CREATE POLICY "Service role can manage entitlements"
  ON course_entitlements
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comments
COMMENT ON TABLE course_entitlements IS 'Stores course access entitlements for faster lookups. Can be computed dynamically from subscriptions + segment course lists.';
COMMENT ON COLUMN course_entitlements.source IS 'Source of entitlement: track, industry, or role';
COMMENT ON COLUMN course_entitlements.source_key IS 'Segment key that granted this entitlement (e.g., "agentic-systems", "finance", "pm")';
