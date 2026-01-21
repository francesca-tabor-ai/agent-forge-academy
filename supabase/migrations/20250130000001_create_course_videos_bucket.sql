-- Create course-videos bucket for storing course video content
-- Based on SUPABASE_COURSE_VIDEOS_BUCKET_SETUP.md documentation

-- ============================================
-- Create course-videos bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true, -- public bucket (course videos should be publicly accessible)
  524288000, -- 500MB limit
  ARRAY[
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- Storage Policies for course-videos bucket
-- ============================================

-- INSERT: Admins can upload course videos
DROP POLICY IF EXISTS "Admins can upload course videos" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Admins can upload course videos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = ''course-videos'' AND
      EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = ''admin''
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- SELECT: Anyone can read course videos
DROP POLICY IF EXISTS "Anyone can read course videos" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Anyone can read course videos"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = ''course-videos'')';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- DELETE: Admins can delete course videos
DROP POLICY IF EXISTS "Admins can delete course videos" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Admins can delete course videos"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = ''course-videos'' AND
      EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = ''admin''
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
