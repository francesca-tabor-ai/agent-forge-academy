# AI Advisor Fix Options

**Date:** 2025-01-27  
**Purpose:** A/B/C fix plan with estimated effort and risk assessment

---

## Fix Option Categories

- **Option A (Hotfix):** Quick fixes to restore service (1-2 days)
- **Option B (Reliability Upgrade):** Production-ready improvements (3-5 days)
- **Option C (Quality Upgrade):** Enhanced features and quality (1-2 weeks)

---

## Option A: Hotfix (Restore Service Fast)

**Goal:** Fix critical issues quickly to restore service availability

**Effort:** 1-2 days  
**Risk:** Low (targeted fixes, minimal changes)

### A1: Validate Environment Variables at Startup ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 2 hours  
**Risk:** Low

**Changes:**
- Add startup validation for `LLM_API_KEY`
- Fail fast with clear error messages
- Log configuration issues at startup

**Files:**
- `app/api/ai-advisor/health/route.ts` (already exists)
- Add startup check in `middleware.ts` or `app/layout.tsx`

**Impact:**
- Prevents "Service unavailable" errors from missing config
- Clear error messages for DevOps
- Faster diagnosis of configuration issues

---

### A2: Improve Error Mapping ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 4 hours  
**Risk:** Low

**Changes:**
- Centralized error taxonomy (`lib/ai-advisor/error-taxonomy.ts`)
- Specific error classes (ValidationError, AuthError, RateLimitError, etc.)
- User-safe error messages with "Try Again" semantics

**Files:**
- `lib/ai-advisor/error-taxonomy.ts` (new)
- `app/api/ai-advisor/chat/route.ts` (updated)

**Impact:**
- Clear error messages for users
- Better debugging with error classes
- Consistent error handling

---

### A3: Add Retry/Backoff for 429/5xx ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 6 hours  
**Risk:** Medium

**Changes:**
- Exponential backoff retry (`lib/ai/retry.ts`)
- Retries transient errors (5xx, 429)
- Jitter to prevent thundering herd

**Files:**
- `lib/ai/retry.ts` (new)
- `lib/ai/llm.ts` (updated)

**Impact:**
- Automatic recovery from transient failures
- Better user experience (fewer errors)
- Reduced load on provider during outages

---

### A4: Add Request Timeout and Cancellation ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 4 hours  
**Risk:** Low

**Changes:**
- Request timeout (30s non-streaming, 60s streaming)
- AbortSignal support for cancellation
- Timeout errors mapped to ProviderTimeout

**Files:**
- `lib/ai/llm.ts` (updated)
- `app/api/ai-advisor/chat/route.ts` (updated)

**Impact:**
- Prevents hanging requests
- Better resource management
- Clear timeout error messages

---

### A5: Add Diagnostics Log Line Keyed by Request ID ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 8 hours  
**Risk:** Low

**Changes:**
- Structured logging with correlation IDs
- Request ID in all logs
- Latency tracking per stage

**Files:**
- `app/api/ai-advisor/chat/route.ts` (updated)
- `lib/utils/redactPII.ts` (existing)

**Impact:**
- Easy debugging with Request ID
- Performance monitoring
- Error tracing

---

### A6: Add Basic Payload Validation ⚠️ **TODO**

**Status:** ⚠️ Not Started  
**Effort:** 4 hours  
**Risk:** Low

**Changes:**
- Add message length validation (max 10k chars)
- Add conversation history length limit (max 20 messages)
- Add basic type checks

**Files:**
- `app/api/ai-advisor/chat/route.ts` (update)

**Impact:**
- Prevents memory issues
- Better error messages for invalid input
- Improved security

---

## Option B: Reliability Upgrade (Production-Ready)

**Goal:** Improve reliability with proper error handling, monitoring, and fallbacks

**Effort:** 3-5 days  
**Risk:** Medium (more changes, requires testing)

### B1: Add Structured Logging + Tracing Spans ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 8 hours  
**Risk:** Low

**Changes:**
- Structured logging at key stages:
  - `context.resolve`
  - `retrieval.query`
  - `prompt.build`
  - `provider.call`
- Correlation IDs (Request ID) in all logs
- Latency tracking per stage

**Files:**
- `app/api/ai-advisor/chat/route.ts` (updated)
- `lib/rag/retrieve.ts` (updated)

**Impact:**
- Better observability
- Performance monitoring
- Easy debugging

---

### B2: Implement Circuit Breaker ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 6 hours  
**Risk:** Medium

**Changes:**
- Circuit breaker per provider (`lib/ai/circuit-breaker.ts`)
- Opens after 5 failures
- Half-open after 60s
- Closes after 2 successes

**Files:**
- `lib/ai/circuit-breaker.ts` (new)
- `lib/ai/llm.ts` (updated)

**Impact:**
- Prevents cascading failures
- Faster failure detection
- Automatic recovery

---

### B3: Add Fallback Behavior When Retrieval Is Empty ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 4 hours  
**Risk:** Low

**Changes:**
- Check if retrieval returns 0 chunks
- Ask user to select/change context
- Explain missing index
- Provide actionable guidance

**Files:**
- `app/api/ai-advisor/chat/route.ts` (updated)

**Impact:**
- Better user experience
- Clear guidance when context is missing
- Prevents confusion
- System prompt includes fallback instructions
- Response metadata includes retrievalEmpty flag

---

### B4: Add Queue/Worker for Indexing ⚠️ **TODO**

**Status:** ⚠️ Not Started  
**Effort:** 2-3 days  
**Risk:** Medium

**Changes:**
- Background worker for indexing
- Queue system (Bull, BullMQ, or similar)
- Automatic indexing on course updates
- Retry logic for failed indexing

**Files:**
- `lib/rag/indexLessons.ts` (update)
- New worker file (e.g., `workers/index-worker.ts`)
- Queue configuration

**Impact:**
- Automatic indexing
- No manual intervention needed
- Better reliability

---

### B5: Add Synthetic Health Checks ⚠️ **TODO**

**Status:** ⚠️ Partially Done (health endpoint exists)  
**Effort:** 4 hours  
**Risk:** Low

**Changes:**
- Provider connectivity check
- Vector store connectivity check
- Index existence check
- Comprehensive health endpoint

**Files:**
- `app/api/ai-advisor/health/route.ts` (update)
- New health check utilities

**Impact:**
- Proactive issue detection
- Better monitoring
- Faster diagnosis

---

### B6: Add Schema Validation with Zod ⚠️ **TODO**

**Status:** ⚠️ Not Started  
**Effort:** 6 hours  
**Risk:** Low

**Changes:**
- Add Zod schema validation
- Validate request payload
- Validate context structure
- Validate conversation history

**Files:**
- `app/api/ai-advisor/chat/route.ts` (update)
- New schema file (e.g., `lib/schemas/chat-request.ts`)

**Impact:**
- Type safety at runtime
- Better error messages
- Prevents invalid requests

---

### B7: Add Rate Limiting ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 1 day  
**Risk:** Medium

**Changes:**
- Per-user rate limiting (10 requests/min)
- Per-IP rate limiting (20 requests/min)
- Return 429 with retry-after header
- In-memory rate limiting (can be upgraded to Redis)

**Files:**
- `lib/utils/rateLimit.ts` (rate limiting utilities)
- `app/api/ai-advisor/chat/route.ts` (integrated)

**Impact:**
- Prevents abuse
- Better resource management
- Fair usage
- Returns proper rate limit headers (X-RateLimit-*)

---

## Option C: Quality Upgrade (Better Answers)

**Goal:** Enhance answer quality, retrieval, and user experience

**Effort:** 1-2 weeks  
**Risk:** High (major changes, requires testing and evaluation)

### C1: Add Reranking ⚠️ **TODO**

**Status:** ⚠️ Not Started  
**Effort:** 3-4 days  
**Risk:** Medium

**Changes:**
- Add cross-encoder reranking
- Rerank top K chunks from vector search
- Improve retrieval quality

**Files:**
- `lib/rag/retrieve.ts` (update)
- New reranking utility

**Impact:**
- Better retrieval quality
- More relevant context
- Improved answer quality

---

### C2: Add Per-Course Namespaces and Strict Filtering ⚠️ **TODO**

**Status:** ⚠️ Partially Done (course slug filtering exists)  
**Effort:** 2 days  
**Risk:** Low

**Changes:**
- Strict filtering by active course
- Namespace per course in vector store
- Prevent cross-course contamination

**Files:**
- `lib/rag/retrieve.ts` (update)
- Database schema (if needed)

**Impact:**
- Better context isolation
- More accurate answers
- Prevents confusion

---

### C3: Add Citations (Doc ID / Title / Snippet) ✅ **DONE**

**Status:** ✅ Implemented  
**Effort:** 4 hours  
**Risk:** Low

**Changes:**
- Generate citations from retrieved chunks
- Include doc ID, title, snippet
- Format citations in response

**Files:**
- `lib/rag/retrieve.ts` (existing)
- `app/api/ai-advisor/chat/route.ts` (existing)

**Impact:**
- Better transparency
- User can verify sources
- Improved trust

---

### C4: Add Eval Harness ⚠️ **TODO**

**Status:** ⚠️ Not Started  
**Effort:** 1 week  
**Risk:** Medium

**Changes:**
- Gold Q/A set for course
- Retrieval metrics (Recall@K)
- Answer faithfulness scoring
- Automated evaluation

**Files:**
- New evaluation files (e.g., `tests/eval/`)
- Evaluation scripts

**Impact:**
- Measure quality improvements
- Identify regressions
- Data-driven decisions

---

### C5: Add Prompt Tuning and Safety ⚠️ **PARTIALLY DONE**

**Status:** ⚠️ Partially Done (prompt improvements added)  
**Effort:** 2-3 days  
**Risk:** Low

**Changes:**
- Enhanced grounding instructions
- Refusal when context missing
- Hallucination prevention
- Safety guardrails

**Files:**
- `app/api/ai-advisor/chat/route.ts` (update buildLLMMessages)
- Prompt templates

**Impact:**
- Better answer quality
- Reduced hallucination
- Improved safety

---

## Implementation Priority

### Phase 1: Critical Fixes (Week 1) ✅ **DONE**

1. ✅ Error taxonomy and mapping
2. ✅ Request timeouts
3. ✅ Retry logic
4. ✅ Circuit breaker
5. ✅ Structured logging

**Status:** ✅ Complete

---

### Phase 2: Reliability (Week 2-3) ⚠️ **IN PROGRESS**

1. ⚠️ Payload validation (A6)
2. ⚠️ Schema validation (B6)
3. ⚠️ Rate limiting (B7)
4. ⚠️ Health checks (B5)
5. ⚠️ Fallback behavior (B3)

**Status:** ⚠️ Not Started

---

### Phase 3: Quality (Week 4-6) ⚠️ **PLANNED**

1. ⚠️ Reranking (C1)
2. ⚠️ Per-course namespaces (C2)
3. ⚠️ Eval harness (C4)
4. ⚠️ Prompt tuning (C5)

**Status:** ⚠️ Not Started

---

## Risk Assessment

### Low Risk
- Error taxonomy ✅
- Request timeouts ✅
- Structured logging ✅
- Payload validation
- Schema validation
- Health checks

### Medium Risk
- Retry logic ✅
- Circuit breaker ✅
- Rate limiting
- Fallback behavior
- Reranking

### High Risk
- Queue/worker for indexing
- Eval harness
- Major prompt changes

---

## Effort Summary

| Option | Effort | Risk | Status |
|--------|--------|------|--------|
| **A: Hotfix** | 1-2 days | Low | ✅ 5/6 Done |
| **B: Reliability** | 3-5 days | Medium | ⚠️ 2/7 Done |
| **C: Quality** | 1-2 weeks | High | ⚠️ 1/5 Done |

---

## Recommendations

1. **Immediate (This Week):**
   - Complete A6 (Payload validation)
   - Start B6 (Schema validation)

2. **Short-term (Next 2 Weeks):**
   - Complete B3 (Fallback behavior)
   - Complete B5 (Health checks)
   - Start B7 (Rate limiting)

3. **Medium-term (Next Month):**
   - Complete B4 (Queue/worker)
   - Start C1 (Reranking)
   - Start C4 (Eval harness)

4. **Long-term (Next Quarter):**
   - Complete C4 (Eval harness)
   - Complete C5 (Prompt tuning)
   - Continuous improvement

---

**End of Fix Options**
