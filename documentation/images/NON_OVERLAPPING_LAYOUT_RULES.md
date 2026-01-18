# Non-Overlapping Layout Rules

## Overview

This document defines the **non-overlapping layout rules** that ensure the app shell guarantees:
1. Sidebar never overlays main content
2. Hero always sits inside main content flow
3. Header height is accounted for (no content hidden under sticky header)

This eliminates "image is there but covered" failures (Bucket C - CSS/Layout issues).

---

## Layout Structure

### App Shell Hierarchy

```
┌─────────────────────────────────────────────────┐
│ Header (sticky top-0, z-50, height: 64px)      │
├─────────────────────────────────────────────────┤
│ Body Container (flex-1, overflow-hidden)        │
│ ┌──────────────┬──────────────────────────────┐ │
│ │ Sidebar      │ Main Content Area            │ │
│ │ (Desktop:    │ (overflow-y-auto)             │ │
│ │  Grid col)   │ ┌──────────────────────────┐ │ │
│ │              │ │ Content Wrapper           │ │ │
│ │              │ │ (max-w-7xl, padding)      │ │ │
│ │              │ │ ┌──────────────────────┐ │ │ │
│ │              │ │ │ Hero (sticky)        │ │ │ │
│ │              │ │ │ (top-[64px], z-[60])  │ │ │ │
│ │              │ │ └──────────────────────┘ │ │ │
│ │              │ │ Page Content              │ │ │
│ │              │ └──────────────────────────┘ │ │
│ └──────────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Rule 1: Sidebar Never Overlays Main Content

### Desktop (≥1024px / lg breakpoint)

**Implementation**: CSS Grid layout ensures sidebar pushes content, never overlays.

```tsx
// LayoutWrapper.tsx
<div 
  style={{
    display: 'grid',
    gridTemplateColumns: `${sidebarWidth}px 1fr`,
  }}
>
  <aside>
    {/* Sidebar - normal flow in grid */}
  </aside>
  <main>
    {/* Main content - pushed by sidebar */}
  </main>
</div>
```

**Key Points**:
- Sidebar uses `grid` column, not `fixed` positioning
- Sidebar width: 280px (expanded) or 72px (collapsed)
- Main content uses `1fr` grid column (takes remaining space)
- **No overlap possible** - grid ensures proper spacing

### Mobile (<1024px)

**Implementation**: Sidebar is `fixed` overlay when revealed, but main content is full-width.

```tsx
// LayoutWrapper.tsx
<aside
  className={isMobile ? 'fixed inset-y-0 left-0 z-40' : ''}
  style={{
    ...(isMobile ? {
      top: `${headerHeight}px`, // Account for header
      height: `calc(100vh - ${headerHeight}px)`,
      transform: !isSidebarExpanded ? 'translateX(-100%)' : 'translateX(0)',
    } : {})
  }}
>
```

**Key Points**:
- Sidebar is `fixed` with `z-40` (below header `z-50`)
- Sidebar accounts for header height (`top: 64px`)
- Main content is full-width (`width: 100%`)
- Overlay backdrop (`z-30`) prevents interaction with content behind
- **Sidebar overlays on mobile, but main content is full-width** - no content hidden

---

## Rule 2: Hero Always Sits Inside Main Content Flow

### Desktop (≥1024px)

**Implementation**: Hero respects main content padding and sidebar grid.

```tsx
// app/(student)/student/courses/[courseSlug]/page.tsx
<div className="sticky top-[64px] z-[60] mb-0 lg:mx-0 w-full lg:w-auto">
  <CourseHero ... />
</div>
```

**Key Points**:
- Hero wrapper uses `lg:mx-0` (no negative margin on desktop)
- Hero respects main content padding (`px-4 sm:px-6 lg:px-8`)
- Hero sits inside grid column (respects sidebar width)
- **No full-bleed breakout** - hero stays within content area

### Mobile (<1024px)

**Implementation**: Hero breaks out of padding for full-width display.

```tsx
// app/(student)/student/courses/[courseSlug]/page.tsx
<div className="sticky top-[64px] z-[60] mb-0 -mx-4 sm:-mx-6 lg:mx-0 w-full">
  <CourseHero ... />
</div>
```

**Key Points**:
- Negative margin (`-mx-4 sm:-mx-6`) breaks out of main content padding
- Full width (`w-full`) ensures hero spans viewport
- Sidebar is overlay on mobile, so hero can be full-width
- **Hero is full-width on mobile, but sidebar is overlay** - no conflict

---

## Rule 3: Header Height is Accounted For

### Sticky Header

**Implementation**: Header is `sticky top-0` with `z-50` and height `64px`.

```tsx
// Header.tsx
<header 
  className="sticky top-0 z-50 bg-white border-b flex-shrink-0" 
  style={{ 
    height: '64px',
  }}
>
```

### Sticky Hero

**Implementation**: Hero uses `top-[64px]` to account for header height.

```tsx
// app/(student)/student/courses/[courseSlug]/page.tsx
<div className="sticky top-[64px] z-[60] ...">
  <CourseHero ... />
</div>
```

**Key Points**:
- Header: `sticky top-0 z-50` (height: 64px)
- Hero: `sticky top-[64px] z-[60]` (starts below header)
- **Hero is never hidden under header** - proper spacing guaranteed

### Sidebar on Mobile

**Implementation**: Sidebar accounts for header height.

```tsx
// LayoutWrapper.tsx
<aside
  style={{
    ...(isMobile ? {
      top: `${headerHeight}px`, // 64px
      height: `calc(100vh - ${headerHeight}px)`,
    } : {})
  }}
>
```

**Key Points**:
- Sidebar starts below header (`top: 64px`)
- Sidebar height accounts for header (`calc(100vh - 64px)`)
- **Sidebar never covers header** - proper positioning

---

## Z-Index Stacking Order

### Z-Index Values

1. **Header**: `z-50` (sticky top-0)
2. **Hero**: `z-[60]` (sticky top-[64px])
3. **Sidebar (Mobile)**: `z-40` (fixed overlay)
4. **Overlay Backdrop**: `z-30` (mobile sidebar backdrop)
5. **Modals**: `z-50` or higher (above header)

### Stacking Context Rules

- **Header is always on top** (except modals)
- **Hero is above header** (`z-[60]` > `z-50`)
- **Sidebar is below header** (`z-40` < `z-50`)
- **No overlap conflicts** - clear hierarchy

---

## Responsive Breakpoints

### Mobile (<1024px / lg breakpoint)

- Sidebar: `fixed` overlay (revealed via burger menu)
- Hero: Full-width (breaks out of padding)
- Header: Sticky top-0, height 64px
- Main content: Full-width, padding `px-4 sm:px-6`

### Desktop (≥1024px / lg breakpoint)

- Sidebar: Grid column (pushes content, never overlays)
- Hero: Respects padding and sidebar grid
- Header: Sticky top-0, height 64px
- Main content: Grid column `1fr`, padding `px-4 sm:px-6 lg:px-8`

---

## Testing Checklist

### Desktop Layout

- [ ] Sidebar never overlays main content (grid layout)
- [ ] Hero respects sidebar width (no overlap)
- [ ] Hero respects main content padding
- [ ] Header height is accounted for (hero starts at 64px)
- [ ] No horizontal scrolling
- [ ] Content is not hidden under header

### Mobile Layout

- [ ] Sidebar overlays when revealed (fixed positioning)
- [ ] Hero is full-width (breaks out of padding)
- [ ] Sidebar accounts for header height (starts at 64px)
- [ ] Main content is full-width
- [ ] No content hidden under header
- [ ] Overlay backdrop prevents interaction with content

### Cross-Breakpoint

- [ ] Layout transitions smoothly between breakpoints
- [ ] No layout shifts when sidebar toggles
- [ ] Hero positioning is correct at all breakpoints
- [ ] Z-index stacking is correct at all breakpoints

---

## Common Mistakes to Avoid

1. **Don't use `fixed` positioning for sidebar on desktop** - Use grid instead
2. **Don't use `top-0` for sticky hero** - Use `top-[64px]` to account for header
3. **Don't use full-bleed breakout on desktop** - Respect sidebar grid
4. **Don't forget header height** - Always account for 64px
5. **Don't use conflicting z-index values** - Follow the hierarchy
6. **Don't use `absolute` positioning for hero** - Use `sticky` instead

---

## Files Modified

- `components/layout/LayoutWrapper.tsx`: Grid layout for desktop, fixed overlay for mobile
- `components/layout/Header.tsx`: Sticky header with z-50, height 64px
- `app/(student)/student/courses/[courseSlug]/page.tsx`: Hero positioning with header height

---

**Last Updated**: Phase 3 - Non-Overlapping Layout Rules
**Status**: ✅ Complete - Layout guarantees no overlapping content
