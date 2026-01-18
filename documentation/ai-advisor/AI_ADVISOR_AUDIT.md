# AI Advisor (RAG Chatbot) — End-to-End Audit Report

**Branch:** `chore/audit-ai-advisor-rag`  
**Date:** 2025-01-27  
**Auditor:** Cursor AI Assistant  
**Scope:** Frontend → API → RAG Pipeline → LLM Provider

---

## Executive Summary

This audit examines the AI Advisor system end-to-end, identifying failure modes, root causes, and actionable fix options. The system is functional but has reliability gaps that can cause "Service Unavailable" errors and degraded user experience.

**Key Findings:**
- ✅ **Working:** Core functionality, RAG retrieval, intent classification, streaming responses
- ⚠️ **Issues:** Missing API key validation, no circuit breakers, limited retry logic, timeout handling gaps
- 🔴 **Critical:** No fallback when LLM provider fails, RAG failures are silent, no rate limiting

---

## 1. System Map

### 1.1 Frontend Components

| Component | File | Role | Key Features |
|-----------|------|------|--------------|
| **AIAdvisor** | `components/ai-advisor/AIAdvisor.tsx` | Main chat UI | Message handling, context management, streaming support, error display |
| **ChatPanel** | `components/ai-advisor/ChatPanel.tsx` | Message display | Renders messages, error banners, retry buttons |
| **ContextBar** | `components/ai-advisor/ContextBar.tsx` | Context selector | Shows active course/project/job context |
| **VoiceControls** | `components/ai-advisor/VoiceControls.tsx` | Voice input | Speech-to-text, text-to-speech |
| **WebRTCRealtime** | `components/ai-advisor/WebRTCRealtime.tsx` | Real-time voice | WebRTC-based voice chat |

**Frontend Flow:**
```
User Input → AIAdvisor.handleSendMessage()
  → POST /api/ai-advisor/chat?stream=true
  → Stream SSE chunks → Update UI in real-time
  → Display response or error with Request ID
```

### 1.2 API Routes

| Route | File | Role | Key Features |
|-------|------|------|--------------|
| **POST /api/ai-advisor/chat** | `app/api/ai-advisor/chat/route.ts` | Main chat endpoint | Streaming/non-streaming, RAG, intent classification, LLM generation |
| **GET /api/ai-advisor/health** | `app/api/ai-advisor/health/route.ts` | Health check | Validates LLM provider configuration |
| **POST /api/ai-advisor/voice** | `app/api/ai-advisor/voice/route.ts` | Voice transcription | Audio → text → chat endpoint |

**API Flow:**
```
Request → Auth Check → LLM Config Validation → Context Loading
  → Intent Classification → RAG Retrieval (if needed)
  → LLM Generation (streaming/non-streaming)
  → Response with citations + next actions
```

### 1.3 RAG Pipeline

| Component | File | Role | Key Features |
|-----------|------|------|--------------|
| **retrieveChunks** | `lib/rag/retrieve.ts` | Content retrieval | Vector search (pgvector) → keyword search fallback |
| **formatChunksForContext** | `lib/rag/retrieve.ts` | Context formatting | Formats chunks with citations for LLM |
| **getEmbeddingProvider** | `lib/rag/embeddings.ts` | Embedding generation | OpenAI embeddings for query vectorization |
| **indexLessons** | `lib/rag/indexLessons.ts` | Content indexing | Chunks lessons, generates embeddings, stores in DB |

**RAG Flow:**
```
Query → Embedding Generation → Vector Search (pgvector)
  → If no results → Keyword Search (PostgreSQL full-text)
  → Format chunks → Add to LLM system prompt
```

### 1.4 LLM Provider Layer

| Component | File | Role | Key Features |
|-----------|------|------|--------------|
| **getLLMProvider** | `lib/ai/llm.ts` | Provider factory | Returns OpenAI or Anthropic provider |
| **getLLMProviderWithFallback** | `lib/ai/llm.ts` | Fallback support | Tries primary, falls back to secondary if configured |
| **OpenAIProvider** | `lib/ai/llm.ts` | OpenAI client | Streaming/non-streaming, handles API errors |
| **AnthropicProvider** | `lib/ai/llm.ts` | Anthropic client | Streaming/non-streaming, handles API errors |

**LLM Flow:**
```
Messages → Provider.generateStream() or generate()
  → API call (OpenAI/Anthropic)
  → Stream chunks or full response
  → Error handling with status codes
```

### 1.5 Supporting Systems

| Component | File | Role |
|-----------|------|------|
| **classifyIntent** | `lib/ai/intent.ts` | Intent classification (rule-based → LLM fallback) |
| **getToolsForIntent** | `lib/ai/intent.ts` | Tool selection based on intent |
| **generateNextActions** | `lib/ai/nextActions.ts` | Generate structured next actions |
| **safeLogger** | `lib/utils/redactPII.ts` | Structured logging with PII redaction |
| **logRequest** | `lib/utils/request-logger.ts` | Request logging to database |

---

## 2. Known Failure Modes

### 2.1 Configuration Failures

**Failure:** `SERVICE_UNAVAILABLE` (503) - "AI service is not configured"

**Root Cause:**
- `LLM_API_KEY` environment variable missing or invalid
- Provider initialization fails silently until first request

**Evidence:**
- Lines 682-694, 728-758 in `app/api/ai-advisor/chat/route.ts`
- Error logged but only returned after auth check
- No startup validation

**Repro Steps:**
1. Remove `LLM_API_KEY` from environment
2. Send message in AI Advisor
3. See "Service unavailable" error with Request ID

**Impact:** High - Blocks all AI functionality

---

### 2.2 LLM Provider Failures

**Failure:** `UPSTREAM_ERROR` (500) or provider-specific errors

**Root Causes:**
- OpenAI/Anthropic API down or rate-limited
- Invalid API key (401)
- Network timeout
- Model unavailable

**Evidence:**
- Lines 1076-1124 (streaming), 1379-1432 (non-streaming) in `app/api/ai-advisor/chat/route.ts`
- Error codes: `SERVICE_UNAVAILABLE`, `UNAUTHORIZED`, `RATE_LIMIT_EXCEEDED`
- No automatic retry for transient failures
- Fallback provider only works if `LLM_FALLBACK_PROVIDER` is set

**Repro Steps:**
1. Set invalid `LLM_API_KEY`
2. Send message
3. See error (401 Unauthorized) with Request ID

**Impact:** High - Blocks all AI functionality

---

### 2.3 RAG Retrieval Failures

**Failure:** Silent fallback to keyword search or empty context

**Root Causes:**
- Embeddings not generated (no `LLM_API_KEY` for embeddings)
- Vector search RPC function missing (`match_lesson_chunks`)
- Database connection issues
- No chunks indexed

**Evidence:**
- Lines 125-152 in `lib/rag/retrieve.ts`
- Falls back silently to keyword search
- No error logged if vector search fails
- Continues without RAG context if retrieval fails

**Repro Steps:**
1. Remove embeddings from `lesson_chunks` table
2. Send course-related question
3. System uses keyword search (no error shown)
4. Quality may degrade but no user-visible error

**Impact:** Medium - Degrades response quality but doesn't break functionality

---

### 2.4 Timeout Failures

**Failure:** `TIMEOUT` (504) - "Response took too long"

**Root Causes:**
- LLM provider slow response (>60s server timeout, >45s client timeout)
- Network latency
- Large context window causing slow generation

**Evidence:**
- Lines 1024-1053 (streaming timeout) in `app/api/ai-advisor/chat/route.ts`
- Client timeout: 45s (line 232 in `AIAdvisor.tsx`)
- Server timeout: 60s (line 1024)
- No progressive timeout warnings

**Repro Steps:**
1. Simulate slow LLM response (network throttling)
2. Send message
3. After 45s, client aborts
4. See timeout error

**Impact:** Medium - User experience degradation

---

### 2.5 Intent Classification Failures

**Failure:** Falls back to `general` intent, wrong tools selected

**Root Causes:**
- LLM-based classification fails (no API key, timeout)
- Rule-based classification has low confidence
- Context not loaded properly

**Evidence:**
- Lines 943-970 in `app/api/ai-advisor/chat/route.ts`
- Falls back to `general` intent on error
- Wrong tools may be selected (e.g., RAG not used when needed)

**Repro Steps:**
1. Disable LLM provider
2. Send ambiguous message
3. Intent classification fails → uses `general` intent
4. RAG may not be triggered when it should be

**Impact:** Low-Medium - Degrades response quality

---

### 2.6 Database Write Failures

**Failure:** Conversation history not saved

**Root Causes:**
- Supabase connection issues
- Database write errors
- Missing `studentProfileId`

**Evidence:**
- Lines 1256, 1554 in `app/api/ai-advisor/chat/route.ts`
- Errors logged but request continues
- No retry for DB writes

**Repro Steps:**
1. Disconnect from Supabase
2. Send message
3. Response generated but not saved
4. No user-visible error

**Impact:** Low - Functionality works but history lost

---

### 2.7 Network/Client Failures

**Failure:** `AbortError` or "Connection issue"

**Root Causes:**
- Client-side timeout (45s)
- Network disconnection
- Server unreachable

**Evidence:**
- Lines 514-594 in `components/ai-advisor/AIAdvisor.tsx`
- Retry logic for network errors (max 2 retries with exponential backoff)
- No retry for timeout errors

**Repro Steps:**
1. Disconnect network mid-request
2. See "Connection issue" error
3. Message restored in input for retry

**Impact:** Medium - User can retry manually

---

## 3. Issue Table

| # | Severity | Impact | Owner | Root Cause | Fix Options |
|---|----------|--------|-------|------------|-------------|
| **1** | 🔴 Critical | Blocks all AI functionality | Backend | Missing `LLM_API_KEY` validation at startup | **Option A:** Add startup check + health endpoint<br>**Option B:** Add circuit breaker + fallback provider<br>**Option C:** Add configuration validation in CI/CD |
| **2** | 🔴 Critical | Blocks all AI functionality | Backend | LLM provider failures (API down, rate limit, invalid key) | **Option A:** Add retry with exponential backoff<br>**Option B:** Add circuit breaker + fallback provider<br>**Option C:** Add queue system for retries |
| **3** | 🟡 Medium | Degrades response quality | Backend | RAG retrieval failures are silent | **Option A:** Log RAG failures, continue without context<br>**Option B:** Add RAG health check, warn user if degraded<br>**Option C:** Add RAG retry logic, fallback to keyword search |
| **4** | 🟡 Medium | Poor user experience | Frontend/Backend | Timeout handling (45s client, 60s server) | **Option A:** Increase timeouts, add progress indicator<br>**Option B:** Add progressive timeout warnings<br>**Option C:** Add streaming heartbeat, adaptive timeouts |
| **5** | 🟡 Medium | Degrades response quality | Backend | Intent classification failures fall back to `general` | **Option A:** Improve rule-based classifier<br>**Option B:** Add intent classification retry<br>**Option C:** Add intent confidence threshold, warn user |
| **6** | 🟢 Low | History lost | Backend | Database write failures are silent | **Option A:** Log DB write errors, continue<br>**Option B:** Add DB write retry logic<br>**Option C:** Add queue for async DB writes |
| **7** | 🟡 Medium | User must retry manually | Frontend | Network errors have limited retry (2 attempts) | **Option A:** Increase retry count to 3<br>**Option B:** Add smarter retry logic (exponential backoff)<br>**Option C:** Add offline queue for retries |
| **8** | 🟡 Medium | No rate limiting | Backend | No rate limiting on chat endpoint | **Option A:** Add basic rate limiting (per user)<br>**Option B:** Add tiered rate limiting (free/paid)<br>**Option C:** Add rate limiting with queue system |

---

## 4. Fix Plan Options

### Option A: Minimal Hotfix (Restore Service Quickly)

**Goal:** Fix critical issues to restore service quickly (1-2 days)

**Changes:**

1. **Add LLM Configuration Validation at Startup**
   - File: `app/api/ai-advisor/chat/route.ts`
   - Add startup check in route handler (before auth)
   - Return 503 immediately if `LLM_API_KEY` missing
   - Log error with Request ID

2. **Add Basic Retry Logic for LLM Provider**
   - File: `lib/ai/llm.ts`
   - Add retry wrapper for `generate()` and `generateStream()`
   - Retry on 429, 500, 502, 503 (max 2 retries, exponential backoff)
   - Skip retry on 401, 400 (configuration errors)

3. **Improve Error Messages**
   - File: `components/ai-advisor/AIAdvisor.tsx`
   - Add more specific error messages for each error code
   - Show actionable steps (e.g., "Check your connection", "Contact support")

4. **Add RAG Failure Logging**
   - File: `lib/rag/retrieve.ts`
   - Log when vector search fails and falls back to keyword search
   - Log when no chunks retrieved

**Pros:**
- Quick to implement
- Fixes critical issues
- Minimal code changes

**Cons:**
- Doesn't address root causes
- No circuit breakers
- Limited retry logic

---

### Option B: Reliability Upgrade (Timeouts/Retries/Validation/Guardrails)

**Goal:** Improve reliability with proper error handling and retries (3-5 days)

**Changes:**

1. **Add Circuit Breaker for LLM Provider**
   - New file: `lib/ai/circuit-breaker.ts`
   - Implement circuit breaker pattern
   - Open circuit after 5 failures in 60s
   - Half-open after 30s, close on success
   - Use fallback provider if primary circuit is open

2. **Add Comprehensive Retry Logic**
   - File: `lib/ai/llm.ts`
   - Retry wrapper with exponential backoff
   - Configurable retry counts per error type
   - Jitter to prevent thundering herd
   - Max retry delay: 30s

3. **Add Timeout Improvements**
   - File: `app/api/ai-advisor/chat/route.ts`
   - Progressive timeout warnings (15s, 30s, 45s)
   - Streaming heartbeat (send empty chunks every 10s)
   - Adaptive timeouts based on provider latency

4. **Add Rate Limiting**
   - New file: `lib/middleware/rate-limit.ts`
   - Per-user rate limiting (10 requests/min)
   - Per-IP rate limiting (20 requests/min)
   - Return 429 with retry-after header

5. **Add Configuration Validation**
   - File: `app/api/ai-advisor/health/route.ts`
   - Enhanced health check with provider connectivity test
   - Startup validation in `next.config.js` or middleware
   - Fail fast if configuration invalid

6. **Add RAG Health Check**
   - File: `lib/rag/retrieve.ts`
   - Check if embeddings available before vector search
   - Log RAG health status
   - Warn user if RAG degraded (optional UI indicator)

7. **Add Intent Classification Retry**
   - File: `lib/ai/intent.ts`
   - Retry LLM-based classification on failure
   - Fallback to rule-based if LLM fails
   - Cache intent for similar messages

8. **Add Database Write Retry**
   - File: `app/api/ai-advisor/chat/route.ts`
   - Retry DB writes with exponential backoff (max 3 retries)
   - Log failures but don't fail request

**Pros:**
- Comprehensive error handling
- Better user experience
- More resilient to failures

**Cons:**
- More complex implementation
- Requires testing
- May need monitoring/alerting

---

### Option C: Quality Upgrade (Retrieval Improvements, Evals, Reranking)

**Goal:** Improve response quality and retrieval accuracy (1-2 weeks)

**Changes:**

1. **Improve RAG Retrieval**
   - File: `lib/rag/retrieve.ts`
   - Add hybrid search (vector + keyword)
   - Add reranking (cross-encoder model)
   - Add query expansion (synonyms, related terms)
   - Add chunk filtering by relevance score

2. **Add RAG Evaluation**
   - New file: `lib/rag/evaluate.ts`
   - Evaluate retrieval quality (precision, recall)
   - A/B test different retrieval strategies
   - Log retrieval metrics

3. **Improve Intent Classification**
   - File: `lib/ai/intent.ts`
   - Fine-tune rule-based classifier
   - Add confidence thresholds
   - Cache intent for conversation context

4. **Add Response Quality Checks**
   - File: `app/api/ai-advisor/chat/route.ts`
   - Validate response length, format
   - Check for hallucinations (optional)
   - Add response quality score

5. **Add Context Window Management**
   - File: `app/api/ai-advisor/chat/route.ts`
   - Truncate context if too large
   - Prioritize recent messages
   - Compress old context

6. **Add Citations Validation**
   - File: `lib/rag/retrieve.ts`
   - Validate citations match retrieved chunks
   - Add citation quality score
   - Warn if citations missing

**Pros:**
- Better response quality
- More accurate retrieval
- Better user experience

**Cons:**
- Requires ML models (reranking)
- More complex implementation
- May need infrastructure changes

---

## 5. Recommended Approach

**Immediate (Option A):** Fix critical issues to restore service
- Add LLM configuration validation
- Add basic retry logic
- Improve error messages

**Short-term (Option B):** Improve reliability
- Add circuit breaker
- Add comprehensive retry logic
- Add rate limiting
- Add timeout improvements

**Long-term (Option C):** Improve quality
- Improve RAG retrieval
- Add evaluation
- Improve intent classification

---

## 6. Testing Recommendations

1. **Unit Tests**
   - Test retry logic with mock failures
   - Test circuit breaker state transitions
   - Test RAG retrieval fallbacks

2. **Integration Tests**
   - Test end-to-end chat flow
   - Test error handling paths
   - Test timeout scenarios

3. **E2E Tests**
   - Test UI error display
   - Test retry functionality
   - Test timeout handling

4. **Load Tests**
   - Test rate limiting
   - Test concurrent requests
   - Test circuit breaker under load

---

## 7. Monitoring & Observability

**Current State:**
- ✅ Request ID tracking
- ✅ Structured logging
- ✅ Error codes
- ❌ No metrics/alerting
- ❌ No dashboards

**Recommendations:**
1. Add metrics (request rate, error rate, latency)
2. Add alerting (circuit breaker open, high error rate)
3. Add dashboards (success rate, latency, error breakdown)
4. Add tracing (distributed tracing for request flow)

---

## 8. Next Steps

1. **Review this audit** with team
2. **Prioritize fixes** based on severity and impact
3. **Implement Option A** (hotfix) immediately
4. **Plan Option B** (reliability upgrade) for next sprint
5. **Consider Option C** (quality upgrade) for future

---

## Appendix: File Reference

### Key Files Audited

- `app/api/ai-advisor/chat/route.ts` - Main chat endpoint (1723 lines)
- `components/ai-advisor/AIAdvisor.tsx` - Frontend chat UI (1024 lines)
- `lib/rag/retrieve.ts` - RAG retrieval (196 lines)
- `lib/ai/llm.ts` - LLM provider (404 lines)
- `lib/ai/intent.ts` - Intent classification (308 lines)
- `lib/rag/embeddings.ts` - Embedding provider (96 lines)
- `app/api/ai-advisor/health/route.ts` - Health check (84 lines)

### Documentation Files

- `documentation/ai-advisor/DIAGNOSTICS_FIX_SUMMARY.md` - Previous fixes
- `documentation/ai-advisor/AI_ADVISOR_UAT_MAPPING.md` - UAT mapping
- `documentation/api/STRUCTURED_LOGGING.md` - Logging format

---

**End of Audit Report**
