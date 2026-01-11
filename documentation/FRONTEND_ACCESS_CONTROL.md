# Frontend Access Control - Course Visibility

## Overview

This document describes the frontend logic for course visibility and access control based on subscription tiers. The frontend provides visual feedback to users about which courses they can access and prompts them to upgrade when needed.

## UI Logic Flow

### High-Level Flow

```
User visits /student/courses
    ↓
Server fetches:
  - All published courses
  - User's subscription tier
  - User's enrollments
    ↓
Frontend receives:
  - courses[]
  - subscriptionTier: 'essential' | 'professional' | null
  - enrollments: Record<courseId, enrollment>
    ↓
For each course:
  - Check if course is locked: isCourseLocked(courseSlug, subscriptionTier)
    ↓
  ┌─────────────────┬─────────────────┐
  │   Professional  │    Essential     │
  └────────┬────────┴────────┬────────┘
           │                  │
           │                  │
    ┌──────▼──────┐    ┌──────▼──────┐
    │ All courses │    │ Check if    │
    │ accessible  │    │ in allowed  │
    │             │    │ list        │
    └─────────────┘    └──────┬──────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────▼──────┐      ┌───────▼──────┐
            │ In allowed   │      │ Not in       │
            │ list         │      │ allowed list │
            │              │      │              │
            │ Show as      │      │ Show as      │
            │ clickable    │      │ locked       │
            └──────────────┘      └──────┬───────┘
                                         │
                                  ┌──────▼──────┐
                                  │ Show lock   │
                                  │ icon & badge│
                                  │             │
                                  │ On click:   │
                                  │ Show upgrade│
                                  │ modal       │
                                  └─────────────┘
```

## Conditional Rendering Rules

### Rule 1: Professional Users

**Condition**: `subscriptionTier === 'professional'`

**Rendering**:
- ✅ All courses shown as **clickable** (normal state)
- ✅ No lock icons or badges
- ✅ Standard hover effects and interactions
- ✅ Direct navigation to course on click

**Code**:
```typescript
const isLocked = isCourseLocked(course.slug, subscriptionTier);
// For Professional: isLocked = false for all courses
```

### Rule 2: Essential Users - Allowed Courses

**Condition**: `subscriptionTier === 'essential'` AND `course.slug` is in `ESSENTIAL_TIER_COURSES`

**Allowed Courses**:
- `prompt-engineering`
- `ai-content-pipelines`
- `reddit-ai-visibility`
- `seo-to-aeo`
- `ai-governance-eu-ai-act`

**Rendering**:
- ✅ Course shown as **clickable** (normal state)
- ✅ No lock icons or badges
- ✅ Standard hover effects and interactions
- ✅ Direct navigation to course on click

**Code**:
```typescript
const isLocked = isCourseLocked(course.slug, subscriptionTier);
// For Essential + allowed course: isLocked = false
```

### Rule 3: Essential Users - Restricted Courses

**Condition**: `subscriptionTier === 'essential'` AND `course.slug` is NOT in `ESSENTIAL_TIER_COURSES`

**Rendering**:
- ❌ Course shown as **locked/disabled**
- 🔒 Lock icon overlay on thumbnail
- 🏷️ "Professional Access Required" badge
- 📉 Reduced opacity (75%)
- 🚫 No hover effects
- 💬 "Upgrade to Unlock" text in footer
- 🎯 On click: Show upgrade modal (don't navigate)

**Visual Indicators**:
1. **Lock Badge**: Amber-colored badge at top of card
2. **Thumbnail Overlay**: Dark overlay with lock icon
3. **Reduced Opacity**: Card appears dimmed
4. **Footer Text**: "Upgrade to Unlock" with lock icon
5. **Cursor**: `cursor-not-allowed`

**Code**:
```typescript
const isLocked = isCourseLocked(course.slug, subscriptionTier);
// For Essential + restricted course: isLocked = true

if (isLocked) {
  // Render locked card with upgrade modal trigger
}
```

### Rule 4: No Subscription

**Condition**: `subscriptionTier === null`

**Rendering**:
- ❌ All courses shown as **locked**
- 🔒 Same locked state as Essential restricted courses
- 💬 Upgrade prompt to get any subscription

## Component Structure

### CourseCard Component

```typescript
interface CourseCardProps {
  course: Course;
  metadata?: CourseMetadata;
  enrollment?: Enrollment | null;
  subscriptionTier?: SubscriptionTier | null;
}
```

**Logic**:
```typescript
const isLocked = isCourseLocked(course.slug, subscriptionTier);

// Conditional rendering
{isLocked ? (
  <div onClick={showUpgradeModal}>
    {/* Locked card UI */}
  </div>
) : (
  <Link href={`/student/courses/${course.slug}`}>
    {/* Normal card UI */}
  </Link>
)}
```

### UpgradeModal Component

**Trigger**: Click on locked course card

**Content**:
- Course title
- Upgrade message
- Benefits list
- Pricing information
- CTA buttons

**Actions**:
- "Upgrade to Professional Access" → Navigate to `/student/subscription`
- "Maybe Later" → Close modal

## Copy Suggestions for Locked Courses

### Lock Badge Text
**Primary**: "Professional Access Required"
**Alternative**: "Upgrade Required" | "Premium Course"

### Footer Text (Locked State)
**Primary**: "Upgrade to Unlock"
**Alternatives**:
- "Unlock with Professional Access"
- "Upgrade to Access"
- "Get Professional Access"

### Upgrade Modal - Headline
**Primary**: "Unlock [Course Title]"
**Alternative**: "Upgrade to Access [Course Title]"

### Upgrade Modal - Description
**Primary**:
```
This course requires Professional Access. Upgrade your
subscription to access this course and unlock all courses
on the platform.
```

**Alternatives**:
```
Unlock this course and get access to all courses with
Professional Access. Upgrade now to start learning.
```

```
This course is available with Professional Access.
Upgrade to unlock this course and the entire course library.
```

### Upgrade Modal - Benefits List

**Primary Benefits**:
- ✅ Access to all courses on the platform
- ✅ Unlimited course enrollments
- ✅ Priority support and updates

**Alternative Benefits**:
- ✅ Full course library access
- ✅ Advanced course content
- ✅ Exclusive resources and materials
- ✅ Early access to new courses

### Upgrade Modal - CTA Button
**Primary**: "Upgrade to Professional Access"
**Alternatives**:
- "Get Professional Access"
- "Upgrade Now"
- "Unlock All Courses"

### Upgrade Modal - Secondary Action
**Primary**: "Maybe Later"
**Alternatives**:
- "Not Now"
- "View Plans"
- "Learn More"

### Upgrade Modal - Footer Link
**Primary**: "View all subscription plans"
**Alternative**: "Compare plans" | "See pricing"

## Visual Design Guidelines

### Locked Course Card Styling

**Border**: `border-gray-300` (lighter, less prominent)
**Opacity**: `opacity-75` (dimmed appearance)
**Cursor**: `cursor-not-allowed`
**Hover**: No hover effects (disabled state)

### Lock Icon
- **Color**: Amber (`text-amber-600`) for badges
- **Size**: `w-4 h-4` for badges, `w-8 h-8` for thumbnail overlay
- **Position**: Top of card (badge) and center of thumbnail (overlay)

### Thumbnail Overlay
- **Background**: `bg-gray-900/40` (semi-transparent dark)
- **Lock Icon**: White, centered
- **Effect**: Clearly indicates locked state

### Badge Styling
- **Background**: Amber/yellow tint
- **Text**: Amber/dark amber
- **Position**: Below category badge, above thumbnail

## User Interaction Flow

### Clicking a Locked Course

```
User clicks locked course card
    ↓
Prevent default navigation
    ↓
Show UpgradeModal
    ↓
User sees:
  - Course title
  - Upgrade benefits
  - Pricing
  - CTA buttons
    ↓
User clicks "Upgrade to Professional Access"
    ↓
Navigate to /student/subscription
    ↓
User completes upgrade
    ↓
Return to courses page
    ↓
Course now shows as unlocked
```

### Clicking an Unlocked Course

```
User clicks unlocked course card
    ↓
Navigate to /student/courses/[courseSlug]
    ↓
Backend validates access (API route guard)
    ↓
If access granted: Show course content
If access denied: Show 403 error
```

## Implementation Files

### Core Files

1. **`lib/utils/course-access-frontend.ts`**
   - `isCourseAccessible()` - Check if course is accessible
   - `isCourseLocked()` - Check if course is locked
   - `getCourseLockReason()` - Get lock reason message
   - `getUpgradeMessage()` - Get upgrade CTA message

2. **`components/courses/CourseCard.tsx`**
   - Main course card component
   - Handles locked/unlocked states
   - Triggers upgrade modal

3. **`components/courses/UpgradeModal.tsx`**
   - Upgrade prompt modal
   - Benefits and pricing display
   - CTA buttons

4. **`components/courses/CoursesPageClient.tsx`**
   - Course listing page client component
   - Passes subscription tier to CourseCard

5. **`app/(student)/student/courses/page.tsx`**
   - Server component
   - Fetches subscription tier
   - Passes to client component

## Testing Scenarios

### Scenario 1: Professional User
- ✅ All courses visible and clickable
- ✅ No lock icons or badges
- ✅ Normal hover effects

### Scenario 2: Essential User - Allowed Course
- ✅ Course visible and clickable
- ✅ No lock icons or badges
- ✅ Normal hover effects

### Scenario 3: Essential User - Restricted Course
- ✅ Course visible but locked
- ✅ Lock badge displayed
- ✅ Thumbnail overlay with lock icon
- ✅ Reduced opacity
- ✅ "Upgrade to Unlock" in footer
- ✅ Click shows upgrade modal
- ✅ No navigation on click

### Scenario 4: No Subscription
- ✅ All courses locked
- ✅ Same visual treatment as Essential restricted courses
- ✅ Upgrade prompts throughout

## Best Practices

1. **Fail-Secure**: When subscription tier is unknown, show courses as locked
2. **Clear Visual Feedback**: Use multiple visual indicators (badge, overlay, opacity)
3. **Helpful Messaging**: Provide clear upgrade paths and benefits
4. **Consistent UX**: Same locked state treatment across all restricted courses
5. **Accessible**: Ensure locked state is clear to screen readers
6. **Performance**: Check access client-side for UI, but always validate server-side

## Accessibility Considerations

- Lock icons should have `aria-label` attributes
- Locked cards should have `aria-disabled="true"`
- Upgrade modal should be keyboard accessible
- Focus management when modal opens/closes
- Screen reader announcements for locked state

## Future Enhancements

1. **Trial Period**: Show trial countdown for trial users
2. **Course Preview**: Allow preview of locked course content
3. **Wishlist**: Let users save locked courses for later
4. **Bulk Upgrade**: Show upgrade prompt when multiple locked courses are viewed
5. **Personalized Recommendations**: Suggest similar unlocked courses
