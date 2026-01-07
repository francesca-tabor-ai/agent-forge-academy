-- Create recruiter_profiles and contact_requests tables
-- Rules:
-- - Recruiters cannot directly message students
-- - Students must approve contact requests
-- - Include status transitions

-- Create contact request status enum
CREATE TYPE contact_request_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

-- Create recruiter_profiles table
-- Extends profiles for recruiter-specific data
CREATE TABLE recruiter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT recruiter_profiles_profile_must_be_recruiter CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = recruiter_profiles.profile_id 
      AND profiles.role = 'recruiter'
    )
  )
);

-- Create contact_requests table
-- Tracks requests from recruiters to students
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_profile_id UUID NOT NULL REFERENCES recruiter_profiles(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  status contact_request_status NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contact_requests_unique_pending UNIQUE (recruiter_profile_id, student_profile_id, status) 
    WHERE status = 'pending'
);

-- Create indexes for common queries
CREATE INDEX idx_recruiter_profiles_profile_id ON recruiter_profiles(profile_id);
CREATE INDEX idx_contact_requests_recruiter_profile_id ON contact_requests(recruiter_profile_id);
CREATE INDEX idx_contact_requests_student_profile_id ON contact_requests(student_profile_id);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);
CREATE INDEX idx_contact_requests_created_at ON contact_requests(created_at DESC);

-- Create triggers to update updated_at
CREATE TRIGGER update_recruiter_profiles_updated_at
  BEFORE UPDATE ON recruiter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_requests_updated_at
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE recruiter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

