-- Add industries field to courses table
-- Industries is an array of text values representing the industry domains a course applies to
-- Courses can have multiple industries (e.g., a course might be relevant for both E-commerce and SaaS)

-- Add industries column as TEXT[] (array of text)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS industries TEXT[] DEFAULT '{}';

-- Create index for array operations (GIN index for efficient array queries)
CREATE INDEX IF NOT EXISTS idx_courses_industries ON courses USING GIN (industries);

-- Add comment for documentation
COMMENT ON COLUMN courses.industries IS 'Array of industry domains this course applies to (e.g., E-commerce, SaaS, Fintech)';
