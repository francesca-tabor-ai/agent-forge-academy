# Bucket C: CSS/Layout Hides the Image - Diagnosis

Generated: 2026-01-18T23:38:51.585Z

## CourseHero Component Analysis

### CSS Checks

- **Has min-height**: ✅ Yes
- **Has overflow-hidden**: ⚠️  Yes
- **Has absolute positioning**: ✅ Yes
- **Has relative positioning**: ✅ Yes
- **Has z-index**: ✅ No
- **Background on correct element**: ✅ Yes
- **Has h-full**: ✅ Yes

### Issues Found

- ✅ Has min-height - prevents collapse
- ⚠️  Has overflow-hidden - could clip image if positioning is off
- ✅ Background image on correct element (absolute inset-0)
- ✅ Has relative positioning for content

## Course Page Layout Analysis

### Layout Checks

- **Has sticky positioning**: ⚠️  Yes
- **Has z-50**: ⚠️  Yes
- **Has complex positioning**: ⚠️  Yes
- **Has overflow-hidden**: ⚠️  Yes
- **Has negative margin**: ⚠️  Yes

### Issues Found

- ⚠️  Hero wrapper uses sticky positioning - could conflict with other sticky elements
- ⚠️  Hero wrapper has z-50 - could be covered by nav/header with higher z-index
- ⚠️  Complex responsive positioning (md:left-1/2 md:-ml-[50vw]) - could cause layout issues
- ⚠️  Has overflow-x-hidden on wrapper - could clip hero content
- ⚠️  Has negative margin (-mt-8) - could cause positioning issues
- ⚠️  Page has sidebar - check if it covers hero on certain breakpoints

## Potential CSS Issues

### Warnings (⚠️)

- ⚠️  Has overflow-hidden - could clip image if positioning is off
- ⚠️  Hero wrapper uses sticky positioning - could conflict with other sticky elements
- ⚠️  Hero wrapper has z-50 - could be covered by nav/header with higher z-index
- ⚠️  Complex responsive positioning (md:left-1/2 md:-ml-[50vw]) - could cause layout issues
- ⚠️  Has overflow-x-hidden on wrapper - could clip hero content
- ⚠️  Has negative margin (-mt-8) - could cause positioning issues
- ⚠️  Page has sidebar - check if it covers hero on certain breakpoints

## Z-Index Stacking Analysis

### Current Z-Index Values

- **Header**: `z-50` (sticky top-0)
- **Hero Wrapper**: `z-50` (sticky top-0)
- **Sidebar (Mobile)**: `z-40` (fixed overlay)
- **Hero Background**: No explicit z-index (defaults to 0, but in relative container)

### Potential Conflict

⚠️ **Header and Hero both have z-50** - They're at the same stacking level. Since header comes first in DOM order, it might be covering the hero on certain breakpoints.

## Recommendations

### Fixes Needed

1. **Fix z-index stacking conflict**: Header and hero both use z-50
   - **Issue**: Header (`z-50`) and hero wrapper (`z-50`) are at same level
   - **Fix**: Increase hero z-index to `z-[60]` or higher to ensure it's above header
   - **Location**: `app/(student)/student/courses/[courseSlug]/page.tsx` line 226

2. **Simplify responsive positioning**: Complex positioning can cause layout issues
   - Test at all breakpoints (mobile, tablet, desktop)
   - Verify hero is not clipped or hidden

3. **Check overflow clipping**: overflow-x-hidden might clip hero content
   - Verify hero is not clipped on mobile/tablet
   - Consider removing overflow-hidden if not needed

4. **Check hero overflow**: overflow-hidden on hero container
   - Ensure background image is not clipped
   - Verify absolute positioning is correct

### Testing Steps

1. **Temporarily add background color** to hero container:
   ```css
   .hero-container { background-color: red !important; }
   ```
   - If red shows, container exists but image might not be loading
   - If red doesn't show, container is collapsed or hidden

2. **Check computed styles** in browser DevTools:
   - Height: Should be at least 240px (mobile) or 360px (desktop)
   - Position: Should be relative or absolute
   - Overflow: Check if hidden is clipping content
   - Z-index: Check stacking context

3. **Test at all breakpoints**:
   - Mobile (≤390px): Check if hero is visible
   - Tablet (~768px): Check layout transition
   - Desktop (≥1280px): Check if sidebar covers hero

