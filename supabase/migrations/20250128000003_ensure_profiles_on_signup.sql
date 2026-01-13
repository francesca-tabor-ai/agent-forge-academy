-- Phase 1, Step 1.1: Ensure every auth user has a profile row with a role
-- Goal: Every auth user has a profile row with a role

-- ============================================
-- Step 1: Ensure role column has default value
-- ============================================
-- The role column already exists and is NOT NULL, but we need to ensure it has a default
-- Since we're using an enum type, we'll set the default in the column definition
-- Note: If the column already has a default, this will update it; if not, it will add it
ALTER TABLE public.profiles
ALTER COLUMN role SET DEFAULT 'student';

-- ============================================
-- Step 2: Add CHECK constraint for role values
-- ============================================
-- Even though we use an enum, adding a CHECK constraint provides additional clarity
-- and ensures only valid roles are allowed (student, recruiter, admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('student', 'recruiter', 'admin'));
  END IF;
END $$;

-- ============================================
-- Step 3: Create function to handle new user signup
-- ============================================
-- This function automatically creates a profile when a new user signs up
-- Uses the user's id from auth.users as user_id in profiles
-- Sets role to 'student' by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 4: Create trigger on auth.users
-- ============================================
-- This trigger fires after a new user is inserted into auth.users
-- and automatically creates a corresponding profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Step 5: Ensure existing users without profiles get one
-- ============================================
-- This is a one-time migration for existing users who don't have profiles
-- New users will get profiles automatically via the trigger above
INSERT INTO public.profiles (user_id, role)
SELECT 
  id as user_id,
  'student' as role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;
