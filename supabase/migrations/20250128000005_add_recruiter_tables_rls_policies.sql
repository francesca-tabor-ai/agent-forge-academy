-- Phase 1, Step 1.3: Tighten RLS on recruiter tables (basic)
-- Add RLS policies: recruiters can read their own org memberships and access grants; admins can manage all

-- ============================================
-- Helper function to check if user is recruiter
-- ============================================
-- This function checks if the authenticated user has the 'recruiter' role
CREATE OR REPLACE FUNCTION is_recruiter(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = check_user_id
    AND profiles.role = 'recruiter'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- recruiter_orgs RLS Policies
-- ============================================

-- Admins can manage all organizations (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage all recruiter orgs" ON public.recruiter_orgs;
CREATE POLICY "Admins can manage all recruiter orgs"
  ON public.recruiter_orgs
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Recruiters can read organizations they are members of
DROP POLICY IF EXISTS "Recruiters can read their orgs" ON public.recruiter_orgs;
CREATE POLICY "Recruiters can read their orgs"
  ON public.recruiter_orgs
  FOR SELECT
  USING (
    is_recruiter(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.recruiter_org_members
      WHERE recruiter_org_members.org_id = recruiter_orgs.id
      AND recruiter_org_members.user_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================
-- recruiter_org_members RLS Policies
-- ============================================

-- Admins can manage all memberships (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage all org memberships" ON public.recruiter_org_members;
CREATE POLICY "Admins can manage all org memberships"
  ON public.recruiter_org_members
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Recruiters can read their own memberships
DROP POLICY IF EXISTS "Recruiters can read their own memberships" ON public.recruiter_org_members;
CREATE POLICY "Recruiters can read their own memberships"
  ON public.recruiter_org_members
  FOR SELECT
  USING (
    is_recruiter(auth.uid())
    AND user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- recruiter_student_access RLS Policies
-- ============================================

-- Admins can manage all access grants (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can manage all access grants" ON public.recruiter_student_access;
CREATE POLICY "Admins can manage all access grants"
  ON public.recruiter_student_access
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Recruiters can read their own access grants
DROP POLICY IF EXISTS "Recruiters can read their own access grants" ON public.recruiter_student_access;
CREATE POLICY "Recruiters can read their own access grants"
  ON public.recruiter_student_access
  FOR SELECT
  USING (
    is_recruiter(auth.uid())
    AND recruiter_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
