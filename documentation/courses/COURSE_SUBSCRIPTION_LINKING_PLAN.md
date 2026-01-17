# Course-Subscription Linking Plan

## Overview

This plan outlines how to properly link courses with subscription tiers, ensuring that:
1. Essential Access (£39/month) has access to 5 specific courses
2. Professional Access (£79/month) has access to all courses
3. Course-subscription mappings stay in sync when courses are added/updated
4. The system works seamlessly with the course sync system

## Current State

### What Exists
- ✅ Database schema: `subscription_tier_courses` table for mapping
- ✅ Database function: `has_course_access()` for access checks
- ✅ Seed migration: Maps Essential tier to 5 courses by slug
- ✅ Frontend utilities: Hardcoded `ESSENTIAL_TIER_COURSES` array
- ✅ Course sync system: Syncs courses from MD files to database

### Current Problems
1. **Hardcoded Frontend List**: `ESSENTIAL_TIER_COURSES` is hardcoded in TypeScript
2. **Slug-Based Mapping**: Seed file uses course slugs, but database uses course IDs
3. **No Sync Integration**: Course sync doesn't update subscription mappings
4. **Manual Management**: No tooling to manage course-tier relationships
5. **Potential Drift**: If course IDs change, mappings could break

## Goals

1. **Dynamic Mapping**: Use database as source of truth, not hardcoded arrays
2. **Automatic Sync**: Link courses to tiers when courses are synced
3. **Metadata-Driven**: Define tier assignments in course metadata files
4. **Validation**: Ensure Essential tier always has exactly 5 courses
5. **Tooling**: CLI/API to manage course-tier relationships

## Proposed Solution

### Architecture

```
┌─────────────────┐
│  MD Files       │
│  _COURSE_       │  ← Define tier in metadata
│  METADATA.md    │
└────────┬────────┘
         │
         │ Extract
         ▼
┌─────────────────┐
│  Course Sync    │  ← Sync courses + tier info
│  System         │
└────────┬────────┘
         │
         │ Upsert
         ▼
┌─────────────────┐
│  courses table  │
└────────┬────────┘
         │
         │ Link
         ▼
┌─────────────────┐
│  subscription_  │  ← Auto-link based on metadata
│  tier_courses   │
└─────────────────┘
```

## Implementation Plan

### Phase 1: Extend Course Metadata Schema

**Add `subscription_tier` field to course metadata**

Update `_COURSE_METADATA.md` format to include tier information:

```markdown
---
slug: prompt-engineering
title: Prompt Engineering
description: Write prompts that are reliable, testable, and reusable
subscription_tier: essential  # 'essential' | 'professional' | null
duration_weeks: 1
difficulty_level: beginner
is_published: true
---
```

**For Essential Access courses:**
- Set `subscription_tier: essential`
- These courses will be automatically linked to Essential tier

**For Professional-only courses:**
- Set `subscription_tier: professional` (optional, since Professional has all-access)
- Or omit the field (defaults to Professional-only)

**For all-access courses:**
- Omit `subscription_tier` field (defaults to all tiers)

### Phase 2: Update Course Sync System

**File**: `lib/course-sync/types.ts`
- Add `subscription_tier?: 'essential' | 'professional' | null` to `CourseMetadata`

**File**: `lib/course-sync/extract-metadata.ts`
- Extract `subscription_tier` from metadata files
- Default to `null` if not specified

**File**: `lib/course-sync/sync-to-db.ts`
- After syncing courses, automatically sync tier mappings
- Link Essential tier courses to `subscription_tier_courses` table

### Phase 3: Create Tier Mapping Sync

**File**: `lib/course-sync/sync-tier-mappings.ts`

**Responsibilities:**
- Read all courses from database
- For courses with `subscription_tier: 'essential'`, ensure they're in `subscription_tier_courses`
- Remove courses from `subscription_tier_courses` that are no longer Essential
- Validate that Essential tier has exactly 5 courses

**Functions:**
```typescript
interface TierMappingSyncResult {
  linked: Array<{ courseSlug: string; courseId: string }>;
  unlinked: Array<{ courseSlug: string; courseId: string }>;
  errors: Array<{ course: string; error: string }>;
  validation: {
    essentialCount: number;
    expectedEssentialCount: number;
    isValid: boolean;
  };
}

async function syncTierMappings(
  supabase: SupabaseClient,
  options?: { dryRun?: boolean }
): Promise<TierMappingSyncResult>
```

### Phase 4: Integrate with Course Sync

**File**: `lib/course-sync/sync-to-db.ts`
- After syncing courses, automatically call tier mapping sync
- Or make it optional via flag: `--sync-tier-mappings`

**File**: `scripts/sync-courses.ts`
- Add `--sync-tiers` flag to sync tier mappings
- Add `--tiers-only` flag to only sync tier mappings (not courses)

### Phase 5: Update Frontend to Use Database

**File**: `lib/utils/subscription-types.ts`
- Remove hardcoded `ESSENTIAL_TIER_COURSES` array
- Create function to fetch Essential tier courses from database

**File**: `lib/utils/course-access-frontend.ts`
- Update `isCourseAccessible()` to optionally check database
- Keep hardcoded version as fallback for performance

**New File**: `lib/utils/subscription-access-dynamic.ts`
- Fetch Essential tier courses from database
- Cache results for performance
- Use in server-side checks

### Phase 6: Validation & Safety

**Validation Rules:**
1. Essential tier must have exactly 5 courses
2. All Essential tier courses must be published
3. Professional tier should not have explicit mappings (uses `has_all_access`)
4. Course slugs must match between metadata and database

**Validation Functions:**
```typescript
async function validateTierMappings(
  supabase: SupabaseClient
): Promise<ValidationResult>

interface ValidationResult {
  valid: boolean;
  errors: Array<{
    rule: string;
    message: string;
    details?: unknown;
  }>;
  warnings: Array<{
    rule: string;
    message: string;
  }>;
}
```

### Phase 7: CLI Tooling

**File**: `scripts/sync-course-tiers.ts`

**Usage:**
```bash
# Sync tier mappings
npm run sync-course-tiers

# Dry run
npm run sync-course-tiers -- --dry-run

# Validate only
npm run sync-course-tiers -- --validate-only
```

**Features:**
- Sync Essential tier course mappings
- Validate mappings
- Show which courses are linked/unlinked
- Report validation errors

### Phase 8: API Endpoint

**File**: `app/api/admin/courses/tiers/sync/route.ts`

**POST `/api/admin/courses/tiers/sync`**
- Admin-only endpoint
- Syncs tier mappings
- Returns sync results

**GET `/api/admin/courses/tiers/validate`**
- Validates tier mappings
- Returns validation results

## Essential Access Courses

The 5 courses for Essential Access are:

1. **Prompt Engineering** (`prompt-engineering`)
2. **AI-Content Pipelines** (`ai-content-pipelines`)
3. **Reddit AI Visibility** (`reddit-ai-visibility`)
4. **SEO → AEO** (`seo-to-aeo`)
5. **AI Governance & the EU AI Act** (`ai-governance-eu-ai-act`)

## Migration Strategy

### Step 1: Add Metadata to Existing Courses

For each Essential Access course, add to `_COURSE_METADATA.md`:

```markdown
---
slug: prompt-engineering
title: Prompt Engineering
subscription_tier: essential
...
---
```

### Step 2: Update Course Sync

- Extend sync to extract `subscription_tier` field
- Store in database (may need to add column or use separate mapping)

### Step 3: Create Tier Mapping Sync

- Implement `sync-tier-mappings.ts`
- Link Essential tier courses based on metadata

### Step 4: Run Initial Sync

```bash
# Generate metadata files (if not done)
npm run generate-metadata

# Edit metadata files to add subscription_tier field

# Sync courses
npm run sync-courses

# Sync tier mappings
npm run sync-course-tiers
```

### Step 5: Update Frontend

- Replace hardcoded arrays with database queries
- Add caching for performance
- Keep fallback for offline/error cases

## Database Schema Considerations

### Option A: Add Column to Courses Table

```sql
ALTER TABLE courses 
ADD COLUMN subscription_tier subscription_tier;
```

**Pros:**
- Simple, direct relationship
- Easy to query

**Cons:**
- Only one tier per course (but that's fine for our use case)
- Redundant with `subscription_tier_courses` table

### Option B: Keep Separate Mapping Table (Recommended)

Keep using `subscription_tier_courses` table, but sync it from course metadata.

**Pros:**
- Maintains existing schema
- Flexible for future changes
- Supports many-to-many (if needed later)

**Cons:**
- Requires sync between courses and mappings

**Recommendation**: Use Option B (keep existing schema)

## Implementation Files

### New Files
```
lib/course-sync/
  sync-tier-mappings.ts    # Tier mapping sync logic
  validate-tier-mappings.ts # Validation utilities

scripts/
  sync-course-tiers.ts     # CLI for tier mapping sync

app/api/admin/courses/tiers/
  sync/route.ts            # API endpoint for tier sync
  validate/route.ts        # API endpoint for validation
```

### Modified Files
```
lib/course-sync/
  types.ts                 # Add subscription_tier field
  extract-metadata.ts       # Extract subscription_tier
  sync-to-db.ts            # Optionally sync tier mappings

lib/utils/
  subscription-types.ts    # Remove hardcoded array
  course-access-frontend.ts # Use database queries

scripts/
  sync-courses.ts          # Add --sync-tiers flag
```

## Validation Rules

1. **Essential Tier Count**: Must have exactly 5 courses
2. **Course Existence**: All mapped courses must exist and be published
3. **No Duplicates**: Each course can only be in Essential tier once
4. **Professional Tier**: Should not have explicit mappings (uses `has_all_access`)

## Error Handling

### Common Scenarios

1. **Missing Course**: Course in metadata doesn't exist in database
   - Skip and warn
   - Report in sync results

2. **Wrong Count**: Essential tier doesn't have 5 courses
   - Fail sync (unless `--skip-validation`)
   - Report which courses are missing/extra

3. **Unpublished Course**: Essential tier course is not published
   - Warn but allow (course might be in draft)
   - Report in validation

4. **Database Errors**: Failed to insert/update mappings
   - Rollback if possible
   - Report errors
   - Continue with other courses

## Testing Strategy

### Unit Tests
- Metadata extraction with `subscription_tier`
- Tier mapping sync logic
- Validation rules

### Integration Tests
- Full sync flow (courses + tiers)
- Database operations
- Error scenarios

### Manual Testing
1. Add `subscription_tier: essential` to 5 course metadata files
2. Run sync
3. Verify mappings in database
4. Test access control

## Rollout Plan

### Week 1: Foundation
- [ ] Add `subscription_tier` to course metadata schema
- [ ] Update metadata extraction
- [ ] Create tier mapping sync library
- [ ] Test with one course

### Week 2: Integration
- [ ] Integrate with course sync
- [ ] Create CLI script
- [ ] Create API endpoint
- [ ] Add validation

### Week 3: Migration
- [ ] Add `subscription_tier` to Essential Access course metadata files
- [ ] Run initial sync
- [ ] Verify mappings
- [ ] Update frontend to use database

### Week 4: Cleanup
- [ ] Remove hardcoded arrays
- [ ] Update documentation
- [ ] Final testing
- [ ] Monitor production

## Benefits

1. **Single Source of Truth**: Course metadata defines tier access
2. **Automatic Sync**: Tier mappings stay in sync with courses
3. **Version Control**: Tier assignments tracked in git
4. **Flexible**: Easy to change which courses are in Essential tier
5. **Validated**: Automatic validation ensures correct configuration

## Future Enhancements

1. **Multiple Tiers**: Support courses in multiple tiers (if needed)
2. **Tier History**: Track when courses were added/removed from tiers
3. **Analytics**: Track which tier courses are most popular
4. **Admin UI**: Visual interface to manage tier assignments
5. **Bulk Operations**: Add/remove multiple courses from tiers at once

## Questions to Resolve

1. **Metadata Field Name**: `subscription_tier` vs `tier` vs `access_tier`?
   - **Recommendation**: `subscription_tier` (clear and explicit)

2. **Default Behavior**: What if `subscription_tier` is not specified?
   - **Recommendation**: Professional-only (requires upgrade)

3. **Professional Tier**: Should we store explicit mappings or rely on `has_all_access`?
   - **Recommendation**: Rely on `has_all_access` (simpler, no redundancy)

4. **Validation Strictness**: Should sync fail if Essential tier doesn't have 5 courses?
   - **Recommendation**: Yes, with `--skip-validation` option for flexibility

## Next Steps

1. **Review & Approve Plan**: Get team feedback
2. **Add Metadata Field**: Update course metadata files
3. **Implement Tier Sync**: Build sync library
4. **Test & Iterate**: Start with one course, expand
5. **Deploy**: Run sync and verify

---

**Version**: 1.0  
**Created**: January 2025  
**Status**: Proposal - Awaiting Approval
