-- Create courses and course_enrollments tables
-- Courses are metadata containers for markdown-based lesson content
-- Lessons are stored as markdown files organized by course directory
-- This table tracks course metadata, enrollment, and progress

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE, -- Directory name for course (e.g., 'multi-agent-deployment')
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration_weeks INTEGER,
  difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create course_enrollments table
-- Tracks which students are enrolled in which courses
CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, student_profile_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_profile_id ON course_enrollments(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_progress ON course_enrollments(progress_percentage);

-- Create trigger to update updated_at (idempotent)
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
CREATE TRIGGER update_course_enrollments_updated_at
  BEFORE UPDATE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses

-- Anyone can view published courses
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
CREATE POLICY "Anyone can view published courses"
  ON courses
  FOR SELECT
  USING (is_published = true OR is_admin(auth.uid()));

-- Only admins can create/update/delete courses
DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses"
  ON courses
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for course_enrollments

-- Students can view their own enrollments
DROP POLICY IF EXISTS "Students can view their own enrollments" ON course_enrollments;
CREATE POLICY "Students can view their own enrollments"
  ON course_enrollments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = course_enrollments.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can enroll themselves in published courses
DROP POLICY IF EXISTS "Students can enroll in published courses" ON course_enrollments;
CREATE POLICY "Students can enroll in published courses"
  ON course_enrollments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = course_enrollments.student_profile_id
      AND p.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = course_enrollments.course_id
      AND c.is_published = true
    )
  );

-- Students can update their own enrollment progress
DROP POLICY IF EXISTS "Students can update their own enrollment progress" ON course_enrollments;
CREATE POLICY "Students can update their own enrollment progress"
  ON course_enrollments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = course_enrollments.student_profile_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = course_enrollments.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Admins can view all enrollments
DROP POLICY IF EXISTS "Admins can view all enrollments" ON course_enrollments;
CREATE POLICY "Admins can view all enrollments"
  ON course_enrollments
  FOR SELECT
  USING (is_admin(auth.uid()));
