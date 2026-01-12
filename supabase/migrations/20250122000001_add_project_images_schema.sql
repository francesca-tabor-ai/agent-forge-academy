-- Add project images support to portfolio_projects
-- Creates project_images table for gallery images
-- Adds cover_image_path to portfolio_projects
-- Sets up RLS policies for both tables
-- Creates storage bucket and policies

-- ============================================
-- STEP 1: Add cover image fields to portfolio_projects
-- ============================================
ALTER TABLE portfolio_projects
ADD COLUMN IF NOT EXISTS cover_image_path TEXT,
ADD COLUMN IF NOT EXISTS cover_image_updated_at TIMESTAMPTZ;

-- ============================================
-- STEP 2: Create project_images table for gallery
-- ============================================
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL, -- user_id from auth.users
  image_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, image_path)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_owner_id ON project_images(owner_id);
CREATE INDEX IF NOT EXISTS idx_project_images_sort_order ON project_images(project_id, sort_order);

-- ============================================
-- STEP 3: Enable RLS on project_images
-- ============================================
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: RLS Policies for project_images
-- ============================================

-- SELECT: Users can see images for projects they own
DROP POLICY IF EXISTS "Users can view their own project images" ON project_images;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can view their own project images"
    ON project_images
    FOR SELECT
    USING (owner_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- INSERT: Users can only insert images for their own projects
DROP POLICY IF EXISTS "Users can insert images for their own projects" ON project_images;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can insert images for their own projects"
    ON project_images
    FOR INSERT
    WITH CHECK (
      owner_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM portfolio_projects pp
        JOIN student_profiles sp ON pp.student_profile_id = sp.id
        JOIN profiles p ON sp.profile_id = p.id
        WHERE pp.id = project_images.project_id
        AND p.user_id = auth.uid()
      )
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- UPDATE: Users can update their own project images
DROP POLICY IF EXISTS "Users can update their own project images" ON project_images;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can update their own project images"
    ON project_images
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- DELETE: Users can delete their own project images
DROP POLICY IF EXISTS "Users can delete their own project images" ON project_images;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can delete their own project images"
    ON project_images
    FOR DELETE
    USING (owner_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================
-- STEP 5: Create storage bucket (if not exists)
-- ============================================
-- Note: This requires the storage extension to be enabled
-- The bucket will be created as private by default
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  false, -- private bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 6: Storage Policies for project-images bucket
-- ============================================

-- INSERT: Users can upload only to their own user-scoped paths
-- Path format: userId/projectId/filename
DROP POLICY IF EXISTS "Users can upload to their own project images" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can upload to their own project images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = ''project-images'' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- SELECT: Users can read their own project images
DROP POLICY IF EXISTS "Users can read their own project images" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can read their own project images"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = ''project-images'' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- DELETE: Users can delete their own project images
DROP POLICY IF EXISTS "Users can delete their own project images" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can delete their own project images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = ''project-images'' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- ============================================
-- STEP 7: Helper function to get user_id from project_id
-- ============================================
-- This function helps verify ownership in triggers/policies
CREATE OR REPLACE FUNCTION get_project_owner_id(project_uuid UUID)
RETURNS UUID AS $$
  SELECT p.user_id
  FROM portfolio_projects pp
  JOIN student_profiles sp ON pp.student_profile_id = sp.id
  JOIN profiles p ON sp.profile_id = p.id
  WHERE pp.id = project_uuid;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
