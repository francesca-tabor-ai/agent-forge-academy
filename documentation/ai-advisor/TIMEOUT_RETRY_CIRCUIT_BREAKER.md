# Timeouts, Retries, and Circuit Breaker

**Date:** 2025-01-27  
**Purpose:** Document timeout, retry, and circuit breaker implementation for LLM provider

---

## Overview

The LLM provider layer now includes:
- **Request timeouts** (30s non-streaming, 60s streaming)
- **Exponential backoff retry** for transient errors (5xx, 429)
- **Circuit breaker** to prevent cascading failures
- **Graceful fallback messages** with "Try Again" semantics

---

## 1. Request Timeouts

### 1.1 Timeout Configuration

**Non-Streaming Requests:**
- Default: 30 seconds
- Configurable via `LLMOptions.timeout`
- Uses `AbortSignal` for cancellation

**Streaming Requests:**
- Default: 60 seconds
- Configurable via `LLMOptions.timeout`
- Uses `AbortSignal` for cancellation

**Implementation:**
```typescript
const timeout = options?.timeout || (streaming ? 60000 : 30000);
const controller = new AbortController();
const timeoutId = setTimeout(() => {
  controller.abort();
}, timeout);

const response = await fetch(url, {
  ...options,
  signal: controller.signal,
});
```

---

### 1.2 Timeout Error Handling

**Error Message:**
```
"Request timeout - The AI response took too long. Please try again."
```

**Error Class:** `ProviderTimeout` (504)

**User Message:**
```
"The AI response is taking longer than expected. Please try again in a moment."
```

---

## 2. Exponential Backoff Retry

### 2.1 Retry Configuration

**Default Config:**
```typescript
{
  maxRetries: 3,
  initialDelay: 1000,      // 1 second
  maxDelay: 30000,          // 30 seconds
  multiplier: 2,            // Double delay each retry
  jitter: true,             // Add random jitter
}
```

**Streaming Requests:**
- Fewer retries (max 2) since streaming can't be retried mid-stream
- Shorter max delay (10 seconds)

---

### 2.2 Retryable Errors

**Retries on:**
- Server errors (5xx)
- Rate limit (429)
- Network errors (ECONNREFUSED, ETIMEDOUT, Failed to fetch)

**Does NOT retry on:**
- Client errors (4xx except 429)
- Timeout errors (user-facing timeout)
- Authentication errors (401, 403)
- Configuration errors

---

### 2.3 Exponential Backoff Calculation

**Formula:**
```typescript
delay = min(initialDelay * (multiplier ^ attempt), maxDelay)
if (jitter) {
  delay += random(0, delay * 0.5)  // Add 0-50% jitter
}
```

**Example Delays (with jitter):**
- Attempt 1: ~1-1.5 seconds
- Attempt 2: ~2-3 seconds
- Attempt 3: ~4-6 seconds
- Attempt 4: ~8-12 seconds (capped at maxDelay)

---

### 2.4 Retry Implementation

**Location:** `lib/ai/retry.ts`

**Usage:**
```typescript
const result = await withRetry(
  async () => {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = new Error(`API error: ${response.status}`);
      (error as any).statusCode = response.status;
      throw error;
    }
    return response;
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
  },
  (error: any) => error.statusCode  // Extract status code
);
```

---

## 3. Circuit Breaker

### 3.1 Circuit Breaker States

**CLOSED (Normal):**
- Circuit is closed, requests pass through
- Failures are counted
- Opens after `failureThreshold` failures

**OPEN (Failing):**
- Circuit is open, requests are rejected immediately
- Returns error: "Circuit breaker is OPEN - Provider is temporarily unavailable"
- Attempts half-open after `timeout` (60 seconds)

**HALF_OPEN (Testing):**
- Circuit is half-open, allows limited requests to test recovery
- Closes if `successThreshold` successes (2)
- Opens again if any failure

---

### 3.2 Circuit Breaker Configuration

**Default Config:**
```typescript
{
  failureThreshold: 5,      // Open after 5 failures
  successThreshold: 2,      // Close after 2 successes (half-open)
  timeout: 60000,            // 60 seconds before half-open
  resetTimeout: 300000,      // 5 minutes before resetting failure count
}
```

---

### 3.3 Circuit Breaker Behavior

**Failure Tracking:**
- Failures are counted per provider
- Only retryable errors count as failures
- Failure count resets after `resetTimeout` (5 minutes)

**State Transitions:**
```
CLOSED → (5 failures) → OPEN
OPEN → (60s timeout) → HALF_OPEN
HALF_OPEN → (2 successes) → CLOSED
HALF_OPEN → (1 failure) → OPEN
```

**Per-Provider:**
- Each provider (OpenAI, Anthropic) has its own circuit breaker
- Failures in one provider don't affect the other
- Fallback provider can still work if primary is open

---

### 3.4 Circuit Breaker Error

**Error Message:**
```
"Circuit breaker is OPEN - {provider} provider is temporarily unavailable. Please try again in a moment."
```

**Error Class:** `ProviderUnavailable` (503)

**User Message:**
```
"AI service is temporarily unavailable due to repeated failures. Please try again in a moment."
```

---

## 4. Graceful Fallback Messages

### 4.1 "Try Again" Semantics

All error messages include actionable guidance:

**Timeout:**
```
"The AI response is taking longer than expected. Please try again in a moment."
```

**Circuit Breaker:**
```
"AI service is temporarily unavailable due to repeated failures. Please try again in a moment."
```

**Rate Limit:**
```
"Too many requests. Please wait a moment and try again."
```

**Provider Unavailable:**
```
"AI service is temporarily unavailable. Please try again in a moment."
```

---

### 4.2 Error Message Structure

All error messages:
- ✅ Explain what happened (timeout, unavailable, etc.)
- ✅ Suggest action ("Please try again")
- ✅ Include timing guidance ("in a moment")
- ✅ Are user-friendly (no technical jargon)
- ✅ Include Request ID for support

---

## 5. Implementation Details

### 5.1 Provider Layer Changes

**File:** `lib/ai/llm.ts`

**Changes:**
1. Added timeout support via `AbortSignal`
2. Added retry wrapper with exponential backoff
3. Added circuit breaker checks before requests
4. Added circuit breaker state updates after requests

**Example (OpenAI Provider):**
```typescript
async generate(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
  const timeout = options?.timeout || 30000;
  
  // Check circuit breaker
  const circuitBreaker = getCircuitBreaker('openai');
  if (circuitBreaker.isOpen()) {
    throw new Error('Circuit breaker is OPEN...');
  }

  // Create timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const result = await withRetry(
      async () => {
        const response = await fetch(url, {
          signal: controller.signal,
          ...
        });
        ...
      },
      { maxRetries: 3, ... }
    );

    circuitBreaker.onSuccess();
    return result;
  } catch (error) {
    if (isRetryableError(error)) {
      circuitBreaker.onFailure();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

### 5.2 Chat Endpoint Integration

**File:** `app/api/ai-advisor/chat/route.ts`

**Changes:**
1. Pass timeout to provider (30s non-streaming, 60s streaming)
2. Errors automatically handled by error taxonomy
3. User messages include "Try Again" semantics

**Example:**
```typescript
// Streaming
for await (const chunk of llm.generateStream(llmMessages, {
  temperature: 0.7,
  maxTokens: 2000,
  timeout: STREAM_TIMEOUT_MS, // 60 seconds
})) {
  ...
}

// Non-streaming
const llmResponse = await llm.generate(llmMessages, {
  temperature: 0.7,
  maxTokens: 2000,
  timeout: 30000, // 30 seconds
});
```

---

## 6. Configuration

### 6.1 Environment Variables

**Timeouts:**
- `LLM_TIMEOUT_NON_STREAMING` (default: 30000ms)
- `LLM_TIMEOUT_STREAMING` (default: 60000ms)

**Circuit Breaker:**
- `CIRCUIT_BREAKER_FAILURE_THRESHOLD` (default: 5)
- `CIRCUIT_BREAKER_TIMEOUT` (default: 60000ms)
- `CIRCUIT_BREAKER_RESET_TIMEOUT` (default: 300000ms)

**Retry:**
- `LLM_RETRY_MAX_RETRIES` (default: 3)
- `LLM_RETRY_INITIAL_DELAY` (default: 1000ms)
- `LLM_RETRY_MAX_DELAY` (default: 30000ms)

---

## 7. Testing

### 7.1 Test Timeout

```typescript
// Test timeout behavior
const result = await llm.generate(messages, {
  timeout: 1000, // 1 second (should timeout)
});

// Expected: ProviderTimeout error
```

---

### 7.2 Test Retry

```typescript
// Mock 5xx error
mockFetch.mockResolvedValueOnce({
  ok: false,
  status: 502,
});

// Should retry 3 times before failing
const result = await llm.generate(messages);

// Expected: Retries 3 times, then fails
```

---

### 7.3 Test Circuit Breaker

```typescript
// Trigger 5 failures
for (let i = 0; i < 5; i++) {
  try {
    await llm.generate(messages);
  } catch (error) {
    // Expected failures
  }
}

// Next request should be rejected immediately
try {
  await llm.generate(messages);
} catch (error) {
  // Expected: "Circuit breaker is OPEN"
}
```

---

## 8. Monitoring

### 8.1 Metrics to Track

1. **Timeout Rate:**
   - Percentage of requests that timeout
   - Average timeout duration
   - Timeout by provider

2. **Retry Rate:**
   - Percentage of requests that retry
   - Average retry count
   - Retry success rate

3. **Circuit Breaker State:**
   - Time in OPEN state
   - Number of times circuit opens
   - Recovery time (OPEN → CLOSED)

---

## 9. Summary

### Implemented Features

✅ **Request Timeouts:**
- 30s for non-streaming
- 60s for streaming
- Configurable via options

✅ **Exponential Backoff Retry:**
- Retries transient errors (5xx, 429)
- Exponential backoff with jitter
- Max 3 retries (2 for streaming)

✅ **Circuit Breaker:**
- Opens after 5 failures
- Half-open after 60s
- Closes after 2 successes
- Per-provider isolation

✅ **Graceful Fallback Messages:**
- User-friendly error messages
- "Try Again" semantics
- Actionable guidance

---

**End of Timeout, Retry, and Circuit Breaker Documentation**
