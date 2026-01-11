-- Row Level Security policies for sales tables
-- Rules:
-- - sales_reps: Only admins can SELECT/INSERT/UPDATE/DELETE
-- - sales_referral_links: Authenticated users can SELECT (to resolve slugs), only admins can INSERT/UPDATE/DELETE
-- - sales_referral_visits: Only admins can SELECT/INSERT/UPDATE/DELETE

-- Note: is_admin() function should already exist from previous migrations
-- If not, it checks profiles.role = 'admin' where profiles.user_id = auth.uid()

-- ============================================================================
-- sales_reps RLS Policies
-- ============================================================================

-- Policy: Only admins can read sales reps
DROP POLICY IF EXISTS "Admins can read sales reps" ON sales_reps;
CREATE POLICY "Admins can read sales reps"
  ON sales_reps
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Policy: Only admins can insert sales reps
DROP POLICY IF EXISTS "Admins can insert sales reps" ON sales_reps;
CREATE POLICY "Admins can insert sales reps"
  ON sales_reps
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Policy: Only admins can update sales reps
DROP POLICY IF EXISTS "Admins can update sales reps" ON sales_reps;
CREATE POLICY "Admins can update sales reps"
  ON sales_reps
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Policy: Only admins can delete sales reps
DROP POLICY IF EXISTS "Admins can delete sales reps" ON sales_reps;
CREATE POLICY "Admins can delete sales reps"
  ON sales_reps
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- sales_referral_links RLS Policies
-- ============================================================================

-- Policy: Authenticated users can read referral links (to resolve slugs)
DROP POLICY IF EXISTS "Authenticated users can read referral links" ON sales_referral_links;
CREATE POLICY "Authenticated users can read referral links"
  ON sales_referral_links
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can insert referral links
DROP POLICY IF EXISTS "Admins can insert referral links" ON sales_referral_links;
CREATE POLICY "Admins can insert referral links"
  ON sales_referral_links
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Policy: Only admins can update referral links
DROP POLICY IF EXISTS "Admins can update referral links" ON sales_referral_links;
CREATE POLICY "Admins can update referral links"
  ON sales_referral_links
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Policy: Only admins can delete referral links
DROP POLICY IF EXISTS "Admins can delete referral links" ON sales_referral_links;
CREATE POLICY "Admins can delete referral links"
  ON sales_referral_links
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================================================
-- sales_referral_visits RLS Policies
-- ============================================================================

-- Policy: Only admins can read referral visits
DROP POLICY IF EXISTS "Admins can read referral visits" ON sales_referral_visits;
CREATE POLICY "Admins can read referral visits"
  ON sales_referral_visits
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Policy: Only admins can insert referral visits
DROP POLICY IF EXISTS "Admins can insert referral visits" ON sales_referral_visits;
CREATE POLICY "Admins can insert referral visits"
  ON sales_referral_visits
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Policy: Only admins can update referral visits
DROP POLICY IF EXISTS "Admins can update referral visits" ON sales_referral_visits;
CREATE POLICY "Admins can update referral visits"
  ON sales_referral_visits
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Policy: Only admins can delete referral visits
DROP POLICY IF EXISTS "Admins can delete referral visits" ON sales_referral_visits;
CREATE POLICY "Admins can delete referral visits"
  ON sales_referral_visits
  FOR DELETE
  USING (is_admin(auth.uid()));
