# Course Sync Plan: MD Files → Supabase

## Overview

This plan outlines how to automatically sync course metadata from Markdown files in the codebase to Supabase, while keeping MD files as the single source of truth.

## Current State

### What Exists
- **MD Files**: Courses stored as directories in `course/` with lesson files
- **Database**: `courses` table in Supabase with metadata (slug, title, description, etc.)
- **Metadata Sources**: 
  - `lib/course-metadata.ts` (TypeScript object)
  - `supabase/seed/02_seed_content.sql` (SQL seed file)
- **File Loading**: `lib/lessons.ts` reads MD files directly from filesystem

### Current Problems
1. **Duplication**: Course metadata exists in 3 places (MD files, TypeScript, SQL)
2. **Manual Sync**: Adding a new course requires updating multiple files
3. **No Source of Truth**: Changes can get out of sync
4. **No Validation**: No check that DB courses match file system

## Goals

1. **MD Files as Source of Truth**: Course metadata should be defined in MD files
2. **Automatic Sync**: Sync from files to database automatically
3. **Backward Compatible**: Existing courses continue to work
4. **Validation**: Ensure DB and filesystem stay in sync
5. **Developer Experience**: Easy to add new courses

## Proposed Solution

### Architecture

```
┌─────────────────┐
│  MD Files       │  ← Source of Truth
│  (course/*/)    │
└────────┬────────┘
         │
         │ Extract metadata
         ▼
┌─────────────────┐
│  Sync Script    │  ← Reads MD files, updates DB
│  / API Route    │
└────────┬────────┘
         │
         │ Upsert
         ▼
┌─────────────────┐
│  Supabase       │  ← Database (enrollments, progress)
│  courses table  │
└─────────────────┘
```

## Implementation Options

### Option 1: Course Metadata File (Recommended)

**Approach**: Each course directory contains a `_COURSE_METADATA.md` or `course.json` file with metadata.

**Pros:**
- Clear separation of metadata from content
- Easy to parse and validate
- Can be version controlled
- Human-readable

**Cons:**
- Requires adding metadata file to each course

**Example Structure:**
```markdown
---
slug: ai-visibility
title: Mastering the AI Visibility Playbook
description: Transform from traditional SEO to AI visibility architecture
category: AI Search & Viability
duration_weeks: 7
difficulty_level: advanced
is_published: true
thumbnail_url: /images/courses/ai-visibility.jpg
---
```

### Option 2: Extract from INDEX.md Frontmatter

**Approach**: Use existing `INDEX.md` or `_COURSE_OVERVIEW.md` frontmatter.

**Pros:**
- No new files needed
- Uses existing structure

**Cons:**
- Less structured
- May not have all metadata fields
- Mixes content with metadata

### Option 3: Hybrid (Recommended)

**Approach**: 
1. Check for `_COURSE_METADATA.md` first (preferred)
2. Fall back to `INDEX.md` or `_COURSE_OVERVIEW.md` frontmatter
3. Fall back to `lib/course-metadata.ts` for legacy courses

**Pros:**
- Flexible migration path
- Backward compatible
- Gradual adoption

## Implementation Plan

### Phase 1: Metadata Extraction Library

**File**: `lib/course-sync/extract-metadata.ts`

**Responsibilities:**
- Scan `course/` directory for course folders
- Extract metadata from each course (prefer `_COURSE_METADATA.md`, fallback to other files)
- Return structured course data matching Supabase schema

**Functions:**
```typescript
interface CourseMetadata {
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_weeks: number | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null;
  is_published: boolean;
}

function extractCourseMetadata(courseSlug: string): CourseMetadata | null
function extractAllCourseMetadata(): CourseMetadata[]
function validateCourseMetadata(metadata: CourseMetadata): ValidationResult
```

### Phase 2: Sync Script/API

**Option A: CLI Script** (`scripts/sync-courses.ts`)

**Usage:**
```bash
npm run sync-courses
# or
npx tsx scripts/sync-courses.ts
```

**Features:**
- Extract metadata from all courses
- Compare with database
- Show diff (what will change)
- Upsert to database
- Report results

**Option B: API Route** (`app/api/admin/courses/sync/route.ts`)

**Features:**
- Admin-only endpoint
- Can be triggered from admin dashboard
- Returns sync results
- Can be scheduled via cron

**Option C: Both**

- CLI for local development and CI/CD
- API for admin dashboard

### Phase 3: Database Sync Logic

**File**: `lib/course-sync/sync-to-db.ts`

**Responsibilities:**
- Compare extracted metadata with database
- Determine what needs to be created/updated/deleted
- Execute upserts
- Handle conflicts (slug changes, etc.)

**Functions:**
```typescript
interface SyncResult {
  created: CourseMetadata[];
  updated: CourseMetadata[];
  deleted: CourseMetadata[];
  unchanged: CourseMetadata[];
  errors: Array<{ course: string; error: string }>;
}

async function syncCoursesToDatabase(
  supabase: SupabaseClient,
  dryRun?: boolean
): Promise<SyncResult>
```

### Phase 4: Validation & Safety

**Features:**
1. **Dry Run Mode**: Preview changes before applying
2. **Validation**: Ensure required fields are present
3. **Conflict Detection**: Warn about slug changes
4. **Backup**: Option to backup before sync
5. **Rollback**: Ability to revert changes

### Phase 5: Automation (Optional)

**CI/CD Integration:**
- GitHub Action that runs on PR to `main`
- Validates course metadata
- Can auto-sync on merge (optional)

**Scheduled Sync:**
- Cron job (via Vercel Cron or similar)
- Daily/weekly sync to catch manual DB changes

## File Structure

```
lib/
  course-sync/
    extract-metadata.ts    # Extract from MD files
    sync-to-db.ts          # Database sync logic
    validate.ts            # Validation utilities
    types.ts               # TypeScript types

scripts/
  sync-courses.ts          # CLI script

app/api/admin/
  courses/
    sync/
      route.ts             # API endpoint (optional)

course/
  ai-visibility/
    _COURSE_METADATA.md    # Course metadata (new)
    INDEX.md
    Module_01_*.md
    ...
```

## Migration Strategy

### Step 1: Create Metadata Files

For each existing course, create `_COURSE_METADATA.md`:

```bash
# Script to generate metadata files from course-metadata.ts
npm run generate-metadata-files
```

### Step 2: Update Sync Logic

1. Implement extraction library
2. Implement sync script
3. Test with one course
4. Test with all courses

### Step 3: Deprecate Old Sources

1. Mark `lib/course-metadata.ts` as deprecated
2. Update documentation
3. Migrate seed file to use sync script

### Step 4: Full Adoption

1. Remove dependency on `course-metadata.ts`
2. Use sync script in CI/CD
3. Update admin dashboard to use sync API

## Example: Adding a New Course

### Current Process (Manual)
1. Create course directory: `course/new-course/`
2. Add lesson MD files
3. Update `lib/course-metadata.ts`
4. Update `supabase/seed/02_seed_content.sql`
5. Run migration

### New Process (Automated)
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

## Database Schema Considerations

### Current Schema
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

### Potential Enhancements
1. **Add `source_file_path`**: Track which file the metadata came from
2. **Add `last_synced_at`**: Track when last synced
3. **Add `sync_hash`**: Detect if file changed since last sync
4. **Add `category`**: Store category from metadata (currently in TypeScript only)

## Error Handling

### Common Scenarios

1. **Missing Metadata File**
   - Log warning
   - Skip course or use fallback
   - Report in sync results

2. **Invalid Metadata**
   - Validate required fields
   - Check enum values (difficulty_level)
   - Report validation errors

3. **Slug Mismatch**
   - Directory name doesn't match metadata slug
   - Warn and use directory name as source of truth

4. **Database Conflicts**
   - Handle unique constraint violations
   - Handle foreign key constraints
   - Report conflicts

5. **File System Errors**
   - Handle missing directories
   - Handle permission errors
   - Graceful degradation

## Testing Strategy

### Unit Tests
- Metadata extraction
- Validation logic
- Sync comparison logic

### Integration Tests
- Full sync flow
- Database operations
- Error scenarios

### Manual Testing
- Test with one course
- Test with all courses
- Test with invalid data
- Test dry-run mode

## Rollout Plan

### Week 1: Foundation
- [ ] Create metadata extraction library
- [ ] Create sync script (CLI)
- [ ] Add validation
- [ ] Test with one course

### Week 2: Integration
- [ ] Create API endpoint (optional)
- [ ] Add to admin dashboard
- [ ] Generate metadata files for existing courses
- [ ] Test full sync

### Week 3: Migration
- [ ] Update documentation
- [ ] Deprecate old metadata sources
- [ ] Update CI/CD (if applicable)
- [ ] Train team on new process

### Week 4: Cleanup
- [ ] Remove deprecated code
- [ ] Final testing
- [ ] Monitor production sync

## Benefits

1. **Single Source of Truth**: MD files are the only place to define courses
2. **Reduced Errors**: No more manual sync mistakes
3. **Faster Onboarding**: Add course in one place
4. **Version Control**: Course metadata changes tracked in git
5. **Validation**: Automatic validation of course data
6. **Audit Trail**: Git history shows when courses changed

## Risks & Mitigations

### Risk: Breaking Existing Courses
**Mitigation**: Backward compatibility, gradual migration, extensive testing

### Risk: Sync Script Bugs
**Mitigation**: Dry-run mode, validation, rollback capability, staging environment

### Risk: Performance (Large Number of Courses)
**Mitigation**: Batch operations, incremental sync, caching

### Risk: Manual DB Changes Overwritten
**Mitigation**: Sync reports, conflict detection, manual override option

## Future Enhancements

1. **Lesson Sync**: Sync lesson metadata to database
2. **Content Hash**: Detect content changes, not just metadata
3. **Webhook Integration**: Trigger sync on file changes
4. **Admin UI**: Visual diff before sync
5. **Auto-publish**: Auto-publish courses when metadata changes
6. **Multi-environment**: Sync to dev/staging/prod separately

## Questions to Resolve

1. **Metadata File Format**: YAML frontmatter vs JSON?
   - **Recommendation**: YAML frontmatter (consistent with lessons)

2. **Sync Frequency**: On-demand vs scheduled?
   - **Recommendation**: Both (on-demand for dev, scheduled for prod)

3. **Delete Handling**: What if course directory deleted?
   - **Recommendation**: Mark as unpublished, don't auto-delete

4. **Category Field**: Add to database or keep in metadata only?
   - **Recommendation**: Add to database for filtering/grouping

5. **Thumbnail Management**: Store in repo or external?
   - **Recommendation**: Keep current approach, sync URL

## Next Steps

1. **Review & Approve Plan**: Get team feedback
2. **Choose Metadata Format**: Decide on `_COURSE_METADATA.md` vs other
3. **Create Metadata Files**: Generate for existing courses
4. **Implement Phase 1**: Build extraction library
5. **Test & Iterate**: Start with one course, expand

---

**Version**: 1.0  
**Created**: January 2025  
**Status**: Proposal - Awaiting Approval
