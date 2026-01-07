-- Create student_profiles and portfolio_projects tables
-- Students control visibility: private, recruiters_only, public
-- Portfolio projects belong to one student
-- Support GitHub repos and demo URLs

-- Create visibility enum type (idempotent)
DO $$ BEGIN
    CREATE TYPE visibility_level AS ENUM ('private', 'recruiters_only', 'public');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create student_profiles table
-- Extends profiles for student-specific data
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  visibility visibility_level NOT NULL DEFAULT 'private',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT student_profiles_profile_must_be_student CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = student_profiles.profile_id 
      AND profiles.role = 'student'
    )
  )
);

-- Create portfolio_projects table
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  github_url TEXT,
  demo_url TEXT,
  visibility visibility_level NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_student_profiles_profile_id ON student_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_visibility ON student_profiles(visibility);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_student_profile_id ON portfolio_projects(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_visibility ON portfolio_projects(visibility);

-- Create triggers to update updated_at (idempotent)
DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_projects_updated_at ON portfolio_projects;
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

