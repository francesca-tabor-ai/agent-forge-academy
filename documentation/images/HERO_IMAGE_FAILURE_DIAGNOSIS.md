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

## Bucket B: Invalid Data

**Symptoms**: Category exists but doesn't match TRACK_COVERS

| Course Slug | Category Found | Expected | Issue | Fix |
|-------------|----------------|----------|-------|-----|
| *No courses in this bucket* | | | | |

## Bucket C: Rendering Issue

**Symptoms**: Category exists and matches TRACK_COVERS, but image not showing

| Course Slug | Category | Source | Issue | Fix |
|-------------|----------|--------|-------|-----|
| ai-driven-credit-scoring-lending | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| ai-powered-financial-risk-management | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| algorithmic-trading-market-intelligence | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| automated-financial-reporting-analysis | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| automated-suitability-esg-matching | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| distribution-marketing-intelligence | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| esg-sustainable-investment-insights | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| financial-fraud-detection-ai | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| frictionless-compliance-onboarding-assistant | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| hyper-personalized-client-communication | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| intelligent-data-management-verification | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| intelligent-document-intelligence-hub | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| investment-siri-mass-market-clients | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| multi-agent-sales-system | Agentic Systems | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| operational-efficiency-tools | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| predictive-wealth-insights-dashboard | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |
| regulatory-compliance-greenwashing-prevention | Trust & Regulation | _COURSE_METADATA.md | Category exists and matches TRACK_COVERS, but image not showing | Check image rendering logic and fallback handling |

## Summary

- **Bucket A (Missing Data)**: 0 courses
- **Bucket B (Invalid Data)**: 0 courses
- **Bucket C (Rendering Issue)**: 17 courses
