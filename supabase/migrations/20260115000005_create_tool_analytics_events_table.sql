-- Create tool_analytics_events table
-- Tracks user interactions with tools and offers for ROI analysis
-- Enables proving value to partners

CREATE TABLE IF NOT EXISTS tool_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'tool_view', 'offer_unlock', 'offer_claim', 'course_tool_conversion'
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_profile_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL,
  tool_id UUID REFERENCES tools(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES tool_offers(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  project_id UUID REFERENCES portfolio_projects(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional event data (e.g., source, referrer, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tool_analytics_events_event_type ON tool_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_events_user_id ON tool_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_events_tool_id ON tool_analytics_events(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_events_offer_id ON tool_analytics_events(offer_id);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_events_course_id ON tool_analytics_events(course_id);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_events_created_at ON tool_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_events_student_profile_id ON tool_analytics_events(student_profile_id);

-- Composite index for common analytics queries
CREATE INDEX IF NOT EXISTS idx_tool_analytics_events_type_tool_date ON tool_analytics_events(event_type, tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_events_type_offer_date ON tool_analytics_events(event_type, offer_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE tool_analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own events
DROP POLICY IF EXISTS "Users can insert their own analytics events" ON tool_analytics_events;
CREATE POLICY "Users can insert their own analytics events"
  ON tool_analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can view their own events
DROP POLICY IF EXISTS "Users can view their own analytics events" ON tool_analytics_events;
CREATE POLICY "Users can view their own analytics events"
  ON tool_analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Admins can view all events
DROP POLICY IF EXISTS "Admins can view all analytics events" ON tool_analytics_events;
CREATE POLICY "Admins can view all analytics events"
  ON tool_analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Comments for documentation
COMMENT ON TABLE tool_analytics_events IS 'Tracks user interactions with tools and offers for ROI analysis and partner reporting';
COMMENT ON COLUMN tool_analytics_events.event_type IS 'Type of event: tool_view, offer_unlock, offer_claim, course_tool_conversion';
COMMENT ON COLUMN tool_analytics_events.metadata IS 'Additional event data stored as JSONB (e.g., source, referrer, user agent, etc.)';
