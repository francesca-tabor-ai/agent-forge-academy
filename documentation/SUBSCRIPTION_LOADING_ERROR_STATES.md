# Subscription Page Loading & Error States

<style>
/* Architecture/Flow/Diagram/Code Block Styling - White Text on Black Background */
pre, code, pre code {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  border: 1px solid #333333;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
}

/* Ensure all code blocks maintain black background */
pre {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

/* Selection state - dark background, white text */
pre::selection, code::selection, pre code::selection {
  background-color: #333333 !important;
  color: #FFFFFF !important;
}

pre ::selection, code ::selection {
  background-color: #333333 !important;
  color: #FFFFFF !important;
}

/* Highlight/Mark state - dark accent, white text */
pre mark, code mark, pre code mark {
  background-color: #444444 !important;
  color: #FFFFFF !important;
}

/* Hover state - stay black */
pre:hover, code:hover {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}

/* Focus state - stay black with subtle outline */
pre:focus, code:focus {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  outline: 1px solid #666666;
}

/* Nested elements inherit white text */
pre *, code *, pre code * {
  color: #FFFFFF !important;
}

/* Prevent theme overrides */
pre.prose, code.prose {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}
</style>

## Overview

The subscription page uses Next.js App Router conventions for loading and error states with server-side rendering.

## Implementation

### 1. Loading State (`loading.tsx`)

**File:** `app/(student)/student/subscription/loading.tsx`

**Purpose:**
- Shows skeleton UI while the page is being server-rendered
- Automatically displayed by Next.js during page transitions
- Provides visual feedback that content is loading

**Features:**
- ✅ Skeleton matches actual page layout
- ✅ Animated pulse effect for better UX
- ✅ Includes all major sections:
  - Header skeleton
  - Plan card skeleton
  - Benefits skeleton
  - Billing information skeleton
  - Invoice list skeleton

**Usage:**
Next.js automatically shows this when:
- Navigating to `/student/subscription`
- Page is being server-rendered
- Data is being fetched from database

### 2. Error State (`error.tsx`)

**File:** `app/(student)/student/subscription/error.tsx`

**Purpose:**
- Catches errors during server-side rendering
- Displays user-friendly error messages
- Provides retry functionality

**Features:**
- ✅ Client component (required for error boundaries)
- ✅ Friendly error message
- ✅ Error details (for debugging)
- ✅ Retry button (calls `reset()` function)
- ✅ Navigation options (Dashboard, Refresh)
- ✅ Help section with support links

**Error Handling:**
- Catches errors from:
  - `getSubscriptionData()` function
  - Database queries
  - Stripe API calls
  - Any other server-side errors

**User Actions:**
1. **Try Again** - Calls `reset()` to retry rendering
2. **Go to Dashboard** - Navigate away
3. **Refresh Page** - Reload the page
4. **Contact Support** - Get help

## How It Works

### Server-Side Rendering Flow

```
User navigates to /student/subscription
    ↓
Next.js shows loading.tsx (skeleton)
    ↓
Server component (page.tsx) executes
    ↓
getSubscriptionData() fetches data
    ↓
Success → Render page
Error → Show error.tsx
```

### Error Boundary

Next.js App Router automatically wraps pages with error boundaries. When an error occurs:

1. Error is caught by `error.tsx`
2. User sees friendly error message
3. User can retry or navigate away
4. Error is logged to console

## Code Structure

### Loading Component

```typescript
// app/(student)/student/subscription/loading.tsx
export default function SubscriptionLoading() {
  return (
    <div className="space-y-8 authenticated-app animate-pulse">
      {/* Skeleton UI matching page layout */}
    </div>
  );
}
```

### Error Component

```typescript
// app/(student)/student/subscription/error.tsx
'use client';

export default function SubscriptionError({ error, reset }: ErrorProps) {
  return (
    <div>
      {/* Error message */}
      {/* Retry button */}
      {/* Navigation options */}
    </div>
  );
}
```

## Page Component Updates

**File:** `app/(student)/student/subscription/page.tsx`

**Changes:**
- Removed try/catch block (errors now handled by error.tsx)
- Let errors propagate to error boundary
- Cleaner code with automatic error handling

**Before:**
```typescript
try {
  subscriptionData = await getSubscriptionData();
} catch (error) {
  redirect('/student/dashboard'); // Fallback
}
```

**After:**
```typescript
// Errors automatically caught by error.tsx
const subscriptionData = await getSubscriptionData();
```

## Benefits

### Server-Side Rendering Approach

1. **Automatic Loading States**
   - Next.js shows `loading.tsx` automatically
   - No manual loading state management needed
   - Consistent UX across all page transitions

2. **Automatic Error Handling**
   - Errors caught by error boundary
   - No need for try/catch in every component
   - Centralized error handling

3. **Better Performance**
   - Loading state shown immediately
   - No client-side API calls
   - Faster perceived load time

4. **SEO Friendly**
   - Content available on initial load
   - Error states don't affect SEO
   - Proper HTTP status codes

## Alternative: Client-Side Fetching

If using client-side fetching (not recommended, but supported):

### Loading State

```typescript
const { data, error, isLoading } = useSubscriptionData();

if (isLoading) {
  return <SubscriptionLoadingSkeleton />;
}
```

### Error State

```typescript
if (error) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  );
}
```

## Testing

### Test Loading State

1. Navigate to `/student/subscription`
2. Observe skeleton UI during load
3. Verify skeleton matches page layout

### Test Error State

1. Simulate error in `getSubscriptionData()`
2. Verify error.tsx displays
3. Test retry button
4. Test navigation options

## Files Created

1. **`app/(student)/student/subscription/loading.tsx`**
   - Loading skeleton component
   - Matches page layout
   - Animated pulse effect

2. **`app/(student)/student/subscription/error.tsx`**
   - Error boundary component
   - User-friendly error messages
   - Retry and navigation options

## Next.js App Router Conventions

These files follow Next.js App Router conventions:

- **`loading.tsx`** - Automatically shown during page load
- **`error.tsx`** - Catches errors in page and nested routes
- Both files are in the same directory as `page.tsx`
- Next.js handles the integration automatically

## Best Practices

1. ✅ **Skeleton matches layout** - Users see familiar structure
2. ✅ **Animated loading** - Pulse effect indicates loading
3. ✅ **Friendly errors** - No technical jargon
4. ✅ **Actionable errors** - Users can retry or get help
5. ✅ **Error logging** - Errors logged for debugging
6. ✅ **Graceful degradation** - Fallback options available

## Related Documentation

- [Next.js Loading UI](https://nextjs.org/docs/app/api-reference/file-conventions/loading)
- [Next.js Error Handling](https://nextjs.org/docs/app/api-reference/file-conventions/error)
