-- Update email preferences: add jobs emails, consolidate day/hour, add last_sent tracking
-- This migration extends the existing email preferences with jobs emails and shared scheduling

-- Ensure pgcrypto extension is enabled (required for generate_unsubscribe_token)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure generate_unsubscribe_token function exists (in case migrations run out of order)
CREATE OR REPLACE FUNCTION generate_unsubscribe_token()
RETURNS TEXT AS $$
BEGIN
  -- Generate a random 32-character hex string
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Add weekly_jobs_emails_enabled column
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS weekly_jobs_emails_enabled BOOLEAN NOT NULL DEFAULT true;

-- Rename learning-specific day/hour to shared weekly_email_day/hour
-- First, add new columns with data from old columns
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS weekly_email_day INTEGER,
  ADD COLUMN IF NOT EXISTS weekly_email_hour INTEGER;

-- Migrate data from old columns to new shared columns
UPDATE student_profiles
SET 
  weekly_email_day = COALESCE(weekly_email_day, weekly_learning_emails_day, 2),
  weekly_email_hour = COALESCE(weekly_email_hour, weekly_learning_emails_hour, 9)
WHERE weekly_email_day IS NULL OR weekly_email_hour IS NULL;

-- Set NOT NULL and defaults for new columns
ALTER TABLE student_profiles
  ALTER COLUMN weekly_email_day SET NOT NULL,
  ALTER COLUMN weekly_email_day SET DEFAULT 2,
  ALTER COLUMN weekly_email_hour SET NOT NULL,
  ALTER COLUMN weekly_email_hour SET DEFAULT 9;

-- Add constraints
ALTER TABLE student_profiles
  ADD CONSTRAINT weekly_email_day_check CHECK (weekly_email_day >= 0 AND weekly_email_day <= 6),
  ADD CONSTRAINT weekly_email_hour_check CHECK (weekly_email_hour >= 0 AND weekly_email_hour <= 23);

-- Drop old learning-specific columns (optional - can keep for backward compatibility)
-- Uncomment if you want to remove the old columns:
-- ALTER TABLE student_profiles
--   DROP COLUMN IF EXISTS weekly_learning_emails_day,
--   DROP COLUMN IF EXISTS weekly_learning_emails_hour;

-- Ensure unsubscribe_token is UNIQUE
-- First, check if there are any duplicates and regenerate them
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Count duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT unsubscribe_token, COUNT(*) as cnt
    FROM student_profiles
    WHERE unsubscribe_token IS NOT NULL
    GROUP BY unsubscribe_token
    HAVING COUNT(*) > 1
  ) duplicates;

  -- If duplicates exist, regenerate them
  IF duplicate_count > 0 THEN
    UPDATE student_profiles sp1
    SET unsubscribe_token = generate_unsubscribe_token()
    WHERE EXISTS (
      SELECT 1
      FROM student_profiles sp2
      WHERE sp2.unsubscribe_token = sp1.unsubscribe_token
      AND sp2.id < sp1.id
    );
  END IF;
END $$;

-- Add UNIQUE constraint to unsubscribe_token
-- Drop existing index first (if it exists)
DROP INDEX IF EXISTS idx_student_profiles_unsubscribe_token;

-- Add UNIQUE constraint
ALTER TABLE student_profiles
  ADD CONSTRAINT student_profiles_unsubscribe_token_unique UNIQUE (unsubscribe_token);

-- Recreate index for quick lookups (UNIQUE constraint already creates an index, but explicit is clearer)
CREATE INDEX IF NOT EXISTS idx_student_profiles_unsubscribe_token ON student_profiles(unsubscribe_token);

-- Add optional last_sent_at columns for preventing double-sends
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS weekly_learning_email_last_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS weekly_jobs_email_last_sent_at TIMESTAMPTZ;

-- Create indexes for efficient queries (finding students who haven't received emails this week)
CREATE INDEX IF NOT EXISTS idx_student_profiles_learning_email_last_sent ON student_profiles(weekly_learning_email_last_sent_at);
CREATE INDEX IF NOT EXISTS idx_student_profiles_jobs_email_last_sent ON student_profiles(weekly_jobs_email_last_sent_at);
