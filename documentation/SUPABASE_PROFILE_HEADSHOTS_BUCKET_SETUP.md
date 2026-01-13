# Supabase Profile Headshots Bucket Setup

This guide explains how to create and configure the `profile-headshots` storage bucket in Supabase for storing user profile images.

## Overview

The `profile-headshots` bucket stores user profile headshot images with the following configuration:
- **Bucket Name**: `profile-headshots`
- **Visibility**: Public (anyone can view)
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, WEBP
- **Path Format**: `{userId}/headshot-{timestamp}.{ext}`

## Method 1: Using Supabase Dashboard (Recommended for Quick Setup)

### Step 1: Navigate to Storage

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **New bucket** button

### Step 2: Create the Bucket

Fill in the bucket configuration:

- **Name**: `profile-headshots`
- **Public bucket**: ✅ **Enable** (check this box)
- **File size limit**: `5242880` (5MB in bytes)
- **Allowed MIME types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

Click **Create bucket**.

### Step 3: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies. Go to **Storage** → **Policies** → Select `profile-headshots` bucket.

#### Policy 1: Allow Users to Upload Their Own Headshots

**Policy Name**: `Users can upload their own headshots`

**Policy Type**: `INSERT`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(bucket_id = 'profile-headshots' AND (storage.foldername(name))[1] = auth.uid()::text)
```

**Explanation**: Users can only upload files to paths that start with their own user ID.

#### Policy 2: Allow Anyone to Read Headshots

**Policy Name**: `Anyone can read headshots`

**Policy Type**: `SELECT`

**Target Roles**: `public`

**Policy Definition**:
```sql
(bucket_id = 'profile-headshots')
```

**Explanation**: Anyone (including unauthenticated users) can view headshot images.

#### Policy 3: Allow Users to Delete Their Own Headshots

**Policy Name**: `Users can delete their own headshots`

**Policy Type**: `DELETE`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(bucket_id = 'profile-headshots' AND (storage.foldername(name))[1] = auth.uid()::text)
```

**Explanation**: Users can only delete files from their own user-scoped paths.

---

## Method 2: Using SQL Migration (Recommended for Production)

If you're managing your database with migrations, use this SQL script:

### Create Migration File

Create a new migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_profile_headshots_bucket.sql`

### SQL Script

```sql
-- ============================================
-- Create profile-headshots bucket
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
-- Storage Policies for profile-headshots bucket
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
```

### Run the Migration

```bash
# Using Supabase CLI
supabase db push

# Or apply directly via SQL Editor in Supabase Dashboard
```

---

## Method 3: Using Supabase SQL Editor

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Paste the SQL script from Method 2 above
4. Click **Run** to execute

---

## Verification

### Check Bucket Exists

Run this query in the SQL Editor:

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'profile-headshots';
```

Expected result:
- `id`: `profile-headshots`
- `name`: `profile-headshots`
- `public`: `true`
- `file_size_limit`: `5242880`
- `allowed_mime_types`: `{image/jpeg,image/jpg,image/png,image/webp}`

### Check Policies Exist

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%headshot%';
```

Expected policies:
1. `Users can upload their own headshots` (INSERT, authenticated)
2. `Anyone can read headshots` (SELECT, public)
3. `Users can delete their own headshots` (DELETE, authenticated)

### Test Upload (Optional)

You can test the bucket by uploading a file via the Supabase Storage UI:
1. Go to **Storage** → `profile-headshots`
2. Click **Upload file**
3. Select a test image (JPG/PNG/WEBP, < 5MB)
4. Upload to path: `{your-user-id}/test-headshot.jpg`
5. Verify the file appears and is accessible

---

## Troubleshooting

### Issue: "Bucket not found" error

**Solution**: Ensure the bucket name is exactly `profile-headshots` (case-sensitive).

### Issue: "Permission denied" on upload

**Solution**: 
1. Verify the INSERT policy exists and is correct
2. Ensure the user is authenticated
3. Check that the file path starts with the user's ID: `{userId}/...`

### Issue: "File too large" error

**Solution**: 
- Check file size is under 5MB
- Verify `file_size_limit` is set to `5242880` in the bucket settings

### Issue: "Invalid file type" error

**Solution**: 
- Ensure file is one of: JPEG, JPG, PNG, or WEBP
- Verify `allowed_mime_types` includes the file's MIME type

### Issue: Images not accessible publicly

**Solution**:
1. Verify bucket `public` setting is `true`
2. Check the SELECT policy allows `public` role
3. Ensure you're using `getPublicUrl()` method in your code

---

## Security Notes

1. **Public Bucket**: The bucket is public, meaning anyone with the URL can view images. This is intentional for profile headshots, but be aware of privacy implications.

2. **User Isolation**: Users can only upload/delete files in their own user-scoped paths (`{userId}/...`). This prevents users from accessing or modifying other users' images.

3. **File Validation**: The API validates file type and size before upload, but the bucket-level restrictions provide an additional security layer.

4. **Path Structure**: Files are stored as `{userId}/headshot-{timestamp}.{ext}` to ensure uniqueness and prevent collisions.

---

## Related Files

- API Endpoint: `app/api/portfolio/profile/headshot/upload/route.ts`
- Component: `components/portfolio/HeadshotUpload.tsx`
- Migration: `supabase/migrations/20250124000001_create_image_buckets.sql`

---

## Next Steps

After creating the bucket:
1. ✅ Verify bucket exists and is public
2. ✅ Verify all three policies are created
3. ✅ Test upload via the application
4. ✅ Verify images are accessible via public URLs
5. ✅ Test delete functionality

The bucket is now ready for use with the profile headshot upload feature!
