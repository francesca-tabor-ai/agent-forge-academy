# Role-Based Routing in Next.js App Router

## Overview

Role-based routing is enforced server-side in Next.js middleware and layout components. Client-side checks are for UX only and never for security.

## Implementation

### Middleware (middleware.ts)

The middleware enforces role-based routing at the edge:

1. **Authentication Check**: Verifies user is authenticated
2. **Onboarding Check**: Verifies onboarding is completed
3. **Role Check**: Verifies user has appropriate role for the route

### Route Protection

Routes are protected by role:

- `/student/*` - Requires `student` role
- `/tutor/*` - Requires `instructor` or `tutor` role
- `/recruiter/*` - Requires `recruiter` role
- `/admin/*` - Requires `admin` role

### Layout Components

Each role group has a layout that:
1. Checks role server-side
2. Redirects if role doesn't match
3. Uses shared `AuthenticatedLayout` component

### Example: Student Layout

```typescript
import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isStudent = await hasRole('student');

  if (!isStudent) {
    redirect('/');
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
```

## Security Principles

1. **Server-Side Only**: All role checks happen server-side
2. **Default Deny**: Unauthorized users are redirected
3. **No Client-Side Security**: Frontend checks are for UX only
4. **RLS Backup**: Database RLS policies enforce access even if routing fails

## Onboarding Flow

1. User signs up or logs in
2. If `onboarding_completed = false`, redirect to `/auth/onboarding`
3. User selects role (student, instructor, recruiter)
4. Role is set and `onboarding_completed = true`
5. User is redirected to appropriate dashboard

## Role Mapping

- `tutor` and `instructor` are treated as the same role for routing
- UI uses `instructor` terminology
- Database may have either `tutor` or `instructor` (migration handles both)

## Error Handling

- Unauthorized access: Redirect to home page
- Incomplete onboarding: Redirect to onboarding page
- No role: Redirect to onboarding page
- Invalid role: Redirect to home page

