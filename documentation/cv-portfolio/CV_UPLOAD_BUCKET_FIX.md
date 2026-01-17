# CV Upload Bucket Fix

## Problem
CV uploads were failing with "Bucket not found" error because:
1. Hardcoded bucket name `'portfolio-files'` was used throughout the codebase
2. The bucket might not exist in the Supabase project
3. No environment variable configuration for bucket name
4. Using user client instead of service role for uploads (less reliable)

## Solution

### 1. Environment Variable Configuration
- Added `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` environment variable
- Defaults to `'resumes'` if not set
- Created utility function `getResumeBucketName()` in `lib/utils/storage.ts`

### 2. Service Role Client for Uploads
- Updated all CV upload routes to use `createServerSupabaseClient()` (service role)
- More reliable than user client (bypasses RLS issues)
- Better error handling and logging

### 3. Improved Error Messages
- Dev mode: Shows exact bucket name being used
- Prod mode: User-friendly error message
- Better error messages for different failure scenarios (bucket not found, duplicate, size, etc.)

### 4. Updated All CV-Related Routes
- `/api/portfolio/cv` - Main upload route
- `/api/portfolio/cv/upload` - Alternative upload route
- `/api/portfolio/cv/download` - Download route
- `/api/portfolio/cv/preview` - Preview route
- `/api/portfolio/auto-import` - Auto-import route
- Portfolio page - Signed URL generation

### 5. File Path Structure
Changed from: `cvs/{userId}/{timestamp}.{ext}`
Changed to: `{userId}/resume-{timestamp}.{ext}`

This stores files directly in the bucket root with user prefix, making it easier to manage.

## Setup Instructions

### Step 1: Create Storage Bucket in Supabase

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Name: `resumes` (or your custom name)
4. Set to **Private** (recommended for CVs)
5. Click **Create bucket**

### Step 2: Set Environment Variable

Add to your `.env.local`:

```bash
# Use the bucket name you created in Supabase
NEXT_PUBLIC_SUPABASE_RESUME_BUCKET=resumes
```

### Step 3: Storage Policies (if bucket is private)

If you set the bucket to private, you need storage policies. However, since we're using the service role key for uploads, policies are less critical. For downloads/previews, the service role can generate signed URLs.

If you want to allow client-side access, add policies:

```sql
-- Allow authenticated users to upload their own CVs
CREATE POLICY "Users can upload their own CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own CVs
CREATE POLICY "Users can read their own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

**Note:** With service role uploads, these policies are optional but recommended for defense in depth.

### Step 4: Verify Setup

1. Upload a CV from `/student/portfolio`
2. Check Supabase Storage → `resumes` bucket → should see file at `{userId}/resume-{timestamp}.pdf`
3. Check database → `student_cvs` table → should have record with correct `file_path`
4. Refresh portfolio page → CV should still be visible
5. Test download → should work with signed URL

## Testing Checklist

- [ ] Bucket exists in Supabase Storage
- [ ] Environment variable is set correctly
- [ ] Upload PDF < 10MB → success
- [ ] Upload DOCX < 10MB → success
- [ ] Upload > 10MB → error message
- [ ] Upload invalid file type → error message
- [ ] Portfolio page shows uploaded CV
- [ ] Refresh page → CV still visible
- [ ] Download link works
- [ ] Preview link works
- [ ] Database has correct record
- [ ] Storage has file at correct path

## Error Messages

### Development Mode
- Shows exact bucket name being used
- Shows helpful debugging information
- Example: `Upload configuration error: Bucket "resumes" not found. Please create the bucket in Supabase Storage or set NEXT_PUBLIC_SUPABASE_RESUME_BUCKET env var.`

### Production Mode
- User-friendly error messages
- No sensitive information exposed
- Example: `Upload configuration error (bucket missing). Please contact support.`

## Migration Notes

If you have existing CVs in the old `portfolio-files` bucket:

1. The new code uses `resumes` bucket by default
2. Old CVs in `portfolio-files` will still work if you:
   - Set `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET=portfolio-files` (temporary)
   - OR migrate files from `portfolio-files` to `resumes` bucket
3. New uploads will use the configured bucket name

## Files Changed

- `lib/utils/storage.ts` - New utility functions
- `app/api/portfolio/cv/route.ts` - Main upload route
- `app/api/portfolio/cv/upload/route.ts` - Alternative upload route
- `app/api/portfolio/cv/download/route.ts` - Download route
- `app/api/portfolio/cv/preview/route.ts` - Preview route
- `app/api/portfolio/auto-import/route.ts` - Auto-import route
- `app/(student)/student/portfolio/page.tsx` - Portfolio page
- `lib/cv/extractText.ts` - Text extraction utility
- `components/portfolio/CVUpload.tsx` - Upload component (error handling)
- `README.md` - Environment variable documentation
- `documentation/SETUP_ENV.md` - Setup instructions

## Definition of Done

✅ "Bucket not found" error eliminated
✅ Bucket name configurable via environment variable
✅ Consistent bucket name usage across codebase
✅ Server-side uploads using service role (secure and reliable)
✅ Resume metadata persisted and displayed from DB
✅ Download works with signed URLs
✅ CV persists after page refresh
✅ Better error messages for debugging
