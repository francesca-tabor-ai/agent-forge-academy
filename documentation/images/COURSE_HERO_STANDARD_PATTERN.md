# CourseHero Standard Pattern Documentation

## Overview

The `CourseHero` component is the **single reusable component** for all course landing pages. This document defines the standard pattern that all course pages must follow.

## Standard Structure

All course landing pages MUST use the same `CourseHero` component structure:

```
┌─────────────────────────────────────────────────┐
│ Hero Wrapper (min-height, overflow-hidden)      │
│ ┌─────────────────────────────────────────────┐ │
│ │ Gradient Fallback Layer (absolute inset-0)  │ │
│ │ - ALWAYS visible (base layer)               │ │
│ │ - linear-gradient(135deg, #667eea, #764ba2) │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Background Image Layer (absolute inset-0)   │ │
│ │ - bg-cover bg-center                         │ │
│ │ - backgroundImage: url(imageUrl)             │ │
│ │ - Renders on top of gradient                 │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Solid Color Fallback (absolute inset-0)     │ │
│ │ - bg-gray-900 (only if all images fail)     │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Gradient Overlay (absolute inset-0)         │ │
│ │ - from-transparent via-black/30 to-black/90 │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ Content Container (relative, z-10)           │ │
│ │ ┌─────────────────────────────────────────┐ │ │
│ │ │ Inner Container (max-w-7xl, responsive)  │ │ │
│ │ │ - Title                                  │ │ │
│ │ │ - Metadata (category, difficulty, time)  │ │ │
│ │ │ - Actions (enroll/continue/share)        │ │ │
│ │ └─────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Required Elements

### 1. Hero Wrapper with Reliable Height

**Requirement**: Must have `min-height` at all breakpoints to prevent collapse.

```tsx
<div className="relative w-full min-h-[240px] sm:min-h-[280px] md:min-h-[320px] lg:min-h-[360px] overflow-hidden">
```

**Breakpoints**:
- Mobile (≤390px): `min-h-[240px]`
- Small (≥640px): `min-h-[280px]`
- Medium (≥768px): `min-h-[320px]`
- Large (≥1024px): `min-h-[360px]`

**Why**: Prevents hero from collapsing to 0 height if image fails to load.

### 2. Gradient Fallback Layer (Always Visible)

**Requirement**: Gradient background that's ALWAYS visible as base layer.

```tsx
<div
  className="absolute inset-0"
  style={{ 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}
/>
```

**Properties**:
- `absolute inset-0`: Full-bleed positioning
- `background`: CSS gradient (purple to blue)
- Always renders as base layer

**Why**: Ensures hero is NEVER blank, even if all images fail to load.

### 3. Background Image Layer

**Requirement**: Image rendered as background layer (not `<img>` tag).

```tsx
<div
  className="absolute inset-0 bg-cover bg-center"
  style={{ backgroundImage: `url(${currentImageUrl})` }}
>
  <img
    src={currentImageUrl}
    alt=""
    className="hidden"
    onError={handleImageError}
    onLoad={handleImageLoad}
  />
</div>
```

**Properties**:
- `absolute inset-0`: Full-bleed positioning
- `bg-cover bg-center`: Image fills container, centered
- `backgroundImage`: CSS background-image property
- Hidden `<img>` tag: Detects load errors via `onError` handler

**Why**: Background layer allows for overlay, better control, and fallback handling. Hidden `<img>` tag enables error detection.

### 4. Multi-Layer Fallback System

**Requirement**: Multiple fallback layers ensure hero is NEVER blank.

**Fallback Chain** (in order of priority):
1. **Gradient Fallback** (always visible as base layer)
   - `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
   - Always renders, ensures hero is never blank
2. **Course-specific `imageUrl`** (if valid)
   - Renders on top of gradient
   - If invalid, skips to next step
3. **Default fallback image URL** (`DEFAULT_FALLBACK_IMAGE`)
   - Used if `imageUrl` is invalid or fails to load
   - Triggered by `onError` handler
4. **Solid color fallback** (`bg-gray-900`)
   - Only visible if both image and gradient fail (unlikely)
   - Last resort fallback

**Error Handling**:
- `onError` handler: Switches to `DEFAULT_FALLBACK_IMAGE` if image fails
- URL validation: Checks if `imageUrl` is valid before using
- Prevents infinite loops: Only falls back once per error

**Why**: Multiple layers ensure hero is NEVER blank, even if:
- Image URL is missing
- Image URL is invalid
- Image fails to load
- Default fallback image also fails

### 5. Gradient Overlay for Readability

**Requirement**: Gradient overlay ensures text is readable over any background.

```tsx
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
```

**Properties**:
- `from-transparent`: Top is transparent (shows image)
- `via-black/30`: Middle has 30% black overlay
- `to-black/90`: Bottom has 90% black overlay (text area)

**Why**: Ensures white text is always readable, regardless of background image brightness.

### 6. Constrained Inner Content Container

**Requirement**: Content must be in a constrained, centered container.

```tsx
<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-8 sm:pb-12 md:pb-16 lg:pb-20">
```

**Properties**:
- `max-w-7xl`: Maximum width constraint (1280px)
- `mx-auto`: Centered horizontally
- Responsive padding: `px-4 sm:px-6 md:px-8 lg:px-12` (horizontal)
- Responsive padding: `pb-8 sm:pb-12 md:pb-16 lg:pb-20` (bottom)

**Why**: Prevents content from stretching too wide, ensures consistent layout.

## Component Usage

### Standard Usage

```tsx
import { CourseHero } from '@/components/courses/CourseHero';
import { getCourseCover } from '@/lib/courseCovers';

// In your course page component:
const courseCoverImage = getCourseCover(course || { 
  category: metadata?.category || staticMetadata?.category,
  industries: metadata?.industries || staticMetadata?.industries 
});

<CourseHero
  title={courseTitle}
  imageUrl={courseCoverImage}
  trackCategory={trackCategory}
  difficultyLevel={difficultyLevel}
  durationWeeks={durationWeeks}
  industries={industries}
  isEnrolled={!!enrollment}
  progressPercentage={enrollment?.progress_percentage}
  courseSlug={courseSlug}
  courseId={course?.id}
  nextLessonSlug={nextLessonSlug}
  firstLessonSlug={lessons[0]?.slug}
/>
```

### Required Props

- `title`: Course title (string, required)
- `imageUrl`: Image URL from `getCourseCover()` (string, required)
- `courseSlug`: Course slug for navigation (string, required)
- `isEnrolled`: Whether user is enrolled (boolean, required)

### Optional Props

- `trackCategory`: Track/category name
- `difficultyLevel`: Difficulty level (beginner/intermediate/advanced)
- `durationWeeks`: Course duration in weeks
- `industries`: Array of industry names
- `progressPercentage`: Enrollment progress (0-100)
- `courseId`: Course ID for enrollment
- `nextLessonSlug`: Next lesson slug
- `firstLessonSlug`: First lesson slug

## Image Resolution

The `imageUrl` prop should always come from `getCourseCover()`:

```tsx
import { getCourseCover } from '@/lib/courseCovers';

const courseCoverImage = getCourseCover(course || {
  category: metadata?.category || staticMetadata?.category,
  industries: metadata?.industries || staticMetadata?.industries,
});
```

**Priority**:
1. Course-specific `imageUrl` override (if valid)
2. Track/Category image from `TRACK_COVERS[category]`
3. Default fallback image

## Error Handling & Fallback System

The component includes **multiple layers of fallback** to ensure the hero is NEVER blank:

### Fallback Layers (Bottom to Top)

1. **Gradient Fallback** (Base Layer - Always Visible)
   - `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
   - Always renders as the base layer
   - Ensures hero is never completely blank

2. **Background Image Layer**
   - Course-specific `imageUrl` (if valid)
   - Renders on top of gradient
   - If invalid, component uses `DEFAULT_FALLBACK_IMAGE`

3. **Default Fallback Image**
   - `DEFAULT_FALLBACK_IMAGE` constant
   - Triggered by `onError` handler if image fails to load
   - Also used if `imageUrl` is invalid from the start

4. **Solid Color Fallback** (Last Resort)
   - `bg-gray-900` background color
   - Only visible if both image and gradient fail (unlikely)

### Error Detection

- **URL Validation**: `isValidImageUrl()` checks if URL is valid before using
- **Load Error Detection**: Hidden `<img>` tag with `onError` handler
- **Automatic Fallback**: Switches to `DEFAULT_FALLBACK_IMAGE` on error
- **Prevents Infinite Loops**: Only falls back once per error

### Why Multiple Layers?

This multi-layer approach ensures:
- ✅ Hero is NEVER blank (gradient always visible)
- ✅ Graceful degradation (falls back smoothly)
- ✅ No layout shifts (min-height prevents collapse)
- ✅ Works offline (gradient is CSS, no network required)

## Responsive Behavior

### Mobile (≤390px)
- Min height: 240px
- Stacked layout (title, metadata, actions vertical)
- Full-bleed breakout (respects sidebar overlay)

### Tablet (~768px)
- Min height: 320px
- Desktop layout starts
- Smooth transition from mobile

### Desktop (≥1280px)
- Min height: 360px
- Horizontal layout (title left, actions right)
- Normal flow within grid (no overlap)

## Z-Index Stacking

The component uses proper z-index stacking:

- **Background Image**: Default (z-0, implicit)
- **Gradient Overlay**: Default (z-0, implicit, above background)
- **Content Container**: `z-10` (above overlay)

**Note**: The hero wrapper itself should have `z-[60]` in the page layout to be above header (`z-50`).

## Accessibility

- `role="banner"`: Identifies hero as page banner
- `aria-label="Course hero banner"`: Descriptive label
- `aria-hidden="true"`: Background layers hidden from screen readers
- Semantic HTML: Proper heading hierarchy (h1 for title)

## Testing Checklist

When adding or modifying CourseHero:

- [ ] Hero has min-height at all breakpoints
- [ ] Gradient fallback is always visible (base layer)
- [ ] Background image renders correctly on top of gradient
- [ ] onError handler switches to fallback image
- [ ] Hero is NEVER blank (test with invalid URL, network offline)
- [ ] Gradient overlay ensures text readability
- [ ] Content container is constrained (max-w-7xl)
- [ ] Responsive padding works at all breakpoints
- [ ] Image error handling works (test with invalid URL)
- [ ] Z-index stacking is correct (hero above header)
- [ ] No layout shifts when image loads
- [ ] Works with all image sources (track, fallback, invalid)
- [ ] Multiple fallback layers work correctly

## Common Mistakes to Avoid

1. **Don't use `<img>` tag for display**: Use background-image instead (hidden `<img>` is OK for error detection)
2. **Don't skip min-height**: Always set min-height at all breakpoints
3. **Don't forget gradient fallback**: Gradient must always be visible as base layer
4. **Don't skip overlay**: Gradient overlay is required for readability
5. **Don't use per-course hacks**: Use this component for all courses
6. **Don't skip error handling**: Always validate and handle image errors with `onError`
7. **Don't leave hero blank**: Multiple fallback layers ensure hero is NEVER blank

## Maintenance

This component is the **single source of truth** for course hero images. All fixes and improvements should be made here, not in individual course pages.

When fixing hero image issues:
1. Fix in `CourseHero.tsx` component
2. All courses automatically benefit
3. No per-course hacks needed
4. Consistent UI across all courses

---

**Last Updated**: Phase 3 - Enhanced Fallback System (Multi-Layer)
**Status**: ✅ Complete - Hero is NEVER blank, multiple fallback layers enforced
