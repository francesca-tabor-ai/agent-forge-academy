-- Create recruiter_profiles and contact_requests tables
-- Rules:
-- - Recruiters cannot directly message students
-- - Students must approve contact requests
-- - Include status transitions

-- Create contact request status enum (idempotent)
DO $$ BEGIN
    CREATE TYPE contact_request_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create recruiter_profiles table
-- Extends profiles for recruiter-specific data
-- Note: Role validation is handled by triggers in migration 20250107000008_fix_issues.sql
CREATE TABLE IF NOT EXISTS recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create contact_requests table
-- Tracks requests from recruiters to students
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  status contact_request_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_recruiter_profiles_profile_id ON recruiter_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_recruiter_profile_id ON contact_requests(recruiter_profile_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_student_profile_id ON contact_requests(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at DESC);

-- Create partial unique index to prevent duplicate pending requests
-- This ensures a recruiter can only have one pending request per student
CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_requests_unique_pending 
  ON contact_requests(recruiter_profile_id, student_profile_id) 
  WHERE status = 'pending';

-- Create triggers to update updated_at (idempotent)
DROP TRIGGER IF EXISTS update_recruiter_profiles_updated_at ON recruiter_profiles;
CREATE TRIGGER update_recruiter_profiles_updated_at
  BEFORE UPDATE ON recruiter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_requests_updated_at ON contact_requests;
CREATE TRIGGER update_contact_requests_updated_at
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

