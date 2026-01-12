-- Enhance student_cvs table to match requirements
-- Add url field for storing public URL
-- Add unique constraint to ensure one CV per student
-- Add user_id column for direct access (computed/denormalized for convenience)

-- Add url field to store public URL (derived from storage key)
ALTER TABLE student_cvs
  ADD COLUMN IF NOT EXISTS url TEXT;

-- Add unique constraint on student_profile_id to ensure one CV per student
-- First, handle any existing duplicates by keeping only the most recent CV per student
DO $$
BEGIN
  -- Delete older CVs if duplicates exist, keeping only the most recent one
  DELETE FROM student_cvs
  WHERE id IN (
    SELECT id
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (PARTITION BY student_profile_id ORDER BY uploaded_at DESC) as rn
      FROM student_cvs
    ) t
    WHERE rn > 1
  );
END $$;

-- Add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'student_cvs_student_profile_id_unique'
  ) THEN
    ALTER TABLE student_cvs
      ADD CONSTRAINT student_cvs_student_profile_id_unique 
      UNIQUE (student_profile_id);
  END IF;
END $$;

-- Add user_id column for direct access (denormalized for convenience)
-- This allows direct queries without joining through student_profiles
ALTER TABLE student_cvs
  ADD COLUMN IF NOT EXISTS user_id UUID;

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_cvs_user_id ON student_cvs(user_id);

-- Populate user_id for existing records
UPDATE student_cvs sc
SET user_id = p.user_id
FROM student_profiles sp
JOIN profiles p ON p.id = sp.profile_id
WHERE sc.student_profile_id = sp.id
  AND sc.user_id IS NULL;

-- Create function to automatically set user_id on insert/update
CREATE OR REPLACE FUNCTION set_student_cv_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Set user_id from student_profile_id
  SELECT p.user_id INTO NEW.user_id
  FROM student_profiles sp
  JOIN profiles p ON p.id = sp.profile_id
  WHERE sp.id = NEW.student_profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set user_id
DROP TRIGGER IF EXISTS trigger_set_student_cv_user_id ON student_cvs;
CREATE TRIGGER trigger_set_student_cv_user_id
  BEFORE INSERT OR UPDATE ON student_cvs
  FOR EACH ROW
  WHEN (NEW.user_id IS NULL)
  EXECUTE FUNCTION set_student_cv_user_id();

-- Add comment to document the table structure
COMMENT ON TABLE student_cvs IS 'Stores CV/Resume files uploaded by students. One CV per student (enforced by unique constraint).';
COMMENT ON COLUMN student_cvs.url IS 'Public URL to access the CV file. Derived from storage key but stored for convenience.';
COMMENT ON COLUMN student_cvs.user_id IS 'Denormalized user_id for direct access without joins. Automatically set via trigger.';
COMMENT ON COLUMN student_cvs.file_path IS 'Storage key/path in the storage bucket (e.g., portfolio-files).';
COMMENT ON COLUMN student_cvs.student_profile_id IS 'Foreign key to student_profiles. Unique constraint ensures one CV per student.';
