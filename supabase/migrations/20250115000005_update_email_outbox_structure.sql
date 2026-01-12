-- Update email_outbox table structure for retries and deduplication
-- Adds email_type, dedupe_key, to_email, subject, attempt_count, next_attempt_at

-- Add new columns
ALTER TABLE email_outbox
  ADD COLUMN IF NOT EXISTS email_type TEXT,
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT,
  ADD COLUMN IF NOT EXISTS to_email TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_error TEXT;

-- Migrate existing data: derive email_type from template_key
UPDATE email_outbox
SET email_type = CASE
  WHEN template_key = 'weekly_next_lesson' THEN 'weekly_learning'
  WHEN template_key LIKE 'weekly_%' THEN 'weekly_jobs'
  ELSE 'weekly_learning'
END
WHERE email_type IS NULL;

-- Set NOT NULL constraint on email_type after migration
ALTER TABLE email_outbox
  ALTER COLUMN email_type SET NOT NULL;

-- Generate dedupe_key for existing records (if not already set)
-- Format: email_type:YYYY-MM-DD:student_profile_id
UPDATE email_outbox
SET dedupe_key = email_type || ':' || TO_CHAR(created_at, 'YYYY-MM-DD') || ':' || student_profile_id::text
WHERE dedupe_key IS NULL;

-- Add UNIQUE constraint on dedupe_key
-- First, handle any duplicates by regenerating dedupe_key with timestamp
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Count duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT dedupe_key, COUNT(*) as cnt
    FROM email_outbox
    WHERE dedupe_key IS NOT NULL
    GROUP BY dedupe_key
    HAVING COUNT(*) > 1
  ) duplicates;

  -- If duplicates exist, regenerate them with timestamp
  IF duplicate_count > 0 THEN
    UPDATE email_outbox eo1
    SET dedupe_key = eo1.email_type || ':' || TO_CHAR(eo1.created_at, 'YYYY-MM-DD') || ':' || eo1.student_profile_id::text || ':' || eo1.id::text
    WHERE EXISTS (
      SELECT 1
      FROM email_outbox eo2
      WHERE eo2.dedupe_key = eo1.dedupe_key
      AND eo2.id < eo1.id
    );
  END IF;
END $$;

-- Add UNIQUE constraint (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE n.nspname = 'public'
      AND c.conname = 'email_outbox_dedupe_key_unique'
      AND c.conrelid = 'public.email_outbox'::regclass
  ) THEN
    ALTER TABLE email_outbox
      ADD CONSTRAINT email_outbox_dedupe_key_unique UNIQUE (dedupe_key);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already exists, ignore
    NULL;
END $$;

-- Create index on dedupe_key for quick lookups
CREATE INDEX IF NOT EXISTS idx_email_outbox_dedupe_key ON email_outbox(dedupe_key);

-- Create index on next_attempt_at for retry queries
CREATE INDEX IF NOT EXISTS idx_email_outbox_next_attempt_at ON email_outbox(next_attempt_at) WHERE status = 'queued' OR status = 'failed';

-- Create index on email_type for filtering
CREATE INDEX IF NOT EXISTS idx_email_outbox_email_type ON email_outbox(email_type);

-- Create index on status and next_attempt_at for efficient retry queries
CREATE INDEX IF NOT EXISTS idx_email_outbox_retry ON email_outbox(status, next_attempt_at) WHERE status IN ('queued', 'failed');

-- Update existing records to have next_attempt_at if NULL
UPDATE email_outbox
SET next_attempt_at = created_at
WHERE next_attempt_at IS NULL;
