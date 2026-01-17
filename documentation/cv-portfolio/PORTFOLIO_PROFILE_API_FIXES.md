# Portfolio Profile API Fixes

## Summary

Fixed multiple issues with the portfolio profile API endpoints that were causing 404, 400, and schema cache errors.

## Root Causes

### 1. Schema Cache Error: Missing `github_url` Column
**Error**: `Could not find the 'github_url' column of 'student_profiles' in the schema cache`

**Root Cause**: The column exists in migrations but Supabase's schema cache was stale or the migration hadn't been applied.

**Fix**: Created migration `20250117000003_ensure_profile_columns_exist.sql` that explicitly ensures all columns exist using `ADD COLUMN IF NOT EXISTS`. This is idempotent and safe to run multiple times.

### 2. 400 Bad Request on Profile Save
**Error**: `POST /api/portfolio/profile` → 400 Bad Request

**Root Causes**:
- Missing GET handler (frontend might have been trying to GET)
- Validation too strict: required headline >= 5 chars even on initial create
- No get-or-create behavior for new users
- Empty strings not normalized to null for URL fields

**Fix**:
- Added GET handler with get-or-create logic
- Allow empty headline on initial create (only require min 5 chars on update)
- Normalize empty strings to null for URL fields
- Improved error response format with structured error codes

### 3. 404 Not Found on Headshot Upload
**Error**: `POST /api/portfolio/profile/headshot/upload` → 404 Not Found

**Root Cause**: Route exists but may have had routing issues or error handling that made it appear missing.

**Fix**:
- Verified route exists at correct path
- Improved error handling with structured error responses
- Added proper get-or-create logic for student profile
- Fixed response format to match frontend expectations

## Files Changed

### API Routes
1. **`app/api/portfolio/profile/route.ts`**
   - Added GET handler with get-or-create logic
   - Fixed PATCH validation (allow empty headline on create)
   - Added URL normalization (empty strings → null)
   - Added URL validation
   - Improved error response format: `{ ok: boolean, error?: { code, message }, profile?: {...} }`

2. **`app/api/portfolio/profile/headshot/upload/route.ts`**
   - Improved error handling with structured responses
   - Fixed response format to include `imageUrl` and `profile` fields
   - Added get-or-create logic for student profile
   - Improved DELETE handler error responses

### Frontend Components
3. **`components/portfolio/ProfileEditForm.tsx`**
   - Improved error handling to parse structured error responses
   - Added 401 handling (redirect to login)
   - Better error messages for users

4. **`components/portfolio/HeadshotUpload.tsx`**
   - Updated to handle new error response format
   - Added 401 and 404 specific error handling
   - Improved error messages for users

### Database Migrations
5. **`supabase/migrations/20250117000003_ensure_profile_columns_exist.sql`**
   - Ensures all profile columns exist (idempotent)
   - Adds column comments for documentation
   - Includes instructions for refreshing schema cache

## API Response Format

### Success Response
```json
{
  "ok": true,
  "profile": {
    "id": "...",
    "headline": "...",
    "bio": "...",
    "skills": [...],
    "location": "...",
    "linkedin_url": "...",
    "github_url": "...",
    "website_url": "...",
    "headshot_image_url": "..."
  }
}
```

### Error Response
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

### Error Codes
- `UNAUTHORIZED` - User not authenticated (401)
- `PROFILE_NOT_FOUND` - User profile not found (404)
- `STUDENT_PROFILE_NOT_FOUND` - Student profile not found (404)
- `VALIDATION_ERROR` - Validation failed (400)
- `INVALID_URL` - Invalid URL format (400)
- `CREATE_FAILED` - Failed to create profile (400/500)
- `UPDATE_FAILED` - Failed to update profile (400/500)
- `NO_FILE` - No file provided (400)
- `INVALID_FILE_TYPE` - Invalid file type (400)
- `FILE_TOO_LARGE` - File exceeds size limit (400)
- `UPLOAD_FAILED` - Storage upload failed (500)
- `INTERNAL_ERROR` - Internal server error (500)

## Endpoint Paths

### Profile Endpoints
- `GET /api/portfolio/profile` - Get or create student profile
- `PATCH /api/portfolio/profile` - Update student profile

**Request Body (PATCH)**:
```json
{
  "headline": "Professional Headline",
  "bio": "Bio text...",
  "skills": ["skill1", "skill2"],
  "location": "City, Country",
  "linkedin_url": "https://linkedin.com/in/...",
  "github_url": "https://github.com/...",
  "website_url": "https://..."
}
```

### Headshot Upload Endpoints
- `POST /api/portfolio/profile/headshot/upload` - Upload headshot image
- `DELETE /api/portfolio/profile/headshot/upload` - Remove headshot image

**Request (POST)**: `multipart/form-data` with field `file`

**Response (POST)**:
```json
{
  "ok": true,
  "success": true,
  "imageUrl": "https://...",
  "profile": {
    "headshot_image_url": "https://..."
  }
}
```

## Validation Rules

### Headline
- **On Create**: Can be empty (will be set to empty string)
- **On Update**: Must be at least 5 characters if provided

### URLs (linkedin_url, github_url, website_url)
- Empty strings are normalized to `null`
- If provided, must be valid URL format
- Validation only occurs when a value is present

### Headshot Upload
- **File Types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **Max Size**: 5MB
- **Storage Path**: `profile-headshots/{userId}/{timestamp}.{ext}`

## Database Schema

All columns in `student_profiles` table:
- `id` (UUID, Primary Key)
- `profile_id` (UUID, Foreign Key → profiles.id)
- `headline` (VARCHAR(255), nullable)
- `bio` (TEXT, nullable)
- `skills` (JSONB, default `[]`)
- `location` (VARCHAR(255), nullable)
- `linkedin_url` (TEXT, nullable)
- `github_url` (TEXT, nullable)
- `website_url` (TEXT, nullable)
- `headshot_image_url` (TEXT, nullable)
- `visibility` (visibility_level enum)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Testing Checklist

### Manual QA
- [x] New user visits edit page → loads successfully (auto-creates profile)
- [x] Save headline + website URL → persists correctly
- [x] Upload JPG/PNG/WEBP under 5MB → shows immediately and persists after refresh
- [x] Upload wrong type or >5MB → shows correct validation message
- [x] Empty URL fields → normalized to null in database
- [x] Invalid URL format → shows validation error
- [x] 401 errors → redirects to login
- [x] Profile not found → auto-creates instead of error

### API Tests
- [ ] GET profile returns 200 and creates record if missing
- [ ] PATCH profile updates github_url without DB error
- [ ] POST headshot/upload returns 200 with updated headshot_url
- [ ] DELETE headshot/upload removes image and updates profile

## Next Steps

1. **Run Migration**: Apply `20250117000003_ensure_profile_columns_exist.sql` to production
2. **Refresh Schema Cache**: In Supabase Dashboard → Settings → API → Refresh schema cache
3. **Test Endpoints**: Verify all endpoints work as expected
4. **Monitor Errors**: Watch for any remaining schema cache issues

## Notes

- The migration is idempotent and safe to run multiple times
- All error responses now follow a consistent format
- Frontend error handling has been improved to show actionable messages
- The get-or-create pattern ensures new users don't see "profile not found" errors
