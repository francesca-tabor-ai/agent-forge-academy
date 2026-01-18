# AI Advisor Issues List

**Date:** 2025-01-27  
**Purpose:** Prioritized issue list with evidence, root causes, and fix options

---

## Issue Priority Legend

- **P0 (Critical):** Service completely unavailable, data loss, security breach
- **P1 (High):** Major functionality broken, significant user impact
- **P2 (Medium):** Minor functionality broken, workaround available
- **P3 (Low):** Enhancement, nice-to-have

---

## P0 Issues

### Issue #1: AI Service Unavailable for Valid Requests

**Severity:** P0  
**Where:** Server (API route)  
**Status:** ✅ **FIXED** (Error taxonomy implemented)

**Repro Steps:**
1. Deploy to production without `LLM_API_KEY` environment variable
2. User sends valid chat message
3. System returns 503 "AI service is not configured. Please contact support."

**Evidence:**
- **Location:** `app/api/ai-advisor/chat/route.ts:765-794`
- **Request ID Example:** `req_1706371200000_abc123`
- **Log Entry:**
  ```json
  {
    "requestId": "req_1706371200000_abc123",
    "userId": "user-123",
    "stage": "provider_config_check",
    "errorClass": "ProviderUnavailable",
    "statusCode": 503,
    "errorMessage": "LLM_API_KEY environment variable is required"
  }
  ```

**Root Cause:**
- Missing `LLM_API_KEY` environment variable in deployment
- No startup validation (fails at request time, not startup)
- Generic error message doesn't help diagnose configuration issues

**Fix Options:**
- ✅ **A (Implemented):** Centralized error taxonomy with clear error classes
- ✅ **B (Implemented):** Structured logging with correlation IDs
- **C (Future):** Startup validation with clear error messages

**Owner:** DevOps / Backend Team  
**ETA:** ✅ Fixed (2025-01-27)

---

### Issue #2: No Circuit Breaker - Cascading Failures

**Severity:** P0  
**Where:** Server (Provider layer)  
**Status:** ✅ **FIXED** (Circuit breaker implemented)

**Repro Steps:**
1. LLM provider API goes down (5xx errors)
2. Multiple requests fail
3. System continues to make requests to failing provider
4. All requests fail, no graceful degradation

**Evidence:**
- **Location:** `lib/ai/llm.ts` (before fix)
- **Request ID Example:** `req_1706371200000_xyz789`
- **Log Entry:**
  ```json
  {
    "requestId": "req_1706371200000_xyz789",
    "provider": "openai",
    "stage": "provider_call_failed",
    "statusCode": 503,
    "errorCode": "UPSTREAM_ERROR",
    "upstreamStatus": 502,
    "message": "OpenAI API error: 502 Bad Gateway"
  }
  ```

**Root Cause:**
- No circuit breaker to stop requests when provider is failing
- No fallback mechanism when primary provider fails
- All requests fail even after provider recovers

**Fix Options:**
- ✅ **A (Implemented):** Circuit breaker with per-provider isolation
- ✅ **B (Implemented):** Fallback provider support
- **C (Future):** Health checks and automatic recovery

**Owner:** Backend Team  
**ETA:** ✅ Fixed (2025-01-27)

---

## P1 Issues

### Issue #3: Missing Request Timeout - Requests Hang Indefinitely

**Severity:** P1  
**Where:** Server (Provider layer)  
**Status:** ✅ **FIXED** (Timeouts implemented)

**Repro Steps:**
1. LLM provider API is slow or unresponsive
2. Request is sent but no response received
3. Request hangs indefinitely (no timeout)
4. User sees loading spinner forever

**Evidence:**
- **Location:** `lib/ai/llm.ts` (before fix)
- **Request ID Example:** `req_1706371200000_hang456`
- **Log Entry:** None (request never completes)

**Root Cause:**
- No timeout on provider API calls
- No AbortSignal support
- No cancellation mechanism

**Fix Options:**
- ✅ **A (Implemented):** Request timeout (30s non-streaming, 60s streaming)
- ✅ **B (Implemented):** AbortSignal support for cancellation
- **C (Future):** Progressive timeout warnings

**Owner:** Backend Team  
**ETA:** ✅ Fixed (2025-01-27)

---

### Issue #4: No Retry Logic for Transient Errors

**Severity:** P1  
**Where:** Server (Provider layer)  
**Status:** ✅ **FIXED** (Retry logic implemented)

**Repro Steps:**
1. LLM provider returns 429 (rate limit) or 502 (bad gateway)
2. Request fails immediately
3. User sees error even though retry would succeed
4. No automatic recovery

**Evidence:**
- **Location:** `lib/ai/llm.ts` (before fix)
- **Request ID Example:** `req_1706371200000_retry789`
- **Log Entry:**
  ```json
  {
    "requestId": "req_1706371200000_retry789",
    "provider": "openai",
    "stage": "provider_call_failed",
    "statusCode": 429,
    "errorCode": "RATE_LIMIT_EXCEEDED",
    "upstreamStatus": 429,
    "message": "OpenAI API error: 429 Rate limit exceeded"
  }
  ```

**Root Cause:**
- No retry logic for transient errors (5xx, 429)
- No exponential backoff
- Single attempt, fails immediately

**Fix Options:**
- ✅ **A (Implemented):** Exponential backoff retry (max 3 retries)
- ✅ **B (Implemented):** Jitter to prevent thundering herd
- **C (Future):** Adaptive retry based on error type

**Owner:** Backend Team  
**ETA:** ✅ Fixed (2025-01-27)

---

### Issue #5: Generic Error Messages - No Root Cause Information

**Severity:** P1  
**Where:** Server (Error handling)  
**Status:** ✅ **FIXED** (Error taxonomy implemented)

**Repro Steps:**
1. Various errors occur (timeout, rate limit, config error)
2. All errors return generic "Service unavailable" message
3. User can't distinguish between different error types
4. Support can't diagnose issues without Request ID

**Evidence:**
- **Location:** `app/api/ai-advisor/chat/route.ts` (before fix)
- **Request ID Example:** `req_1706371200000_generic123`
- **Error Messages:**
  - Timeout: "Service unavailable"
  - Rate limit: "Service unavailable"
  - Config error: "Service unavailable"

**Root Cause:**
- No error taxonomy
- All errors mapped to generic messages
- No correlation between error type and user message

**Fix Options:**
- ✅ **A (Implemented):** Centralized error taxonomy with specific error classes
- ✅ **B (Implemented):** User-safe error messages with "Try Again" semantics
- **C (Future):** Error analytics and monitoring

**Owner:** Backend Team  
**ETA:** ✅ Fixed (2025-01-27)

---

### Issue #6: No Payload Size Validation - Memory Issues

**Severity:** P1  
**Where:** Server (API route)  
**Status:** ⚠️ **OPEN**

**Repro Steps:**
1. User sends very large conversation history (100+ messages)
2. Payload exceeds memory limits
3. Server crashes or becomes unresponsive
4. No validation prevents this

**Evidence:**
- **Location:** `app/api/ai-advisor/chat/route.ts:797`
- **Request ID Example:** `req_1706371200000_large456`
- **Log Entry:** None (server crashes before logging)

**Root Cause:**
- No payload size validation
- No message length limits
- No conversation history length limits
- No schema validation library (Zod, Yup)

**Fix Options:**
- **A (Quick):** Add basic length checks (message max 10k chars, history max 20 messages)
- **B (Robust):** Add Zod schema validation with size limits
- **C (Future):** Streaming payload parsing for large requests

**Owner:** Backend Team  
**ETA:** TBD

---

### Issue #7: RAG Retrieval Failures Are Silent

**Severity:** P1  
**Where:** Server (RAG pipeline)  
**Status:** ⚠️ **PARTIALLY FIXED** (Logging added, but no user notification)

**Repro Steps:**
1. Vector search fails (pgvector unavailable)
2. Keyword search fallback also fails
3. No chunks retrieved
4. LLM generates response without course context
5. User doesn't know context is missing

**Evidence:**
- **Location:** `lib/rag/retrieve.ts:117-240`
- **Request ID Example:** `req_1706371200000_rag789`
- **Log Entry:**
  ```json
  {
    "requestId": "req_1706371200000_rag789",
    "stage": "retrieval_complete",
    "chunksCount": 0,
    "method": "none",
    "error": "Vector search failed, keyword search also failed"
  }
  ```

**Root Cause:**
- RAG failures are logged but not surfaced to user
- No fallback behavior when retrieval is empty
- User doesn't know if answer is grounded in course content

**Fix Options:**
- ✅ **A (Implemented):** Structured logging for RAG failures
- **B (Recommended):** User notification when retrieval fails
- **C (Future):** Fallback to ask user to select/change context

**Owner:** Backend Team  
**ETA:** TBD

---

## P2 Issues

### Issue #8: No Schema Validation - Type Safety Issues

**Severity:** P2  
**Where:** Server (API route)  
**Status:** ⚠️ **OPEN**

**Repro Steps:**
1. Client sends malformed payload (wrong types, missing fields)
2. Server crashes or returns unexpected errors
3. No validation catches issues early

**Evidence:**
- **Location:** `app/api/ai-advisor/chat/route.ts:797`
- **Request ID Example:** `req_1706371200000_schema123`
- **Error:** TypeScript interface only (no runtime validation)

**Root Cause:**
- No schema validation library (Zod, Yup)
- TypeScript interfaces don't enforce runtime types
- No validation of nested objects (context, conversationHistory)

**Fix Options:**
- **A (Quick):** Add basic type checks for required fields
- **B (Recommended):** Add Zod schema validation
- **C (Future):** OpenAPI schema generation from Zod

**Owner:** Backend Team  
**ETA:** TBD

---

### Issue #9: No Rate Limiting - Potential Abuse

**Severity:** P2  
**Where:** Server (API route)  
**Status:** ✅ **FIXED**

**Repro Steps:**
1. User sends many requests rapidly
2. No rate limiting prevents abuse
3. System resources exhausted
4. Other users affected

**Evidence:**
- **Location:** `app/api/ai-advisor/chat/route.ts:747-815`
- **Request ID Example:** Multiple requests from same user/IP

**Root Cause:**
- No rate limiting middleware
- No per-user or per-IP limits
- No request throttling

**Fix Options:**
- ✅ **B (Implemented):** Per-IP and per-user rate limiting (in-memory, can upgrade to Redis)
- **C (Future):** Adaptive rate limiting based on provider limits

**Owner:** Backend Team  
**ETA:** ✅ Fixed (2025-01-27)

---

### Issue #10: Course Content Not Indexed in Production

**Severity:** P2  
**Where:** Server (RAG pipeline)  
**Status:** ⚠️ **OPEN** (Manual indexing required)

**Repro Steps:**
1. New course added to system
2. Course content not automatically indexed
3. RAG retrieval returns 0 chunks for course
4. LLM can't answer course-specific questions

**Evidence:**
- **Location:** `app/api/rag/index/route.ts`
- **Request ID Example:** `req_1706371200000_index456`
- **Log Entry:**
  ```json
  {
    "requestId": "req_1706371200000_index456",
    "courseSlug": "mastering-agentic-rag",
    "chunksCount": 0,
    "error": "Course not indexed"
  }
  ```

**Root Cause:**
- Manual indexing required (no automatic indexing)
- No background worker for indexing
- No notification when course is not indexed

**Fix Options:**
- **A (Quick):** Add health check endpoint to verify indexing
- **B (Recommended):** Add background worker for automatic indexing
- **C (Future):** Real-time indexing on course updates

**Owner:** Backend Team  
**ETA:** TBD

---

### Issue #11: No Prompt Grounding Enforcement

**Severity:** P2  
**Where:** Server (Prompt assembly)  
**Status:** ⚠️ **PARTIALLY FIXED** (Instructions added, but not enforced)

**Repro Steps:**
1. RAG retrieval returns chunks
2. LLM generates response
3. Response includes information not in retrieved chunks (hallucination)
4. User doesn't know if answer is grounded

**Evidence:**
- **Location:** `app/api/ai-advisor/chat/route.ts:549-554`
- **Request ID Example:** `req_1706371200000_ground789`
- **Prompt Instructions:** "Use the retrieved content to answer questions accurately" (soft constraint)

**Root Cause:**
- Prompt instructions are suggestions, not constraints
- No explicit prohibition on hallucination
- No citation enforcement

**Fix Options:**
- ✅ **A (Implemented):** Enhanced prompt instructions (see PROMPT_GROUNDING_AUDIT.md)
- **B (Recommended):** Add citation enforcement in response parsing
- **C (Future):** Add faithfulness scoring and evaluation

**Owner:** Backend Team  
**ETA:** TBD

---

## P3 Issues

### Issue #12: No Reranking - Retrieval Quality Could Be Better

**Severity:** P3  
**Where:** Server (RAG pipeline)  
**Status:** ⚠️ **OPEN**

**Repro Steps:**
1. User asks question about course
2. Vector search returns top K chunks
3. Chunks may not be most relevant
4. LLM uses suboptimal context

**Evidence:**
- **Location:** `lib/rag/retrieve.ts:117-240`
- **Request ID Example:** `req_1706371200000_rerank123`
- **Retrieval:** Vector similarity only, no reranking

**Root Cause:**
- No reranking step after vector search
- No cross-encoder or lightweight ranker
- Relies solely on embedding similarity

**Fix Options:**
- **A (Quick):** Add simple keyword-based reranking
- **B (Recommended):** Add cross-encoder reranking
- **C (Future):** Add learned reranker with fine-tuning

**Owner:** Backend Team  
**ETA:** TBD

---

### Issue #13: No Evaluation Harness - Can't Measure Quality

**Severity:** P3  
**Where:** System-wide  
**Status:** ⚠️ **OPEN**

**Repro Steps:**
1. System changes made (prompt updates, retrieval changes)
2. No way to measure impact on answer quality
3. Can't compare before/after
4. Can't identify regressions

**Evidence:**
- **Location:** No evaluation system exists
- **Request ID Example:** N/A

**Root Cause:**
- No evaluation harness
- No gold Q/A set
- No metrics (Recall@K, faithfulness, latency)

**Fix Options:**
- **A (Quick):** Add manual evaluation checklist
- **B (Recommended):** Add automated evaluation with gold set
- **C (Future):** Add continuous evaluation in CI/CD

**Owner:** Backend Team  
**ETA:** TBD

---

## Summary

| Priority | Count | Fixed | Open |
|----------|-------|-------|------|
| P0 | 2 | 2 | 0 |
| P1 | 5 | 3 | 2 |
| P2 | 4 | 0 | 4 |
| P3 | 2 | 0 | 2 |
| **Total** | **13** | **5** | **8** |

---

**End of Issues List**
