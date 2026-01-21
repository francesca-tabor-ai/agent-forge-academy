-- Add profile fields to student_profiles
-- Add CV storage table
-- Add image fields to portfolio_projects

-- Add new fields to student_profiles
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS headline VARCHAR(255),
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS location VARCHAR(255),
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Create student_cvs table for CV/resume storage
CREATE TABLE IF NOT EXISTS student_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  visibility visibility_level NOT NULL DEFAULT 'private',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for student_cvs
CREATE INDEX IF NOT EXISTS idx_student_cvs_student_profile_id ON student_cvs(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_student_cvs_visibility ON student_cvs(visibility);

-- Add trigger for updated_at on student_cvs
DROP TRIGGER IF EXISTS update_student_cvs_updated_at ON student_cvs;
CREATE TRIGGER update_student_cvs_updated_at
  BEFORE UPDATE ON student_cvs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add image fields to portfolio_projects
ALTER TABLE portfolio_projects
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Enable RLS on student_cvs
ALTER TABLE student_cvs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_cvs
-- Students can read their own CVs
DROP POLICY IF EXISTS "Students can read own CVs" ON student_cvs;
CREATE POLICY "Students can read own CVs"
  ON student_cvs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = student_cvs.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own CVs
DROP POLICY IF EXISTS "Students can insert own CVs" ON student_cvs;
CREATE POLICY "Students can insert own CVs"
  ON student_cvs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = student_cvs.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can update their own CVs
DROP POLICY IF EXISTS "Students can update own CVs" ON student_cvs;
CREATE POLICY "Students can update own CVs"
  ON student_cvs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = student_cvs.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can delete their own CVs
DROP POLICY IF EXISTS "Students can delete own CVs" ON student_cvs;
CREATE POLICY "Students can delete own CVs"
  ON student_cvs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = student_cvs.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Recruiters can read non-private CVs
DROP POLICY IF EXISTS "Recruiters can read non-private CVs" ON student_cvs;
CREATE POLICY "Recruiters can read non-private CVs"
  ON student_cvs
  FOR SELECT
  USING (
    visibility != 'private'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.role = 'recruiter'
      AND profiles.user_id = auth.uid()
    )
  );
