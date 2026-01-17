# Jobs API 500 Error Fix

## Root Cause Analysis

The `/api/jobs` endpoint was returning 500 errors in the following scenarios:

1. **Missing Student Profile**: When a student profile didn't exist, the API returned 404/500 instead of gracefully handling it
2. **Missing Student Data**: When student data (enrollments, projects) couldn't be fetched, it threw errors instead of returning an empty list
3. **Inconsistent Error Format**: Errors didn't follow a consistent format, making debugging difficult
4. **Missing Request IDs**: Errors didn't include request IDs for tracking in production logs

## Changes Made

### 1. API Route Handler (`app/api/jobs/route.ts`)

#### Query Parameter Parsing
- Added `parseJobsQuery()` function with safe defaults:
  - `matchMin`: defaults to 0, clamped to 0-100
  - `matchMax`: defaults to 100, clamped to 0-100
  - `skills`: accepts comma-separated or repeated params, max 10, max 50 chars each
  - `sort`: defaults to 'best-match'
  - `search`: max 80 characters, empty strings normalized to undefined
  - Auto-swaps matchMin/matchMax if min > max

#### Error Handling Improvements
- **Missing Student Profile**: Returns 200 with empty list and `reason: 'PROFILE_INCOMPLETE'` instead of 404/500
- **Missing Student Data**: Returns 200 with empty list and `reason: 'PROFILE_INCOMPLETE'` instead of 500
- **Database Errors**: Wrapped in try/catch with full stack trace logging
- **All Errors**: Include `requestId` for production debugging

#### Response Format Standardization
All responses now follow this format:

**Success:**
```json
{
  "ok": true,
  "jobs": [...],
  "total": 0
}
```

**Empty State (Profile Incomplete):**
```json
{
  "ok": true,
  "jobs": [],
  "total": 0,
  "reason": "PROFILE_INCOMPLETE",
  "missingFields": ["student_profile"]
}
```

**Error:**
```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED" | "INVALID_PARAMS" | "SERVER_ERROR" | "FORBIDDEN",
    "message": "Human-readable error message"
  },
  "requestId": "req-1234567890-abc123"
}
```

#### Comprehensive Logging
- Request ID included in all log entries
- Full stack traces for all errors
- Query parameter logging
- Database query duration tracking
- Matching calculation duration tracking

### 2. Frontend Component (`components/jobs/JobOpportunitiesPage.tsx`)

#### Error Handling
- Checks for `ok: false` in response (even with 200 status)
- Extracts and displays `requestId` in error messages
- Handles `PROFILE_INCOMPLETE` reason gracefully (no error shown, just empty state)
- Improved error messages with request ID for support

#### Response Validation
- Validates response structure before processing
- Handles both old and new response formats (backward compatible)
- Gracefully handles empty states with reasons

### 3. Unit Tests (`tests/unit/jobs-query-parsing.test.ts`)

Added comprehensive unit tests for:
- Invalid query parameter handling
- Value clamping (0-100 range)
- Skills parsing (comma-separated, max 10, max 50 chars)
- Search query validation (max 80 chars)
- Status value validation
- Default values

## Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User not a student |
| `INVALID_PARAMS` | 400 | Invalid query parameters |
| `SERVER_ERROR` | 500 | Internal server error |

## Response Schema

### Success Response
```typescript
{
  ok: true;
  jobs: Job[];
  total: number;
  reason?: 'PROFILE_INCOMPLETE';
  missingFields?: string[];
}
```

### Error Response
```typescript
{
  ok: false;
  error: {
    code: string;
    message: string;
    details?: string | string[];
  };
  requestId: string;
}
```

## Logging Format

All logs include:
- `[requestId]` prefix
- Timestamp
- User ID (if authenticated)
- Query parameters
- Duration metrics
- Full error stack traces

Example:
```
[req-1234567890-abc123] GET /api/jobs - Request started
[req-1234567890-abc123] User authenticated { userId: "..." }
[req-1234567890-abc123] Student profile found { studentProfileId: "..." }
[req-1234567890-abc123] Jobs fetched from database { count: 10, duration: "45ms" }
[req-1234567890-abc123] GET /api/jobs - Request completed { duration: "120ms", jobsCount: 10 }
```

## Testing

### Manual Testing Checklist
- [x] Missing student profile returns 200 with empty list
- [x] Invalid query params return 400 with error details
- [x] Unauthenticated requests return 401
- [x] Non-student users return 403
- [x] Database errors return 500 with requestId
- [x] Frontend displays requestId in error messages
- [x] Empty state shows helpful message for incomplete profiles

### Unit Tests
Run with: `npm test tests/unit/jobs-query-parsing.test.ts`

## Migration Notes

The API response format has changed to include `ok: true/false`. The frontend has been updated to handle both old and new formats for backward compatibility.

## Production Deployment

Before deploying:
1. Verify all error logs include requestId
2. Test with missing student profiles
3. Test with invalid query parameters
4. Verify empty states render correctly
5. Check that requestId appears in frontend error messages

## Future Improvements

1. Add server-side filtering/sorting (currently done client-side)
2. Add rate limiting to prevent abuse
3. Add caching for job listings
4. Add metrics/monitoring for error rates
5. Add integration tests for full request/response cycle
