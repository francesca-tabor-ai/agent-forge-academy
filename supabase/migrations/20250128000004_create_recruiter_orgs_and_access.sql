-- Phase 1, Step 1.2: Add recruiter-specific tables (minimal)
-- Create tables to represent recruiter organizations, memberships, and explicit access grants

-- ============================================
-- Step 1: Create recruiter_orgs table
-- ============================================
-- Represents recruiter organizations/companies
CREATE TABLE IF NOT EXISTS public.recruiter_orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Step 2: Create recruiter_org_members table
-- ============================================
-- Links recruiters (via profiles) to organizations
-- Composite primary key ensures a recruiter can only be in an org once
CREATE TABLE IF NOT EXISTS public.recruiter_org_members (
  org_id UUID NOT NULL REFERENCES public.recruiter_orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- ============================================
-- Step 3: Create recruiter_student_access table
-- ============================================
-- Explicit access grants from recruiters to students
-- This is the explicit access model - easiest to reason about
CREATE TABLE IF NOT EXISTS public.recruiter_student_access (
  recruiter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  org_id UUID NULL REFERENCES public.recruiter_orgs(id) ON DELETE SET NULL,
  reason TEXT NULL,
  expires_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (recruiter_id, student_id)
);

-- ============================================
-- Step 4: Add indexes for performance
-- ============================================
-- Index on student_id for looking up which recruiters have access to a student
CREATE INDEX IF NOT EXISTS idx_recruiter_access_student 
  ON public.recruiter_student_access(student_id);

-- Index on recruiter_id for looking up which students a recruiter has access to
CREATE INDEX IF NOT EXISTS idx_recruiter_access_recruiter 
  ON public.recruiter_student_access(recruiter_id);

-- Index on org_id for looking up access grants by organization
CREATE INDEX IF NOT EXISTS idx_recruiter_access_org 
  ON public.recruiter_student_access(org_id)
  WHERE org_id IS NOT NULL;

-- Index on expires_at for finding expired access grants
CREATE INDEX IF NOT EXISTS idx_recruiter_access_expires_at 
  ON public.recruiter_student_access(expires_at)
  WHERE expires_at IS NOT NULL;

-- Index on org_id in recruiter_org_members for looking up members of an org
CREATE INDEX IF NOT EXISTS idx_recruiter_org_members_org_id 
  ON public.recruiter_org_members(org_id);

-- Index on user_id in recruiter_org_members for looking up orgs a recruiter belongs to
CREATE INDEX IF NOT EXISTS idx_recruiter_org_members_user_id 
  ON public.recruiter_org_members(user_id);

-- ============================================
-- Step 5: Enable Row Level Security
-- ============================================
-- RLS policies will be added in a separate migration
ALTER TABLE public.recruiter_orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_student_access ENABLE ROW LEVEL SECURITY;
