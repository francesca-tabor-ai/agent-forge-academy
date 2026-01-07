-- Row Level Security policies for profiles table
-- Rules:
-- - Users can always read/write their own profile
-- - Recruiters can only read student profiles where visibility != 'private'
-- - Tutors cannot see recruiter-only fields
-- - Admins can read everything

-- Helper function to check if user is admin
-- Note: This will be properly implemented in a later migration
-- For now, returning false - proper implementation in 20250107000008_fix_issues.sql
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- This is a placeholder - will be replaced in migration 20250107000008
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE profiles.user_id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Users can always read their own profile (idempotent)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can always update their own profile (idempotent)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile (typically done via trigger) (idempotent)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can read everything (idempotent)
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Policy: Admins can update everything (idempotent)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (is_admin(auth.uid()));
