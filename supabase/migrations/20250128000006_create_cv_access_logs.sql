-- Phase 3, Step 3.2: Add audit logging for CV access
-- Create cv_access_logs table to track recruiter access to student CVs

-- ============================================
-- Create cv_access_logs table
-- ============================================
CREATE TABLE IF NOT EXISTS public.cv_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('preview', 'download')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Add indexes for performance
-- ============================================
-- Index on recruiter_id for looking up access by recruiter
CREATE INDEX IF NOT EXISTS idx_cv_access_logs_recruiter_id 
  ON public.cv_access_logs(recruiter_id);

-- Index on student_id for looking up access to a student
CREATE INDEX IF NOT EXISTS idx_cv_access_logs_student_id 
  ON public.cv_access_logs(student_id);

-- Index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_cv_access_logs_created_at 
  ON public.cv_access_logs(created_at DESC);

-- Composite index for common queries (recruiter + student + time)
CREATE INDEX IF NOT EXISTS idx_cv_access_logs_recruiter_student_time 
  ON public.cv_access_logs(recruiter_id, student_id, created_at DESC);

-- ============================================
-- Enable Row Level Security
-- ============================================
-- RLS policies will be added in a separate migration
-- For now, only admins should be able to read these logs
ALTER TABLE public.cv_access_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Add comments
-- ============================================
COMMENT ON TABLE public.cv_access_logs IS 'Audit log of recruiter access to student CVs. Tracks who accessed which CV and when.';
COMMENT ON COLUMN public.cv_access_logs.recruiter_id IS 'Profile ID of the recruiter who accessed the CV';
COMMENT ON COLUMN public.cv_access_logs.student_id IS 'Profile ID of the student whose CV was accessed';
COMMENT ON COLUMN public.cv_access_logs.action IS 'Type of access: preview or download';
COMMENT ON COLUMN public.cv_access_logs.ip_address IS 'IP address of the requester (optional, for security auditing)';
COMMENT ON COLUMN public.cv_access_logs.user_agent IS 'User agent string of the requester (optional, for security auditing)';
