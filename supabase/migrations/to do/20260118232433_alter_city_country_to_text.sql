-- Alter city and country columns from VARCHAR(100) to TEXT if they exist
-- This handles cases where columns were created with VARCHAR(100) in previous migrations
-- Safe to run multiple times (idempotent)

-- Check if city column exists and is VARCHAR, then alter to TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'student_profiles' 
      AND column_name = 'city'
      AND data_type = 'character varying'
      AND character_maximum_length = 100
  ) THEN
    ALTER TABLE student_profiles ALTER COLUMN city TYPE TEXT;
  END IF;
END $$;

-- Check if country column exists and is VARCHAR, then alter to TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'student_profiles' 
      AND column_name = 'country'
      AND data_type = 'character varying'
      AND character_maximum_length = 100
  ) THEN
    ALTER TABLE student_profiles ALTER COLUMN country TYPE TEXT;
  END IF;
END $$;
