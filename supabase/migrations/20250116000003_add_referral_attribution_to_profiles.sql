-- Add referral attribution fields to profiles table
-- Users can read their own referral fields, but only admins can modify them
-- Attribution is set when a user signs up via a referral link

-- Add referral attribution columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_link_id UUID REFERENCES sales_referral_links(id) ON DELETE SET NULL;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sales_rep_id UUID REFERENCES sales_reps(id) ON DELETE SET NULL;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referred_at TIMESTAMPTZ;

-- Create indexes for referral fields
CREATE INDEX IF NOT EXISTS idx_profiles_referral_link_id ON profiles(referral_link_id);
CREATE INDEX IF NOT EXISTS idx_profiles_sales_rep_id ON profiles(sales_rep_id);

-- Create function to prevent referral field changes by non-admins
CREATE OR REPLACE FUNCTION prevent_referral_field_change()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
