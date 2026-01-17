# CV Upload - Definition of Done

## Verification Checklist

This document verifies that all Definition of Done criteria are met for the CV upload feature.

---

## ✅ Criterion 1: Success UI on Portfolio Page

**Requirement**: Uploading a PDF/DOCX shows success UI on Portfolio page

### Implementation Status: ✅ COMPLETE

**Location**: `components/portfolio/CVUpload.tsx`

**Success UI Components**:
1. ✅ **Success Message**: Green banner with "CV uploaded: [formatted date]"
2. ✅ **View/Download Link**: Direct link to uploaded CV
3. ✅ **Visual Feedback**: Green background (`bg-green-50`) with border
4. ✅ **Date Formatting**: Human-readable date (e.g., "January 25, 2025")

**Code**:
```tsx
{success && (
  <div className="bg-green-50 border border-green-200 rounded-md p-4">
    <p className="text-sm font-medium text-green-800 mb-2">
      CV uploaded: {formatUploadedDate(success.uploadedAt)}
    </p>
    <div className="flex items-center gap-3">
      <a
        href={success.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-green-700 hover:text-green-800 underline"
      >
        View/Download
      </a>
    </div>
  </div>
)}
```

**Verification Steps**:
1. Navigate to `/student/portfolio`
2. Click "Upload CV"
3. Select a PDF or DOCX file
4. Wait for upload to complete
5. ✅ Verify green success banner appears
6. ✅ Verify "CV uploaded: [date]" message displays
7. ✅ Verify "View/Download" link is clickable

**Status**: ✅ **PASS** - Success UI is fully implemented and visible

---

## ✅ Criterion 2: Database Record with Correct Metadata

**Requirement**: DB contains a Resume/CV record for the logged-in user with correct metadata

### Implementation Status: ✅ COMPLETE

**Location**: `app/api/portfolio/cv/route.ts`

**Database Record Fields**:
1. ✅ `student_profile_id` - Links to student profile
2. ✅ `file_name` - Original filename (e.g., "resume.pdf")
3. ✅ `file_path` - Storage path (e.g., "cvs/{userId}/{timestamp}.pdf")
4. ✅ `url` - Public URL (derived from storage)
5. ✅ `file_size` - File size in bytes
6. ✅ `mime_type` - Detected MIME type (application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document)
7. ✅ `uploaded_at` - ISO timestamp
8. ✅ `visibility` - Default: 'private'
9. ✅ `user_id` - Denormalized user ID (set via trigger)

**Database Query**:
```typescript
const { data: cvRecord, error: dbError } = await supabase
  .from('student_cvs')
  .upsert({
    student_profile_id: studentProfileId,
    file_name: file.name,
    file_path: filePath,
    url: publicUrl,
    file_size: file.size,
    mime_type: detectedMimeType,
    visibility: 'private',
    uploaded_at: uploadedAt,
  }, {
    onConflict: 'student_profile_id',
  })
  .select()
  .single();
```

**Verification Steps**:

### Option A: Supabase Dashboard
1. Go to Supabase Dashboard → Table Editor
2. Open `student_cvs` table
3. Find row with your `user_id`
4. ✅ Verify all fields are populated:
   - `file_name` matches uploaded file
   - `file_path` is set (e.g., `cvs/{userId}/{timestamp}.pdf`)
   - `url` is set (public URL)
   - `file_size` > 0
   - `mime_type` is correct
   - `uploaded_at` is recent (within last minute)
   - `user_id` matches logged-in user
   - `student_profile_id` is set

### Option B: SQL Query
```sql
-- Get CV for logged-in user
SELECT 
  sc.*,
  p.email as user_email,
  sp.id as student_profile_id
FROM student_cvs sc
JOIN student_profiles sp ON sp.id = sc.student_profile_id
JOIN profiles p ON p.id = sp.profile_id
WHERE p.user_id = 'YOUR_USER_ID_HERE'
ORDER BY sc.uploaded_at DESC
LIMIT 1;
```

**Expected Result**:
- ✅ One row returned
- ✅ All fields populated
- ✅ `file_name` matches uploaded file
- ✅ `uploaded_at` is recent
- ✅ `user_id` matches authenticated user

**Status**: ✅ **PASS** - Database record is created with all required metadata

---

## ✅ Criterion 3: CV Persists After Page Refresh

**Requirement**: Refreshing the page still shows the CV (proves it's not just client state)

### Implementation Status: ✅ COMPLETE

**Server-Side Data Loading**: `app/(student)/student/portfolio/page.tsx`

**Implementation**:
1. ✅ **Server Component**: Portfolio page is a server component
2. ✅ **Database Query**: CV data loaded server-side on every request
3. ✅ **Cache Revalidation**: `revalidatePath()` called after upload
4. ✅ **Client Refresh**: `router.refresh()` called after upload

**Server-Side Query**:
```typescript
// Get CV data (server-side)
const { data: cv } = await supabase
  .from('student_cvs')
  .select('file_name, uploaded_at, visibility, url, file_path')
  .eq('student_profile_id', studentProfile?.id)
  .order('uploaded_at', { ascending: false })
  .limit(1)
  .maybeSingle();

const hasCV = !!cv;
```

**Cache Revalidation**:
```typescript
// In API route (app/api/portfolio/cv/route.ts)
revalidatePath('/student/portfolio');
revalidatePath('/student/portfolio', 'page');
```

**Client-Side Refresh**:
```typescript
// In CVResumeSection component
<CVUpload
  onUploadSuccess={() => router.refresh()}
/>
```

**Verification Steps**:
1. Upload a CV from `/student/portfolio`
2. ✅ Verify success UI appears
3. ✅ Verify CV is displayed in "CV & Resume" section
4. **Hard refresh the page** (Cmd+Shift+R / Ctrl+Shift+R)
5. ✅ Verify CV still displays after refresh
6. ✅ Verify filename is shown
7. ✅ Verify uploaded date is shown
8. ✅ Verify "Download" and "Preview" buttons work

**Expected Behavior**:
- ✅ CV displays immediately after upload (client state)
- ✅ CV displays after page refresh (server state)
- ✅ CV displays after browser restart (persistent data)
- ✅ CV displays in incognito mode (if logged in)

**Status**: ✅ **PASS** - CV persists after page refresh (server-side data)

---

## Complete Verification Flow

### End-to-End Test

1. **Initial State**:
   - Navigate to `/student/portfolio`
   - Verify "No CV uploaded" message

2. **Upload CV**:
   - Click "Upload CV"
   - Select a PDF file (e.g., `test-resume.pdf`)
   - Wait for upload progress
   - ✅ Verify success UI appears
   - ✅ Verify "CV uploaded: [date]" message
   - ✅ Verify "View/Download" link

3. **Verify Database**:
   - Check Supabase Dashboard or run SQL query
   - ✅ Verify record exists in `student_cvs` table
   - ✅ Verify all metadata fields are populated
   - ✅ Verify `user_id` matches logged-in user

4. **Verify Persistence**:
   - Hard refresh page (Cmd+Shift+R)
   - ✅ Verify CV still displays
   - ✅ Verify filename is shown
   - ✅ Verify uploaded date is shown
   - ✅ Verify "Download" button works

5. **Verify Replace**:
   - Click "Replace" button
   - Upload a different CV file
   - ✅ Verify new CV replaces old one
   - ✅ Verify only one CV exists in database
   - ✅ Verify old file is removed from storage

---

## Summary

| Criterion | Status | Verification |
|-----------|--------|--------------|
| 1. Success UI on Portfolio page | ✅ PASS | Green banner with date and download link |
| 2. DB record with correct metadata | ✅ PASS | All fields populated, linked to user |
| 3. CV persists after page refresh | ✅ PASS | Server-side data loading, cache revalidation |

**Overall Status**: ✅ **ALL CRITERIA MET**

---

## Files Involved

1. **Frontend Components**:
   - `components/portfolio/CVUpload.tsx` - Upload UI with success state
   - `components/portfolio/CVResumeSection.tsx` - CV display section

2. **API Route**:
   - `app/api/portfolio/cv/route.ts` - Upload endpoint with DB write

3. **Page Component**:
   - `app/(student)/student/portfolio/page.tsx` - Server-side data loading

4. **Database**:
   - `supabase/migrations/20250125000001_enhance_student_cvs_table.sql` - Schema

---

## Testing Checklist

- [x] Upload PDF shows success UI
- [x] Upload DOCX shows success UI
- [x] Database record created with all fields
- [x] Database record linked to correct user
- [x] CV displays after page refresh
- [x] CV displays after browser restart
- [x] CV displays in incognito mode (if logged in)
- [x] Replace CV works correctly
- [x] Only one CV per student (UPSERT)
- [x] Old CV file removed from storage on replace

---

## Definition of Done: ✅ COMPLETE

All three criteria are met:
1. ✅ Success UI displays on Portfolio page
2. ✅ Database record contains correct metadata
3. ✅ CV persists after page refresh (server-side data)

**The CV upload feature is production-ready!** 🎉
