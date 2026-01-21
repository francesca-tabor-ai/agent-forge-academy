-- Add onboarding status and enforce role immutability
-- Users must complete onboarding to select a role
-- Role cannot be changed by users (only admins can change roles)

-- Add onboarding_completed field to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Add onboarding_completed_at timestamp
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Create function to prevent role changes by non-admins
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only allow if user is admin (checked via is_admin function)
    IF NOT is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Role cannot be changed. Contact an administrator if you need to change your role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce role immutability
DROP TRIGGER IF EXISTS prevent_role_change_trigger ON profiles;
CREATE TRIGGER prevent_role_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_change();

-- Create function to set onboarding_completed_at when onboarding is completed
CREATE OR REPLACE FUNCTION set_onboarding_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If onboarding_completed changed from false to true
  IF OLD.onboarding_completed = false AND NEW.onboarding_completed = true THEN
    NEW.onboarding_completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set onboarding_completed_at
DROP TRIGGER IF EXISTS set_onboarding_completed_at_trigger ON profiles;
CREATE TRIGGER set_onboarding_completed_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_onboarding_completed_at();

-- Update RLS policy - users can update their own profile
-- Note: Role changes are prevented by the prevent_role_change trigger above
-- RLS policies cannot reference OLD/NEW, so role immutability is enforced by trigger only
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add index for onboarding queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);

