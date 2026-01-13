# Subscription Page Implementation

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

The subscription page supports two implementation approaches:

1. **Server-Side Rendering (Preferred)** - Direct DB fetch in server component
2. **Client-Side Fetching (Alternative)** - API route with SWR/React Query

## Approach 1: Server-Side Rendering (Preferred) ✅

**File:** `app/(student)/student/subscription/page.tsx`

This is the **recommended approach** for best performance and SEO.

### Implementation

```typescript
import { getSubscriptionData } from '@/lib/subscription/getSubscriptionData';

export default async function SubscriptionPageServer() {
  // ... auth checks ...
  
  // Direct server-side fetch (no client API call)
  const subscriptionData = await getSubscriptionData();
  
  return <SubscriptionPage subscriptionData={subscriptionData} />;
}
```

### Benefits

- ✅ **Best Performance** - No client-side API round-trip
- ✅ **SEO Friendly** - Data available on initial page load
- ✅ **Faster Load Times** - Direct database queries
- ✅ **No Loading States** - Data ready immediately
- ✅ **Better UX** - Instant content display

### When to Use

- Default choice for all pages
- When SEO is important
- When you want fastest possible load times
- When data doesn't need frequent refreshing

## Approach 2: Client-Side Fetching (Alternative)

**Files:**
- API Route: `app/api/student/subscription/route.ts`
- Hook: `lib/subscription/useSubscriptionData.ts`

Use this approach when the page **must** be a client component.

### API Route

**Endpoint:** `GET /api/student/subscription`

Returns `SubscriptionPageData` for the authenticated user.

```typescript
// Example usage
const response = await fetch('/api/student/subscription');
const data = await response.json();
```

### React Hooks

#### With SWR

```typescript
import useSWR from 'swr';
import { useSubscriptionDataSWR } from '@/lib/subscription/useSubscriptionData';

function MyComponent() {
  const { data, error, isLoading } = useSubscriptionDataSWR();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <SubscriptionContent data={data} />;
}
```

#### With React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { useSubscriptionDataQuery } from '@/lib/subscription/useSubscriptionData';

function MyComponent() {
  const { data, error, isLoading } = useSubscriptionDataQuery();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <SubscriptionContent data={data} />;
}
```

#### Manual Fetch (No Library)

```typescript
import { useSubscriptionDataManual } from '@/lib/subscription/useSubscriptionData';

function MyComponent() {
  const { data, error, isLoading } = useSubscriptionDataManual();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <SubscriptionContent data={data} />;
}
```

### Benefits

- ✅ **Automatic Refetching** - With SWR/React Query
- ✅ **Caching** - Reduces redundant API calls
- ✅ **Real-time Updates** - Can refresh on focus/reconnect
- ✅ **Client Component Support** - Works in client components

### When to Use

- Page must be a client component (interactive features)
- Need real-time data updates
- Want automatic refetching on focus/reconnect
- Building a dashboard with multiple data sources

## Current Implementation

The subscription page currently uses **Approach 1 (Server-Side Rendering)**:

```typescript
// app/(student)/student/subscription/page.tsx
export default async function SubscriptionPageServer() {
  // Auth checks...
  
  // Server-side fetch
  const subscriptionData = await getSubscriptionData();
  
  // Pass to client component
  return <SubscriptionPage subscriptionData={subscriptionData} />;
}
```

## Data Flow

### Server-Side Rendering Flow

```
User Request
    ↓
Server Component (page.tsx)
    ↓
getSubscriptionData() [server-only]
    ↓
Database Queries + Stripe API
    ↓
SubscriptionPageData
    ↓
Client Component (SubscriptionPage)
    ↓
Render UI
```

### Client-Side Fetching Flow

```
User Request
    ↓
Client Component
    ↓
useSubscriptionData() Hook
    ↓
API Route (/api/student/subscription)
    ↓
getSubscriptionData() [server-only]
    ↓
Database Queries + Stripe API
    ↓
JSON Response
    ↓
Hook Updates State
    ↓
Render UI
```

## Error Handling

### Server-Side

```typescript
try {
  const subscriptionData = await getSubscriptionData();
  if (!subscriptionData) {
    redirect('/auth/login');
  }
} catch (error) {
  console.error('Error:', error);
  redirect('/student/dashboard'); // Fallback
}
```

### Client-Side

```typescript
const { data, error, isLoading } = useSubscriptionData();

if (error) {
  return <ErrorComponent error={error} />;
}
```

## Performance Comparison

| Metric | Server-Side | Client-Side |
|--------|------------|-------------|
| Initial Load | ⚡ Fastest | 🐢 Slower (API call) |
| Time to First Byte | ⚡ Immediate | 🐢 After API response |
| SEO | ✅ Full | ❌ Limited |
| Caching | ✅ Built-in | ✅ SWR/React Query |
| Refetching | ❌ Manual | ✅ Automatic |

## Migration Guide

### From Client-Side to Server-Side

1. Convert page to async server component
2. Call `getSubscriptionData()` directly
3. Remove client-side fetching logic
4. Pass data as props to client components

### From Server-Side to Client-Side

1. Create API route (already exists)
2. Use `useSubscriptionData()` hook
3. Handle loading/error states
4. Add SWR or React Query if needed

## Best Practices

1. **Default to Server-Side** - Use unless you have a specific need for client-side
2. **Error Handling** - Always handle errors gracefully
3. **Loading States** - Show loading UI for client-side fetching
4. **Caching** - Use appropriate cache headers for API routes
5. **Type Safety** - Use TypeScript types consistently

## API Route Details

**Endpoint:** `GET /api/student/subscription`

**Authentication:** Required (uses session)

**Response:**
```typescript
{
  plan: { ... } | null,
  billing: { ... },
  nextInvoice: { ... } | null,
  invoices: [ ... ]
}
```

**Error Responses:**
- `401` - Unauthorized (not authenticated)
- `500` - Internal Server Error

**Cache Headers:**
- `Cache-Control: private, no-cache, no-store, must-revalidate`
- Prevents caching of sensitive subscription data

## Examples

### Example 1: Server-Side (Current)

See `app/(student)/student/subscription/page.tsx`

### Example 2: Client-Side with SWR

```typescript
'use client';

import { useSubscriptionDataSWR } from '@/lib/subscription/useSubscriptionData';

export default function SubscriptionPage() {
  const { data, error, isLoading } = useSubscriptionDataSWR();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <NoSubscription />;
  
  return <SubscriptionContent data={data} />;
}
```

### Example 3: Manual Client Fetch

```typescript
'use client';

import { useEffect, useState } from 'react';
import type { SubscriptionPageData } from '@/lib/subscription/getSubscriptionData';

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionPageData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/student/subscription')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (!data) return <NoSubscription />;
  
  return <SubscriptionContent data={data} />;
}
```

## Troubleshooting

### Issue: "User not authenticated" error

**Solution:** Ensure user is logged in and session is valid.

### Issue: Data not updating

**Server-Side:** Data is fetched once per page load. Use router.refresh() to refetch.

**Client-Side:** Check SWR/React Query cache settings.

### Issue: Slow page load

**Server-Side:** Check database query performance, add indexes if needed.

**Client-Side:** Consider switching to server-side rendering.

## Related Files

- `lib/subscription/getSubscriptionData.ts` - Server-side data loader
- `app/api/student/subscription/route.ts` - API route
- `lib/subscription/useSubscriptionData.ts` - React hooks
- `app/(student)/student/subscription/page.tsx` - Page component
