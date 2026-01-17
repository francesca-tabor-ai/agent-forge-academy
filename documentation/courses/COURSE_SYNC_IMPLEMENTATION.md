# Course Sync Implementation - Complete

## Overview

The Hybrid approach for syncing courses from MD files to Supabase has been fully implemented. This system keeps MD files as the single source of truth while automatically syncing metadata to the database.

## What Was Implemented

### 1. Core Library (`lib/course-sync/`)

#### `types.ts`
- TypeScript interfaces for course metadata
- Sync result types
- Validation result types

#### `validate.ts`
- Validates course metadata
- Normalizes raw metadata to database format
- Checks required fields, enum values, data types

#### `extract-metadata.ts`
- **Hybrid approach**: Checks multiple sources in priority order:
  1. `_COURSE_METADATA.md` (preferred)
  2. `INDEX.md` frontmatter
  3. `_COURSE_OVERVIEW.md` frontmatter
  4. `README.md` frontmatter
  5. `lib/course-metadata.ts` (legacy fallback)
  6. Generated from directory name (last resort)

#### `sync-to-db.ts`
- Compares file metadata with database
- Creates new courses
- Updates existing courses
- Optionally deletes courses not in filesystem
- Returns detailed sync results

### 2. CLI Script (`scripts/sync-courses.ts`)

**Usage:**
```bash
# Sync courses (requires env vars)
npm run sync-courses

# Dry run (preview changes)
npm run sync-courses:dry-run

# With options
npm run sync-courses -- --delete-missing
npm run sync-courses -- --skip-validation
npm run sync-courses -- --verbose
```

**Features:**
- Validates metadata before syncing
- Shows detailed results
- Dry-run mode for safety
- Error handling and reporting

### 3. API Endpoint (`app/api/admin/courses/sync/route.ts`)

**POST `/api/admin/courses/sync`**
- Admin-only endpoint
- Syncs courses to database
- Accepts options: `dryRun`, `deleteMissing`, `skipValidation`
- Returns detailed sync results

**GET `/api/admin/courses/sync`**
- Preview what would be synced
- Shows what would be created/updated/deleted
- Shows validation results

### 4. Metadata Generator (`scripts/generate-metadata-files.ts`)

**Usage:**
```bash
npm run generate-metadata
```

**Features:**
- Generates `_COURSE_METADATA.md` files for existing courses
- Uses data from `course-metadata.ts` and existing MD files
- Skips courses that already have metadata files
- Estimates duration and difficulty from time strings

## How It Works

### Metadata Extraction Priority

1. **`_COURSE_METADATA.md`** (Preferred)
   - Dedicated metadata file
   - Full control over all fields
   - Example:
     ```markdown
     ---
     slug: ai-visibility
     title: Mastering the AI Visibility Playbook
     description: Transform from traditional SEO to AI visibility architecture
     category: AI Search & Visibility
     duration_weeks: 7
     difficulty_level: advanced
     is_published: true
     ---
     ```

2. **Existing MD Files** (Fallback)
   - Extracts from `INDEX.md`, `_COURSE_OVERVIEW.md`, or `README.md` frontmatter
   - Uses whatever fields are available

3. **Legacy `course-metadata.ts`** (Fallback)
   - Converts legacy format to new format
   - Estimates duration from time strings
   - Estimates difficulty from duration

4. **Generated** (Last Resort)
   - Creates minimal metadata from directory name
   - Sets `is_published: false` by default

### Sync Process

1. **Extract** metadata from all course directories
2. **Validate** all metadata (unless `--skip-validation`)
3. **Compare** with database courses
4. **Create** new courses
5. **Update** changed courses
6. **Delete** missing courses (if `--delete-missing`)
7. **Report** results

## Usage Examples

### Adding a New Course

1. Create course directory: `course/new-course/`
2. Add lesson MD files
3. Create `_COURSE_METADATA.md`:
   ```markdown
   ---
   slug: new-course
   title: New Course Title
   description: Course description
   category: Category Name
   duration_weeks: 4
   difficulty_level: intermediate
   is_published: true
   ---
   ```
4. Run sync: `npm run sync-courses`
5. Done! ✅

### Updating Existing Course

1. Edit `_COURSE_METADATA.md` or the source file
2. Run sync: `npm run sync-courses`
3. Changes are synced to database

### Previewing Changes

```bash
# See what would change
npm run sync-courses:dry-run

# Or use API
curl -X GET http://localhost:3000/api/admin/courses/sync \
  -H "Authorization: Bearer <token>"
```

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

The sync works with the existing `courses` table:

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  thumbnail_url TEXT,
  duration_weeks INTEGER,
  difficulty_level VARCHAR(50),
  is_published BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Migration Path

### Step 1: Generate Metadata Files (Optional)

```bash
npm run generate-metadata
```

This creates `_COURSE_METADATA.md` files for all existing courses using data from `course-metadata.ts`.

### Step 2: Review Generated Files

Check the generated files and adjust as needed:
- Add missing descriptions
- Correct duration/difficulty
- Add thumbnail URLs
- Set `is_published` correctly

### Step 3: Sync to Database

```bash
# Dry run first
npm run sync-courses:dry-run

# Then sync for real
npm run sync-courses
```

### Step 4: Verify

Check the database to ensure courses are synced correctly.

## Benefits

1. **Single Source of Truth**: MD files are the only place to define courses
2. **Automatic Sync**: No manual database updates needed
3. **Version Control**: Course metadata changes tracked in git
4. **Validation**: Automatic validation of course data
5. **Backward Compatible**: Works with existing courses
6. **Flexible**: Multiple fallback sources for metadata

## Future Enhancements

Potential improvements:
1. Add `category` field to database schema
2. Sync lesson metadata to database
3. Content hash detection for changes
4. Webhook integration for auto-sync
5. Admin UI for visual diff before sync
6. Multi-environment sync (dev/staging/prod)

## Troubleshooting

### Error: Missing environment variables
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### Error: Validation failed
- Check the validation errors in the output
- Fix the metadata files and try again

### Courses not syncing
- Check that course directories exist in `course/`
- Verify metadata files are readable
- Check database connection

### Permission errors
- Ensure service role key has proper permissions
- Check RLS policies (sync uses service role, bypasses RLS)

## Files Created

```
lib/course-sync/
  types.ts              # Type definitions
  validate.ts           # Validation utilities
  extract-metadata.ts   # Metadata extraction (hybrid approach)
  sync-to-db.ts         # Database sync logic

scripts/
  sync-courses.ts       # CLI sync script
  generate-metadata-files.ts  # Generate metadata files

app/api/admin/courses/sync/
  route.ts              # API endpoint

package.json           # Added scripts and tsx dependency
```

## Next Steps

1. **Generate metadata files** for existing courses:
   ```bash
   npm run generate-metadata
   ```

2. **Review and edit** generated metadata files as needed

3. **Test sync** with dry run:
   ```bash
   npm run sync-courses:dry-run
   ```

4. **Sync to database**:
   ```bash
   npm run sync-courses
   ```

5. **Integrate into workflow**:
   - Add to CI/CD pipeline (optional)
   - Use API endpoint in admin dashboard
   - Schedule periodic syncs (optional)

---

**Status**: ✅ Complete  
**Version**: 1.0  
**Date**: January 2025
