-- Admin audit logging
-- Tracks all admin actions for security and compliance

-- Create admin_audit_log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL, -- 'role_change', 'event_create', 'user_approve', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'profile', 'event', 'instructor_approval', etc.
  resource_id UUID,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_type ON admin_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_resource ON admin_audit_log(resource_type, resource_id);

-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Function to log admin role changes
CREATE OR REPLACE FUNCTION log_admin_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed and was changed by admin
  IF OLD.role IS DISTINCT FROM NEW.role AND is_admin(auth.uid()) THEN
    INSERT INTO admin_audit_log (
      admin_user_id,
      action_type,
      resource_type,
      resource_id,
      old_value,
      new_value,
      metadata
    )
    VALUES (
      auth.uid(),
      'role_change',
      'profile',
      NEW.id,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role),
      jsonb_build_object(
        'target_user_id', NEW.user_id,
        'changed_at', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile role changes by admins
DROP TRIGGER IF EXISTS log_admin_role_change_trigger ON profiles;
CREATE TRIGGER log_admin_role_change_trigger
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role AND is_admin(auth.uid()))
  EXECUTE FUNCTION log_admin_role_change();

-- Function to log admin event creation
CREATE OR REPLACE FUNCTION log_admin_event_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when admin creates an event
  IF is_admin(auth.uid()) THEN
    INSERT INTO admin_audit_log (
      admin_user_id,
      action_type,
      resource_type,
      resource_id,
      new_value,
      metadata
    )
    VALUES (
      auth.uid(),
      'event_create',
      'event',
      NEW.id,
      jsonb_build_object(
        'title', NEW.title,
        'event_type', NEW.event_type,
        'start_time', NEW.start_time
      ),
      jsonb_build_object(
        'created_at', NOW()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for event creation by admins
DROP TRIGGER IF EXISTS log_admin_event_creation_trigger ON events;
CREATE TRIGGER log_admin_event_creation_trigger
  AFTER INSERT ON events
  FOR EACH ROW
  WHEN (is_admin(auth.uid()))
  EXECUTE FUNCTION log_admin_event_creation();

-- RLS Policies for admin_audit_log

-- Only admins can read audit logs
DROP POLICY IF EXISTS "Admins can read audit logs" ON admin_audit_log;
CREATE POLICY "Admins can read audit logs"
  ON admin_audit_log
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Only system can insert audit logs (via triggers)
DROP POLICY IF EXISTS "System can insert audit logs" ON admin_audit_log;
CREATE POLICY "System can insert audit logs"
  ON admin_audit_log
  FOR INSERT
  WITH CHECK (false); -- Triggers use SECURITY DEFINER

-- No updates or deletes allowed
-- Audit logs are immutable

