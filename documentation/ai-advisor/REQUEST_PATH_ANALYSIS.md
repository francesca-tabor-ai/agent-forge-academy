# AI Advisor Request Path & Error Handling Analysis

**Date:** 2025-01-27  
**Scope:** Frontend chat send handler → Backend API → Error handling

---

## 1. Request Path Flow

### 1.1 Entry Point

**Component:** `components/ai-advisor/AIAdvisor.tsx`  
**Function:** `handleSendMessage(messageText: string, isQuickAction = false, intent?: string)`

**Location:** Line 209

```typescript
const handleSendMessage = async (messageText: string, isQuickAction = false, intent?: string) => {
  if (!messageText.trim() || isLoading) return; // ⚠️ Prevents double-send via isLoading flag
  
  // ... creates user message, sets loading state
  const sendRequest = async (retryCount = 0): Promise<void> => {
    // ... makes fetch call
  };
  
  sendRequest();
};
```

### 1.2 API Call

**Method:** `fetch()` (native browser API, not axios)

**Streaming Mode (Default):**
```typescript
// Line 245-260
const response = await fetch('/api/ai-advisor/chat?stream=true', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  },
  body: JSON.stringify({
    message: messageToSend,
    context: activeContext,        // ✅ Sends context
    studentProfileId,
    conversationHistory: messages.slice(-10), // Last 10 messages
    intent,
    conversationId,
  }),
  signal: controller.signal,      // AbortController for timeout
});
```

**Non-Streaming Mode (Fallback):**
```typescript
// Line 419-433
const response = await fetch('/api/ai-advisor/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: messageToSend,
    context: activeContext,        // ✅ Sends context
    studentProfileId,
    conversationHistory: messages.slice(-10),
    intent,
    conversationId,
  }),
  signal: controller.signal,
});
```

---

## 2. Payload Structure

### 2.1 Request Body

```typescript
{
  message: string;                    // User's message text
  context?: {                         // ✅ Active context object
    course?: { 
      id: string; 
      slug: string; 
      title: string 
    };
    project?: { 
      id: string; 
      title: string 
    };
    job?: { 
      id: string; 
      title: string; 
      company: string 
    };
  };
  studentProfileId: string | null;    // Student profile ID
  conversationHistory: Array<{         // Last 10 messages
    id: string;
    role: 'user' | 'assistant' | 'human';
    content: string;
    timestamp: Date;
  }>;
  intent?: string;                     // Pre-classified intent (optional)
  conversationId?: string;             // Conversation ID for persistence
}
```

### 2.2 Context Structure

**Type Definition:** `ActiveContext` (Line 40-44)

```typescript
export interface ActiveContext {
  course?: { id: string; slug: string; title: string };
  project?: { id: string; title: string };
  job?: { id: string; title: string; company: string };
}
```

**Context Loading:**
- Loaded from database on mount (Line 90-181)
- Fetched from `/api/advisor/context` endpoint
- Mapped to `activeContext` state
- **✅ Includes course/project/job IDs** when available

**Context Usage:**
- Sent in every request (Line 253, 426)
- Included in user message object (Line 217)
- Used for RAG retrieval and intent classification on backend

---

## 3. Request ID Handling

### 3.1 Request ID Generation

**Location:** `app/api/ai-advisor/chat/route.ts` (Line 656-662)

```typescript
// ✅ Request ID is generated SERVER-SIDE
const isMockMode = process.env.UAT_MOCK_AI === '1';
const requestId = isMockMode 
  ? 'mock-req-chat-12345' 
  : `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
```

**Format:**
- Production: `req_{timestamp}_{random}` (e.g., `req_1768693606406_11h3eg9`)
- Mock: `mock-req-chat-12345` (deterministic for testing)

**✅ Confirmed: Request ID is generated server-side, NOT client-side**

### 3.2 Request ID Extraction (Client-Side)

**Location:** `components/ai-advisor/AIAdvisor.tsx`

**From Response Header (Fallback):**
```typescript
// Line 270, 443
requestId = response.headers.get('X-Request-ID') || undefined;
```

**From Error Body (Preferred):**
```typescript
// Line 277, 450
requestId = errorData.error.requestId || requestId;

// Line 281, 454 (top-level fallback)
requestId = errorData.requestId || requestId;
```

**From Streaming Error:**
```typescript
// Line 334
const requestId = parsed.error.requestId;
```

**From Error Message (Regex):**
```typescript
// Line 566-567
const requestIdMatch = error.message?.match(/Request ID: ([^\\)]+)/);
const requestId = requestIdMatch?.[1] || 'N/A';
```

**Priority Order:**
1. Error body `error.requestId` (preferred)
2. Top-level `requestId` in body
3. Response header `X-Request-ID`
4. Regex extraction from error message

---

## 4. Double-Send Prevention

### 4.1 Current Implementation

**Location:** Line 210

```typescript
if (!messageText.trim() || isLoading) return;
```

**Mechanism:**
- ✅ Uses `isLoading` state flag to prevent concurrent sends
- ✅ Checks if message is empty/whitespace
- ⚠️ **No debouncing** - only prevents if already loading

**State Management:**
```typescript
// Line 68
const [isLoading, setIsLoading] = useState(false);

// Line 223 - Set before request
setIsLoading(true);

// Line 387, 407, 493, 593 - Clear after completion/error
setIsLoading(false);
```

### 4.2 Limitations

**Issues:**
1. ❌ **No debouncing** - Rapid clicks can queue multiple requests
2. ❌ **No request cancellation** - Previous request not cancelled if new one starts
3. ⚠️ **Race condition possible** - If `isLoading` is cleared before new request starts

**Example Race Condition:**
```
User clicks Send → isLoading = true → Request 1 starts
User clicks Send again → Blocked (isLoading = true) ✅
Request 1 completes → isLoading = false
User clicks Send → Request 2 starts (but Request 1 might still be processing)
```

**Recommendation:**
- Add debouncing (300-500ms)
- Cancel previous request using AbortController
- Add request queue or lock mechanism

---

## 5. Error Handling

### 5.1 Error Extraction

**Location:** Lines 264-290 (streaming), 437-463 (non-streaming)

**Process:**
1. Check `response.ok`
2. Extract error message from response body
3. Extract Request ID (header → body → regex)
4. Combine error message with Request ID
5. Throw Error with combined message

**Code:**
```typescript
if (!response.ok) {
  let errorMessage = 'Failed to get response';
  let requestId: string | undefined;
  
  // Try header first (fallback)
  requestId = response.headers.get('X-Request-ID') || undefined;
  
  try {
    const errorData = await response.json();
    if (errorData.error) {
      errorMessage = errorData.error.message || errorData.error.code || errorMessage;
      // Prefer requestId from error body
      requestId = errorData.error.requestId || requestId;
    }
  } catch {
    errorMessage = response.statusText || errorMessage;
  }
  
  const errorWithId = requestId 
    ? `${errorMessage} (Request ID: ${requestId})`
    : errorMessage;
  throw new Error(errorWithId);
}
```

### 5.2 Error Classification

**Location:** Lines 514-594

**Error Types Detected:**
1. **Timeout** (Line 518-521)
   - `AbortError`
   - Message contains "timeout", "TIMEOUT", "took too long"

2. **Network Error** (Line 524-528)
   - `Failed to fetch`
   - `NetworkError`
   - `TypeError`
   - `AbortError`

3. **Server Error** (Line 529-531)
   - Message contains "500", "Internal Server Error"

4. **Service Unavailable** (Line 573)
   - Message contains "SERVICE_UNAVAILABLE", "not configured", "LLM_API_KEY"

5. **Rate Limit** (Line 575)
   - Message contains "RATE_LIMIT_EXCEEDED", "429"

6. **Unauthorized** (Line 577)
   - Message contains "UNAUTHORIZED", "401"

### 5.3 Error Messages Displayed

**Location:** Lines 569-581

| Error Type | Message Displayed | Root Cause Shown? |
|------------|-------------------|-------------------|
| **Timeout** | "⏱️ **Taking longer than expected** — The AI response is taking too long..." | ⚠️ Generic (doesn't specify why) |
| **Network Error** | "⚠️ **Connection issue** — I couldn't reach the server..." | ⚠️ Generic |
| **Service Unavailable** | "⚠️ **Service unavailable** — The AI service is currently unavailable..." | ❌ Generic (doesn't say "LLM_API_KEY missing") |
| **Rate Limit** | "⚠️ **Rate limit exceeded** — Too many requests..." | ✅ Specific |
| **Unauthorized** | "⚠️ **Authentication error** — Your session may have expired..." | ✅ Specific |
| **Other** | "⚠️ **Error** — {error.message}" | ⚠️ Shows raw error message |

**Issues:**
- ❌ **Service Unavailable** doesn't show root cause (e.g., "LLM_API_KEY missing")
- ⚠️ **Timeout** doesn't explain why (e.g., "LLM provider slow", "Network latency")
- ⚠️ **Network Error** is generic (doesn't distinguish DNS, connection, etc.)

### 5.4 Retry Logic

**Location:** Lines 533-540

**Retry Conditions:**
```typescript
const shouldRetry = (isNetworkError || isServerError) && !isTimeout && retryCount < 2;
```

**Retry Behavior:**
- ✅ Retries network errors (max 2 retries)
- ✅ Retries server errors (5xx)
- ❌ **No retry** for timeout errors
- ❌ **No retry** for upstream errors (401, 403, 404, 429, 503)
- ✅ Exponential backoff: `1000 * Math.pow(2, retryCount)` (1s, 2s)

**Limitations:**
- ⚠️ Max 2 retries may not be enough for transient failures
- ⚠️ No jitter (all retries happen at same time)
- ⚠️ No circuit breaker (will retry even if service is down)

---

## 6. Checkpoint Summary

### ✅ Checkpoint 1: Does UI send activeCourseId / context?

**Answer: YES**

- ✅ Sends `context` object in request body (Line 253, 426)
- ✅ Context includes `course`, `project`, `job` objects when available
- ✅ Each context object includes `id`, `slug`/`title`, etc.
- ✅ Backend receives context and uses it for RAG/intent classification

**Evidence:**
```typescript
// Line 251-258
body: JSON.stringify({
  message: messageToSend,
  context: activeContext,  // ✅ Includes course/project/job
  studentProfileId,
  conversationHistory: messages.slice(-10),
  intent,
  conversationId,
})
```

### ✅ Checkpoint 2: Does it debounce / prevent double-send?

**Answer: PARTIAL**

- ✅ Prevents double-send via `isLoading` flag
- ❌ **No debouncing** - rapid clicks can queue requests
- ❌ **No request cancellation** - previous request not cancelled
- ⚠️ Race condition possible if `isLoading` cleared too early

**Evidence:**
```typescript
// Line 210
if (!messageText.trim() || isLoading) return; // ✅ Prevents if loading
// ❌ No debouncing mechanism
```

**Recommendation:**
- Add debouncing (300-500ms)
- Cancel previous request with AbortController
- Add request queue

### ⚠️ Checkpoint 3: Does it display root cause vs generic "Service unavailable"?

**Answer: PARTIAL**

- ✅ Shows specific messages for some errors (Rate Limit, Unauthorized)
- ❌ **Service Unavailable** is generic - doesn't show root cause
- ⚠️ **Timeout** is generic - doesn't explain why
- ⚠️ **Network Error** is generic - doesn't distinguish error types

**Evidence:**
```typescript
// Line 573-574
else if (error.message?.includes('SERVICE_UNAVAILABLE') || ...) {
  errorContent = "⚠️ **Service unavailable** — The AI service is currently unavailable. Please contact support if this persists." + (requestId !== 'N/A' ? `\n\n**Request ID:** ${requestId}` : '');
  // ❌ Doesn't say "LLM_API_KEY missing" or "Provider down"
}
```

**Recommendation:**
- Parse error message to extract root cause
- Show specific messages: "LLM API key missing", "OpenAI API down", etc.
- Include actionable steps: "Check environment variables", "Contact support"

---

## 7. Recommendations

### 7.1 Immediate Fixes

1. **Add Debouncing**
   ```typescript
   const debouncedSend = useMemo(
     () => debounce((msg: string) => handleSendMessage(msg), 300),
     []
   );
   ```

2. **Improve Error Messages**
   ```typescript
   if (error.message?.includes('LLM_API_KEY')) {
     errorContent = "⚠️ **Configuration Error** — LLM API key is missing. Please contact support to configure the AI service.";
   } else if (error.message?.includes('SERVICE_UNAVAILABLE')) {
     errorContent = "⚠️ **Service Unavailable** — The AI service is currently down. Please try again in a few minutes.";
   }
   ```

3. **Add Request Cancellation**
   ```typescript
   const abortControllerRef = useRef<AbortController | null>(null);
   
   // Cancel previous request
   if (abortControllerRef.current) {
     abortControllerRef.current.abort();
   }
   
   abortControllerRef.current = new AbortController();
   ```

### 7.2 Long-term Improvements

1. **Request Queue** - Queue requests if one is in progress
2. **Circuit Breaker** - Stop retrying if service is down
3. **Error Analytics** - Track error types and frequencies
4. **Progressive Timeout Warnings** - Show warnings at 15s, 30s, 45s

---

## 8. Request ID Flow Diagram

```
┌─────────────────┐
│  User Clicks    │
│     Send        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ handleSendMessage│
│  - Check isLoading│
│  - Set isLoading=true│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   sendRequest    │
│  - Create AbortController│
│  - Set timeout (45s)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  fetch('/api/   │
│  ai-advisor/    │
│  chat?stream=   │
│  true')         │
│                 │
│  Payload:       │
│  - message      │
│  - context ✅   │
│  - studentProfileId│
│  - conversationHistory│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  - Generate     │
│    requestId ✅ │
│  - Process       │
│  - Return with   │
│    X-Request-ID │
│    header        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Client Receives│
│  - Extract      │
│    requestId    │
│    from header/ │
│    body ✅      │
│  - Display error│
│    with ID      │
└─────────────────┘
```

---

## 9. Code References

### Key Files

1. **Frontend Handler:** `components/ai-advisor/AIAdvisor.tsx`
   - `handleSendMessage()` - Line 209
   - `sendRequest()` - Line 229
   - Error handling - Lines 514-594

2. **Backend API:** `app/api/ai-advisor/chat/route.ts`
   - Request ID generation - Line 656-662
   - Error responses - Lines 713-757, 1412-1431

3. **Context Loading:** `components/ai-advisor/AIAdvisor.tsx`
   - Context loading - Lines 90-181
   - Context structure - Lines 40-44

---

**End of Analysis**
