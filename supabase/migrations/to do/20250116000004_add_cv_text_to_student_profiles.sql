-- Add cv_text field to student_profiles for storing extracted CV text
-- This enables text-based search and skill extraction from CVs

ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS cv_text TEXT;

-- Add index for full-text search on CV text (optional, for future use)
-- CREATE INDEX IF NOT EXISTS idx_student_profiles_cv_text_fts ON student_profiles USING gin(to_tsvector('english', cv_text));

-- Add comment to document the field
COMMENT ON COLUMN student_profiles.cv_text IS 'Extracted plain text from uploaded CV/Resume (PDF or DOCX). Used for skill extraction and job matching. OCR support is TODO.';
