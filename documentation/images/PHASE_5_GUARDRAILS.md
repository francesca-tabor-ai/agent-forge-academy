# Phase 5 — Prevent Future Breakage (Guardrails)

## Overview

This document describes the **guardrails** implemented to prevent hero image rendering issues from being introduced in the future. These guardrails ensure that:

1. Course records cannot be created without a valid hero image source (unless fallback is explicitly enabled)
2. PR reviews include a simple UI QA checklist to catch issues early

---

## Guardrail 1: Course Metadata Validation

### Implementation

**Location**: `lib/course-sync/validate.ts`

**Validation Rule**: Course metadata must have at least one of:
1. `imageUrl` - Direct image URL (validated)
2. `thumbnail_url` - Thumbnail image URL (validated)
3. `category` - Track/category for track-based fallback
4. `allow_fallback: true` - Explicitly enable fallback (bypasses validation)

### Validation Logic

```typescript
// Hero image validation guardrail
const hasImageUrl = metadata.imageUrl && isValidImageUrl(metadata.imageUrl);
const hasThumbnailUrl = metadata.thumbnail_url && isValidImageUrl(metadata.thumbnail_url);
const hasCategory = metadata.category && metadata.category.trim().length > 0;
const allowFallback = metadata.allow_fallback === true;

// Guardrail: Require hero image source unless fallback is explicitly enabled
if (!hasImageUrl && !hasThumbnailUrl && !hasCategory && !allowFallback) {
  errors.push({
    field: 'heroImage',
    message: 'Course must have either imageUrl, thumbnail_url, or category (for track-based fallback). If none are available, set allow_fallback: true to explicitly enable fallback.',
  });
}
```

### Image URL Validation

Invalid image URLs are rejected:
- Empty strings
- Placeholder strings: `"image"`, `"placeholder"`
- Placeholder URLs: `"http://placeholder..."`, `"placeholder..."`

### When Validation Runs

1. **Course Sync API** (`/api/admin/courses/sync`)
   - Validates all courses before syncing to database
   - Returns 400 error if validation fails
   - Can be bypassed with `skipValidation: true` (not recommended)

2. **Sync Script** (`scripts/sync-courses.ts`)
   - Validates all courses before syncing
   - Exits with error code if validation fails
   - Can be bypassed with `--skip-validation` flag (not recommended)

3. **Bulk Upload** (`/api/admin/bulk-upload/apply`)
   - Validates each course row before applying
   - Returns validation errors for invalid rows
   - Prevents invalid courses from being created

---

## Guardrail 2: Bulk Upload Validation

### Implementation

**Location**: `lib/utils/bulk-upload-validator.ts`

**Validation Rule**: Same as course metadata validation, but for bulk upload CSV files.

### Usage

When uploading courses via bulk upload:
1. Each row is validated before insertion
2. Invalid rows are rejected with error messages
3. Valid rows are processed normally

---

## Guardrail 3: PR Review Checklist

### Implementation

**Location**: `.github/PULL_REQUEST_TEMPLATE.md`

**Checklist Items**:
- [ ] **Hero present?** - Hero image appears on course landing pages (or fallback gradient is visible)
- [ ] **Fallback works?** - Fallback gradient/image appears if hero image fails to load
- [ ] **No overlap?** - Hero does not overlap with header or sidebar
- [ ] **No horizontal scroll** - Hero does not introduce horizontal scrolling
- [ ] **Responsive** - Hero scales correctly at mobile, tablet, and desktop breakpoints
- [ ] **Text readable** - Text remains readable on hero background (gradient overlay works)

### Usage

When creating a PR:
1. GitHub automatically includes the PR template
2. Reviewer checks off items as they verify
3. PR cannot be merged until checklist is complete (if enforced by branch protection)

---

## How to Use Guardrails

### Adding a New Course

**Option 1: With Direct Image URL**
```yaml
# _COURSE_METADATA.md
---
title: "My New Course"
imageUrl: "https://example.com/hero-image.jpg"
category: "Agentic Systems"
---
```

**Option 2: With Track-Based Fallback**
```yaml
# _COURSE_METADATA.md
---
title: "My New Course"
category: "Agentic Systems"  # Uses track image from TRACK_COVERS
---
```

**Option 3: Explicitly Allow Fallback**
```yaml
# _COURSE_METADATA.md
---
title: "My New Course"
allow_fallback: true  # Explicitly enables fallback (gradient background)
---
```

### Bypassing Validation (Not Recommended)

If you need to bypass validation temporarily:

**API Endpoint**:
```json
POST /api/admin/courses/sync
{
  "skipValidation": true
}
```

**Sync Script**:
```bash
npm run tsx scripts/sync-courses.ts -- --skip-validation
```

**Warning**: Bypassing validation can lead to courses with missing hero images. Only use in emergencies.

---

## Validation Error Messages

### Missing Hero Image Source

```
Error: Course must have either imageUrl, thumbnail_url, or category (for track-based fallback). 
If none are available, set allow_fallback: true to explicitly enable fallback.
```

**Fix**: Add one of the required fields or set `allow_fallback: true`.

### Invalid Image URL

```
Error: imageUrl is invalid or appears to be a placeholder: "image"
```

**Fix**: Provide a valid image URL or remove the field to use track-based fallback.

---

## Testing Guardrails

### Test Validation

```bash
# Test validation without syncing
npm run tsx scripts/sync-courses.ts -- --dry-run

# Test with invalid course (should fail)
# Add a course with no imageUrl, thumbnail_url, category, or allow_fallback
npm run tsx scripts/sync-courses.ts
```

### Test Bulk Upload

1. Create a CSV with a course missing hero image source
2. Upload via `/api/admin/bulk-upload`
3. Verify validation errors are returned

### Test PR Template

1. Create a new PR
2. Verify PR template is included
3. Check that checklist items are present

---

## Enforcement

### Automatic Enforcement

- **Course Sync**: Validation runs automatically (unless bypassed)
- **Bulk Upload**: Validation runs automatically for each row
- **PR Template**: Included automatically in all PRs

### Manual Enforcement

- **Code Review**: Reviewers should check PR checklist
- **Branch Protection**: Can require checklist completion (optional)
- **CI/CD**: Can add validation step to CI pipeline (optional)

---

## Future Enhancements

### Potential Improvements

1. **CI/CD Validation**: Add validation step to CI pipeline
2. **Pre-commit Hook**: Validate courses before commit
3. **Visual Regression Testing**: Automated screenshot comparison
4. **Accessibility Checks**: Automated WCAG compliance checks

---

## Related Documentation

- **Phase 1**: Expected Behavior Definition (`HERO_IMAGE_AUDIT.md`)
- **Phase 2**: Page Inventory (`PAGE_INVENTORY_BREAKPOINTS.md`)
- **Phase 3**: Standard Pattern (`COURSE_HERO_STANDARD_PATTERN.md`)
- **Phase 4**: Regression Test Plan (`PHASE_4_REGRESSION_TEST_PLAN.md`)
- **Non-Overlapping Layout**: Layout Rules (`NON_OVERLAPPING_LAYOUT_RULES.md`)

---

**Last Updated**: Phase 5 - Guardrails Implementation
**Status**: ✅ Complete - Guardrails prevent future breakage
