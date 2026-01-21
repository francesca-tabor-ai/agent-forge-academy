-- Add structured location fields to student_profiles
-- Adds: city (normalized key), country (optional)
-- When location is updated, parse city from first token before comma

-- Add city column (normalized key, e.g., "london")
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Add country column (optional, e.g., "UK")
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Create index on city for faster lookups (for banner image matching)
CREATE INDEX IF NOT EXISTS idx_student_profiles_city ON student_profiles(city) WHERE city IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN student_profiles.city IS 'Normalized city name (lowercase key, e.g., "london") parsed from location field';
COMMENT ON COLUMN student_profiles.country IS 'Country name (e.g., "UK") parsed from location field';
