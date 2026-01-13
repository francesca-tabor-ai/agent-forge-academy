# Supabase Resumes Bucket Setup

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

This guide explains how to create and configure the `resumes` storage bucket in Supabase for storing user CV/Resume files.

## Overview

The `resumes` bucket stores user CV/Resume files with the following configuration:
- **Bucket Name**: `resumes` (configurable via `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` env var)
- **Visibility**: Private (recommended for CVs - sensitive documents)
- **File Size Limit**: 10MB
- **Allowed Types**: PDF, DOCX
- **Path Format**: `{userId}/resume-{timestamp}.{ext}`

## Method 1: Using Supabase Dashboard (Recommended for Quick Setup)

### Step 1: Navigate to Storage

1. Go to your Supabase project dashboard
2. Click on **Storage** in the left sidebar
3. Click **New bucket** button

### Step 2: Create the Bucket

Fill in the bucket configuration:

- **Name**: `resumes`
- **Public bucket**: ❌ **Disable** (leave unchecked - CVs should be private)
- **File size limit**: `10485760` (10MB in bytes)
- **Allowed MIME types**: 
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

Click **Create bucket**.

### Step 3: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies. Go to **Storage** → **Policies** → Select `resumes` bucket.

#### Policy 1: Allow Users to Upload Their Own CVs

**Policy Name**: `Users can upload their own CVs`

**Policy Type**: `INSERT`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text)
```

**Explanation**: Users can only upload files to paths that start with their own user ID.

#### Policy 2: Allow Users to Read Their Own CVs

**Policy Name**: `Users can read their own CVs`

**Policy Type**: `SELECT`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text)
```

**Explanation**: Users can only read/download their own CV files. This is important for private CVs.

#### Policy 3: Allow Users to Delete Their Own CVs

**Policy Name**: `Users can delete their own CVs`

**Policy Type**: `DELETE`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text)
```

**Explanation**: Users can only delete files from their own user-scoped paths.

#### Policy 4: Allow Recruiters to Read Non-Private CVs (Optional)

If you want recruiters to access CVs that are marked as `recruiters_only` or `public` in the database:

**Policy Name**: `Recruiters can read non-private CVs`

**Policy Type**: `SELECT`

**Target Roles**: `authenticated`

**Policy Definition**:
```sql
(
  bucket_id = 'resumes' AND
  EXISTS (
    SELECT 1 FROM student_cvs
    WHERE student_cvs.file_path = storage.objects.name
    AND student_cvs.visibility IN ('recruiters_only', 'public')
  )
)
```

**Note**: This policy requires a join with the `student_cvs` table. For better performance, you might want to handle recruiter access via signed URLs generated server-side instead.

---

## Method 2: Using SQL Migration (Recommended for Production)

If you're managing your database with migrations, use this SQL script:

### Create Migration File

Create a new migration file: `supabase/migrations/YYYYMMDDHHMMSS_create_resumes_bucket.sql`

### SQL Script

```sql
-- ============================================
-- Create resumes bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false, -- private bucket (CVs are sensitive documents)
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- Storage Policies for resumes bucket
-- ============================================

-- INSERT: Users can upload only to their own user-scoped paths
-- Path format: userId/resume-timestamp.ext
DROP POLICY IF EXISTS "Users can upload their own CVs" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can upload their own CVs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = ''resumes'' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- SELECT: Users can read their own CVs
DROP POLICY IF EXISTS "Users can read their own CVs" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can read their own CVs"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = ''resumes'' AND
      (storage.foldername(name))[1] = auth.uid()::text
    )';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- DELETE: Users can delete their own CVs
DROP POLICY IF EXISTS "Users can delete their own CVs" ON storage.objects;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Users can delete their own CVs"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = ''resumes'' AND
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
WHERE id = 'resumes';
```

Expected result:
- `id`: `resumes`
- `name`: `resumes`
- `public`: `false`
- `file_size_limit`: `10485760`
- `allowed_mime_types`: `{application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document}`

### Check Policies Exist

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%CV%' OR policyname LIKE '%resume%';
```

Expected policies:
1. `Users can upload their own CVs` (INSERT, authenticated)
2. `Users can read their own CVs` (SELECT, authenticated)
3. `Users can delete their own CVs` (DELETE, authenticated)

### Test Upload (Optional)

You can test the bucket by uploading a file via the Supabase Storage UI:
1. Go to **Storage** → `resumes`
2. Click **Upload file**
3. Select a test PDF or DOCX file (< 10MB)
4. Upload to path: `{your-user-id}/test-resume.pdf`
5. Verify the file appears and is accessible (you'll need to be authenticated)

---

## Environment Variable Configuration

After creating the bucket, make sure to set the environment variable in your `.env.local`:

```bash
# Use the bucket name you created in Supabase (defaults to 'resumes' if not set)
NEXT_PUBLIC_SUPABASE_RESUME_BUCKET=resumes
```

---

## Troubleshooting

### Issue: "Bucket not found" error

**Solution**: 
1. Ensure the bucket name is exactly `resumes` (case-sensitive)
2. Verify the bucket exists in Supabase Storage dashboard
3. Check that `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` env var matches the bucket name

### Issue: "Permission denied" on upload

**Solution**: 
1. Verify the INSERT policy exists and is correct
2. Ensure the user is authenticated
3. Check that the file path starts with the user's ID: `{userId}/...`
4. Note: The application uses service role for uploads, so policies are less critical, but they provide defense in depth

### Issue: "File too large" error

**Solution**: 
- Check file size is under 10MB
- Verify `file_size_limit` is set to `10485760` in the bucket settings

### Issue: "Invalid file type" error

**Solution**: 
- Ensure file is PDF or DOCX
- Verify `allowed_mime_types` includes:
  - `application/pdf`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Issue: Cannot download CV

**Solution**:
1. Verify bucket `public` setting is `false` (private bucket)
2. Check the SELECT policy allows authenticated users to read their own files
3. The application uses signed URLs for downloads (generated server-side with service role)
4. Ensure you're using the download/preview API endpoints, not direct public URLs

---

## Security Notes

1. **Private Bucket**: The bucket is private, meaning files are not publicly accessible. This is intentional for CVs as they contain sensitive personal information.

2. **User Isolation**: Users can only upload/read/delete files in their own user-scoped paths (`{userId}/...`). This prevents users from accessing or modifying other users' CVs.

3. **File Validation**: The API validates file type and size before upload, but the bucket-level restrictions provide an additional security layer.

4. **Path Structure**: Files are stored as `{userId}/resume-{timestamp}.{ext}` to ensure uniqueness and prevent collisions.

5. **Service Role Uploads**: The application uses the service role key for uploads (bypasses RLS), but policies are still recommended for defense in depth and potential future client-side operations.

6. **Signed URLs**: Downloads use signed URLs generated server-side, which expire after 1 hour. This provides secure access without making files publicly accessible.

---

## Related Files

- API Endpoint: `app/api/portfolio/cv/route.ts`
- Alternative Upload: `app/api/portfolio/cv/upload/route.ts`
- Download Endpoint: `app/api/portfolio/cv/download/route.ts`
- Preview Endpoint: `app/api/portfolio/cv/preview/route.ts`
- Component: `components/portfolio/CVUpload.tsx`
- Utility: `lib/utils/storage.ts`
- Documentation: `documentation/CV_UPLOAD_BUCKET_FIX.md`

---

## Next Steps

After creating the bucket:

1. ✅ Verify bucket exists and is private
2. ✅ Verify all three policies are created (INSERT, SELECT, DELETE)
3. ✅ Set `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` environment variable
4. ✅ Test upload via the application (`/student/portfolio`)
5. ✅ Verify CV appears in database (`student_cvs` table)
6. ✅ Test download functionality
7. ✅ Test preview functionality
8. ✅ Verify CV persists after page refresh

The bucket is now ready for use with the CV upload feature!
