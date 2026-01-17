# CV Upload End-to-End Testing Guide

## Prerequisites

Before testing, ensure:

1. ✅ **Environment Variables Set in Vercel**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` (optional, defaults to "resumes")

2. ✅ **Supabase Storage Bucket Created**:
   - Bucket name: `resumes` (or value from `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET`)
   - Visibility: Private (recommended)
   - File size limit: 10MB
   - Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. ✅ **Storage Policies Configured**:
   - Users can upload their own CVs (INSERT policy)
   - Users can read their own CVs (SELECT policy)
   - Users can delete their own CVs (DELETE policy)

4. ✅ **Application Deployed**:
   - Latest code deployed to Vercel
   - Environment variables available at runtime

## Test Steps

### Step 1: Verify Environment Variables

1. **Open Browser DevTools** (F12 or Cmd+Option+I)
2. **Navigate to Console tab**
3. **Visit the portfolio page**: `/student/portfolio`
4. **Check console logs**:
   - Should see: `SUPABASE_URL: https://your-project.supabase.co`
   - Should see: `SUPABASE_ANON_KEY exists: true`
   - If either shows `undefined` or `false`, env vars are not configured correctly

### Step 2: Verify Defensive Guard

1. **If env vars are missing**, you should see an error:
   - `Error: Supabase env vars missing at runtime`
   - This confirms the defensive guard is working

2. **If env vars are present**, the page should load normally
   - No error should appear
   - CV upload section should be visible

### Step 3: Prepare Test File

1. **Create or use a small PDF file** (<1MB):
   - Can use any PDF document
   - Ensure file size is under 10MB
   - File should be a valid PDF (not corrupted)

2. **Note the file details**:
   - File name
   - File size
   - File type (should be PDF or DOCX)

### Step 4: Upload CV

1. **Navigate to Portfolio page**: `/student/portfolio`
2. **Locate CV & Resume section**
3. **Click "Upload CV" button**
4. **Select your test PDF file**
5. **Watch the upload progress**:
   - Progress bar should appear
   - Percentage should increase
   - Should reach 100%

### Step 5: Monitor Network Tab

1. **Open Browser DevTools** → **Network tab**
2. **Filter by "cv" or "portfolio"**
3. **Click "Upload CV" and select file**
4. **Watch for the following requests**:

   **Request 1: POST /api/portfolio/cv**
   - **Status**: Should be `200` or `201`
   - **Request Payload**: FormData with file
   - **Response**: JSON with `{ ok: true, resume: { ... } }`

   **Request 2: Supabase Storage Upload** (if visible)
   - **URL**: Should contain your Supabase project URL
   - **Path**: Should contain `/storage/v1/object/resumes/`
   - **Status**: Should be `200` or `201`

### Step 6: Verify Upload Success

1. **Check UI feedback**:
   - Green success message should appear
   - Should show: "CV uploaded: [date]"
   - "View/Download" link should be visible

2. **Check response in Network tab**:
   ```json
   {
     "ok": true,
     "resume": {
       "url": "https://...",
       "fileName": "test.pdf",
       "uploadedAt": "2025-01-25T12:00:00.000Z",
       "fileSize": 123456
     }
   }
   ```

### Step 7: Verify File in Supabase Storage

1. **Go to Supabase Dashboard**:
   - Navigate to **Storage** → **Buckets**
   - Click on **`resumes`** bucket

2. **Verify file exists**:
   - Should see a folder with your user ID
   - Inside: `resume-{timestamp}.pdf`
   - File size should match your uploaded file

3. **Check file path format**:
   - Should be: `{userId}/resume-{timestamp}.{ext}`
   - Example: `abc123-def456/resume-1706188800000.pdf`

### Step 8: Verify Database Record

1. **Go to Supabase Dashboard** → **Table Editor**
2. **Open `student_cvs` table**
3. **Find your record**:
   - `student_profile_id`: Should match your student profile
   - `file_name`: Should match uploaded file name
   - `file_path`: Should match storage path
   - `file_size`: Should match file size
   - `mime_type`: Should be `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `visibility`: Should be `private`
   - `uploaded_at`: Should be recent timestamp

### Step 9: Test Download/View

1. **Click "View/Download" link** in the UI
2. **Verify**:
   - File should download or open in new tab
   - File content should match uploaded file
   - URL should be accessible (for private buckets, should be signed URL)

### Step 10: Test Error Scenarios

#### Test 1: File Too Large
1. Try uploading a file > 10MB
2. **Expected**: Error message "File size must be less than 10MB"
3. **Network**: Should return `400` status

#### Test 2: Invalid File Type
1. Try uploading a `.txt` or `.jpg` file
2. **Expected**: Error message "Invalid file type. Only PDF and DOCX files are allowed"
3. **Network**: Should return `400` status

#### Test 3: Missing File
1. Try submitting without selecting a file
2. **Expected**: Error message "No file provided. Use field name 'cv'."
3. **Network**: Should return `400` status

## Troubleshooting

### Issue: Upload fails with "Bucket not found"

**Possible Causes**:
- Bucket doesn't exist in Supabase Storage
- `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` env var doesn't match bucket name

**Solution**:
1. Check Supabase Dashboard → Storage → Buckets
2. Verify bucket name matches env var (default: "resumes")
3. Create bucket if missing
4. Redeploy application

### Issue: Upload fails with 401 Unauthorized

**Possible Causes**:
- User not authenticated
- Session expired

**Solution**:
1. Log out and log back in
2. Check browser cookies
3. Verify authentication is working

### Issue: Upload fails with 500 Internal Server Error

**Possible Causes**:
- Storage policies not configured
- Service role key missing or invalid
- Database write failed

**Solution**:
1. Check server logs in Vercel
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Check storage policies in Supabase
4. Verify database connection

### Issue: File uploads but doesn't appear in UI

**Possible Causes**:
- Database write failed
- Cache not refreshed
- Component state not updated

**Solution**:
1. Check database for record
2. Hard refresh page (Cmd+Shift+R or Ctrl+Shift+R)
3. Check browser console for errors

### Issue: Network request shows 200 but file not in storage

**Possible Causes**:
- Storage upload succeeded but database write failed
- File was cleaned up due to DB error

**Solution**:
1. Check server logs for DB errors
2. Verify `student_cvs` table exists
3. Check database permissions

## Success Criteria

✅ **All tests pass if**:
1. Environment variables are available at runtime (console logs show values)
2. Defensive guard doesn't throw error (env vars present)
3. File upload succeeds (200/201 response)
4. File appears in Supabase Storage bucket
5. Database record created in `student_cvs` table
6. UI shows success message with download link
7. Download link works and file is accessible

## Next Steps After Successful Test

1. **Remove temporary console.log statements** from:
   - `lib/supabase/client.ts`
   - `lib/supabase/server.ts`

2. **Monitor production**:
   - Check Vercel logs for any errors
   - Monitor Supabase Storage usage
   - Track upload success rate

3. **Document any issues** found during testing

## Related Documentation

- [Vercel Supabase Env Setup](./VERCEL_SUPABASE_ENV_SETUP.md)
- [Supabase Resumes Bucket Setup](./SUPABASE_RESUMES_BUCKET_SETUP.md)
- [CV Upload API Documentation](./CV_UPLOAD_API.md)
- [CV Upload Frontend Documentation](./CV_UPLOAD_FRONTEND.md)
