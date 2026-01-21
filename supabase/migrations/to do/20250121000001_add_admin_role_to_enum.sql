-- Add 'admin' role to user_role enum
-- This migration is idempotent and safe to run multiple times

DO $$ 
BEGIN
  -- Add 'admin' if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'admin' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;
END $$;
