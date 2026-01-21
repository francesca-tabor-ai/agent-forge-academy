-- Create lesson_progress table for tracking individual lesson progress
-- Lightweight table that records when lessons are opened and completed
-- Does not require changes to course flows - just records events

-- Create lesson progress status enum
DO $$ BEGIN
    CREATE TYPE lesson_progress_status AS ENUM ('started', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  status lesson_progress_status NOT NULL DEFAULT 'started',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_profile_id, course_id, lesson_slug)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_profile_id ON lesson_progress(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_slug ON lesson_progress(lesson_slug);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_course ON lesson_progress(student_profile_id, course_id);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_progress

-- Students can view their own lesson progress
DROP POLICY IF EXISTS "Students can view their own lesson progress" ON lesson_progress;
CREATE POLICY "Students can view their own lesson progress"
  ON lesson_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = lesson_progress.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own lesson progress
DROP POLICY IF EXISTS "Students can insert their own lesson progress" ON lesson_progress;
CREATE POLICY "Students can insert their own lesson progress"
  ON lesson_progress
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = lesson_progress.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can update their own lesson progress
DROP POLICY IF EXISTS "Students can update their own lesson progress" ON lesson_progress;
CREATE POLICY "Students can update their own lesson progress"
  ON lesson_progress
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = lesson_progress.student_profile_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = lesson_progress.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Admins can view all lesson progress
DROP POLICY IF EXISTS "Admins can view all lesson progress" ON lesson_progress;
CREATE POLICY "Admins can view all lesson progress"
  ON lesson_progress
  FOR SELECT
  USING (is_admin(auth.uid()));
