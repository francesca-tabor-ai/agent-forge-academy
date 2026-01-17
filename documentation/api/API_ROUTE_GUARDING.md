# API Route Guarding - Course Access Control

## Overview

This document explains how the course access guard middleware integrates with the API routes to enforce subscription-based access control.

## Route Protection

The course access guard middleware protects the following route:

- **`GET /api/courses/:courseId`** - Fetch course details by ID

## Middleware Function

### Location
`lib/middleware/course-access-guard.ts`

### Functions

1. **`guardCourseAccess(requestUserId?, courseId?)`**
   - Full-featured guard with detailed error messages
   - Handles authentication internally
   - Provides specific error messages based on subscription status

2. **`guardCourseAccessViaDB(userId, courseId)`**
   - Optimized version using database function
   - Requires pre-authenticated userId
   - More efficient for server-side checks

## How It Works

### Step-by-Step Process

```
1. User makes request → GET /api/courses/:courseId
   ↓
2. API Route Handler receives request
   ↓
3. Authenticate user (check auth token)
   ↓
4. Call guardCourseAccessViaDB(userId, courseId)
   ↓
5. Guard middleware:
   a. Verify course exists and is published
   b. Check subscription access using database function
   c. Return access decision
   ↓
6. If access allowed (200):
   → Fetch and return course data
   ↓
7. If access denied (401/403):
   → Return error response with appropriate status code
```

### Access Control Flow

```
┌─────────────────┐
│  API Request    │
│  /api/courses/:id│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Authenticate    │
│ User            │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 401     200 OK
Unauthorized  │
              ▼
    ┌─────────────────┐
    │ Guard Middleware│
    │ - Check course  │
    │ - Check sub     │
    └────────┬────────┘
             │
        ┌────┴────┐
        │         │
        ▼         ▼
      403       200
    Forbidden   OK
        │         │
        │         ▼
        │    ┌─────────────┐
        │    │ Return      │
        │    │ Course Data │
        │    └─────────────┘
        │
        ▼
   ┌─────────────┐
   │ Return      │
   │ Error       │
   └─────────────┘
```

## HTTP Status Codes

The middleware returns the following status codes:

| Status Code | Meaning | When Returned |
|------------|---------|---------------|
| **200 OK** | Access granted | User is authenticated, has active subscription, and has permission to access the course |
| **401 Unauthorized** | Not authenticated | User is not logged in or authentication token is invalid |
| **403 Forbidden** | Access denied | User is authenticated but:<br>- Has no subscription<br>- Subscription is inactive/expired<br>- Subscription tier doesn't include this course |
| **404 Not Found** | Course not found | Course ID doesn't exist or course is not published |
| **500 Internal Server Error** | Server error | Unexpected error occurred during access check |

## Integration Example

### API Route Implementation

```typescript
// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { guardCourseAccessViaDB } from '@/lib/middleware/course-access-guard';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    
    // Step 1: Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Step 2: Guard course access
    const guardResult = await guardCourseAccessViaDB(user.id, params.id);
    
    if (!guardResult.allowed) {
      return NextResponse.json(
        { error: guardResult.error },
        { status: guardResult.status }
      );
    }

    // Step 3: Fetch and return course data
    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .single();

    return NextResponse.json(course);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Response Examples

### Success (200 OK)

```json
{
  "id": "course-uuid",
  "slug": "prompt-engineering",
  "title": "Prompt Engineering",
  "description": "Write prompts that are reliable...",
  "isPublished": true,
  ...
}
```

### Unauthorized (401)

```json
{
  "error": "Unauthorized. Please log in to access this course."
}
```

### Forbidden - No Subscription (403)

```json
{
  "error": "Access denied. A subscription is required to access this course."
}
```

### Forbidden - Insufficient Tier (403)

```json
{
  "error": "Access denied. This course requires Professional Access. Please upgrade your subscription."
}
```

### Forbidden - Expired Subscription (403)

```json
{
  "error": "Access denied. Your subscription is not active or has expired."
}
```

### Not Found (404)

```json
{
  "error": "Course not found"
}
```

## Integration with Other API Routes

The guard middleware can be reused in other API routes that need course access control:

### Example: Course Enrollment Route

```typescript
// app/api/courses/enroll/route.ts
import { guardCourseAccessViaDB } from '@/lib/middleware/course-access-guard';

export async function POST(request: NextRequest) {
  const { courseId } = await request.json();
  
  // Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Guard course access
  const guardResult = await guardCourseAccessViaDB(user.id, courseId);
  if (!guardResult.allowed) {
    return NextResponse.json(
      { error: guardResult.error },
      { status: guardResult.status }
    );
  }

  // Proceed with enrollment
  // ...
}
```

### Example: Course Lessons Route

```typescript
// app/api/courses/:courseId/lessons/route.ts
export async function GET(request: NextRequest, { params }) {
  // Use guard middleware before returning lessons
  const guardResult = await guardCourseAccessViaDB(user.id, params.courseId);
  if (!guardResult.allowed) {
    return NextResponse.json(
      { error: guardResult.error },
      { status: guardResult.status }
    );
  }
  // Return lessons...
}
```

## Benefits of Middleware Approach

1. **Reusability**: Single guard function used across multiple routes
2. **Consistency**: Same access control logic everywhere
3. **Maintainability**: Update access logic in one place
4. **Testability**: Guard function can be tested independently
5. **Performance**: Database function runs checks efficiently
6. **Security**: Centralized security logic reduces vulnerabilities

## Error Handling

The middleware handles all edge cases:

- ✅ Invalid user ID
- ✅ Invalid course ID
- ✅ Missing subscription
- ✅ Inactive subscription
- ✅ Expired subscription
- ✅ Insufficient tier (Essential trying to access Professional-only course)
- ✅ Unpublished course
- ✅ Database errors
- ✅ Unexpected exceptions

## Testing

Test the guard middleware with:

1. **Unauthenticated requests** → Should return 401
2. **Users without subscriptions** → Should return 403
3. **Essential users accessing allowed courses** → Should return 200
4. **Essential users accessing restricted courses** → Should return 403
5. **Professional users accessing any course** → Should return 200
6. **Invalid course IDs** → Should return 404

See `tests/subscription-access.test.ts` for comprehensive test scenarios.

## Performance Considerations

- The `guardCourseAccessViaDB` function uses a database function (`has_course_access`) which runs checks efficiently in PostgreSQL
- All database queries are optimized with proper indexes
- Access checks are cached at the database level where possible
- Minimal round trips to the database (single RPC call for access check)

## Security Notes

- **Never bypass the guard**: Always use the guard middleware for course access
- **Fail-secure**: On errors, deny access by default
- **Logging**: All access denials are logged for security auditing
- **Rate limiting**: Consider adding rate limiting for repeated access attempts
- **Token validation**: Authentication tokens are validated by Supabase Auth

## Future Enhancements

Potential improvements:

1. **Caching**: Cache subscription status for active sessions
2. **Rate limiting**: Add rate limiting for access checks
3. **Audit logging**: Log all access attempts for security auditing
4. **Webhook integration**: Update access on subscription changes
5. **Trial period handling**: Special handling for trial subscriptions
