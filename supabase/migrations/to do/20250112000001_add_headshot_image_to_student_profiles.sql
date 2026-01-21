-- Add headshot_image_url field to student_profiles table

ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS headshot_image_url TEXT;
