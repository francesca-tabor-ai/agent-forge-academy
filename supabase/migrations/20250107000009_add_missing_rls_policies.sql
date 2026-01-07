-- Add missing RLS policies for recruiter_profiles, contact_requests, and events tables

-- ============================================
-- RLS Policies for recruiter_profiles
-- ============================================

-- Recruiters can read their own profile
CREATE POLICY "Recruiters can read own profile"
  ON recruiter_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = recruiter_profiles.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Recruiters can update their own profile
CREATE POLICY "Recruiters can update own profile"
  ON recruiter_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = recruiter_profiles.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Recruiters can insert their own profile
CREATE POLICY "Recruiters can insert own profile"
  ON recruiter_profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = recruiter_profiles.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'recruiter'
    )
  );

-- Admins can read all recruiter profiles
CREATE POLICY "Admins can read all recruiter profiles"
  ON recruiter_profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS Policies for contact_requests
-- ============================================

-- Recruiters can create contact requests
CREATE POLICY "Recruiters can create contact requests"
  ON contact_requests
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recruiter_profiles
      JOIN profiles ON profiles.id = recruiter_profiles.profile_id
      WHERE recruiter_profiles.id = contact_requests.recruiter_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Recruiters can read their own contact requests
CREATE POLICY "Recruiters can read own contact requests"
  ON contact_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM recruiter_profiles
      JOIN profiles ON profiles.id = recruiter_profiles.profile_id
      WHERE recruiter_profiles.id = contact_requests.recruiter_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Students can read contact requests for their profile
CREATE POLICY "Students can read contact requests for their profile"
  ON contact_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = contact_requests.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Students can update contact requests for their profile (to approve/reject)
CREATE POLICY "Students can update contact requests for their profile"
  ON contact_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = contact_requests.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Recruiters can withdraw their own pending requests
CREATE POLICY "Recruiters can withdraw own pending requests"
  ON contact_requests
  FOR UPDATE
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM recruiter_profiles
      JOIN profiles ON profiles.id = recruiter_profiles.profile_id
      WHERE recruiter_profiles.id = contact_requests.recruiter_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can read all contact requests
CREATE POLICY "Admins can read all contact requests"
  ON contact_requests
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ============================================
-- RLS Policies for events
-- ============================================

-- Everyone can read public events
CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  USING (true);

-- Only admins can create/update/delete events
CREATE POLICY "Admins can manage events"
  ON events
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- RLS Policies for event_presentations
-- ============================================

-- Everyone can read event presentations
CREATE POLICY "Anyone can read event presentations"
  ON event_presentations
  FOR SELECT
  USING (true);

-- Students can create presentations for their own profile
CREATE POLICY "Students can create own presentations"
  ON event_presentations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = event_presentations.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Students can update their own presentations
CREATE POLICY "Students can update own presentations"
  ON event_presentations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = event_presentations.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all presentations
CREATE POLICY "Admins can manage all presentations"
  ON event_presentations
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- RLS Policies for event_attendance
-- ============================================

-- Users can read attendance for events they're attending
CREATE POLICY "Users can read own attendance"
  ON event_attendance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = event_attendance.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can create their own attendance records
CREATE POLICY "Users can create own attendance"
  ON event_attendance
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = event_attendance.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can update their own attendance
CREATE POLICY "Users can update own attendance"
  ON event_attendance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = event_attendance.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can read all attendance
CREATE POLICY "Admins can read all attendance"
  ON event_attendance
  FOR SELECT
  USING (is_admin(auth.uid()));

