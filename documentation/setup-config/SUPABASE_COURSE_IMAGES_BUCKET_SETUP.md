# Supabase Course Images Bucket Setup

<style>
/* Architecture/Flow/Diagram/Code Block Styling - White Text on Black Background */
pre, code, pre code {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  border: 1px solid #333333;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
}

/* Ensure all code blocks maintain black background */
pre {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

/* Selection state - dark background, white text */
pre::selection, code::selection, pre code::selection {
  background-color: #333333 !important;
  color: #FFFFFF !important;
}

pre ::selection, code ::selection {
  background-color: #333333 !important;
  color: #FFFFFF !important;
}

/* Highlight/Mark state - dark accent, white text */
pre mark, code mark, pre code mark {
  background-color: #444444 !important;
  color: #FFFFFF !important;
}

/* Hover state - stay black */
pre:hover, code:hover {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}

/* Focus state - stay black with subtle outline */
pre:focus, code:focus {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  outline: 1px solid #666666;
}

/* Nested elements inherit white text */
pre *, code *, pre code * {
  color: #FFFFFF !important;
}

/* Prevent theme overrides */
pre.prose, code.prose {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}
</style>

This guide explains how to create and configure the `course-images` storage bucket in Supabase for storing course thumbnail images and other course-related images.

## Overview

The `course-images` bucket stores course thumbnail images and other course-related images with the following configuration:
- **Bucket Name**: `course-images`
- **Visibility**: Public (anyone can view course images)
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, WEBP, **GIF**
- **Path Format**: `{course-slug}/thumbnail-{timestamp}.{ext}` or `{course-slug}/other-images/...`

## Method 1: Using Supabase Dashboard (Recommended for Quick Setup)

### Step 1: Navigate to Storage

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **New bucket** button (or edit existing `course-images` bucket)

### Step 2: Create or Update the Bucket

If creating a new bucket, fill in the bucket configuration:

- **Name**: `course-images`
- **Public bucket**: ✅ **Enable** (check this box - course images should be publicly accessible)
- **File size limit**: `5242880` (5MB in bytes)
- **Allowed MIME types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `image/gif` ⭐ **(Important: Include GIF support)**

Click **Create bucket** or **Save** if updating.

### Step 3: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies. Go to **Storage** → **Policies** → Select `course-images` bucket.

#### Policy 1: Allow Admins to Upload Course Images

**Policy Name**: `Admins can upload course images`

**Policy Type**: `INSERT`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(
  bucket_id = 'course-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
```

**Explanation**: Only users with admin role can upload course images.

#### Policy 2: Allow Anyone to Read Course Images

**Policy Name**: `Anyone can read course images`

**Policy Type**: `SELECT`

**Target Roles**: `public`

**Policy Definition**:
```sql
(bucket_id = 'course-images')
```

**Explanation**: Anyone (including unauthenticated users) can view course images. This is important for public course listings.

#### Policy 3: Allow Admins to Delete Course Images

**Policy Name**: `Admins can delete course images`

**Policy Type**: `DELETE`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(
  bucket_id = 'course-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
```

**Explanation**: Only admins can delete course images.

---

## Method 2: Using SQL Migration (Recommended for Production)

If you're managing your database with migrations, use this SQL script:

### Create Migration File

The bucket is created in migration `20250124000001_create_image_buckets.sql`. To add GIF support, use migration `20260113135110_add_gif_support_to_course_images.sql`.

### SQL Script for Adding GIF Support

```sql
-- Update course-images bucket to allow GIF files
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
]
WHERE id = 'course-images';
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

### Check Bucket Exists and GIF is Allowed

Run this query in the SQL Editor:

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'course-images';
```

Expected result:
- `id`: `course-images`
- `name`: `course-images`
- `public`: `true`
- `file_size_limit`: `5242880`
- `allowed_mime_types`: `{image/jpeg,image/jpg,image/png,image/webp,image/gif}`

### Verify GIF is in Allowed Types

```sql
SELECT 
  id,
  'image/gif' = ANY(allowed_mime_types) as gif_allowed
FROM storage.buckets
WHERE id = 'course-images';
```

Expected result: `gif_allowed` should be `true`.

### Check Policies Exist

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%course image%';
```

Expected policies:
1. `Admins can upload course images` (INSERT, authenticated)
2. `Anyone can read course images` (SELECT, public)
3. `Admins can delete course images` (DELETE, authenticated)

### Test Upload (Optional)

You can test the bucket by uploading a file via the Supabase Storage UI:
1. Go to **Storage** → `course-images`
2. Click **Upload file**
3. Select a test image file (< 5MB) - try a GIF file to verify GIF support
4. Upload to path: `test-course/thumbnail-test.gif`
5. Verify the file appears and is accessible (should be publicly accessible)

---

## Terminal Instructions

### Updating Supabase

#### Option 1: Using Supabase CLI (Recommended)

```bash
# Navigate to your project directory
cd /path/to/agent-forge-academy

# Make sure you're logged in to Supabase CLI
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration to update the bucket
supabase db push

# Verify the migration was applied
supabase db diff
```

#### Option 2: Using Supabase SQL Editor

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the SQL from the migration file:
   ```sql
   UPDATE storage.buckets
   SET allowed_mime_types = ARRAY[
     'image/jpeg',
     'image/jpg',
     'image/png',
     'image/webp',
     'image/gif'
   ]
   WHERE id = 'course-images';
   ```
5. Click **Run** to execute

#### Option 3: Using Supabase Dashboard UI

1. Go to **Storage** in your Supabase dashboard
2. Click on the `course-images` bucket
3. Click **Settings** or **Edit**
4. In **Allowed MIME types**, add `image/gif`
5. Click **Save**

### Updating Vercel

After updating Supabase, you need to ensure your Vercel deployment has the latest code:

```bash
# Navigate to your project directory
cd /path/to/agent-forge-academy

# Make sure all changes are committed
git add .
git commit -m "Add GIF support to course-images bucket"

# Push to your repository
git push origin main

# Vercel will automatically deploy if you have auto-deploy enabled
# Or manually trigger a deployment:
vercel --prod
```

#### If Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Verify Deployment

1. Check Vercel dashboard for successful deployment
2. Test the course thumbnail upload endpoint with a GIF file:
   ```bash
   # Example curl command (replace with your actual endpoint and auth token)
   curl -X POST https://your-app.vercel.app/api/courses/[course-id]/thumbnail \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test-image.gif"
   ```

---

## Troubleshooting

### Issue: "Bucket not found" error

**Solution**: 
1. Ensure the bucket name is exactly `course-images` (case-sensitive)
2. Verify the bucket exists in Supabase Storage dashboard
3. If the bucket doesn't exist, run the initial migration: `20250124000001_create_image_buckets.sql`

### Issue: "Permission denied" on upload

**Solution**: 
1. Verify the INSERT policy exists and is correct
2. Ensure the user is authenticated and has `admin` role
3. Check that the user's profile has `role = 'admin'` in the `profiles` table

### Issue: "File too large" error

**Solution**: 
- Check file size is under 5MB
- Verify `file_size_limit` is set to `5242880` in the bucket settings

### Issue: "Invalid file type" error for GIF

**Solution**: 
- Ensure `image/gif` is in the `allowed_mime_types` array
- Verify the migration `20260113135110_add_gif_support_to_course_images.sql` was applied
- Check the API route validation includes `'image/gif'` in `allowedTypes`

### Issue: GIF files not uploading

**Solution**:
1. Verify bucket allows GIF: Run the verification SQL query above
2. Check API route: Ensure `app/api/courses/[id]/thumbnail/route.ts` includes `'image/gif'` in `allowedTypes`
3. Check file MIME type: Ensure the file is actually `image/gif` (some GIFs might be detected as other types)
4. Verify deployment: Ensure latest code is deployed to Vercel

### Issue: Cannot view course images

**Solution**:
1. Verify bucket `public` setting is `true`
2. Check the SELECT policy allows public access
3. Ensure you're using the public URL format (not signed URLs for public buckets)

---

## Security Notes

1. **Public Bucket**: The bucket is public, meaning anyone with the URL can view images. This is intentional for course images as they should be publicly accessible for course listings.

2. **Admin-Only Uploads**: Only users with `admin` role can upload/delete course images. This prevents unauthorized modifications.

3. **File Validation**: The API validates file type and size before upload, but the bucket-level restrictions provide an additional security layer.

4. **Path Structure**: Files are stored as `{course-slug}/thumbnail-{timestamp}.{ext}` to ensure uniqueness and prevent collisions.

5. **GIF Support**: GIF files are now supported, allowing animated course thumbnails and other course-related GIF images.

---

## Related Files

- Migration (Initial): `supabase/migrations/20250124000001_create_image_buckets.sql`
- Migration (GIF Support): `supabase/migrations/20260113135110_add_gif_support_to_course_images.sql`
- API Endpoint: `app/api/courses/[id]/thumbnail/route.ts`
- Documentation: `documentation/SUPABASE_COURSE_IMAGES_BUCKET_SETUP.md`

---

## Next Steps

After creating/updating the bucket:

1. ✅ Verify bucket exists and is public
2. ✅ Verify GIF is in `allowed_mime_types` array
3. ✅ Verify all three policies are created (INSERT, SELECT, DELETE)
4. ✅ Update API route to allow GIF validation
5. ✅ Deploy changes to Vercel
6. ✅ Test upload via the application (admin course management)
7. ✅ Test GIF upload specifically
8. ✅ Verify GIF images display correctly in course listings

The bucket is now ready for use with GIF support for course images!
