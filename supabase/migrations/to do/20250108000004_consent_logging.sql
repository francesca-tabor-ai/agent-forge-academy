-- Consent logging for visibility changes
-- Tracks when students change their profile or project visibility
-- This is important for trust and audit purposes

-- Create consent_events table
CREATE TABLE IF NOT EXISTS consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'visibility_change', 'contact_approval', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'student_profile', 'portfolio_project'
  resource_id UUID NOT NULL,
  old_value TEXT,
  new_value TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_consent_events_user_id ON consent_events(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_events_profile_id ON consent_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_consent_events_event_type ON consent_events(event_type);
CREATE INDEX IF NOT EXISTS idx_consent_events_created_at ON consent_events(created_at DESC);

-- Enable RLS
ALTER TABLE consent_events ENABLE ROW LEVEL SECURITY;

-- Function to log visibility changes
CREATE OR REPLACE FUNCTION log_visibility_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if visibility actually changed
  IF OLD.visibility IS DISTINCT FROM NEW.visibility THEN
    INSERT INTO consent_events (
      user_id,
      profile_id,
      event_type,
      resource_type,
      resource_id,
      old_value,
      new_value,
      metadata
    )
    SELECT
      p.user_id,
      NEW.profile_id,
      'visibility_change',
      'student_profile',
      NEW.id,
      OLD.visibility::TEXT,
      NEW.visibility::TEXT,
      jsonb_build_object(
        'profile_id', NEW.id,
        'changed_at', NOW()
      )
    FROM profiles p
    WHERE p.id = NEW.profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for student_profiles visibility changes
DROP TRIGGER IF EXISTS log_student_profile_visibility_change ON student_profiles;
CREATE TRIGGER log_student_profile_visibility_change
  AFTER UPDATE ON student_profiles
  FOR EACH ROW
  WHEN (OLD.visibility IS DISTINCT FROM NEW.visibility)
  EXECUTE FUNCTION log_visibility_change();

-- Function to log portfolio project visibility changes
CREATE OR REPLACE FUNCTION log_project_visibility_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if visibility actually changed
  IF OLD.visibility IS DISTINCT FROM NEW.visibility THEN
    INSERT INTO consent_events (
      user_id,
      profile_id,
      event_type,
      resource_type,
      resource_id,
      old_value,
      new_value,
      metadata
    )
    SELECT
      p.user_id,
      sp.profile_id,
      'visibility_change',
      'portfolio_project',
      NEW.id,
      OLD.visibility::TEXT,
      NEW.visibility::TEXT,
      jsonb_build_object(
        'project_id', NEW.id,
        'project_title', NEW.title,
        'changed_at', NOW()
      )
    FROM student_profiles sp
    JOIN profiles p ON p.id = sp.profile_id
    WHERE sp.id = NEW.student_profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for portfolio_projects visibility changes
DROP TRIGGER IF EXISTS log_portfolio_project_visibility_change ON portfolio_projects;
CREATE TRIGGER log_portfolio_project_visibility_change
  AFTER UPDATE ON portfolio_projects
  FOR EACH ROW
  WHEN (OLD.visibility IS DISTINCT FROM NEW.visibility)
  EXECUTE FUNCTION log_project_visibility_change();

-- Function to log contact request approvals
CREATE OR REPLACE FUNCTION log_contact_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when contact request is approved
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    INSERT INTO consent_events (
      user_id,
      profile_id,
      event_type,
      resource_type,
      resource_id,
      old_value,
      new_value,
      metadata
    )
    SELECT
      p.user_id,
      sp.profile_id,
      'contact_approval',
      'contact_request',
      NEW.id,
      OLD.status,
      NEW.status,
      jsonb_build_object(
        'contact_request_id', NEW.id,
        'recruiter_profile_id', NEW.recruiter_profile_id,
        'approved_at', NOW()
      )
    FROM student_profiles sp
    JOIN profiles p ON p.id = sp.profile_id
    WHERE sp.id = NEW.student_profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for contact_requests status changes
DROP TRIGGER IF EXISTS log_contact_approval ON contact_requests;
CREATE TRIGGER log_contact_approval
  AFTER UPDATE ON contact_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_contact_approval();

-- RLS Policies for consent_events

-- Users can read their own consent events
DROP POLICY IF EXISTS "Users can read own consent events" ON consent_events;
CREATE POLICY "Users can read own consent events"
  ON consent_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can read all consent events
DROP POLICY IF EXISTS "Admins can read all consent events" ON consent_events;
CREATE POLICY "Admins can read all consent events"
  ON consent_events
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Only system can insert consent events (via triggers)
-- No user-initiated inserts allowed
DROP POLICY IF EXISTS "System can insert consent events" ON consent_events;
CREATE POLICY "System can insert consent events"
  ON consent_events
  FOR INSERT
  WITH CHECK (false); -- Triggers use SECURITY DEFINER, so this is fine

-- No updates or deletes allowed
-- Consent events are immutable audit records

