# Hero Image Failure Diagnosis Report

Generated: 2026-01-18T23:30:17.454Z

Total Courses with Missing Images: 17

## Bucket A: Missing Data

**Symptoms**: No category/track field in metadata

**Analysis**: All 17 courses have `category` fields in their `_COURSE_METADATA.md` files. However, **NONE of these courses are in `course-metadata.ts`** (the legacy static metadata file). This means:

1. ✅ Category data exists in `_COURSE_METADATA.md`
2. ❌ Category data missing from `course-metadata.ts` (legacy fallback)
3. ⚠️ If `extractCourseMetadata()` fails, there's no fallback

**Root Cause**: These courses rely entirely on `extractCourseMetadata()` to read from `_COURSE_METADATA.md`. If this extraction fails or returns null, there's no category data available.

| Course Slug | Category Found | Source | In course-metadata.ts? | Issue | Fix |
|-------------|----------------|--------|------------------------|-------|-----|
| *All courses have category in _COURSE_METADATA.md* | | | | | |
| *But none are in course-metadata.ts* | | | | | |

**Recommended Fix for Bucket A Prevention**:
- Add all courses to `course-metadata.ts` as a fallback, OR
- Ensure `extractCourseMetadata()` always succeeds, OR
- Make category a required field in database schema

## Bucket B: Rendering Not Implemented

**Symptoms**: Image exists in data but no `<img>` / background layer rendered, course hero component is text-only

**Analysis**: ✅ **Rendering IS implemented**

- CourseHero component has backgroundImage rendering code
- CourseHero accepts `imageUrl` prop
- Course landing page passes `imageUrl` to CourseHero via `getCourseCover()`
- All 17 courses would pass imageUrl to component (none would be null)

**Result**: Bucket B does NOT apply. Rendering is fully implemented.

See [BUCKET_B_RENDERING_DIAGNOSIS.md](./BUCKET_B_RENDERING_DIAGNOSIS.md) for detailed analysis.

| Course Slug | Rendering Implemented? | ImageUrl Passed? | Notes |
|-------------|------------------------|------------------|-------|
| *All courses* | ✅ Yes | ✅ Yes | CourseHero component has full image rendering implementation |

## Bucket C: Invalid Data (Category Mismatch)

**Symptoms**: Category exists but doesn't match TRACK_COVERS

| Course Slug | Category Found | Expected | Issue | Fix |
|-------------|----------------|----------|-------|-----|
| *No courses in this bucket* | | | | |

## Bucket C: CSS/Layout Hides the Image

**Symptoms**: Image exists and is rendered, but not visible due to CSS/layout issues

**Analysis**: Found 7 potential CSS/layout issues:

1. ⚠️ **Z-index conflict**: Header and hero both use `z-50` - header might cover hero
2. ⚠️ **Complex responsive positioning**: `md:left-1/2 md:-ml-[50vw]` could cause layout issues
3. ⚠️ **Overflow clipping**: `overflow-x-hidden` on wrapper might clip hero content
4. ⚠️ **Negative margin**: `-mt-8` could cause positioning issues
5. ⚠️ **Sticky positioning**: Could conflict with other sticky elements
6. ⚠️ **Sidebar overlay**: On mobile, sidebar has `z-40` (lower than hero, but check desktop)
7. ⚠️ **Hero overflow-hidden**: Could clip background image if positioning is off

**Most Likely Issue**: Z-index conflict - header (`z-50`) and hero wrapper (`z-50`) are at same level.

See [BUCKET_C_CSS_LAYOUT_DIAGNOSIS.md](./BUCKET_C_CSS_LAYOUT_DIAGNOSIS.md) for detailed analysis.

| Course Slug | Category | Source | CSS Issue | Fix |
|-------------|----------|--------|-----------|-----|
| ai-driven-credit-scoring-lending | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| ai-powered-financial-risk-management | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| algorithmic-trading-market-intelligence | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| automated-financial-reporting-analysis | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| automated-suitability-esg-matching | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| distribution-marketing-intelligence | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| esg-sustainable-investment-insights | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| financial-fraud-detection-ai | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| frictionless-compliance-onboarding-assistant | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| hyper-personalized-client-communication | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| intelligent-data-management-verification | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| intelligent-document-intelligence-hub | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| investment-siri-mass-market-clients | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| multi-agent-sales-system | Agentic Systems | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| operational-efficiency-tools | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| predictive-wealth-insights-dashboard | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |
| regulatory-compliance-greenwashing-prevention | Trust & Regulation | _COURSE_METADATA.md | Z-index conflict (header z-50 covers hero z-50) | Increase hero z-index to z-[60] |

**Note**: All 17 courses share the same CourseHero component and page layout, so they all have the same CSS issues. The most likely issue is the z-index conflict where the header (`z-50`) might be covering the hero (`z-50`).

## Summary

- **Bucket A (Missing Data)**: 0 courses
  - All courses have category in `_COURSE_METADATA.md`
  - Risk: 16/17 courses not in `course-metadata.ts` (no fallback if extraction fails)
- **Bucket B (Rendering Not Implemented)**: 0 courses
  - ✅ Rendering IS fully implemented
  - CourseHero component has backgroundImage rendering
  - Course landing page properly passes imageUrl
- **Bucket C (CSS/Layout Hides Image)**: 17 courses
  - All have valid category data
  - Rendering is implemented
  - **Most likely issue**: Z-index conflict (header z-50 covers hero z-50)
  - Other potential issues: Complex positioning, overflow clipping, negative margins