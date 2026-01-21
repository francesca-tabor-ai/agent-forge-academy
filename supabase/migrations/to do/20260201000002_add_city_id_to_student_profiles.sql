-- Add city_id foreign key to student_profiles table
-- Links student profiles to cities table for banner image resolution

-- Add city_id column
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id) ON DELETE SET NULL;

-- Create index on city_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_profiles_city_id ON student_profiles(city_id) WHERE city_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN student_profiles.city_id IS 'Foreign key to cities table for profile banner image resolution';
