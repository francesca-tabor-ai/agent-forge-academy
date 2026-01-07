-- Fix issues in Supabase schema
-- 1. Add admin role to enum
-- 2. Fix CHECK constraints (use triggers instead)
-- 3. Implement is_admin function properly
-- 4. Add missing RLS policies

-- Add admin role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Drop problematic CHECK constraints (they don't work reliably with subqueries)
ALTER TABLE student_profiles DROP CONSTRAINT IF EXISTS student_profiles_profile_must_be_student;
ALTER TABLE recruiter_profiles DROP CONSTRAINT IF EXISTS recruiter_profiles_profile_must_be_recruiter;

-- Create trigger function to validate student_profiles role
CREATE OR REPLACE FUNCTION validate_student_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = NEW.profile_id 
    AND profiles.role = 'student'
  ) THEN
    RAISE EXCEPTION 'student_profiles can only be created for profiles with role = student';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to validate recruiter_profiles role
CREATE OR REPLACE FUNCTION validate_recruiter_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = NEW.profile_id 
    AND profiles.role = 'recruiter'
  ) THEN
    RAISE EXCEPTION 'recruiter_profiles can only be created for profiles with role = recruiter';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to validate roles
DROP TRIGGER IF EXISTS validate_student_profile_role_trigger ON student_profiles;
CREATE TRIGGER validate_student_profile_role_trigger
  BEFORE INSERT OR UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_student_profile_role();

DROP TRIGGER IF EXISTS validate_recruiter_profile_role_trigger ON recruiter_profiles;
CREATE TRIGGER validate_recruiter_profile_role_trigger
  BEFORE INSERT OR UPDATE ON recruiter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_recruiter_profile_role();

-- Fix is_admin function to check for admin role
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = is_admin.user_id
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

