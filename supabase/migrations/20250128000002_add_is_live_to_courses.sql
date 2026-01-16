-- Add is_live field to courses table
-- This field indicates if a course is "live" (actively available for enrollment)
-- Defaults to true for published courses, can be set to false for archived/draft courses

-- Add is_live column
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS is_live BOOLEAN NOT NULL DEFAULT true;

-- Set is_live based on is_published (if not already set)
-- Published courses are live by default
UPDATE courses
SET is_live = true
WHERE is_published = true AND is_live IS NULL;

-- Create index for filtering live courses
CREATE INDEX IF NOT EXISTS idx_courses_is_live ON courses(is_live) WHERE is_live = true;

-- Add comment for documentation
COMMENT ON COLUMN courses.is_live IS 'Indicates if course is live and available for enrollment. Published courses are live by default.';
