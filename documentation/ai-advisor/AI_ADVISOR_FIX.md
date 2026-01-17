# AI Advisor Fix Summary

## Issue
AI Advisor was not responding on `/student/ai-advisor`. Symptoms included:
- User sends a message, UI shows it, but AI never replies (hangs)
- Previously seen: `ai-advisor:1 404` and other API issues
- Voice mode may show "Voice input isn't available…"

## Root Causes Identified

1. **Missing observability**: No requestId tracking, making debugging difficult
2. **No timeout handling**: Streaming responses could hang indefinitely
3. **Poor error handling**: Errors from LLM provider (e.g., missing API key) weren't properly surfaced
4. **Context fetches blocking**: If context fetches failed, entire response could fail
5. **No client-side timeout**: Frontend could wait forever for a response
6. **Inconsistent error format**: Errors weren't in a format the frontend could handle

## Fixes Implemented

### 1. API Route (`app/api/ai-advisor/chat/route.ts`)

#### Added Observability
- **RequestId generation**: Each request gets a unique `requestId` for tracking
- **Comprehensive logging**: Logs requestId, userId, message length, context, LLM latency, and errors
- **RequestId in responses**: All responses (success and error) include `requestId` in headers and body

#### Added Timeout Protection
- **Server-side timeout**: 60-second timeout for streaming responses
- **Timeout error handling**: Sends proper error message with requestId when timeout occurs
- **Stream completion tracking**: Prevents multiple close attempts

#### Improved Error Handling
- **LLM provider check**: Validates LLM provider configuration before attempting to use it
- **Error codes**: Structured error responses with codes (`UNAUTHORIZED`, `UPSTREAM_ERROR`, `TIMEOUT`, `INTERNAL_ERROR`)
- **Error format**: Consistent error format: `{ ok: false, error: { code, message, requestId } }`
- **Upstream error detection**: Detects missing API keys, quota issues, etc. and returns appropriate error messages

#### Made Context Fetches Non-Blocking
- **Graceful degradation**: If context fetches fail, continue with minimal context
- **Error logging**: Logs context fetch errors separately without breaking the response
- **Fallback context**: Uses request context if database context fetch fails

#### Streaming Response Improvements
- **Proper stream closure**: Ensures stream always closes, even on errors
- **Error chunks**: Sends error information via SSE when errors occur
- **RequestId in stream**: Includes requestId in final stream chunk

### 2. Frontend (`components/ai-advisor/AIAdvisor.tsx`)

#### Added Client-Side Timeout
- **45-second timeout**: Aborts request if no response within 45 seconds
- **Timeout detection**: Detects timeout errors and shows appropriate message
- **AbortController**: Uses AbortController for proper request cancellation

#### Improved Error Handling
- **Error format parsing**: Handles new structured error format with codes and requestId
- **User-friendly messages**: Shows clear, actionable error messages based on error type
- **RequestId display**: Shows requestId in error messages for support
- **Retry logic**: Only retries network/server errors, not timeouts or upstream errors

#### Better Error Messages
- **Timeout**: "Taking longer than expected" with retry option
- **Network errors**: "Connection issue" with retry option
- **Upstream errors**: "Service unavailable" with requestId for support
- **Generic errors**: Shows error message with requestId

#### Stream Error Handling
- **Error detection in stream**: Detects errors in SSE stream and handles appropriately
- **Stream cleanup**: Properly releases reader and clears timeouts

### 3. Health Check Endpoint (`app/api/ai-advisor/health/route.ts`)

Created new endpoint for quick diagnostics:
- **GET `/api/ai-advisor/health`**: Returns provider configuration status
- **Response format**: `{ ok: true, providerConfigured: boolean, provider: string, error?: string }`
- **Use case**: Quick check to verify LLM_API_KEY is set and provider is working

## Request/Response Contract

### Streaming Response (SSE)
- **Request**: `POST /api/ai-advisor/chat?stream=true` with `Accept: text/event-stream`
- **Success chunks**: `data: {"content": "...", "done": false}\n\n`
- **Final chunk**: `data: {"content": "", "done": true, "conversationId": "...", "nextActions": [...], "requestId": "..."}\n\n`
- **Error chunk**: `data: {"ok": false, "error": {"code": "...", "message": "...", "requestId": "..."}, "done": true}\n\n`

### Non-Streaming Response (JSON)
- **Request**: `POST /api/ai-advisor/chat`
- **Success**: `{ ok: true, response: "...", conversationId: "...", nextActions: [...], requestId: "..." }`
- **Error**: `{ ok: false, error: { code: "...", message: "...", requestId: "..." } }`

## Error Codes

- **UNAUTHORIZED**: User not authenticated (401)
- **BAD_REQUEST**: Invalid request (400)
- **UPSTREAM_ERROR**: LLM provider error (missing key, quota, etc.) (500)
- **TIMEOUT**: Request timed out (500)
- **INTERNAL_ERROR**: Unexpected server error (500)

## Testing Checklist

- [x] API returns 200 and a reply for a basic prompt (with mock upstream)
- [x] API returns 401 when no session
- [x] API returns 500 with requestId when upstream fails (missing API key)
- [x] API returns timeout error after 60 seconds
- [x] Frontend shows retry UI on error and doesn't hang
- [x] Frontend times out after 45 seconds and shows appropriate message
- [x] Context fetch failures don't break the response
- [x] RequestId is included in all responses for debugging

## Files Changed

1. `app/api/ai-advisor/chat/route.ts` - Main API route with observability, timeouts, and error handling
2. `components/ai-advisor/AIAdvisor.tsx` - Frontend with timeout and improved error handling
3. `app/api/ai-advisor/health/route.ts` - New health check endpoint

## Acceptance Criteria Met

✅ Sending a message produces an AI reply within a reasonable time  
✅ If provider/env is broken, user sees a clear error + requestId  
✅ No infinite loading states  
✅ Proper error handling with user-friendly messages  
✅ RequestId tracking for debugging  
✅ Timeout protection (server: 60s, client: 45s)  
✅ Context fetches don't block responses  

## Next Steps

1. Monitor logs for requestId patterns to identify common failure modes
2. Consider adding retry logic for transient upstream errors
3. Add metrics/analytics for response times and error rates
4. Consider adding rate limiting if needed
