-- Phase 3, Step 3.2: Add RLS policies for cv_access_logs
-- Only admins can read access logs (for auditing)
-- Service role can insert (for logging)

-- ============================================
-- cv_access_logs RLS Policies
-- ============================================

-- Admins can read all access logs (for auditing)
DROP POLICY IF EXISTS "Admins can read all CV access logs" ON public.cv_access_logs;
CREATE POLICY "Admins can read all CV access logs"
  ON public.cv_access_logs
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Service role can insert logs (via API using service role client)
-- Note: This is handled by using service role client in the API, which bypasses RLS
-- But we add a policy for completeness and potential future use
DROP POLICY IF EXISTS "Service role can insert CV access logs" ON public.cv_access_logs;
CREATE POLICY "Service role can insert CV access logs"
  ON public.cv_access_logs
  FOR INSERT
  WITH CHECK (true); -- Service role bypasses RLS anyway, but this allows explicit inserts

-- Recruiters cannot read logs (privacy - they shouldn't see audit trail)
-- Students cannot read logs (privacy - they shouldn't see who accessed their CV)
-- Default deny for all other operations
