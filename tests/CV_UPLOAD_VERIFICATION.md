# CV Upload Verification Guide

## Step 5 — Verify CV Upload in Database

This document provides both automated and manual verification workflows for CV upload functionality.

---

## A) Automated Test (Preferred)

### Test File

**Location**: `tests/integration/api/cv-upload.test.ts`

### Running the Test

```bash
# Run integration tests
npm run test:integration

# Run specific test file
npx vitest run tests/integration/api/cv-upload.test.ts

# Run with UI
npx vitest --ui tests/integration/api/cv-upload.test.ts
```

### Test Coverage

The integration test verifies:

1. ✅ **User Creation** - Creates test user with profile and student profile
2. ✅ **File Upload** - Uploads sample PDF to `/api/portfolio/cv`
3. ✅ **Database Record** - Queries `student_cvs` table by `userId`
4. ✅ **Field Validation**:
   - `file_path` (storageKey) not null
   - `url` not null
   - `file_name` matches uploaded file
   - `file_size` > 0
   - `mime_type` is 'application/pdf'
   - `uploaded_at` is set
   - `user_id` matches test user
5. ✅ **File URL Accessibility** - GET request to file URL returns 200
6. ✅ **UPSERT Behavior** - Only one CV per student (replaces old one)

### Test Structure

```typescript
describe('CV Upload - Integration Tests', () => {
  beforeAll(async () => {
    // Create test user
    // Create profile
    // Create student profile
  });

  afterAll(async () => {
    // Cleanup: Delete CV, student profile, profile, user
  });

  it('should upload CV and create database record', async () => {
    // Upload PDF
    // Verify response
  });

  it('should create database record with all required fields', async () => {
    // Query DB
    // Assert all fields
  });

  it('should allow downloading the uploaded CV file', async () => {
    // Get CV URL
    // Test file access
  });

  it('should enforce one CV per student (UPSERT)', async () => {
    // Upload second CV
    // Verify only one exists
  });
});
```

### Prerequisites

1. **Test Database** - Supabase test project or local Supabase
2. **Environment Variables** - `.env.test` with test Supabase credentials
3. **Test Server** - Next.js dev server running on `http://localhost:3000`

### Sample PDF Generation

The test creates a minimal valid PDF in memory:

```typescript
const pdfContent = Buffer.from(
  '%PDF-1.4\n' +
  '1 0 obj\n' +
  '<< /Type /Catalog /Pages 2 0 R >>\n' +
  'endobj\n' +
  // ... minimal PDF structure
);
```

This creates a valid PDF file without external dependencies.

---

## B) Manual Verification (Fast)

### Step 1: Upload CV from UI

1. Navigate to `/student/portfolio`
2. Scroll to "CV & Resume" section
3. Click "Upload CV"
4. Select a PDF or DOCX file (max 10MB)
5. Wait for upload to complete

**Expected**: Success message with "CV uploaded: [date]" and "View/Download" link

### Step 2: Check Database

#### Option A: Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor
2. Open `student_cvs` table
3. Find row with your `user_id`

**Verify**:
- ✅ Row exists
- ✅ `file_name` matches uploaded file
- ✅ `file_path` is set (e.g., `cvs/{user_id}/{timestamp}.pdf`)
- ✅ `url` is set (public URL)
- ✅ `file_size` > 0
- ✅ `mime_type` is correct (`application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- ✅ `uploaded_at` is recent (within last minute)
- ✅ `user_id` matches your user ID
- ✅ `student_profile_id` is set

#### Option B: SQL Query

```sql
-- Get your user ID first
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then query CVs
SELECT 
  sc.*,
  sp.id as student_profile_id,
  p.user_id
FROM student_cvs sc
JOIN student_profiles sp ON sp.id = sc.student_profile_id
JOIN profiles p ON p.id = sp.profile_id
WHERE p.user_id = 'YOUR_USER_ID_HERE'
ORDER BY sc.uploaded_at DESC
LIMIT 1;
```

**Verify all fields are populated**:
- `file_path` ✅
- `url` ✅
- `file_name` ✅
- `file_size` > 0 ✅
- `mime_type` ✅
- `uploaded_at` ✅
- `user_id` ✅

### Step 3: Verify File in Storage

1. Go to Supabase Dashboard → Storage
2. Open `portfolio-files` bucket
3. Navigate to `cvs/{user_id}/` folder
4. Verify file exists with correct name

**Verify**:
- ✅ File exists in storage
- ✅ File name matches `file_path` in database
- ✅ File size matches `file_size` in database

### Step 4: Test Download URL

#### For Private CVs

```sql
-- Generate signed URL (expires in 1 hour)
SELECT 
  sc.file_path,
  sc.visibility
FROM student_cvs sc
JOIN student_profiles sp ON sp.id = sc.student_profile_id
JOIN profiles p ON p.id = sp.profile_id
WHERE p.user_id = 'YOUR_USER_ID_HERE'
ORDER BY sc.uploaded_at DESC
LIMIT 1;
```

Then use Supabase Storage API or Dashboard to generate signed URL.

#### For Public CVs

1. Copy `url` from database
2. Open in browser
3. Verify file downloads/opens correctly

**Expected**: PDF opens or downloads successfully

### Step 5: Verify Portfolio Page Display

1. Refresh `/student/portfolio` page
2. Check "CV & Resume" section

**Verify**:
- ✅ Filename displays correctly
- ✅ Uploaded date displays (e.g., "January 25, 2025")
- ✅ "Download" button works
- ✅ "Preview" button works
- ✅ Visibility badge shows (if applicable)

### Step 6: Test UPSERT (Replace CV)

1. Click "Replace" button
2. Upload a different CV file
3. Check database again

**Verify**:
- ✅ Only one CV record exists (old one replaced)
- ✅ New `file_name` is correct
- ✅ New `uploaded_at` is updated
- ✅ Old file removed from storage (optional check)

---

## Quick Verification Checklist

### Database Record
- [ ] CV row exists in `student_cvs` table
- [ ] `file_path` (storageKey) is not null
- [ ] `url` is not null
- [ ] `file_name` matches uploaded file
- [ ] `file_size` > 0
- [ ] `mime_type` is correct
- [ ] `uploaded_at` is set (recent timestamp)
- [ ] `user_id` matches authenticated user
- [ ] `student_profile_id` is set

### Storage
- [ ] File exists in `portfolio-files/cvs/{user_id}/` folder
- [ ] File name matches `file_path` in database
- [ ] File size matches `file_size` in database

### UI
- [ ] Portfolio page shows CV filename
- [ ] Portfolio page shows uploaded date
- [ ] Download link works
- [ ] Preview link works
- [ ] "No CV uploaded" shows when no CV exists

### Functionality
- [ ] Upload succeeds
- [ ] Only one CV per student (UPSERT works)
- [ ] Old CV replaced when uploading new one
- [ ] Page refreshes after upload
- [ ] Signed URLs work for private CVs
- [ ] Public URLs work for public CVs

---

## Troubleshooting

### CV Not Appearing in Database

1. Check browser console for errors
2. Check API response in Network tab
3. Verify authentication (user logged in)
4. Check RLS policies allow insert

### File Not in Storage

1. Check Supabase Storage bucket exists (`portfolio-files`)
2. Verify bucket permissions
3. Check API response for upload errors
4. Verify file size < 10MB

### Download URL Not Working

1. For private CVs: Generate signed URL (expires in 1 hour)
2. For public CVs: Check bucket is public or use signed URL
3. Verify `file_path` is correct
4. Check file exists in storage

### Test Failing

1. Verify test database is set up
2. Check environment variables in `.env.test`
3. Ensure Next.js dev server is running
4. Verify test user creation succeeds
5. Check cleanup doesn't interfere with other tests

---

## SQL Queries for Verification

### Get CV for User

```sql
SELECT 
  sc.id,
  sc.file_name,
  sc.file_path,
  sc.url,
  sc.file_size,
  sc.mime_type,
  sc.uploaded_at,
  sc.visibility,
  sc.user_id,
  p.email as user_email
FROM student_cvs sc
JOIN student_profiles sp ON sp.id = sc.student_profile_id
JOIN profiles p ON p.id = sp.profile_id
WHERE p.user_id = 'YOUR_USER_ID_HERE'
ORDER BY sc.uploaded_at DESC;
```

### Count CVs per User

```sql
SELECT 
  p.user_id,
  p.email,
  COUNT(sc.id) as cv_count
FROM profiles p
LEFT JOIN student_profiles sp ON sp.profile_id = p.id
LEFT JOIN student_cvs sc ON sc.student_profile_id = sp.id
WHERE p.role = 'student'
GROUP BY p.user_id, p.email
HAVING COUNT(sc.id) > 0;
```

### Check for Duplicate CVs (should be 0)

```sql
SELECT 
  student_profile_id,
  COUNT(*) as count
FROM student_cvs
GROUP BY student_profile_id
HAVING COUNT(*) > 1;
```

---

## Next Steps

After verification:

1. ✅ All tests passing
2. ✅ Manual verification successful
3. ✅ Database records correct
4. ✅ UI displays CV correctly
5. ✅ Download/preview working

**CV Upload functionality is complete and verified!**
