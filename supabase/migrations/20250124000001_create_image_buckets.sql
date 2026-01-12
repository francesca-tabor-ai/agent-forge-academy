-- Create dedicated image buckets for profile headshots, course images, and portfolio project images
-- Also sets up storage policies for all image buckets

-- ============================================
-- STEP 1: Create profile-headshots bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-headshots',
  'profile-headshots',
  true, -- public bucket (headshots are typically public)
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 2: Storage Policies for profile-headshots bucket
-- ============================================

-- INSERT: Users can upload only to their own user-scoped paths
-- Path format: userId/headshot-timestamp.ext
DROP POLICY IF EXISTS "Users can upload their own headshots" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can upload their own headshots"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = ''profile-headshots'' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- SELECT: Anyone can read headshots (public bucket)
DROP POLICY IF EXISTS "Anyone can read headshots" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Anyone can read headshots"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = ''profile-headshots'')';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- DELETE: Users can delete their own headshots
DROP POLICY IF EXISTS "Users can delete their own headshots" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can delete their own headshots"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = ''profile-headshots'' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================
-- STEP 3: Create course-images bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images',
  'course-images',
  true, -- public bucket (course images are typically public)
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 4: Storage Policies for course-images bucket
-- ============================================

-- INSERT: Only admins and authenticated users can upload course images
-- Path format: course-slug/thumbnail-timestamp.ext or course-slug/other-images/...
DROP POLICY IF EXISTS "Admins can upload course images" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Admins can upload course images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = ''course-images'' AND
      EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role IN (''admin'', ''instructor'')
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- SELECT: Anyone can read course images (public bucket)
DROP POLICY IF EXISTS "Anyone can read course images" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Anyone can read course images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = ''course-images'')';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- DELETE: Only admins can delete course images
DROP POLICY IF EXISTS "Admins can delete course images" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Admins can delete course images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = ''course-images'' AND
      EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role IN (''admin'', ''instructor'')
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================
-- STEP 5: Ensure project-images bucket exists (already created in previous migration)
-- This is just a safety check
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  false, -- private bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Note: Storage policies for project-images are already created in migration 20250122000001_add_project_images_schema.sql
