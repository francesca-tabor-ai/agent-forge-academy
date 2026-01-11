-- Create email_outbox table for robust email sending with retries
-- Decouples email sending from business logic and enables retry mechanisms

-- Create email status enum
DO $$ BEGIN
    CREATE TYPE email_status AS ENUM ('queued', 'sent', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create email_outbox table
CREATE TABLE IF NOT EXISTS email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  template_key VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status email_status NOT NULL DEFAULT 'queued',
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email_outbox_student_profile_id ON email_outbox(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_email_outbox_status ON email_outbox(status);
CREATE INDEX IF NOT EXISTS idx_email_outbox_template_key ON email_outbox(template_key);
CREATE INDEX IF NOT EXISTS idx_email_outbox_created_at ON email_outbox(created_at);
-- Composite index for common query: get queued emails ordered by creation time
CREATE INDEX IF NOT EXISTS idx_email_outbox_status_created_at ON email_outbox(status, created_at) WHERE status = 'queued';

-- Enable Row Level Security
ALTER TABLE email_outbox ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_outbox

-- Students can view their own email queue (read-only for transparency)
DROP POLICY IF EXISTS "Students can view own email queue" ON email_outbox;
CREATE POLICY "Students can view own email queue"
  ON email_outbox
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = email_outbox.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Only system/admins can insert emails (via service role or admin)
-- Students cannot directly insert emails - they're created by the system
DROP POLICY IF EXISTS "System can insert emails" ON email_outbox;
CREATE POLICY "System can insert emails"
  ON email_outbox
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Only system/admins can update email status (for processing queue)
DROP POLICY IF EXISTS "System can update email status" ON email_outbox;
CREATE POLICY "System can update email status"
  ON email_outbox
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admins can view all emails
DROP POLICY IF EXISTS "Admins can view all emails" ON email_outbox;
CREATE POLICY "Admins can view all emails"
  ON email_outbox
  FOR SELECT
  USING (is_admin(auth.uid()));
