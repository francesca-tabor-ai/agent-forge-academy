# CV Upload API Implementation

## Step 2 — Upload API Route

### Endpoint

**POST** `/api/portfolio/cv`

### Requirements Implementation

✅ **Auth required** - Rejects with 401 if not logged in  
✅ **Accepts multipart/form-data** - Uses `request.formData()`  
✅ **File field name**: `cv`  
✅ **Validates file type** - PDF or DOCX only (validated from file content, not client-provided)  
✅ **Validates file size** - Max 10MB  
✅ **Uploads to storage** - Supabase Storage (`portfolio-files` bucket)  
✅ **Saves/UPSERTs DB record** - All required fields  
✅ **Returns proper JSON** - Exact format as specified  

### Request

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `cv`: File (PDF or DOCX, max 10MB)

**Note**: `studentProfileId` is automatically derived from the authenticated user - no need to pass it.

### Response

**Success (200)**:
```json
{
  "ok": true,
  "resume": {
    "url": "https://...",
    "fileName": "resume.pdf",
    "uploadedAt": "2025-01-25T12:00:00.000Z",
    "fileSize": 123456
  }
}
```

**Error (400/401/404/500)**:
```json
{
  "error": "Error message"
}
```

### Security Features

1. **MIME Type Detection from File Content**
   - Does NOT trust client-provided `file.type`
   - Uses magic bytes (file signatures) to detect:
     - PDF: `%PDF` signature
     - DOCX: ZIP signature (`PK\x03\x04`) + DOCX-specific markers
   - Falls back to file extension only if magic bytes are ambiguous

2. **File Type Validation**
   - Only allows: `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Rejects all other file types

3. **File Size Validation**
   - Maximum: 10MB (10 * 1024 * 1024 bytes)
   - Rejects larger files

4. **Authentication**
   - Requires authenticated user (Supabase Auth)
   - Automatically derives `studentProfileId` from user
   - No need to pass `studentProfileId` in form data

5. **Authorization**
   - Verifies user owns the student profile
   - RLS policies enforce additional security

### Database Record

The API creates/updates a record in `student_cvs` table with:

- `student_profile_id` - Derived from authenticated user
- `user_id` - Auto-set via trigger (denormalized)
- `file_name` - Original filename
- `file_path` - Storage key/path
- `url` - Public URL to access file
- `file_size` - File size in bytes
- `mime_type` - Detected MIME type (from file content)
- `visibility` - Default: 'private'
- `uploaded_at` - Current timestamp

### UPSERT Behavior

- Uses `UPSERT` with `onConflict: 'student_profile_id'`
- Ensures one CV per student (enforced by unique constraint)
- Automatically deletes old file from storage when replaced
- Updates existing record if CV already exists

### Additional Features

1. **Text Extraction**
   - Extracts text from CV (non-blocking)
   - Updates `student_profiles.cv_text` field
   - Used for search and job matching
   - Does not fail upload if extraction fails

2. **Old File Cleanup**
   - Automatically removes old CV file from storage when replaced
   - Best-effort cleanup (doesn't fail upload if cleanup fails)

### Error Handling

| Status | Scenario |
|--------|----------|
| 401 | Not authenticated |
| 400 | No file provided, invalid file type, file too large |
| 404 | Profile or student profile not found |
| 500 | Upload failed, database error, internal error |

### Implementation Details

**File**: `app/api/portfolio/cv/route.ts`

**Key Functions**:
- `detectMimeTypeFromBuffer()` - Safely detects MIME type from file content
- `isValidCVFileType()` - Validates MIME type is PDF or DOCX
- `extractTextFromCV()` - Extracts text from CV (non-blocking)

**Storage**:
- Bucket: `portfolio-files`
- Path pattern: `cvs/{user_id}/{timestamp}.{ext}`
- Public URLs generated via `getPublicUrl()`

### Testing

```bash
# Test upload
curl -X POST http://localhost:3000/api/portfolio/cv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "cv=@resume.pdf"
```

### Next Steps

1. ✅ Step 1 - Database schema confirmed
2. ✅ Step 2 - Upload API route implemented
3. ⏳ Step 3 - Frontend upload component
4. ⏳ Step 4 - Portfolio page re-render with uploaded CV
