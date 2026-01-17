# CV Upload Database Schema Implementation

## Overview

This document describes the database schema for CV/Resume upload functionality. The implementation follows **Option A (recommended)**: a separate `student_cvs` table.

## Database Schema

### Table: `student_cvs`

The `student_cvs` table stores CV/Resume files uploaded by students.

#### Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Primary key | Yes |
| `student_profile_id` | UUID | Foreign key to `student_profiles(id)` | Yes (unique) |
| `user_id` | UUID | Denormalized user_id for direct access | Auto-set via trigger |
| `file_name` | VARCHAR(255) | Original filename | Yes |
| `file_path` | TEXT | Storage key/path in bucket | Yes |
| `url` | TEXT | Public URL to access the file | Optional |
| `file_size` | BIGINT | File size in bytes | Yes |
| `mime_type` | VARCHAR(100) | MIME type (e.g., application/pdf) | Yes |
| `visibility` | visibility_level | Visibility level (private/public/recruiters_only) | Yes (default: private) |
| `uploaded_at` | TIMESTAMPTZ | Upload timestamp | Yes (auto) |
| `created_at` | TIMESTAMPTZ | Record creation timestamp | Yes (auto) |
| `updated_at` | TIMESTAMPTZ | Last update timestamp | Yes (auto) |

#### Constraints

- **Primary Key**: `id`
- **Unique Constraint**: `student_profile_id` (one CV per student)
- **Foreign Key**: `student_profile_id` → `student_profiles(id)` ON DELETE CASCADE
- **Index**: `idx_student_cvs_student_profile_id` on `student_profile_id`
- **Index**: `idx_student_cvs_user_id` on `user_id`
- **Index**: `idx_student_cvs_visibility` on `visibility`

#### Automatic Features

- **Trigger**: `trigger_set_student_cv_user_id` - Automatically sets `user_id` from `student_profile_id` on insert/update
- **Trigger**: `update_student_cvs_updated_at` - Automatically updates `updated_at` on update

## Migration

### File: `20250125000001_enhance_student_cvs_table.sql`

This migration:

1. **Adds `url` field** - Stores public URL for convenience (derived from storage key)
2. **Adds unique constraint** - Ensures one CV per student (handles existing duplicates)
3. **Adds `user_id` field** - Denormalized for direct access without joins
4. **Creates trigger** - Automatically sets `user_id` from `student_profile_id`
5. **Populates existing data** - Updates existing records with `user_id` and handles duplicates

## API Implementation

### Upload Endpoint: `/api/portfolio/cv/upload`

**Method**: POST

**Request**:
- `file`: File (PDF or DOCX, max 10MB)
- `studentProfileId`: string

**Response**:
```json
{
  "success": true,
  "cv": {
    "id": "uuid",
    "student_profile_id": "uuid",
    "user_id": "uuid",
    "file_name": "resume.pdf",
    "file_path": "cvs/user-id/timestamp.pdf",
    "url": "https://...",
    "file_size": 123456,
    "mime_type": "application/pdf",
    "visibility": "private",
    "uploaded_at": "2025-01-25T...",
    "created_at": "2025-01-25T...",
    "updated_at": "2025-01-25T..."
  },
  "url": "https://...",
  "textExtracted": true
}
```

**Features**:
- Validates file type (PDF/DOCX only)
- Validates file size (max 10MB)
- Uploads to Supabase Storage (`portfolio-files` bucket)
- Stores public URL in database
- Extracts text from CV (for search/matching)
- Deletes old CV if exists (one CV per student)
- Updates `student_profiles.cv_text` with extracted text

## Row Level Security (RLS)

RLS policies are enabled on `student_cvs`:

1. **Students can read their own CVs** - SELECT policy
2. **Students can insert their own CVs** - INSERT policy
3. **Students can update their own CVs** - UPDATE policy
4. **Students can delete their own CVs** - DELETE policy
5. **Recruiters can read non-private CVs** - SELECT policy (visibility != 'private')

## Storage

- **Bucket**: `portfolio-files`
- **Path Pattern**: `cvs/{user_id}/{timestamp}.{ext}`
- **Public Access**: URLs are generated via `getPublicUrl()`

## Related Tables

### `student_profiles`
- Contains `cv_text` field (extracted plain text from CV)
- Used for text-based search and skill extraction

## Usage Example

```typescript
// Upload CV
const formData = new FormData();
formData.append('file', file);
formData.append('studentProfileId', studentProfileId);

const response = await fetch('/api/portfolio/cv/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// data.cv contains the database record
// data.url contains the public URL
```

## Verification

To verify the schema is correct:

```sql
-- Check table structure
\d student_cvs

-- Check constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'student_cvs'::regclass;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'student_cvs';

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'student_cvs';
```

## Next Steps

1. ✅ Database schema confirmed/implemented
2. ⏳ Run migration: `supabase db push` or apply migration manually
3. ⏳ Test CV upload functionality
4. ⏳ Verify Portfolio page re-renders with uploaded CV
5. ⏳ Verify database record is created correctly
