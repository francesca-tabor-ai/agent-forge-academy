# Course Card Image Audit & Fix Proposals

**Date:** 2025-01-XX  
**Audited URL:** https://agent-forge-academy.vercel.app/student/courses  
**Status:** Audit Complete - Proposals Ready

---

## 🔍 What's Broken

### 1. **Placeholder Values in Database**
- **Issue:** Database `courses.thumbnail_url` field may contain literal string `"image"` as placeholder
- **Evidence:** Code has explicit checks filtering `imageUrl !== 'image'` in:
  - `components/courses/CourseCard.tsx:137`
  - `components/segments/LandingCourseCard.tsx:21`
  - `lib/utils/course-image-resolver.ts:74`
- **Impact:** Cards with `thumbnail_url="image"` will skip to fallback chain, but if fallback fails, may show broken image

### 2. **Missing Local Fallback Images**
- **Issue:** Code references `/course-covers/industry/default.jpg` in `lib/courseCovers.ts:15`, but directory doesn't exist in `/public`
- **Evidence:** `public/` directory only contains `hero-bg.png` and `logos/`, no `course-covers/` subdirectory
- **Impact:** If remote images fail or are blocked, no local fallback exists

### 3. **External Image Dependencies**
- **Issue:** All course images are hosted on external domains (Unsplash, third-party sites)
- **Evidence:** All URLs in `lib/courseCovers.ts` and `lib/utils/course-image-resolver.ts` are external HTTPS URLs
- **Impact:** 
  - Risk of broken images if external sites change URLs or block hotlinking
  - No control over image availability
  - Potential CORS/blocking issues
  - Slow LCP if external images are slow to load

### 4. **Inconsistent Image Source Priority**
- **Issue:** Multiple sources of truth for images:
  - Database `thumbnail_url`
  - Metadata `imageUrl` (from `_COURSE_METADATA.md` or `course-metadata.ts`)
  - Industry-based fallback
  - Track-based fallback
- **Evidence:** Complex resolution logic in `resolveCourseImageUrl()` with 5 priority levels
- **Impact:** Hard to debug which source is being used, potential for mismatches

### 5. **No Build-Time Validation**
- **Issue:** No script validates that all courses resolve to valid image URLs
- **Impact:** Broken images can slip into production

### 6. **Potential Next.js Image Config Gaps**
- **Issue:** While many domains are configured, some external image URLs might use domains not in `next.config.js`
- **Evidence:** `next.config.js` has ~15 remote patterns, but external sites may change or add new domains
- **Impact:** Next.js Image component may block some images

---

## 🎯 Root Cause Analysis

### Primary Root Cause
**Database courses have `thumbnail_url="image"` placeholder values** that bypass the first priority check, forcing fallback to industry/track-based images. If:
1. Course has no `imageUrl` in metadata
2. Course has no matching industry/track mapping
3. External fallback image URL is blocked/slow/broken

Then the card will show a broken image or the generic fallback.

### Secondary Issues
- **No local image assets** - 100% dependency on external URLs
- **Complex resolution chain** - Makes debugging difficult
- **No validation** - Broken images aren't caught before production

---

## 💡 Solution Options

### Option 1: Industry/Track-Based Static Covers in `/public`

**What to Change:**
- Create `/public/course-covers/industry/` directory with images for each industry
- Create `/public/course-covers/track/` directory with images for each track
- Update `lib/courseCovers.ts` to use local paths (e.g., `/course-covers/industry/finance.jpg`)
- Keep external URLs as fallback only

**Files to Modify:**
- `lib/courseCovers.ts` - Change URLs to `/course-covers/...` paths
- `lib/utils/course-image-resolver.ts` - Update `TRACK_DEFAULT_IMAGES` to use local paths
- Create new directory structure in `public/`

**Pros:**
- ✅ Fast loading (served from same domain, no external requests)
- ✅ Reliable (no dependency on external sites)
- ✅ Better LCP (images load immediately)
- ✅ Full control over image quality/size
- ✅ Works offline/development
- ✅ SEO-friendly (images on same domain)

**Cons:**
- ❌ Requires downloading/optimizing ~15-20 images upfront
- ❌ Increases repository size (~2-5MB for optimized images)
- ❌ Manual process to add new industries/tracks
- ❌ Need to maintain image assets in repo

**Implementation Time:** 2-4 hours (download, optimize, organize images)

---

### Option 2: Per-Course `imageUrl` in Metadata with Fallback

**What to Change:**
- Add `imageUrl` field to all `_COURSE_METADATA.md` files (or `course-metadata.ts`)
- Keep existing fallback chain (industry → track → default)
- Update database courses to remove `thumbnail_url="image"` placeholders

**Files to Modify:**
- All `course/*/_COURSE_METADATA.md` files - Add `imageUrl: "..."` field
- `lib/course-metadata.ts` - Add `imageUrl` to courses missing it
- Database migration script - Update `thumbnail_url` from `"image"` to `NULL`

**Pros:**
- ✅ Per-course customization (most flexible)
- ✅ Can use external URLs or local paths
- ✅ Maintains existing fallback logic
- ✅ No new infrastructure needed

**Cons:**
- ❌ Requires updating ~60 course metadata files
- ❌ Still dependent on external URLs if using them
- ❌ Manual maintenance for each new course
- ❌ Inconsistent if some courses use external, others use local

**Implementation Time:** 4-6 hours (update all metadata files, test)

---

### Option 3: Supabase Storage-Hosted Images + Next.js Config

**What to Change:**
- Create public Supabase Storage bucket `course-covers`
- Upload all course images to Supabase Storage
- Update `next.config.js` to allow `*.supabase.co` (already configured)
- Update `lib/courseCovers.ts` to use Supabase Storage URLs

**Files to Modify:**
- `lib/courseCovers.ts` - Change URLs to Supabase Storage paths
- `next.config.js` - Verify Supabase domain is allowed (already done)
- Create upload script for images

**Pros:**
- ✅ Centralized image management
- ✅ Can update images without code changes
- ✅ CDN benefits (Supabase Storage uses CDN)
- ✅ Version control for images (can update URLs)
- ✅ No repo bloat

**Cons:**
- ❌ Requires Supabase Storage setup
- ❌ Need to upload/manage images in Supabase dashboard
- ❌ External dependency (Supabase availability)
- ❌ Potential costs if storage/CDN usage grows
- ❌ More complex deployment (images separate from code)

**Implementation Time:** 3-5 hours (setup bucket, upload images, update code)

---

### Option 4: No-Image Fallback UI (Gradient + Initials/Title)

**What to Change:**
- Create `<CourseImagePlaceholder>` component that shows:
  - Gradient background based on industry/track color
  - Course title initials or first letter
  - Optional icon based on category
- Use this component when `imageUrl` is invalid/missing
- Keep existing image logic but add graceful degradation

**Files to Modify:**
- `components/courses/CourseCard.tsx` - Add placeholder component
- `components/segments/LandingCourseCard.tsx` - Add placeholder component
- Create new `components/courses/CourseImagePlaceholder.tsx`

**Pros:**
- ✅ Always works (no broken images)
- ✅ Fast (no image load)
- ✅ Consistent brand experience
- ✅ Can implement immediately
- ✅ Good for courses without images yet

**Cons:**
- ❌ Less visually appealing than real images
- ❌ Doesn't solve the root problem (still need images eventually)
- ❌ May look "incomplete" to users
- ❌ No SEO benefit from images

**Implementation Time:** 1-2 hours (create component, integrate)

---

### Option 5: Build-Time Validation Script

**What to Change:**
- Create `scripts/validate-course-images.ts` that:
  - Loads all courses (from DB + file system)
  - Resolves image URL for each course
  - Validates URL is accessible (HTTP HEAD request)
  - Fails build if any course has invalid image
- Add to `package.json` scripts: `"validate:images": "tsx scripts/validate-course-images.ts"`
- Run in CI/CD before deployment

**Files to Modify:**
- Create `scripts/validate-course-images.ts`
- Update `package.json` - Add validation script
- Update CI/CD workflow to run validation

**Pros:**
- ✅ Prevents broken images in production
- ✅ Catches issues early
- ✅ Documents which courses have image problems
- ✅ Can be run locally for debugging

**Cons:**
- ❌ Doesn't fix existing broken images
- ❌ Requires network access during build
- ❌ May slow down build process
- ❌ External URL validation may have false positives (rate limiting, etc.)

**Implementation Time:** 2-3 hours (write script, integrate into build)

---

## 🎯 Recommended Approach

### **For Next 2 Weeks (Fast + Robust): Hybrid Approach**

**Combine Options 1 + 4 + 5:**

1. **Immediate Fix (Option 4):** Implement no-image fallback UI
   - Prevents broken images immediately
   - Can ship in 1-2 hours
   - Provides consistent experience

2. **Short-term Fix (Option 1):** Add local static covers for top 5-7 industries/tracks
   - Focus on most common courses first
   - Use local images for reliability
   - Keep external URLs as fallback for less common ones

3. **Validation (Option 5):** Add build-time validation
   - Catches issues before production
   - Documents which courses need images

**Implementation Order:**
1. Day 1: Option 4 (fallback UI) - **1-2 hours**
2. Day 2-3: Option 1 (top industries/tracks) - **3-4 hours**
3. Day 4: Option 5 (validation) - **2 hours**
4. Week 2: Expand Option 1 to all industries/tracks - **2-3 hours**

**Total Time:** ~8-11 hours over 2 weeks

---

### **For Next 2 Months (Scalable): Full Solution**

**Combine Options 1 + 2 + 3 + 5:**

1. **Local Static Covers (Option 1):** Complete coverage
   - All industries and tracks have local images
   - Optimized, consistent sizing

2. **Per-Course Overrides (Option 2):** For special cases
   - Courses that need unique images can override
   - Stored in `_COURSE_METADATA.md` or `course-metadata.ts`

3. **Supabase Storage (Option 3):** For dynamic updates
   - Admin can upload new images without code changes
   - Use for course-specific images that change frequently

4. **Validation (Option 5):** Production safety
   - CI/CD validation prevents regressions
   - Regular audits catch broken external URLs

**Implementation Plan:**
- **Month 1:**
  - Complete local static covers (all industries/tracks)
  - Add per-course `imageUrl` to top 20 courses
  - Set up Supabase Storage bucket (optional, for future)
  
- **Month 2:**
  - Migrate remaining courses to have `imageUrl` in metadata
  - Set up automated image validation in CI/CD
  - Create admin UI for uploading course images (if using Supabase)

**Total Time:** ~20-30 hours over 2 months

---

## 📋 Action Items Summary

### Immediate (This Week)
- [ ] Implement no-image fallback UI component
- [ ] Add build-time validation script
- [ ] Audit database for `thumbnail_url="image"` values

### Short-term (Next 2 Weeks)
- [ ] Create `/public/course-covers/industry/` with top 5-7 industry images
- [ ] Create `/public/course-covers/track/` with all track images
- [ ] Update `lib/courseCovers.ts` to use local paths
- [ ] Test image resolution for all courses

### Long-term (Next 2 Months)
- [ ] Complete local image coverage (all industries)
- [ ] Add `imageUrl` to all course metadata files
- [ ] Set up Supabase Storage (optional)
- [ ] Create admin image upload UI (if using Supabase)
- [ ] Document image management process

---

## 🔧 Technical Notes

### Current Image Resolution Priority
1. `course.imageUrl` (if valid, not "image" placeholder)
2. Priority industries (Healthcare, Finance) → industry cover
3. Track/category → track cover
4. Standard industries → industry cover
5. Default fallback → `https://wallpaperaccess.com/full/340554.png`

### Next.js Image Configuration
- Already configured for most external domains
- Supabase Storage wildcard pattern exists: `**.supabase.co`
- May need to add more domains as new external images are used

### Database Schema
- `courses.thumbnail_url` - TEXT, nullable
- No `imageUrl` field in database (only in metadata)
- Consider adding `image_url` column for direct DB storage

---

## 📊 Risk Assessment

| Solution | Risk Level | Mitigation |
|----------|-----------|------------|
| Option 1 (Local Static) | Low | Test all paths, verify images exist |
| Option 2 (Metadata URLs) | Medium | Validate URLs, use fallback chain |
| Option 3 (Supabase Storage) | Medium | Monitor storage costs, test CDN performance |
| Option 4 (Fallback UI) | Low | Design review, accessibility testing |
| Option 5 (Validation) | Low | Handle network failures gracefully |

---

## ✅ Success Criteria

- [ ] Zero course cards show broken images
- [ ] All courses resolve to valid image URLs (local or external)
- [ ] Build fails if any course has invalid image
- [ ] Image load time < 500ms for local images
- [ ] Fallback UI displays correctly for courses without images
- [ ] All external image URLs are validated and working

---

**Next Steps:** Review this audit, select approach, and begin implementation.
