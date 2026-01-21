# Supabase Course Videos Bucket Setup

This guide explains how to create and configure the `course-videos` storage bucket in Supabase for storing course video content.

## Overview

The `course-videos` bucket stores course video files with the following configuration:
- **Bucket Name**: `course-videos`
- **Visibility**: Public (anyone can view course videos)
- **File Size Limit**: 500MB (videos can be large)
- **Allowed Types**: MP4, MOV, WEBM
- **Path Format**: `{course-slug}/video-{number}.{ext}`

## Why Supabase Storage for Videos?

✅ **Better for Vercel**: Large video files won't bloat your deployment  
✅ **CDN Delivery**: Faster loading times globally  
✅ **Scalability**: Easy to add/update videos without redeploying  
✅ **Cost Effective**: Supabase Storage is optimized for media files  
✅ **Performance**: Better than serving from Next.js static files

## Method 1: Using Supabase Dashboard (Recommended for Quick Setup)

### Step 1: Navigate to Storage

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **New bucket** button

### Step 2: Create the Bucket

Fill in the bucket configuration:

- **Name**: `course-videos`
- **Public bucket**: ✅ **Enable** (check this box - course videos should be publicly accessible)
- **File size limit**: `524288000` (500MB in bytes)
- **Allowed MIME types**: 
  - `video/mp4`
  - `video/quicktime` (for .mov files)
  - `video/webm`

Click **Create bucket**.

### Step 3: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies. Go to **Storage** → **Policies** → Select `course-videos` bucket.

#### Policy 1: Allow Admins to Upload Course Videos

**Policy Name**: `Admins can upload course videos`

**Policy Type**: `INSERT`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
```

**Explanation**: Only users with admin role can upload course videos.

#### Policy 2: Allow Anyone to Read Course Videos

**Policy Name**: `Anyone can read course videos`

**Policy Type**: `SELECT`

**Target Roles**: `public`

**Policy Definition**:
```sql
(bucket_id = 'course-videos')
```

**Explanation**: Anyone (including unauthenticated users) can view course videos. This is important for public course content.

#### Policy 3: Allow Admins to Delete Course Videos

**Policy Name**: `Admins can delete course videos`

**Policy Type**: `DELETE`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
```

**Explanation**: Only admins can delete course videos.

---

## Method 2: Using SQL Migration (Recommended for Production)

### Create Migration File

Create a new migration file: `supabase/migrations/[timestamp]_create_course_videos_bucket.sql`

### SQL Script

```sql
-- Create course-videos bucket for storing course video content
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

-- Storage Policies for course-videos bucket

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
```

### Run the Migration

```bash
# Using Supabase CLI
supabase db push

# Or apply directly via SQL Editor in Supabase Dashboard
```

---

## Uploading Videos

### Option 1: Using Supabase Dashboard

1. Go to **Storage** → **course-videos** bucket
2. Click **Upload file** or **Upload folder**
3. Create folder structure: `scaling-fashion-visuals-with-ai/`
4. Upload your videos:
   - `scaling-fashion-visuals-with-ai/video-1.mov`
   - `scaling-fashion-visuals-with-ai/video-2.mp4`

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Upload videos
supabase storage cp "media/video/Scaling Fashion Visuals with AI - Video 1.mov" \
  "course-videos/scaling-fashion-visuals-with-ai/video-1.mov"

supabase storage cp "media/video/Scaling Fashion Visuals with AI - Video 2.mp4" \
  "course-videos/scaling-fashion-visuals-with-ai/video-2.mp4"
```

### Option 3: Using API (Programmatic Upload)

See the API upload patterns in the codebase (similar to CV uploads).

---

## Getting Public URLs

Since the bucket is public, you can get direct URLs:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Get public URL
const { data } = supabase.storage
  .from('course-videos')
  .getPublicUrl('scaling-fashion-visuals-with-ai/video-1.mov');

const videoUrl = data.publicUrl;
```

**Public URL Format:**
```
https://[project-ref].supabase.co/storage/v1/object/public/course-videos/scaling-fashion-visuals-with-ai/video-1.mov
```

---

## Updating Course Files

After uploading videos, update the course markdown files to use Supabase URLs:

**Before (local paths):**
```html
<video width="100%" controls>
  <source src="/media/video/Scaling%20Fashion%20Visuals%20with%20AI%20-%20Video%201.mov" type="video/quicktime">
</video>
```

**After (Supabase URLs):**
```html
<video width="100%" controls>
  <source src="https://[project-ref].supabase.co/storage/v1/object/public/course-videos/scaling-fashion-visuals-with-ai/video-1.mov" type="video/quicktime">
  <source src="https://[project-ref].supabase.co/storage/v1/object/public/course-videos/scaling-fashion-visuals-with-ai/video-1.mov" type="video/mp4">
</video>
```

---

## Environment Variables

No additional environment variables needed for public buckets. The Supabase URL is already configured via:
- `NEXT_PUBLIC_SUPABASE_URL`

---

## Testing

After setup:

1. ✅ Verify bucket exists in Supabase Dashboard
2. ✅ Upload a test video
3. ✅ Check public URL is accessible
4. ✅ Test video playback in course module
5. ✅ Verify policies are working (admin can upload, public can view)

---

## Troubleshooting

### Videos not loading
- Check bucket is set to **public**
- Verify file paths are correct
- Check CORS settings if needed
- Verify MIME types are allowed

### Upload fails
- Check file size is under 500MB
- Verify you have admin role
- Check storage policies are correct
- Verify MIME type is allowed

### Performance issues
- Videos are served via CDN automatically
- Consider video compression before upload
- Use appropriate video formats (MP4 recommended)

---

## Best Practices

1. **File Naming**: Use consistent naming: `{course-slug}/video-{number}.{ext}`
2. **Compression**: Compress videos before upload to reduce file size
3. **Formats**: Prefer MP4 for best browser compatibility
4. **Organization**: Organize by course slug in folder structure
5. **Versioning**: Use version numbers or timestamps for updates

---

## Next Steps

1. Create the bucket using Method 1 or 2 above
2. Upload your videos to Supabase Storage
3. Get the public URLs
4. Update course markdown files with Supabase URLs
5. Test video playback
6. Remove videos from local `media/video/` directory (optional, to reduce repo size)
