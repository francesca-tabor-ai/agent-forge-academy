# Phase 4 — Regression Test Plan (Repeatable QA Checklist)

## Overview

This document provides a **comprehensive, repeatable QA checklist** for testing hero image rendering across all courses. Use this plan to verify that hero images render correctly after any changes to the image system, layout, or components.

---

## Test Environment Setup

### Prerequisites
- [ ] Access to the application (local dev or staging)
- [ ] Browser DevTools enabled
- [ ] Responsive design mode available (or multiple devices)
- [ ] Network throttling capability (to test slow image loads)

### Test Accounts
- [ ] Student account with access to multiple courses
- [ ] Account enrolled in at least 3 different courses
- [ ] Account with no enrollments (to test enrollment flow)

---

## Must-Test Pages Per Course

For **each course**, test the following pages:

### 1. Course Landing Page
**URL Pattern**: `/student/courses/[courseSlug]`

**Test Steps**:
1. Navigate to course landing page
2. Verify hero image is visible
3. Check that hero is not hidden under header
4. Verify hero respects sidebar (desktop) or is full-width (mobile)
5. Check for horizontal scroll introduced by hero
6. Verify text is readable on hero background

**Expected Results**:
- ✅ Hero image appears OR fallback gradient appears (never blank)
- ✅ Hero starts at 64px from top (below header)
- ✅ No overlap with header or sidebar
- ✅ No horizontal scroll
- ✅ Image scales responsively without distortion
- ✅ Text remains readable (white text on dark gradient overlay)

---

### 2. Quick Start Lesson (First Regular Lesson)
**URL Pattern**: `/student/courses/[courseSlug]/lessons/[firstLessonSlug]`

**How to Identify**:
- First lesson in the course (excluding `_COURSE_METADATA.md` or "Course Index" lessons)
- Usually the first lesson listed in the course modules

**Test Steps**:
1. Navigate to Quick Start lesson
2. Verify page loads correctly
3. Check "Back" link works (returns to course landing page)
4. Check "Next →" link works (if not last lesson)
5. Verify no hero image issues (lesson pages don't have hero, but should not break layout)

**Expected Results**:
- ✅ Page loads without errors
- ✅ "Back" link navigates to course landing page
- ✅ "Next →" link navigates to next lesson (if available)
- ✅ No layout issues (hero not required on lesson pages)

---

### 3. Module 1 Lesson (First Lesson After Quick Start)
**URL Pattern**: `/student/courses/[courseSlug]/lessons/[module1LessonSlug]`

**How to Identify**:
- Second lesson in the course (after Quick Start)
- First lesson of the first module (if course has modules)

**Test Steps**:
1. Navigate to Module 1 lesson
2. Verify page loads correctly
3. Check "Back" link works
4. Check "Next →" link works
5. Verify navigation flow is correct

**Expected Results**:
- ✅ Page loads without errors
- ✅ Navigation links work correctly
- ✅ No layout issues

---

### 4. Last Module Lesson (Final Lesson)
**URL Pattern**: `/student/courses/[courseSlug]/lessons/[lastLessonSlug]`

**How to Identify**:
- Last lesson in the course
- Usually shows "Module complete →" instead of "Next →"

**Test Steps**:
1. Navigate to last lesson
2. Verify page loads correctly
3. Check "Back" link works
4. Verify "Module complete →" link appears (instead of "Next →")
5. Check that "Module complete →" links back to course landing page

**Expected Results**:
- ✅ Page loads without errors
- ✅ "Back" link works
- ✅ "Module complete →" link appears and works
- ✅ No layout issues

---

## Must-Test Interactions

### 1. Navigate Via Sidebar Links

**Test Steps**:
1. Open sidebar (if collapsed)
2. Click "Courses" link in sidebar
3. Navigate to a course from the courses list
4. Verify hero image appears on course landing page
5. Click "Dashboard" link in sidebar
6. Click "Courses" link again
7. Navigate to a different course
8. Verify hero image appears on new course landing page

**Expected Results**:
- ✅ Sidebar navigation works correctly
- ✅ Hero images appear on all course landing pages
- ✅ No layout issues when navigating between courses
- ✅ Sidebar does not overlay hero on desktop

---

### 2. Click "Back" Links

**Test Steps**:
1. Navigate to a course landing page
2. Click on a lesson (Quick Start or Module 1)
3. Click "Back" link on lesson page
4. Verify you return to course landing page
5. Verify hero image is still visible on landing page
6. Repeat for multiple lessons

**Expected Results**:
- ✅ "Back" link navigates correctly
- ✅ Hero image remains visible after navigation
- ✅ No layout shifts or issues

---

### 3. Click "Next →" Links

**Test Steps**:
1. Navigate to a course landing page
2. Click on Quick Start lesson
3. Click "Next →" link on lesson page
4. Verify you navigate to next lesson
5. Continue clicking "Next →" through multiple lessons
6. Verify navigation flow is correct

**Expected Results**:
- ✅ "Next →" link navigates correctly
- ✅ Navigation flow is sequential
- ✅ No broken links or 404 errors
- ✅ Last lesson shows "Module complete →" instead

---

### 4. Refresh Page Directly on a Lesson URL

**Test Steps**:
1. Navigate to a course landing page
2. Note the URL
3. Navigate to a lesson
4. Note the lesson URL
5. Refresh the page (F5 or Cmd+R)
6. Verify page loads correctly
7. Verify hero image appears (on landing page)
8. Repeat for multiple lessons

**Expected Results**:
- ✅ Page loads correctly after refresh
- ✅ Hero image appears (on landing page)
- ✅ No layout issues after refresh
- ✅ Navigation links still work

---

## Must-Test Breakpoints

### Mobile (≤390px)

**Test Steps**:
1. Set viewport to mobile size (≤390px width)
2. Navigate to course landing page
3. Verify hero image is visible
4. Check that hero is full-width (breaks out of padding)
5. Verify hero is not hidden under header
6. Check for horizontal scroll
7. Verify text is readable
8. Test sidebar overlay (burger menu)
9. Verify sidebar does not cover hero when open

**Expected Results**:
- ✅ Hero image appears OR fallback gradient appears
- ✅ Hero is full-width on mobile
- ✅ Hero starts at 64px from top (below header)
- ✅ No horizontal scroll
- ✅ Text is readable
- ✅ Sidebar overlay works correctly
- ✅ Sidebar does not cover hero content

---

### Tablet (~768px)

**Test Steps**:
1. Set viewport to tablet size (~768px width)
2. Navigate to course landing page
3. Verify hero image is visible
4. Check that hero respects layout constraints
5. Verify hero is not hidden under header
6. Check for horizontal scroll
7. Verify text is readable
8. Test sidebar (should be in grid layout, not overlay)

**Expected Results**:
- ✅ Hero image appears OR fallback gradient appears
- ✅ Hero respects layout constraints
- ✅ Hero starts at 64px from top (below header)
- ✅ No horizontal scroll
- ✅ Text is readable
- ✅ Sidebar is in grid layout (pushes content, not overlay)

---

### Desktop (≥1280px)

**Test Steps**:
1. Set viewport to desktop size (≥1280px width)
2. Navigate to course landing page
3. Verify hero image is visible
4. Check that hero respects sidebar grid
5. Verify hero is not hidden under header
6. Check for horizontal scroll
7. Verify text is readable
8. Test sidebar collapse/expand
9. Verify hero adjusts when sidebar width changes

**Expected Results**:
- ✅ Hero image appears OR fallback gradient appears
- ✅ Hero respects sidebar grid (no overlap)
- ✅ Hero starts at 64px from top (below header)
- ✅ No horizontal scroll
- ✅ Text is readable
- ✅ Sidebar grid layout works correctly
- ✅ Hero adjusts when sidebar width changes

---

## Pass Criteria

### ✅ Hero Image Appears OR Fallback Appears (Never Blank)

**Check**:
- Hero image is visible (actual image or gradient fallback)
- No blank/empty hero area
- Gradient fallback is visible if image fails to load

**How to Verify**:
1. Inspect hero element in DevTools
2. Check computed styles for `background-image` or `background` (gradient)
3. Verify at least one background layer is visible
4. Test with network throttling (slow 3G) to verify fallback works

---

### ✅ No Overlap with Header/Sidebar

**Check**:
- Hero is not hidden under header
- Hero does not overlap sidebar on desktop
- Sidebar does not cover hero content

**How to Verify**:
1. Inspect hero element position (`top: 64px`)
2. Check z-index stacking (header: z-50, hero: z-[60])
3. Verify sidebar grid layout on desktop
4. Test sidebar overlay on mobile

---

### ✅ No Horizontal Scroll Introduced by Hero

**Check**:
- No horizontal scrollbar appears
- Hero does not overflow viewport width
- Content does not extend beyond viewport

**How to Verify**:
1. Check for horizontal scrollbar
2. Inspect hero element width (`w-full` or `w-auto`)
3. Verify `overflow-x-hidden` is applied
4. Test at all breakpoints

---

### ✅ Image Scales Responsively Without Distortion

**Check**:
- Hero image scales correctly at all breakpoints
- Image maintains aspect ratio
- No stretching or squashing
- Image covers container properly (`bg-cover bg-center`)

**How to Verify**:
1. Resize viewport between breakpoints
2. Check image scaling behavior
3. Verify `bg-cover bg-center` classes are applied
4. Check computed styles for `background-size: cover`

---

### ✅ Text Remains Readable on Image Background

**Check**:
- White text is readable over hero image
- Gradient overlay ensures text contrast
- Text is not obscured by image

**How to Verify**:
1. Check gradient overlay is applied (`bg-gradient-to-b from-transparent via-black/30 to-black/90`)
2. Verify text color is white or light
3. Test with various image backgrounds
4. Check contrast ratio (WCAG AA minimum)

---

## Test Execution Checklist

### Per Course Checklist

For each course, complete this checklist:

```
Course: [Course Name]
Course Slug: [course-slug]

[ ] Landing Page - Hero visible
[ ] Landing Page - No overlap with header/sidebar
[ ] Landing Page - No horizontal scroll
[ ] Landing Page - Image scales responsively
[ ] Landing Page - Text readable

[ ] Quick Start Lesson - Page loads
[ ] Quick Start Lesson - Back link works
[ ] Quick Start Lesson - Next link works

[ ] Module 1 Lesson - Page loads
[ ] Module 1 Lesson - Back link works
[ ] Module 1 Lesson - Next link works

[ ] Last Lesson - Page loads
[ ] Last Lesson - Back link works
[ ] Last Lesson - Module complete link works

[ ] Sidebar Navigation - Works correctly
[ ] Direct URL Refresh - Works correctly

[ ] Mobile Breakpoint - All checks pass
[ ] Tablet Breakpoint - All checks pass
[ ] Desktop Breakpoint - All checks pass
```

---

## Sample Test Courses

### High-Priority Courses (Test First)

1. **AI Recommender Systems** (`ai-recommender-systems`)
   - Popular course, likely to have issues
   - Test all pages and interactions

2. **Multi-Agent Systems** (`multi-agent-systems`)
   - Complex course structure
   - Test navigation flow

3. **Agentic Commerce** (`agentic-commerce`)
   - E-commerce focus
   - Test all breakpoints

### Medium-Priority Courses (Test Next)

4. **LLM First Websites** (`llm-first-websites`)
5. **Prompt Engineering** (`prompt-engineering`)
6. **Spec-Driven Development** (`spec-driven-development`)

### Low-Priority Courses (Test Last)

7. **Vibe Coding Cursor Supabase** (`vibe-coding-cursor-supabase`)
8. **3D for Ecommerce** (`3d-for-ecommerce`)
9. **AI Content Pipelines** (`ai-content-pipelines`)

---

## Automated Test Scripts

### Quick Visual Check Script

Run this script to quickly check all course landing pages:

```bash
# List all courses
npm run tsx scripts/test-hero-images.ts

# Check specific course
npm run tsx scripts/test-hero-images.ts -- --course ai-recommender-systems
```

### Page Inventory Script

Generate a checklist of all pages to test:

```bash
npm run tsx scripts/page-inventory-hero-images.ts
```

---

## Common Issues & Solutions

### Issue: Hero Image Not Showing

**Symptoms**:
- Blank hero area
- No background image or gradient

**Check**:
1. Verify image URL is valid
2. Check network requests (image loading)
3. Verify fallback gradient is applied
4. Check console for errors

**Solution**:
- Ensure `DEFAULT_FALLBACK_IMAGE` is set
- Verify gradient fallback is always visible
- Check image URL resolution logic

---

### Issue: Hero Hidden Under Header

**Symptoms**:
- Hero content is cut off at top
- Header covers hero

**Check**:
1. Verify hero uses `top-[64px]` (not `top-0`)
2. Check z-index stacking
3. Verify header height is 64px

**Solution**:
- Update hero positioning to `sticky top-[64px]`
- Verify z-index hierarchy

---

### Issue: Horizontal Scroll

**Symptoms**:
- Horizontal scrollbar appears
- Content extends beyond viewport

**Check**:
1. Verify `overflow-x-hidden` is applied
2. Check hero width (`w-full` or `w-auto`)
3. Verify negative margins are correct

**Solution**:
- Add `overflow-x-hidden` to hero wrapper
- Adjust width classes
- Fix negative margin calculations

---

### Issue: Sidebar Overlaps Hero

**Symptoms**:
- Sidebar covers hero on desktop
- Hero content is hidden

**Check**:
1. Verify sidebar uses grid layout (not fixed)
2. Check grid template columns
3. Verify hero respects grid

**Solution**:
- Ensure sidebar uses grid on desktop
- Verify hero sits inside main content flow
- Check grid column widths

---

## Reporting Issues

### Issue Template

When reporting a hero image issue, include:

1. **Course**: Course name and slug
2. **Page**: Landing page or lesson page
3. **Breakpoint**: Mobile, tablet, or desktop
4. **Issue**: Description of the problem
5. **Expected**: What should happen
6. **Actual**: What actually happens
7. **Screenshots**: Visual evidence
8. **Console Errors**: Any JavaScript errors
9. **Network Requests**: Image loading status

---

## Test Frequency

### Recommended Schedule

- **After any hero image changes**: Full test suite
- **After layout changes**: Full test suite
- **Before production release**: Full test suite
- **Weekly regression**: Sample of 5-10 courses
- **Monthly full audit**: All courses

---

## Success Metrics

### Pass Rate Targets

- **Hero Image Visibility**: 100% (all courses must show hero or fallback)
- **Layout Issues**: 0% (no overlap, no horizontal scroll)
- **Responsive Behavior**: 100% (works at all breakpoints)
- **Navigation**: 100% (all links work correctly)

---

**Last Updated**: Phase 4 - Regression Test Plan
**Status**: ✅ Complete - Ready for QA execution
