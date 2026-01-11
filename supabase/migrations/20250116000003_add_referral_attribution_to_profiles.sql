-- Add referral attribution fields to profiles table
-- Users can read their own referral fields, but only admins can modify them
-- Attribution is set when a user signs up via a referral link

-- First, check if sales tables exist and add columns/constraints
DO $$
BEGIN
  -- Check if sales_referral_links and sales_reps tables exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sales_referral_links'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sales_reps'
  ) THEN
    RAISE NOTICE 'sales_referral_links or sales_reps tables do not exist. Ensure migration 20250116000001_create_sales_referral_tables.sql runs first.';
    RETURN;
  END IF;

  -- Add referral attribution columns to profiles
  ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS referral_link_id UUID;

  ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS sales_rep_id UUID;

  ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS referred_at TIMESTAMPTZ;

  -- Add foreign key constraints if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_referral_link_id_fkey'
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_referral_link_id_fkey 
    FOREIGN KEY (referral_link_id) REFERENCES sales_referral_links(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_sales_rep_id_fkey'
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_sales_rep_id_fkey 
    FOREIGN KEY (sales_rep_id) REFERENCES sales_reps(id) ON DELETE SET NULL;
  END IF;

  -- Create indexes for referral fields (using EXECUTE since we're in a DO block)
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_referral_link_id ON profiles(referral_link_id)';
  EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_sales_rep_id ON profiles(sales_rep_id)';
END $$;

-- Create function to prevent referral field changes by non-admins
CREATE OR REPLACE FUNCTION prevent_referral_field_change()
RETURNS TRIGGER AS $function$
BEGIN
  -- Check if any referral field is being changed
  IF (OLD.referral_link_id IS DISTINCT FROM NEW.referral_link_id)
     OR (OLD.sales_rep_id IS DISTINCT FROM NEW.sales_rep_id)
     OR (OLD.referred_at IS DISTINCT FROM NEW.referred_at) THEN
    -- Only allow if user is admin (checked via is_admin function)
    IF NOT is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Referral attribution fields cannot be changed. Contact an administrator if you need to update referral information.';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce referral field immutability for non-admins
DROP TRIGGER IF EXISTS prevent_referral_field_change_trigger ON profiles;
CREATE TRIGGER prevent_referral_field_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_referral_field_change();

-- Note: RLS policies for reading referral fields are already covered by existing policies:
-- - "Users can read own profile" allows users to read their own profile (including referral fields)
-- - "Admins can read all profiles" allows admins to read all profiles
-- - "Users can update own profile" allows users to update their own profile, but the trigger above
--   prevents non-admins from modifying referral fields specifically
-- - "Admins can update all profiles" allows admins to update any profile (including referral fields)
