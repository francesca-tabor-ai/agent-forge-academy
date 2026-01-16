-- Add course overview fields to courses table
-- These fields support the new course detail page sections

-- Add outcome field (array of strings for bullet points)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS outcome TEXT[] DEFAULT '{}';

-- Add youll_build field (array of strings for bullet points)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS youll_build TEXT[] DEFAULT '{}';

-- Add best_for field (array of strings, can be single item)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS best_for TEXT[] DEFAULT '{}';

-- Add category field (track/category name)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN courses.outcome IS 'Array of learning outcomes for this course';
COMMENT ON COLUMN courses.youll_build IS 'Array of things students will build in this course';
COMMENT ON COLUMN courses.best_for IS 'Array of target audiences or use cases for this course';
COMMENT ON COLUMN courses.category IS 'Course track/category (e.g., "Vibe Engineering", "Agentic Systems")';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category) WHERE category IS NOT NULL;
