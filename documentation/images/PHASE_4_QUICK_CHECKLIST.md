# Phase 4 — Quick Test Checklist

## Quick Reference for QA Testing

### Per Course Checklist

```
Course: _______________________
Course Slug: ___________________

LANDING PAGE
[ ] Hero visible (image or fallback)
[ ] No overlap with header/sidebar
[ ] No horizontal scroll
[ ] Image scales responsively
[ ] Text readable

QUICK START LESSON
[ ] Page loads
[ ] Back link works
[ ] Next link works

MODULE 1 LESSON
[ ] Page loads
[ ] Back link works
[ ] Next link works

LAST LESSON
[ ] Page loads
[ ] Back link works
[ ] Module complete link works

INTERACTIONS
[ ] Sidebar navigation works
[ ] Direct URL refresh works

BREAKPOINTS
[ ] Mobile (≤390px) - All checks pass
[ ] Tablet (~768px) - All checks pass
[ ] Desktop (≥1280px) - All checks pass
```

---

## Pass Criteria (Quick Check)

- ✅ Hero image appears OR fallback appears (never blank)
- ✅ No overlap with header/sidebar
- ✅ No horizontal scroll introduced by hero
- ✅ Image scales responsively without distortion
- ✅ Text remains readable on image background

---

## Test Pages Per Course

1. **Course Landing Page**: `/student/courses/[courseSlug]`
2. **Quick Start Lesson**: First regular lesson (exclude `_COURSE_METADATA.md`)
3. **Module 1 Lesson**: Second lesson (first lesson after Quick Start)
4. **Last Module Lesson**: Final lesson in course

---

## Test Interactions

1. Navigate via sidebar links
2. Click "Back" links
3. Click "Next →" links
4. Refresh page directly on a lesson URL

---

## Test Breakpoints

- **Mobile**: ≤390px
- **Tablet**: ~768px
- **Desktop**: ≥1280px

---

**See `PHASE_4_REGRESSION_TEST_PLAN.md` for detailed instructions.**
