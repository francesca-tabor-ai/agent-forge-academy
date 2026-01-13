-- Update course-images bucket to allow GIF files
-- This migration adds 'image/gif' to the allowed_mime_types array

-- ============================================
-- Update course-images bucket to allow GIFs
-- ============================================
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]
WHERE id = 'course-images';

-- Verify the update
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'course-images')
  INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    RAISE EXCEPTION 'course-images bucket does not exist. Please create it first using migration 20250124000001_create_image_buckets.sql';
  END IF;
  
  -- Check if GIF is now in the allowed types
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets
    WHERE id = 'course-images'
    AND 'image/gif' = ANY(allowed_mime_types)
  ) THEN
    RAISE EXCEPTION 'Failed to add image/gif to allowed_mime_types';
  END IF;
END $$;
