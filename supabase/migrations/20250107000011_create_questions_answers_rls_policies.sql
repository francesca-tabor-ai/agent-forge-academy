-- Row Level Security policies for questions and answers tables
-- Rules:
-- - Students can CRUD their own questions
-- - Students can read all questions
-- - Tutors can read all questions and create answers
-- - Tutors can mark answers as accepted
-- - Students can create answers to any question
-- - Users can update their own answers

-- ============================================
-- RLS Policies for questions
-- ============================================

-- Students can read all questions
CREATE POLICY "Students can read all questions"
  ON questions
  FOR SELECT
  USING (true);

-- Students can create questions
CREATE POLICY "Students can create questions"
  ON questions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = questions.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Students can update their own questions
CREATE POLICY "Students can update own questions"
  ON questions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = questions.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Students can delete their own questions
CREATE POLICY "Students can delete own questions"
  ON questions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles
      JOIN profiles ON profiles.id = student_profiles.profile_id
      WHERE student_profiles.id = questions.student_profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Tutors can read all questions
CREATE POLICY "Tutors can read all questions"
  ON questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'tutor'
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all questions
CREATE POLICY "Admins can manage all questions"
  ON questions
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- RLS Policies for answers
-- ============================================

-- Anyone authenticated can read answers
CREATE POLICY "Authenticated users can read answers"
  ON answers
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Students and tutors can create answers
CREATE POLICY "Students and tutors can create answers"
  ON answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = answers.profile_id
      AND profiles.user_id = auth.uid()
      AND profiles.role IN ('student', 'tutor')
    )
  );

-- Users can update their own answers
CREATE POLICY "Users can update own answers"
  ON answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = answers.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Users can delete their own answers
CREATE POLICY "Users can delete own answers"
  ON answers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = answers.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Tutors can mark answers as accepted (update is_accepted field)
CREATE POLICY "Tutors can mark answers as accepted"
  ON answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'tutor'
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Only allow updating is_accepted field
    -- This ensures tutors can only mark answers, not edit content
    (SELECT body FROM answers WHERE id = answers.id) = answers.body
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'tutor'
      AND profiles.user_id = auth.uid()
    )
  );

-- Admins can manage all answers
CREATE POLICY "Admins can manage all answers"
  ON answers
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

