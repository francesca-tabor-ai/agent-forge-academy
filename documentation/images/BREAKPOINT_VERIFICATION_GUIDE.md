# Cross-Breakpoint Verification Guide for Hero Images

## Overview

This guide documents the expected behavior of hero images at different viewport sizes and provides a testing checklist.

## Breakpoint Definitions

Based on Tailwind CSS breakpoints and CourseHero component:

- **Mobile**: ≤ 390px (base, no prefix)
- **Tablet**: ~768px (md breakpoint)
- **Desktop**: ≥ 1280px (xl breakpoint, but lg is 1024px)

### Tailwind Breakpoints Reference
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Expected Behavior by Breakpoint

### CourseHero Component (`components/courses/CourseHero.tsx`)

#### Mobile (≤ 390px)
- **Min Height**: 240px (`min-h-[240px]`)
- **Layout**: Stacked (vertical)
- **Title**: `text-3xl` (30px)
- **Padding**: `px-4`, `pb-8`
- **Image**: Full-bleed background, `bg-cover bg-center`
- **Expected Issues**: 
  - Hero may appear collapsed if image fails to load
  - Minimum height should prevent collapse
  - Text should remain readable with gradient overlay

#### Tablet (~768px)
- **Min Height**: 320px (`md:min-h-[320px]`)
- **Layout**: Desktop layout starts (`hidden md:block`)
- **Title**: `text-5xl` (48px)
- **Padding**: `px-8`, `pb-16`
- **Image**: Full-bleed background, `bg-cover bg-center`
- **Expected Issues**:
  - Transition from mobile to desktop layout
  - Image should scale properly
  - No layout shifts

#### Desktop (≥ 1280px)
- **Min Height**: 360px (`lg:min-h-[360px]`)
- **Layout**: Horizontal (title left, actions right)
- **Title**: `text-7xl` (72px) (`xl:text-7xl`)
- **Padding**: `px-12`, `pb-20`
- **Image**: Full-bleed background, `bg-cover bg-center`
- **Expected Issues**:
  - Image should cover full width
  - No cropping of important image areas
  - Text should be clearly readable

## Common Issues by Breakpoint

### Mobile (≤ 390px)
1. **Collapsed Hero Height**
   - **Symptom**: Hero area appears too small or collapsed
   - **Cause**: Image fails to load, min-height not enforced
   - **Check**: Verify `min-h-[240px]` is applied
   - **Fix**: Ensure fallback image loads, check CSS

2. **Image Not Visible**
   - **Symptom**: No background image visible
   - **Cause**: Image URL invalid, network error, or CSS issue
   - **Check**: Inspect element, check `backgroundImage` style
   - **Fix**: Verify image URL, check error handling

3. **Text Overlap**
   - **Symptom**: Title or buttons overlap with image
   - **Cause**: Insufficient padding or z-index issues
   - **Check**: Verify padding and z-index values
   - **Fix**: Adjust padding or z-index

### Tablet (~768px)
1. **Layout Shift**
   - **Symptom**: Content jumps when resizing
   - **Cause**: Different layouts for mobile/desktop
   - **Check**: Verify smooth transition at 768px
   - **Fix**: Ensure consistent spacing

2. **Image Cropping**
   - **Symptom**: Important parts of image cut off
   - **Cause**: `bg-cover` may crop image
   - **Check**: Verify image aspect ratio vs container
   - **Fix**: Adjust `bg-cover` to `bg-contain` if needed (not recommended)

### Desktop (≥ 1280px)
1. **Image Stretching**
   - **Symptom**: Image appears stretched or distorted
   - **Cause**: Aspect ratio mismatch
   - **Check**: Verify image dimensions vs viewport
   - **Fix**: Use appropriate image dimensions or `object-fit`

2. **Blank Hero Area**
   - **Symptom**: Empty space where image should be
   - **Cause**: Image URL invalid or failed to load
   - **Check**: Verify image loads, check console for errors
   - **Fix**: Ensure fallback image works

## Testing Checklist Format

For each course page, test at all three breakpoints:

| Breakpoint | Hero Image Shows? | Fallback Shows? | Height Correct? | Layout Correct? | Notes |
|------------|-------------------|-----------------|-----------------|-----------------|-------|
| Mobile (≤390px) | Yes/No | Yes/No | Yes/No | Yes/No | Issues found |
| Tablet (~768px) | Yes/No | Yes/No | Yes/No | Yes/No | Issues found |
| Desktop (≥1280px) | Yes/No | Yes/No | Yes/No | Yes/No | Issues found |

## Manual Testing Steps

### 1. Open Browser DevTools
- Chrome/Edge: F12 or Right-click → Inspect
- Firefox: F12 or Right-click → Inspect Element
- Safari: Cmd+Option+I

### 2. Enable Device Toolbar
- Chrome/Edge: Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)
- Firefox: Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)
- Safari: Cmd+Option+R

### 3. Set Viewport Sizes

#### Mobile (≤ 390px)
- Select device: iPhone SE (375px) or Custom: 390px
- Or manually set width to 390px

#### Tablet (~768px)
- Select device: iPad (768px) or Custom: 768px
- Or manually set width to 768px

#### Desktop (≥ 1280px)
- Select device: Desktop or Custom: 1280px
- Or manually set width to 1280px

### 4. Test Each Course Page

For each course:
1. Navigate to `/student/courses/[courseSlug]`
2. Check at Mobile (390px):
   - [ ] Hero image is visible
   - [ ] Hero height is at least 240px
   - [ ] Text is readable
   - [ ] No layout issues
3. Check at Tablet (768px):
   - [ ] Hero image is visible
   - [ ] Hero height is at least 320px
   - [ ] Layout transition is smooth
   - [ ] No layout shifts
4. Check at Desktop (1280px):
   - [ ] Hero image is visible
   - [ ] Hero height is at least 360px
   - [ ] Image covers full width
   - [ ] Text is clearly readable

### 5. Document Issues

For each issue found:
- **Breakpoint**: Mobile/Tablet/Desktop
- **Course**: Course name and slug
- **Issue**: Description of the problem
- **Screenshot**: If possible
- **Severity**: Critical/High/Medium/Low

## Automated Testing (Future)

The following can be automated:
- Image URL validation
- Fallback image verification
- CSS class presence
- Minimum height enforcement

The following require manual testing:
- Visual appearance
- Layout correctness
- Text readability
- Image cropping/stretching

## Expected CSS Classes

### Container
```css
.relative.w-full.min-h-[240px].sm:min-h-[280px].md:min-h-[320px].lg:min-h-[360px]
```

### Background Image
```css
.absolute.inset-0.bg-cover.bg-center.bg-gray-900
```

### Content Container
```css
.relative.h-full.min-h-[240px].sm:min-h-[280px].md:min-h-[320px].lg:min-h-[360px]
```

## Troubleshooting

### Image Not Showing
1. Check browser console for errors
2. Verify image URL is valid
3. Check network tab for failed requests
4. Verify fallback image loads
5. Check CSS `backgroundImage` style

### Collapsed Height
1. Verify `min-h-[240px]` is applied
2. Check if image failed to load
3. Verify fallback image works
4. Check for CSS conflicts

### Layout Issues
1. Check viewport meta tag
2. Verify responsive classes are applied
3. Check for CSS conflicts
4. Verify z-index values

## Notes

- All hero images should have a minimum height at each breakpoint
- Fallback images should work at all breakpoints
- Text should remain readable with gradient overlay
- Images should use `bg-cover` to fill container
- No layout shifts should occur when resizing
