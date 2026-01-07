-- Update role enum to use 'instructor' instead of 'tutor'
-- Note: This migration handles the transition from 'tutor' to 'instructor'

-- First, check if we need to add 'instructor' (it might already exist)
DO $$ 
BEGIN
  -- Add 'instructor' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'instructor' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'instructor';
  END IF;
END $$;

-- Note: We cannot directly rename enum values in PostgreSQL
-- Existing 'tutor' roles will need to be migrated manually or via application logic
-- For new installations, use 'instructor' going forward

