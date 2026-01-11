-- Add email preference fields to student_profiles
-- Weekly learning emails with day/hour preferences and unsubscribe token

-- Add email preference columns
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS weekly_learning_emails_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS weekly_learning_emails_day INTEGER NOT NULL DEFAULT 2 CHECK (weekly_learning_emails_day >= 0 AND weekly_learning_emails_day <= 6),
  ADD COLUMN IF NOT EXISTS weekly_learning_emails_hour INTEGER NOT NULL DEFAULT 9 CHECK (weekly_learning_emails_hour >= 0 AND weekly_learning_emails_hour <= 23),
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;

-- Create index on unsubscribe_token for quick lookups
CREATE INDEX IF NOT EXISTS idx_student_profiles_unsubscribe_token ON student_profiles(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;

-- Function to generate a random unsubscribe token
-- Uses md5() which doesn't require any extensions (built into PostgreSQL)
CREATE OR REPLACE FUNCTION generate_unsubscribe_token()
RETURNS TEXT AS $$
BEGIN
  -- Generate a random 32-character hex string using md5 (no extension required)
  -- Combines random() and clock_timestamp() for uniqueness
  RETURN md5(random()::text || clock_timestamp()::text || random()::text);
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate unsubscribe_token on insert if not provided
CREATE OR REPLACE FUNCTION set_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set token if it's NULL
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := generate_unsubscribe_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate unsubscribe_token
DROP TRIGGER IF EXISTS set_unsubscribe_token_trigger ON student_profiles;
CREATE TRIGGER set_unsubscribe_token_trigger
  BEFORE INSERT ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_unsubscribe_token();

-- Update existing student_profiles to have unsubscribe tokens if they don't have one
UPDATE student_profiles
SET unsubscribe_token = generate_unsubscribe_token()
WHERE unsubscribe_token IS NULL;
