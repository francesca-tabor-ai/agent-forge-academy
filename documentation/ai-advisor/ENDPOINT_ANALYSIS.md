# AI Advisor Backend Endpoints & Provider Integration Analysis

**Date:** 2025-01-27  
**Scope:** Backend API endpoints, provider integration, error handling, reliability

---

## 1. Endpoints Overview

| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/ai-advisor/chat` | POST | `app/api/ai-advisor/chat/route.ts` | Main chat endpoint (streaming/non-streaming) |
| `/api/ai-advisor/health` | GET | `app/api/ai-advisor/health/route.ts` | Health check for LLM provider |
| `/api/ai-advisor/voice` | POST | `app/api/ai-advisor/voice/route.ts` | Voice transcription + chat |

---

## 2. Endpoint: `/api/ai-advisor/chat`

### 2.1 Authentication

**Mechanism:** Supabase Auth (server-side)

**Location:** Lines 696-725

```typescript
const supabase = await createUserSupabaseClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json(
    { ok: false, error: { code: 'UNAUTHORIZED', message: 'Session expired — please sign in again.', requestId } },
    { status: 401, headers: { 'X-Request-ID': requestId } }
  );
}
```

**Status:** ✅ **Working**
- Validates user session
- Returns 401 with Request ID if unauthorized
- Logs unauthorized attempts

---

### 2.2 Input Schema Validation

**Location:** Lines 760-788

**Current Validation:**
```typescript
const body: ChatRequest = await request.json();
let { message, context, studentProfileId, conversationHistory, intent, conversationId } = body;

if (!message || !message.trim()) {
  return NextResponse.json(
    { ok: false, error: { code: 'BAD_REQUEST', message: 'Message is required', requestId } },
    { status: 400 }
  );
}
```

**Issues:**
- ❌ **No schema validation library** (no Zod, Yup, etc.)
- ❌ **No type checking** - TypeScript interface only (runtime not enforced)
- ❌ **No payload size limit** - Large payloads can cause memory issues
- ❌ **No message length validation** - No max length check
- ❌ **No conversationHistory length validation** - Can send unlimited history
- ⚠️ **No context structure validation** - Assumes correct shape

**Recommendation:**
```typescript
import { z } from 'zod';

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  context: z.object({
    course: z.object({ id: z.string(), slug: z.string(), title: z.string() }).optional(),
    project: z.object({ id: z.string(), title: z.string() }).optional(),
    job: z.object({ id: z.string(), title: z.string(), company: z.string() }).optional(),
  }).optional(),
  studentProfileId: z.string().nullable(),
  conversationHistory: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'human']),
    content: z.string(),
    timestamp: z.date(),
  })).max(20), // Limit to 20 messages
  intent: z.string().optional(),
  conversationId: z.string().optional(),
});

// Validate
const result = ChatRequestSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: result.error.message } }, { status: 400 });
}
```

---

### 2.3 Timeout Handling

**Streaming Mode:**
- **Location:** Lines 1024-1053
- **Timeout:** 60 seconds (`STREAM_TIMEOUT_MS = 60000`)
- **Mechanism:** `Promise.race()` between stream and timeout promise
- **Issue:** ❌ **No retry on timeout** - Request fails immediately
- **Issue:** ❌ **No cancellation** - Stream continues even after timeout

```typescript
const STREAM_TIMEOUT_MS = 60000; // 60 seconds
const timeoutPromise = new Promise<void>((resolve) => {
  streamTimeout = setTimeout(() => {
    if (!streamCompleted) {
      // Send timeout error, close stream
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ok: false, error: { code: 'TIMEOUT', ... } })}\n\n`));
      controller.close();
    }
  }, STREAM_TIMEOUT_MS);
});

await Promise.race([streamPromise, timeoutPromise]);
```

**Non-Streaming Mode:**
- **Location:** Lines 1356-1674
- **Timeout:** ❌ **No explicit timeout** - Relies on Next.js default (varies)
- **Issue:** ❌ **No timeout handling** - Can hang indefinitely

**Provider Layer:**
- **Location:** `lib/ai/llm.ts` (Lines 123, 170)
- **Timeout:** ❌ **No timeout** - Uses default fetch timeout (varies by platform)
- **Issue:** ❌ **No AbortSignal** - Cannot cancel provider requests

**Recommendations:**
1. Add timeout to provider layer with AbortSignal
2. Add retry logic for timeout errors (with exponential backoff)
3. Cancel stream on timeout (already done, but verify)

---

### 2.4 Retry Logic

**Current State:** ❌ **No retry logic in backend**

**Provider Layer:**
- **Location:** `lib/ai/llm.ts`
- **Status:** ❌ **No retry** - Single attempt, fails immediately on error

**Error Handling:**
```typescript
// lib/ai/llm.ts:141-143
if (!response.ok) {
  const error = await response.text();
  throw new Error(`OpenAI API error: ${response.status} ${error}`);
}
```

**Issues:**
- ❌ **No retry for transient failures** (5xx, network errors)
- ❌ **No exponential backoff**
- ❌ **No jitter**
- ❌ **No circuit breaker**

**Recommendation:**
```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Retry on 5xx, 429, network errors
      if (response.status >= 500 || response.status === 429) {
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

---

### 2.5 Streaming

**Status:** ✅ **Working**

**Implementation:**
- **Location:** Lines 1018-1355
- **Format:** Server-Sent Events (SSE)
- **Content-Type:** `text/event-stream`
- **Format:** `data: {JSON}\n\n`

**Features:**
- ✅ Real-time chunk streaming
- ✅ Error handling in stream
- ✅ Timeout protection (60s)
- ✅ Empty response guard

**Issues:**
- ⚠️ **No heartbeat** - Client may timeout if stream stalls
- ⚠️ **No cancellation** - Cannot cancel mid-stream from client

**Recommendation:**
- Add heartbeat (send empty chunk every 10s)
- Add cancellation support (AbortController)

---

### 2.6 Provider Selection

**Location:** Lines 1056-1124 (streaming), 1360-1432 (non-streaming)

**Mechanism:**
```typescript
const providerResult = getLLMProviderWithFallback();
llm = providerResult.provider;
actualProvider = providerResult.providerName;
isFallback = providerResult.isFallback;
```

**Provider Selection Logic:**
- **Location:** `lib/ai/llm.ts` (Lines 79-104)
- **Primary:** `process.env.LLM_PROVIDER || 'openai'`
- **Fallback:** `process.env.LLM_FALLBACK_PROVIDER` (if configured)
- **Status:** ✅ **Working** - Falls back if primary fails

**Issues:**
- ⚠️ **No provider health check** - Doesn't verify provider before use
- ⚠️ **No provider rotation** - Always uses same provider until failure

---

### 2.7 Error Mapping

**Location:** Lines 1076-1124 (streaming), 1379-1432 (non-streaming)

**Current Mapping:**
```typescript
let errorCode = 'UPSTREAM_ERROR';
let statusCode = 500;

if (errorMessage.includes('LLM_API_KEY') || errorMessage.includes('required')) {
  errorCode = 'SERVICE_UNAVAILABLE';
  statusCode = 503;
} else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
  errorCode = 'UNAUTHORIZED';
  statusCode = 401;
} else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
  errorCode = 'RATE_LIMIT_EXCEEDED';
  statusCode = 429;
} else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
  errorCode = 'BAD_REQUEST';
  statusCode = 400;
}
```

**Issues:**
- ❌ **Generic error messages** - Doesn't show root cause
- ❌ **String matching** - Fragile (depends on error message format)
- ❌ **5xx errors mapped to generic** - "AI service error. Please try again."
- ❌ **No specific error codes** - All 5xx become `UPSTREAM_ERROR`

**Example:**
```typescript
// Upstream returns: "OpenAI API error: 502 Bad Gateway"
// Mapped to: "AI service error. Please try again." (generic)
// Should be: "OpenAI API is temporarily unavailable. Please try again in a few minutes."
```

**Recommendation:**
```typescript
// Parse upstream status code
const upstreamStatusMatch = errorMessage.match(/(\d{3})/);
const upstreamStatus = upstreamStatusMatch ? parseInt(upstreamStatusMatch[1]) : null;

if (upstreamStatus === 502) {
  errorCode = 'BAD_GATEWAY';
  message = 'AI provider is temporarily unavailable. Please try again in a few minutes.';
} else if (upstreamStatus === 503) {
  errorCode = 'SERVICE_UNAVAILABLE';
  message = 'AI provider is overloaded. Please try again later.';
} else if (upstreamStatus === 504) {
  errorCode = 'GATEWAY_TIMEOUT';
  message = 'AI provider took too long to respond. Please try again.';
} else if (upstreamStatus === 500) {
  errorCode = 'PROVIDER_ERROR';
  message = 'AI provider encountered an error. Please try again.';
}
```

---

## 3. Endpoint: `/api/ai-advisor/health`

### 3.1 Authentication

**Status:** ❌ **No authentication** - Public endpoint

**Location:** Line 8

```typescript
export async function GET(request: NextRequest) {
  // No auth check
}
```

**Issue:** ⚠️ **Exposes provider configuration** (provider name, health status)

**Recommendation:** Add basic auth or rate limiting

---

### 3.2 Input Validation

**Status:** ✅ **N/A** - GET endpoint, no body

---

### 3.3 Timeout

**Location:** Line 38

```typescript
signal: AbortSignal.timeout(3000), // 3 second timeout
```

**Status:** ✅ **Working** - 3 second timeout for upstream check

---

### 3.4 Provider Check

**Location:** Lines 29-52

**Implementation:**
- Checks if `LLM_API_KEY` is set
- For OpenAI: Calls `/v1/models` endpoint (lightweight)
- For others: Assumes healthy if configured

**Status:** ✅ **Working**

---

## 4. Endpoint: `/api/ai-advisor/voice`

### 4.1 Authentication

**Status:** ✅ **Working** - Same as chat endpoint (Supabase Auth)

---

### 4.2 Input Validation

**Location:** Lines 605-635

**Current Validation:**
```typescript
// Audio type validation
const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];
if (!allowedTypes.includes(audioFile.type)) {
  return NextResponse.json({ error: 'Invalid audio format...' }, { status: 400 });
}

// File size validation
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
if (audioFile.size > MAX_SIZE) {
  return NextResponse.json({ error: 'Audio file size must be less than 10MB' }, { status: 400 });
}
```

**Status:** ✅ **Working** - Validates audio type and size

**Issues:**
- ⚠️ **No validation for other fields** (context, conversationHistory, etc.)
- ⚠️ **No JSON parsing error handling** (Lines 554, 592)

---

### 4.3 Timeout

**Status:** ❌ **No explicit timeout** - Relies on Next.js default

---

### 4.4 Retry Logic

**Status:** ❌ **No retry logic** - Single attempt for transcription/LLM calls

---

## 5. Provider Integration Issues

### 5.1 Missing Environment Variables

**Location:** `lib/ai/llm.ts` (Lines 56-60, 80-86)

**Current Handling:**
```typescript
const apiKey = process.env.LLM_API_KEY;
if (!apiKey) {
  throw new Error('LLM_API_KEY environment variable is required');
}
```

**Issues:**
- ❌ **No validation at startup** - Only fails on first request
- ❌ **Generic error message** - Doesn't specify which variable is missing
- ❌ **No fallback** - Doesn't check `OPENAI_API_KEY` as fallback (except in health endpoint)

**Recommendation:**
- Validate at startup (middleware or config check)
- Provide specific error messages
- Check multiple env var names

---

### 5.2 Invalid Base URL

**Location:** `lib/ai/llm.ts` (Lines 115, 269)

**Current Implementation:**
```typescript
// OpenAI
this.baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

// Anthropic
this.baseURL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
```

**Issues:**
- ❌ **No URL validation** - Accepts any string (could be invalid)
- ❌ **No URL format check** - Doesn't verify it's a valid URL
- ❌ **No connectivity check** - Doesn't verify URL is reachable

**Example Problem:**
```typescript
// If OPENAI_BASE_URL = "not-a-url"
// Will fail at runtime with cryptic error
```

**Recommendation:**
```typescript
function validateBaseURL(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Base URL must use http or https');
    }
    return url;
  } catch (error) {
    throw new Error(`Invalid base URL: ${url}`);
  }
}

this.baseURL = validateBaseURL(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
```

---

### 5.3 Upstream 5xx Mapping to Generic Message

**Location:** `lib/ai/llm.ts` (Lines 141-143, 189-192, 300-303, 353-356)

**Current Implementation:**
```typescript
if (!response.ok) {
  const error = await response.text();
  throw new Error(`OpenAI API error: ${response.status} ${error}`);
}
```

**Issues:**
- ❌ **All 5xx errors become generic** - "OpenAI API error: 502 ..."
- ❌ **Error message passed through** - May contain sensitive info
- ❌ **No specific handling** - 502, 503, 504 all treated the same

**In Route Handler:**
```typescript
// Lines 1111-1115
message: process.env.NODE_ENV === 'development'
  ? errorMessage
  : (errorMessage.includes('LLM_API_KEY') 
      ? 'AI service is not configured. Please contact support.'
      : 'AI service error. Please try again.'), // ❌ Generic for all 5xx
```

**Recommendation:**
```typescript
// In provider layer
if (!response.ok) {
  const errorText = await response.text();
  let errorMessage = `Provider API error: ${response.status}`;
  
  if (response.status === 502) {
    errorMessage = 'Provider gateway error - service temporarily unavailable';
  } else if (response.status === 503) {
    errorMessage = 'Provider service unavailable - overloaded';
  } else if (response.status === 504) {
    errorMessage = 'Provider timeout - took too long to respond';
  } else if (response.status === 500) {
    errorMessage = 'Provider internal error';
  }
  
  throw new Error(`${errorMessage} (status: ${response.status})`);
}
```

---

### 5.4 Timeouts Without Retries/Cancellation

**Issues:**
1. **Provider Layer:** No timeout on fetch calls
2. **Route Handler:** Timeout exists but no retry
3. **No cancellation:** Cannot cancel in-flight requests

**Current State:**
- ❌ **No AbortSignal in provider** - Cannot cancel provider requests
- ❌ **No retry on timeout** - Request fails immediately
- ⚠️ **Stream timeout** - Exists but no retry

**Recommendation:**
```typescript
// Add timeout to provider
async generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    // ... handle response
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}
```

---

### 5.5 Rate Limit Handling (429) Without Backoff

**Location:** `lib/ai/llm.ts` (Lines 141-143)

**Current Implementation:**
```typescript
if (!response.ok) {
  const error = await response.text();
  throw new Error(`OpenAI API error: ${response.status} ${error}`);
}
```

**Issues:**
- ❌ **No retry on 429** - Fails immediately
- ❌ **No backoff** - Even if retried, no delay
- ❌ **No Retry-After header parsing** - Doesn't respect provider's retry timing

**In Route Handler:**
```typescript
// Lines 1088-1090
} else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
  errorCode = 'RATE_LIMIT_EXCEEDED';
  statusCode = 429;
}
// ❌ No retry, just returns error
```

**Recommendation:**
```typescript
// In provider layer
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  const delay = retryAfter ? parseInt(retryAfter) * 1000 : 1000;
  
  // Retry with backoff
  await new Promise(resolve => setTimeout(resolve, delay));
  return this.generate(messages, options); // Retry once
}
```

---

### 5.6 Serialization Issues (Large Payloads)

**Location:** `app/api/ai-advisor/chat/route.ts` (Line 760)

**Current Implementation:**
```typescript
const body: ChatRequest = await request.json();
```

**Issues:**
- ❌ **No payload size limit** - Can accept unlimited size
- ❌ **No message length validation** - Can send very long messages
- ❌ **No conversationHistory limit** - Can send unlimited history
- ❌ **Memory risk** - Large payloads can cause OOM

**Example Problem:**
```typescript
// User sends:
{
  message: "test",
  conversationHistory: Array(1000).fill({ content: "very long message..." })
}
// Can cause memory issues or serialization errors
```

**Recommendation:**
```typescript
// Add payload size check
const MAX_PAYLOAD_SIZE = 1 * 1024 * 1024; // 1MB
const contentLength = request.headers.get('content-length');
if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
  return NextResponse.json(
    { ok: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request payload too large' } },
    { status: 413 }
  );
}

// Validate message length
if (message.length > 10000) {
  return NextResponse.json(
    { ok: false, error: { code: 'MESSAGE_TOO_LONG', message: 'Message exceeds maximum length' } },
    { status: 400 }
  );
}

// Limit conversation history
if (conversationHistory && conversationHistory.length > 20) {
  conversationHistory = conversationHistory.slice(-20); // Keep last 20
}
```

---

## 6. Summary of Issues

| Issue | Severity | Location | Impact |
|-------|----------|----------|--------|
| **No input schema validation** | 🔴 High | `chat/route.ts:760` | Invalid payloads can cause runtime errors |
| **No payload size limit** | 🔴 High | `chat/route.ts:760` | Memory issues, DoS risk |
| **No retry logic** | 🔴 High | `lib/ai/llm.ts:141` | Transient failures cause immediate errors |
| **Generic 5xx error messages** | 🟡 Medium | `chat/route.ts:1115` | Poor user experience, hard to debug |
| **No timeout in provider** | 🟡 Medium | `lib/ai/llm.ts:123` | Requests can hang indefinitely |
| **No rate limit backoff** | 🟡 Medium | `lib/ai/llm.ts:141` | 429 errors fail immediately |
| **No base URL validation** | 🟡 Medium | `lib/ai/llm.ts:115` | Invalid URLs cause cryptic errors |
| **No env var validation at startup** | 🟡 Medium | `lib/ai/llm.ts:56` | Fails on first request, not at startup |
| **No cancellation support** | 🟢 Low | `lib/ai/llm.ts` | Cannot cancel in-flight requests |
| **No heartbeat in stream** | 🟢 Low | `chat/route.ts:1018` | Client may timeout on stalled streams |

---

## 7. Recommendations

### 7.1 Immediate Fixes (High Priority)

1. **Add Input Schema Validation**
   - Use Zod for runtime validation
   - Validate message length, conversationHistory length
   - Return specific error messages

2. **Add Payload Size Limits**
   - Check `Content-Length` header
   - Limit to 1MB for chat endpoint
   - Return 413 if exceeded

3. **Add Retry Logic**
   - Retry on 5xx, 429, network errors
   - Exponential backoff with jitter
   - Max 3 retries

4. **Improve Error Messages**
   - Parse upstream status codes
   - Provide specific messages (502, 503, 504)
   - Include actionable guidance

### 7.2 Short-term Improvements (Medium Priority)

1. **Add Timeout to Provider**
   - Use AbortSignal with 30s timeout
   - Cancel on timeout

2. **Add Rate Limit Backoff**
   - Parse `Retry-After` header
   - Retry with appropriate delay

3. **Validate Base URLs**
   - Check URL format at initialization
   - Validate protocol (http/https)

4. **Add Startup Validation**
   - Check env vars at startup
   - Fail fast if misconfigured

### 7.3 Long-term Enhancements (Low Priority)

1. **Add Circuit Breaker**
   - Stop retrying if provider is down
   - Half-open after timeout

2. **Add Request Cancellation**
   - Support AbortController from client
   - Cancel provider requests

3. **Add Stream Heartbeat**
   - Send empty chunks every 10s
   - Prevent client timeouts

---

## 8. Code References

### Key Files

1. **Chat Endpoint:** `app/api/ai-advisor/chat/route.ts` (1723 lines)
   - Auth: Lines 696-725
   - Input validation: Lines 760-788
   - Timeout: Lines 1024-1053
   - Error mapping: Lines 1076-1124, 1379-1432

2. **Provider Layer:** `lib/ai/llm.ts` (404 lines)
   - Provider selection: Lines 55-104
   - Error handling: Lines 141-143, 189-192
   - Base URL: Lines 115, 269

3. **Health Endpoint:** `app/api/ai-advisor/health/route.ts` (84 lines)
   - Provider check: Lines 29-52
   - Timeout: Line 38

4. **Voice Endpoint:** `app/api/ai-advisor/voice/route.ts` (855 lines)
   - Input validation: Lines 605-635

---

**End of Analysis**
