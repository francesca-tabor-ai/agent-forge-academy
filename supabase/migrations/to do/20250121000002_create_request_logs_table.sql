-- Create request_logs table for tracking API requests
-- Stores request metadata, status, duration, and error information
-- Used for debugging and monitoring critical endpoints

CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- milliseconds
  error_stack TEXT, -- Only populated for 5xx errors
  error_message TEXT, -- Only populated for errors
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_request_logs_request_id ON request_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_user_id ON request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_path ON request_logs(path);
CREATE INDEX IF NOT EXISTS idx_request_logs_status ON request_logs(status);
CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_path_status ON request_logs(path, status);

-- Enable RLS
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can read request logs
DROP POLICY IF EXISTS "Admins can read request logs" ON request_logs;
CREATE POLICY "Admins can read request logs"
  ON request_logs
  FOR SELECT
  USING (is_admin(auth.uid()));

-- RLS Policy: System can insert request logs (via service role)
DROP POLICY IF EXISTS "System can insert request logs" ON request_logs;
CREATE POLICY "System can insert request logs"
  ON request_logs
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS

-- No updates or deletes allowed
-- Request logs are immutable
