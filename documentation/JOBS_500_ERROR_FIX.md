# Jobs API 500 Error Fix

## Problem
The `/student/jobs` page was showing "Server error: 500" for normal users, even when the issue was simply a missing or incomplete student profile.

## Root Cause Analysis

The 500 errors were caused by:

1. **Missing Student Profile**: When `getStudentDataForMatching` couldn't find a student profile, it threw a generic error that wasn't properly caught and handled as a "not found" case.

2. **Insufficient Error Handling**: The API handler checked for "not found" in error messages, but database errors (like `PGRST116`) weren't being recognized as "not found" cases.

3. **Poor Empty State Handling**: The frontend didn't distinguish between real server errors and healthy empty states (like incomplete profiles).

## Solution

### 1. Enhanced Error Handling in `getStudentDataForMatching`

**File**: `lib/jobs/student-data-cache.ts`

- Added `StudentProfileNotFoundError` custom error class to distinguish "not found" from other errors
- Improved error detection to recognize Supabase's `PGRST116` code and "No rows returned" messages
- Better error logging with structured error information

### 2. Improved API Error Handling

**File**: `app/api/jobs/route.ts`

- Returns **200 with `PROFILE_INCOMPLETE`** instead of 500 for missing/incomplete profiles
- Better error detection using `StudentProfileNotFoundError` and error code checks
- Added defensive checks before processing jobs to ensure `studentData` is valid
- All error responses now include `requestId` for debugging
- Consistent error response format: `{ ok: false, error: { code, message }, requestId }`

### 3. Enhanced Frontend Empty State

**File**: `components/jobs/JobOpportunitiesPage.tsx`

- Added `profileIncomplete` state to track when profile is incomplete
- Shows helpful empty state message with actionable buttons:
  - "Edit Profile" button linking to `/student/profile`
  - "Add a Project" button linking to `/student/portfolio`
- Clear messaging: "To unlock matched roles, complete your profile"
- Distinguishes between:
  - **Profile incomplete** (healthy empty state, no error)
  - **No jobs match filters** (user has profile but filters exclude all jobs)
  - **Real server errors** (shows error message with requestId)

### 4. Updated Individual Job Endpoint

**File**: `app/api/jobs/[id]/route.ts`

- Applied same error handling improvements
- Added `requestId` to all responses
- Consistent error format matching the list endpoint
- Better logging for debugging

### 5. Enhanced Test Coverage

**Files**: 
- `tests/integration/api-jobs-endpoint.test.ts`
- `tests/unit/jobs-api.test.ts`

- Added tests for `PROFILE_INCOMPLETE` response (200 with empty list)
- Added tests for error response format validation
- Added tests for `requestId` inclusion in all error responses
- Documented expected behavior for all error cases

## Response Format Changes

### Success Response (with jobs)
```json
{
  "ok": true,
  "jobs": [...],
  "total": 10
}
```

### Success Response (empty - profile incomplete)
```json
{
  "ok": true,
  "jobs": [],
  "total": 0,
  "reason": "PROFILE_INCOMPLETE",
  "missingFields": ["student_profile"]
}
```

### Error Response (401 Unauthorized)
```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  },
  "requestId": "req-1234567890-abc123"
}
```

### Error Response (400 Invalid Params)
```json
{
  "ok": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "Invalid query parameters",
    "details": ["matchMin must be an integer between 0 and 100"]
  },
  "requestId": "req-1234567890-abc123"
}
```

### Error Response (500 Server Error)
```json
{
  "ok": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Internal server error"
  },
  "requestId": "req-1234567890-abc123"
}
```

## Error Handling Flow

1. **Authentication Check**: Returns 401 if no user session
2. **Role Check**: Returns 403 if user is not a student
3. **Profile Check**: Returns 200 with `PROFILE_INCOMPLETE` if student profile is missing
4. **Student Data Check**: Returns 200 with `PROFILE_INCOMPLETE` if student data fetch fails with "not found"
5. **Database Errors**: Returns 500 only for unexpected database errors (with requestId)
6. **Query Validation**: Returns 400 for invalid query parameters

## Key Improvements

✅ **No more 500 errors for missing profiles** - Returns 200 with `PROFILE_INCOMPLETE`  
✅ **Better error messages** - All errors include `requestId` for debugging  
✅ **Helpful empty states** - Users see actionable guidance instead of error messages  
✅ **Consistent error format** - All errors follow the same structure  
✅ **Better logging** - All operations include `requestId` for traceability  
✅ **Defensive programming** - Added null checks before processing data  

## Testing

### Manual Testing Checklist
- [x] Missing student profile returns 200 with `PROFILE_INCOMPLETE`
- [x] Invalid query params return 400 with error details
- [x] Unauthenticated requests return 401
- [x] Non-student users return 403
- [x] Database errors return 500 with requestId
- [x] Frontend displays helpful message for incomplete profiles
- [x] Frontend shows requestId in error messages for real errors
- [x] Empty state shows actionable buttons

### Test Files Updated
- `tests/integration/api-jobs-endpoint.test.ts` - Added tests for PROFILE_INCOMPLETE
- `tests/unit/jobs-api.test.ts` - Added tests for error response format

## Files Changed

1. `lib/jobs/student-data-cache.ts` - Enhanced error handling
2. `app/api/jobs/route.ts` - Improved error responses and logging
3. `app/api/jobs/[id]/route.ts` - Applied same improvements
4. `components/jobs/JobOpportunitiesPage.tsx` - Better empty state UI
5. `tests/integration/api-jobs-endpoint.test.ts` - Enhanced test coverage
6. `tests/unit/jobs-api.test.ts` - Enhanced test coverage

## Production Deployment Notes

Before deploying:
1. ✅ Verify all error logs include requestId
2. ✅ Test with missing student profiles (should return 200, not 500)
3. ✅ Test with invalid query parameters (should return 400)
4. ✅ Verify empty states render correctly with helpful messages
5. ✅ Check that requestId appears in frontend error messages
6. ✅ Verify retry button works for transient errors

## Monitoring

In production, monitor:
- Error rates by error code (should see fewer 500s, more 200s with PROFILE_INCOMPLETE)
- Request IDs in error logs for debugging
- User experience metrics (time to see jobs, empty state engagement)

## Future Improvements

1. Add server-side filtering/sorting (currently done client-side)
2. Add rate limiting to prevent abuse
3. Add caching for job listings
4. Add metrics/monitoring for error rates
5. Add integration tests for full request/response cycle with real database
