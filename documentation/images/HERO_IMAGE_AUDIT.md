# Hero Image Sitewide Audit & Fix Plan

## Phase 1: Expected Behavior Definition (Single Source of Truth)

This document defines the **expected behavior** for hero/course images across the entire site. This serves as the acceptance standard for QA and development.

---

## 1. Course Landing Pages (`/student/courses/[courseSlug]`)

### Expected Behavior
- **MUST** display a hero banner image at the top of the page
- Image should be **full-width, sticky header** (stays visible on scroll)
- Minimum height: 240px (mobile), 360px (desktop)
- Image source priority:
  1. Course-specific `imageUrl` override (if valid and not placeholder)
  2. Track/Category image (from `TRACK_COVERS` in `lib/courseCovers.ts`)
  3. Default fallback image (`/course-covers/industry/default.jpg` or external default)

### Implementation
- **Component**: `CourseHero` (`components/courses/CourseHero.tsx`)
- **Image Resolution**: `getCourseCover()` from `lib/courseCovers.ts`
- **Page**: `app/(student)/student/courses/[courseSlug]/page.tsx` (line 134, 229)

### Acceptance Criteria
- ✅ Hero image is visible on all course pages
- ✅ Image loads successfully (no broken image icons)
- ✅ Image has proper gradient overlay for text readability
- ✅ Image never shows placeholder text or empty state
- ✅ Image gracefully handles missing/invalid URLs with fallback

### Current Status
- **Implementation**: ✅ Uses `getCourseCover()` which resolves track images
- **Potential Issues**: Need to verify all courses have valid track/category set

---

## 2. Course Cards (Listing Pages)

### Expected Behavior
- **MUST** display a thumbnail image in each course card
- Image should be **200px height** with rounded corners
- Image source priority:
  1. Course-specific `imageUrl` or `thumbnail_url` (if valid)
  2. Track/Category image (from `TRACK_COVERS`)
  3. Placeholder component (`CourseImagePlaceholder`) if no valid image

### Implementation
- **Component**: `CourseCard` (`components/courses/CourseCard.tsx`)
- **Image Resolution**: `resolveCourseImageUrl()` from `lib/utils/course-image-resolver.ts`
- **Placeholder**: `CourseImagePlaceholder` component (shows initials/colors if image fails)

### Usage Locations
- `/student/courses` - Main courses listing page
- Dashboard courses section
- Landing page course grids
- Segment landing pages (industry/role/track)

### Acceptance Criteria
- ✅ Every course card shows either an image or a styled placeholder
- ✅ No broken image icons or empty image areas
- ✅ Placeholder is visually appealing (not just gray box)
- ✅ Image loading errors trigger placeholder gracefully
- ✅ Images are optimized (lazy loading, proper sizing)

### Current Status
- **Implementation**: ✅ Has fallback to placeholder component
- **Potential Issues**: Need to verify placeholder shows correctly for all edge cases

---

## 3. Lesson Pages (`/student/courses/[courseSlug]/lessons/[slug]`)

### Expected Behavior
- **OPTIONAL**: Lesson pages do NOT require hero images
- If hero images are added in the future, they must not break layout
- Current design: Simple header with lesson title and metadata

### Implementation
- **Page**: `app/(student)/student/courses/[courseSlug]/lessons/[slug]/page.tsx`
- **Current**: No hero image component

### Acceptance Criteria
- ✅ Page renders correctly without hero image
- ✅ Layout is not broken by missing image
- ✅ If hero images are added later, they must be optional (graceful degradation)

### Current Status
- **Implementation**: ✅ No hero images (by design)
- **Status**: No action needed

---

## 4. Landing Pages (Industry/Role/Track)

### Expected Behavior
- **MUST** display a full-bleed hero banner image
- Image should be **60vh minimum height** (500px minimum)
- Image source:
  - **Industry pages**: `getIndustryHeroImage()` from `lib/utils/hero-image-resolver.ts`
  - **Role pages**: `getRoleHeroImage()` from `lib/utils/hero-image-resolver.ts`
  - **Track pages**: `getTrackHeroImage()` from `lib/utils/hero-image-resolver.ts`
- Fallback: Default image from `COURSE_IMAGE_URLS.md` or role-specific default

### Implementation
- **Components**: 
  - `SegmentLandingPage` (authenticated users)
  - `PublicSegmentLandingPage` (public access)
- **Pages**:
  - `app/landing/industry/[slug]/page.tsx`
  - `app/landing/role/[slug]/page.tsx`
  - `app/landing/track/[slug]/page.tsx` (if exists)

### Acceptance Criteria
- ✅ Hero image is visible on all landing pages
- ✅ Image loads successfully (no broken image icons)
- ✅ Image has proper gradient overlay for text readability
- ✅ Image never shows placeholder text or empty state
- ✅ Image gracefully handles missing/invalid URLs with fallback

### Current Status
- **Implementation**: ✅ Uses hero image resolver functions
- **Potential Issues**: Need to verify all segments have valid hero image URLs in `COURSE_IMAGE_URLS.md`

---

## 5. Main Landing Page (`/landing`)

### Expected Behavior
- **MUST** display thumbnail images for each segment (industry/role/track) card
- Images should be **192px height** (h-48) with rounded corners
- Image source: Same as individual landing pages (industry/role/track hero images)

### Implementation
- **Page**: `app/landing/page.tsx`
- **Image Resolution**: Uses segment `heroImageUrl` property

### Acceptance Criteria
- ✅ Every segment card shows an image
- ✅ No broken image icons or empty image areas
- ✅ Images are optimized (lazy loading, proper sizing)
- ✅ Image loading errors are handled gracefully

### Current Status
- **Implementation**: ✅ Uses segment hero image URLs
- **Potential Issues**: Need to verify all segments have valid hero image URLs

---

## Image Resolution Priority (Universal Rules)

### For Course Images (Course Pages & Cards)
1. **Direct override**: `course.imageUrl` or `course.thumbnail_url` (if valid, not placeholder)
2. **Track/Category**: `TRACK_COVERS[category]` from `lib/courseCovers.ts`
3. **Default fallback**: `/course-covers/industry/default.jpg` or external default URL

### For Landing Page Images (Industry/Role/Track)
1. **Specific mapping**: From `COURSE_IMAGE_URLS.md` (tracks/industries) or `content/landing/role-images.md` (roles)
2. **Default fallback**: 
   - Tracks/Industries: `https://wallpaperaccess.com/full/340554.png`
   - Roles: `/landing/default-role.jpg`

---

## Image Validation Rules

### Valid Image URL
- Must be a non-empty string
- Must NOT be: `"image"`, `"placeholder"`, or start with `"http://placeholder"`
- Must be a valid URL (starts with `http://`, `https://`, or `/`)

### Invalid Image Handling
- **Course Cards**: Show `CourseImagePlaceholder` component (styled with initials/colors)
- **Course Landing Pages**: Use default fallback image (never show placeholder)
- **Landing Pages**: Use default fallback image (never show placeholder)

---

## Testing Checklist

### Course Landing Pages
- [ ] All courses display hero images
- [ ] Images load successfully (no 404s or broken icons)
- [ ] Fallback works when track/category is missing
- [ ] Fallback works when image URL is invalid
- [ ] Gradient overlay ensures text readability

### Course Cards
- [ ] All course cards show images or placeholders
- [ ] Placeholder component renders correctly
- [ ] Images are optimized (lazy loading)
- [ ] Error handling works (onError triggers placeholder)

### Landing Pages
- [ ] All industry pages show hero images
- [ ] All role pages show hero images
- [ ] All track pages show hero images (if they exist)
- [ ] Main landing page shows thumbnails for all segments
- [ ] Fallback images work when segment image is missing

---

## Issues Found & Fixed

### ✅ Fixed Issues

1. **CourseHero Missing Error Handling** (FIXED)
   - **Problem**: `CourseHero` component had no error handling for failed image loads
   - **Impact**: Broken images would show empty space or broken image icons
   - **Fix**: Added image validation, error state management, and automatic fallback to default image
   - **Location**: `components/courses/CourseHero.tsx`

2. **Inconsistent Default Fallback Images** (FIXED)
   - **Problem**: `getCourseCover()` used `/course-covers/industry/default.jpg` (local, may not exist) while `resolveCourseImageUrl()` used external URL
   - **Impact**: Inconsistent behavior and potential 404 errors
   - **Fix**: Standardized both to use external default URL: `https://wallpaperaccess.com/full/340554.png`
   - **Location**: `lib/courseCovers.ts`

3. **No Image URL Validation in CourseHero** (FIXED)
   - **Problem**: `CourseHero` accepted any string as `imageUrl` without validation
   - **Impact**: Placeholder strings like "image" or "placeholder" would be used as URLs
   - **Fix**: Added validation function to check for valid URLs before rendering
   - **Location**: `components/courses/CourseHero.tsx`

### ⚠️ Potential Issues to Monitor

1. **Missing Track/Category**: Some courses may not have `category` set, causing fallback to default
2. **Invalid Image URLs**: Some courses may have placeholder values in `imageUrl` field (now handled with validation)
3. **Missing Segment Images**: Some industries/roles may not have entries in `COURSE_IMAGE_URLS.md`
4. **Image Loading Failures**: External URLs may become unavailable over time (now handled with error fallback)

---

## Phase 3: Cross-Breakpoint Verification

### Breakpoint Testing
- **Mobile (≤390px)**: Min height 240px, stacked layout
- **Tablet (~768px)**: Min height 320px, desktop layout starts
- **Desktop (≥1280px)**: Min height 360px, horizontal layout

### Common Issues by Breakpoint
- **Mobile**: Collapsed hero height, image not visible, text overlap
- **Tablet**: Layout shift, image cropping
- **Desktop**: Image stretching, blank hero area

See [BREAKPOINT_VERIFICATION_GUIDE.md](./BREAKPOINT_VERIFICATION_GUIDE.md) for detailed testing instructions.

## Next Steps (Phase 2+)

1. ✅ **Audit all courses**: Check which courses have missing/invalid images (COMPLETE)
2. ✅ **Create page inventory**: Generated checklist for all course pages (COMPLETE)
3. ✅ **Cross-breakpoint verification**: Created testing guide and checklist (COMPLETE)
4. **Manual breakpoint testing**: Test each course at Mobile/Tablet/Desktop viewports
5. **Audit all segments**: Check which segments have missing hero images
6. **Test image loading**: Verify all image URLs are accessible
7. **Implement fixes**: Add missing images, fix invalid URLs, ensure fallbacks work
8. **Create reusable component**: Ensure consistent image handling across all pages

---

## Files to Review

### Image Resolution
- `lib/courseCovers.ts` - Track/industry cover images
- `lib/utils/course-image-resolver.ts` - Course image resolution logic
- `lib/utils/hero-image-resolver.ts` - Landing page hero image resolution

### Components
- `components/courses/CourseHero.tsx` - Course landing page hero
- `components/courses/CourseCard.tsx` - Course card with thumbnail
- `components/courses/CourseImagePlaceholder.tsx` - Placeholder component
- `components/segments/SegmentLandingPage.tsx` - Authenticated landing pages
- `components/segments/PublicSegmentLandingPage.tsx` - Public landing pages

### Pages
- `app/(student)/student/courses/[courseSlug]/page.tsx` - Course landing page
- `app/(student)/student/courses/[courseSlug]/lessons/[slug]/page.tsx` - Lesson page
- `app/landing/page.tsx` - Main landing page
- `app/landing/industry/[slug]/page.tsx` - Industry landing page
- `app/landing/role/[slug]/page.tsx` - Role landing page

### Data Sources
- `documentation/images/COURSE_IMAGE_URLS.md` - Track/industry/role image mappings
- `content/landing/role-images.md` - Role image mappings (alternative source)

---

**Last Updated**: Phase 1 - Expected Behavior Definition
**Status**: ✅ Complete - Ready for Phase 2 (Sitewide Audit)
