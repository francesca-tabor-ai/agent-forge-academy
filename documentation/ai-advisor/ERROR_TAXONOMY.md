# Error Taxonomy - Correlation IDs and Error Classification

**Date:** 2025-01-27  
**Purpose:** Centralized error taxonomy for AI Advisor chat endpoint

---

## Overview

All errors in the AI Advisor chat endpoint are mapped through a single source of truth: `lib/ai-advisor/error-taxonomy.ts`. This ensures consistent error classification, status codes, user messages, and logging.

---

## Error Classes

### 1. ValidationError (400)

**Trigger Conditions:**
- Missing required fields (message, studentProfileId)
- Invalid input format
- Empty or invalid request body

**Status Code:** 400

**User Message:** "Invalid request. Please check your input and try again."

**Example:**
```typescript
// Missing message
if (!message || !message.trim()) {
  const errorResponse = createErrorResponse(
    new Error('Message is required and must be a non-empty string'),
    { requestId, userId: user.id, errorMessage: 'Message is required', stage: 'input_validation' }
  );
}
```

---

### 2. AuthError (401/403)

**Trigger Conditions:**
- User not authenticated (401)
- User not authorized (403)
- Session expired
- Invalid authentication token

**Status Code:** 401 or 403

**User Messages:**
- 401: "Your session has expired. Please refresh the page and try again."
- 403: "You do not have permission to perform this action."

**Example:**
```typescript
// User not authenticated
if (!user) {
  const errorResponse = createErrorResponse(
    new Error('User not authenticated'),
    { requestId, errorMessage: 'User not authenticated', stage: 'auth_check' }
  );
}
```

---

### 3. RateLimitError (429)

**Trigger Conditions:**
- Provider API returns 429
- Error message contains "rate limit" or "429"
- Too many requests to provider

**Status Code:** 429

**User Message:** "Too many requests. Please wait a moment and try again."

**Example:**
```typescript
// Provider rate limit
if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
  // Automatically mapped to RateLimitError by taxonomy
}
```

---

### 4. ProviderTimeout (504)

**Trigger Conditions:**
- Stream timeout (60 seconds)
- Provider API timeout
- Error message contains "timeout" or "TIMEOUT"
- AbortError from fetch
- Upstream status 504

**Status Code:** 504

**User Message:** "The AI response is taking longer than expected. Please try again in a moment."

**Example:**
```typescript
// Stream timeout
streamTimeout = setTimeout(() => {
  const errorResponse = createErrorResponse(
    new Error('Stream timeout'),
    { requestId, userId: user.id, errorMessage: 'Stream timeout', stage: 'stream_timeout' }
  );
}, STREAM_TIMEOUT_MS);
```

---

### 5. ProviderUnavailable (503)

**Trigger Conditions:**
- Missing LLM_API_KEY
- Provider not configured
- Provider API 5xx errors (500, 502, 503, not 504)
- Error message contains "SERVICE_UNAVAILABLE" or "not configured"

**Status Code:** 503

**User Messages:**
- Configuration: "AI service is currently unavailable. Please contact support if this persists."
- Provider 5xx: "AI service is temporarily unavailable. Please try again in a moment."

**Example:**
```typescript
// Missing API key
if (!llmApiKey) {
  const errorResponse = createErrorResponse(
    new Error('LLM_API_KEY environment variable is required'),
    { requestId, userId: user.id, errorMessage: 'LLM_API_KEY environment variable is required', stage: 'provider_config_check' }
  );
}
```

---

### 6. VectorStoreUnavailable (503)

**Trigger Conditions:**
- Vector search fails
- Error message contains "vector" and ("unavailable" or "failed" or "error")
- pgvector extension not available
- Vector search RPC function error

**Status Code:** 503

**User Message:** "Search functionality is temporarily unavailable. Please try again in a moment."

**Example:**
```typescript
// Vector search failure
if (errorMessage.includes('vector') && errorMessage.includes('unavailable')) {
  // Automatically mapped to VectorStoreUnavailable by taxonomy
}
```

---

### 7. IndexMissing (424/404)

**Trigger Conditions:**
- Course content not indexed
- Error message contains "index" and ("missing" or "not found" or "not indexed")
- Upstream status 404 for course/index content

**Status Code:** 424 (Failed Dependency) or 404 (Not Found)

**User Messages:**
- 424: "Course content is not yet indexed. Please contact support."
- 404: "Requested course content was not found."

**Example:**
```typescript
// Index missing
if (errorMessage.includes('index') && errorMessage.includes('missing')) {
  // Automatically mapped to IndexMissing by taxonomy
}
```

---

### 8. InternalError (500)

**Default fallback for all unclassified errors**

**Status Code:** 500

**User Message:** "An unexpected error occurred. Please try again or contact support."

---

## Error Response Structure

### Response Format

```typescript
{
  ok: false,
  error: {
    code: "ErrorClass",  // e.g., "ValidationError", "ProviderUnavailable"
    message: "User-safe message",
    requestId: "req_1234567890_abc123"
  }
}
```

### HTTP Headers

```
X-Request-ID: req_1234567890_abc123
```

---

## Logging Structure

All errors are logged with consistent structure:

```typescript
{
  requestId: "req_1234567890_abc123",
  userId: "user-123",  // Optional
  errorClass: "ProviderUnavailable",
  statusCode: 503,
  upstreamStatus: 502,  // Optional, extracted from error message
  errorMessage: "Provider API error (502): OpenAI API error: 502 Bad Gateway",
  stage: "provider_call_failed",  // Optional
  message: "Provider unavailable: OpenAI API error: 502 Bad Gateway"
}
```

---

## Error Mapping Function

### `createErrorResponse(error, context)`

**Location:** `lib/ai-advisor/error-taxonomy.ts`

**Parameters:**
- `error`: Error object or message
- `context`: ErrorContext object
  - `requestId`: Correlation ID (required)
  - `userId`: User ID (optional)
  - `upstreamStatus`: Upstream HTTP status code (optional)
  - `errorMessage`: Error message (required)
  - `stage`: Stage where error occurred (optional)
  - `originalError`: Original error object (optional)

**Returns:**
```typescript
{
  response: {
    ok: false,
    error: {
      code: string,      // ErrorClass enum value
      message: string,   // User-safe message
      requestId: string
    }
  },
  statusCode: number,
  headers: {
    'X-Request-ID': string
  },
  logData: {
    requestId: string,
    userId?: string,
    errorClass: ErrorClass,
    statusCode: number,
    upstreamStatus?: number | null,
    errorMessage: string,
    stage?: string,
    message: string
  }
}
```

---

## Usage Examples

### Example 1: Validation Error

```typescript
if (!message || !message.trim()) {
  const errorResponse = createErrorResponse(
    new Error('Message is required and must be a non-empty string'),
    {
      requestId,
      userId: user.id,
      errorMessage: 'Message is required',
      stage: 'input_validation',
    }
  );
  
  safeLogger.warn('[AI_ADVISOR] Validation error', errorResponse.logData);
  
  return NextResponse.json(
    errorResponse.response,
    {
      status: errorResponse.statusCode,
      headers: errorResponse.headers,
    }
  );
}
```

**Result:**
- Error Class: `ValidationError`
- Status Code: 400
- User Message: "Invalid request. Please check your input and try again."
- Log includes: `requestId`, `errorClass: "ValidationError"`, `statusCode: 400`

---

### Example 2: Provider Unavailable

```typescript
if (!llmApiKey) {
  const errorResponse = createErrorResponse(
    new Error('LLM_API_KEY environment variable is required'),
    {
      requestId,
      userId: user.id,
      errorMessage: 'LLM_API_KEY environment variable is required',
      stage: 'provider_config_check',
    }
  );
  
  safeLogger.error('[AI_ADVISOR] Configuration error', {
    ...errorResponse.logData,
    provider: llmProvider,
    model,
  });
  
  return NextResponse.json(
    errorResponse.response,
    {
      status: errorResponse.statusCode,
      headers: errorResponse.headers,
    }
  );
}
```

**Result:**
- Error Class: `ProviderUnavailable`
- Status Code: 503
- User Message: "AI service is currently unavailable. Please contact support if this persists."
- Log includes: `requestId`, `errorClass: "ProviderUnavailable"`, `statusCode: 503`

---

### Example 3: Provider Timeout

```typescript
streamTimeout = setTimeout(() => {
  const timeoutError = new Error('Stream timeout');
  const errorResponse = createErrorResponse(timeoutError, {
    requestId,
    userId: user.id,
    errorMessage: 'Stream timeout',
    stage: 'stream_timeout',
  });
  
  safeLogger.error('[AI_ADVISOR] Stream timeout', {
    ...errorResponse.logData,
    elapsed: Date.now() - startTime,
  });
  
  controller.enqueue(
    encoder.encode(`data: ${JSON.stringify({ 
      ok: false,
      error: errorResponse.response.error,
      done: true 
    })}\n\n`)
  );
}, STREAM_TIMEOUT_MS);
```

**Result:**
- Error Class: `ProviderTimeout`
- Status Code: 504
- User Message: "The AI response is taking longer than expected. Please try again in a moment."
- Log includes: `requestId`, `errorClass: "ProviderTimeout"`, `statusCode: 504`

---

### Example 4: Provider API Error with Upstream Status

```typescript
} catch (llmError: any) {
  const errorMessage = llmError.message || 'LLM provider not configured';
  
  // Extract upstream status if available
  const upstreamStatusMatch = errorMessage.match(/(\d{3})/);
  const upstreamStatus = upstreamStatusMatch ? parseInt(upstreamStatusMatch[1]) : null;
  
  // Use centralized error taxonomy
  const errorResponse = createErrorResponse(llmError, {
    requestId,
    userId: user.id,
    upstreamStatus: upstreamStatus,  // e.g., 429, 502, 503
    errorMessage: errorMessage,
    stage: 'provider_call_failed',
    originalError: llmError,
  });
  
  safeLogger.error('[AI_ADVISOR] Provider call failed', {
    ...errorResponse.logData,  // Includes upstreamStatus
    provider: llmProvider,
    model,
  });
  
  return NextResponse.json(
    errorResponse.response,
    {
      status: errorResponse.statusCode,
      headers: errorResponse.headers,
    }
  );
}
```

**Result (for 429):**
- Error Class: `RateLimitError`
- Status Code: 429
- User Message: "Too many requests. Please wait a moment and try again."
- Log includes: `requestId`, `errorClass: "RateLimitError"`, `statusCode: 429`, `upstreamStatus: 429`

---

## Error Classification Logic

### Priority Order

1. **ValidationError** - Checked first (missing required fields)
2. **AuthError** - Checked second (401/403, authentication issues)
3. **RateLimitError** - Checked third (429, rate limit)
4. **ProviderTimeout** - Checked fourth (timeout, 504)
5. **ProviderUnavailable** - Checked fifth (missing config, 5xx)
6. **VectorStoreUnavailable** - Checked sixth (vector search errors)
7. **IndexMissing** - Checked seventh (index not found, 424/404)
8. **InternalError** - Default fallback

### Upstream Status Extraction

The taxonomy automatically extracts upstream HTTP status codes from error messages:

```typescript
// Extracts "429" from "OpenAI API error: 429 Rate limit exceeded"
const upstreamStatus = extractUpstreamStatus(errorMessage); // Returns 429
```

---

## Error Taxonomy Table

| Error Class | Status Code | Trigger Conditions | User Message |
|-------------|-------------|-------------------|--------------|
| **ValidationError** | 400 | Missing required fields, invalid input | "Invalid request. Please check your input and try again." |
| **AuthError** | 401 | User not authenticated | "Your session has expired. Please refresh the page and try again." |
| **AuthError** | 403 | User not authorized | "You do not have permission to perform this action." |
| **RateLimitError** | 429 | Provider rate limit, 429 status | "Too many requests. Please wait a moment and try again." |
| **ProviderTimeout** | 504 | Stream timeout, provider timeout, 504 status | "The AI response is taking longer than expected. Please try again in a moment." |
| **ProviderUnavailable** | 503 | Missing API key, provider 5xx (not 504), not configured | "AI service is currently unavailable. Please contact support if this persists." |
| **VectorStoreUnavailable** | 503 | Vector search fails, pgvector unavailable | "Search functionality is temporarily unavailable. Please try again in a moment." |
| **IndexMissing** | 424 | Course content not indexed | "Course content is not yet indexed. Please contact support." |
| **IndexMissing** | 404 | Course content not found | "Requested course content was not found." |
| **InternalError** | 500 | All other errors (default) | "An unexpected error occurred. Please try again or contact support." |

---

## Benefits

### 1. Single Source of Truth

All error mapping happens in one place (`lib/ai-advisor/error-taxonomy.ts`), making it easy to:
- Update error messages
- Add new error classes
- Change status code mappings
- Modify user messages

### 2. Consistent Logging

All errors log:
- Correlation ID (requestId)
- Error class
- Upstream status (if available)
- Safe user message
- Stage where error occurred

### 3. User-Safe Messages

All user messages are safe and don't leak:
- API keys
- Internal error details
- Stack traces
- Sensitive information

### 4. Easy Debugging

With correlation IDs and consistent error classes, debugging is easier:
- Filter logs by error class
- Trace errors by requestId
- Identify patterns by upstream status

---

## Migration Notes

### Before (Scattered Error Handling)

```typescript
// Multiple places with different error handling
if (errorMessage.includes('429')) {
  errorCode = 'RATE_LIMIT_EXCEEDED';
  statusCode = 429;
  userMessage = 'Too many requests...';
}

if (errorMessage.includes('LLM_API_KEY')) {
  errorCode = 'SERVICE_UNAVAILABLE';
  statusCode = 503;
  userMessage = 'AI service is not configured...';
}
```

### After (Centralized Error Taxonomy)

```typescript
// Single place for all error mapping
const errorResponse = createErrorResponse(error, {
  requestId,
  userId: user.id,
  upstreamStatus: upstreamStatus,
  errorMessage: errorMessage,
  stage: 'provider_call_failed',
});

// Consistent response format
return NextResponse.json(
  errorResponse.response,
  {
    status: errorResponse.statusCode,
    headers: errorResponse.headers,
  }
);
```

---

## Testing

### Test Error Classes

```typescript
// Test ValidationError
const errorResponse = createErrorResponse(
  new Error('Message is required'),
  { requestId: 'test-123', errorMessage: 'Message is required', stage: 'validation' }
);
expect(errorResponse.errorClass).toBe(ErrorClass.ValidationError);
expect(errorResponse.statusCode).toBe(400);

// Test ProviderUnavailable
const errorResponse = createErrorResponse(
  new Error('LLM_API_KEY environment variable is required'),
  { requestId: 'test-123', errorMessage: 'LLM_API_KEY environment variable is required' }
);
expect(errorResponse.errorClass).toBe(ErrorClass.ProviderUnavailable);
expect(errorResponse.statusCode).toBe(503);

// Test RateLimitError
const errorResponse = createErrorResponse(
  new Error('OpenAI API error: 429 Rate limit exceeded'),
  { requestId: 'test-123', errorMessage: 'OpenAI API error: 429 Rate limit exceeded', upstreamStatus: 429 }
);
expect(errorResponse.errorClass).toBe(ErrorClass.RateLimitError);
expect(errorResponse.statusCode).toBe(429);
```

---

## Future Enhancements

1. **Error Metrics:**
   - Track error rates by class
   - Monitor upstream status distribution
   - Alert on error spikes

2. **Error Recovery:**
   - Automatic retry for transient errors
   - Circuit breaker for provider errors
   - Fallback strategies

3. **Error Analytics:**
   - Error frequency by class
   - Error patterns by stage
   - User impact analysis

---

**End of Error Taxonomy Documentation**
