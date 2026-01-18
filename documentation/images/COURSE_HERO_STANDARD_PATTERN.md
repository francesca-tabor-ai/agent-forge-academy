# CourseHero Standard Pattern Documentation

## Overview

The `CourseHero` component is the **single reusable component** for all course landing pages. This document defines the standard pattern that all course pages must follow.

## Standard Structure

All course landing pages MUST use the same `CourseHero` component structure:

```
┌─────────────────────────────────────────────────┐
│ Hero Wrapper (min-height, overflow-hidden)      │
│ ┌─────────────────────────────────────────────┐ │
│ │ Background Image Layer (absolute inset-0)   │ │
│ │ - bg-cover bg-center                         │ │
│ │ - bg-gray-900 (fallback background)         │ │
│ │ - backgroundImage: url(imageUrl)             │ │
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

### 2. Background Image Layer

**Requirement**: Image rendered as background layer (not `<img>` tag).

```tsx
<div
  className="absolute inset-0 bg-cover bg-center bg-gray-900"
  style={{ backgroundImage: `url(${currentImageUrl})` }}
>
```

**Properties**:
- `absolute inset-0`: Full-bleed positioning
- `bg-cover bg-center`: Image fills container, centered
- `bg-gray-900`: Fallback background color (always visible)
- `backgroundImage`: CSS background-image property

**Why**: Background layer allows for overlay, better control, and fallback handling.

### 3. Fallback Background

**Requirement**: Must have fallback background color if no image.

```tsx
className="... bg-gray-900"
```

**Fallback Chain**:
1. Course-specific `imageUrl` (if valid)
2. Track/Category image from `TRACK_COVERS`
3. Default fallback image URL
4. `bg-gray-900` background color (always visible)

**Why**: Ensures hero is never completely blank, even if all images fail.

### 4. Gradient Overlay for Readability

**Requirement**: Gradient overlay ensures text is readable over any background.

```tsx
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
```

**Properties**:
- `from-transparent`: Top is transparent (shows image)
- `via-black/30`: Middle has 30% black overlay
- `to-black/90`: Bottom has 90% black overlay (text area)

**Why**: Ensures white text is always readable, regardless of background image brightness.

### 5. Constrained Inner Content Container

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

## Error Handling

The component includes automatic error handling:

1. **URL Validation**: Validates imageUrl before using it
2. **Fallback Image**: Uses `DEFAULT_FALLBACK_IMAGE` if URL is invalid
3. **Load Error Detection**: Detects image load failures
4. **Automatic Fallback**: Falls back to default image on error
5. **Background Color**: `bg-gray-900` always visible as last resort

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
- [ ] Background image renders correctly
- [ ] Fallback background color visible if image fails
- [ ] Gradient overlay ensures text readability
- [ ] Content container is constrained (max-w-7xl)
- [ ] Responsive padding works at all breakpoints
- [ ] Image error handling works (test with invalid URL)
- [ ] Z-index stacking is correct (hero above header)
- [ ] No layout shifts when image loads
- [ ] Works with all image sources (track, fallback, invalid)

## Common Mistakes to Avoid

1. **Don't use `<img>` tag**: Use background-image instead
2. **Don't skip min-height**: Always set min-height at all breakpoints
3. **Don't forget fallback**: Always have bg-gray-900 as last resort
4. **Don't skip overlay**: Gradient overlay is required for readability
5. **Don't use per-course hacks**: Use this component for all courses
6. **Don't skip error handling**: Always validate and handle image errors

## Maintenance

This component is the **single source of truth** for course hero images. All fixes and improvements should be made here, not in individual course pages.

When fixing hero image issues:
1. Fix in `CourseHero.tsx` component
2. All courses automatically benefit
3. No per-course hacks needed
4. Consistent UI across all courses

---

**Last Updated**: Phase 3 - Standard Pattern Implementation
**Status**: ✅ Complete - Ready for use across all course pages
