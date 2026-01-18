# AI Advisor Structured Logging Guide

**Date:** 2025-01-27  
**Purpose:** Guide for using structured logging to debug AI Advisor issues

---

## Overview

The AI Advisor chat endpoint now includes comprehensive structured logging with correlation IDs (Request IDs) and latency tracking at each stage of the request lifecycle.

---

## Log Stages

### 1. Request Received

**Stage:** `request_received`  
**When:** Immediately after parsing request body

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "payload": {
    "message": "[REDACTED: truncated]",
    "context": { "course": {...}, "project": {...}, "job": {...} },
    "studentProfileId": "***",
    "conversationHistoryLength": 5,
    "intent": "learning_help",
    "conversationId": "conv-456"
  },
  "messageLength": 42,
  "stage": "request_received",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

**What to Check:**
- ✅ Request ID is present
- ✅ Payload structure is correct
- ✅ Context is included (course/project/job)

---

### 2. Context Resolved

**Stage:** `context_resolved`  
**When:** After loading active context from database

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "activeContext": {
    "activeCourseId": "course-123",
    "activeProjectId": null,
    "activeJobId": null
  },
  "latency": 45,
  "stage": "context_resolved",
  "timestamp": "2025-01-27T10:30:00.045Z"
}
```

**What to Check:**
- ✅ Latency is reasonable (< 100ms)
- ✅ Active context matches request context
- ⚠️ If `context_load_failed`, check database connection

---

### 3. Context Data Fetched

**Stage:** `context_data_fetched`  
**When:** After fetching course/project/job data from database

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "hasCourseData": true,
  "hasProjectData": false,
  "hasJobData": false,
  "hasUserProfile": true,
  "activeContextIds": {
    "courseId": "course-123",
    "projectId": null,
    "jobId": null
  },
  "latency": 120,
  "stage": "context_data_fetched",
  "timestamp": "2025-01-27T10:30:00.165Z"
}
```

**What to Check:**
- ✅ Data fetched successfully
- ✅ Latency is reasonable (< 200ms)
- ⚠️ If `context_data_fetch_failed`, check database queries

---

### 4. Retrieval Query

**Stage:** `retrieval_query`  
**When:** Before RAG retrieval starts

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "query": "[REDACTED: truncated]",
  "courseSlug": "agentic-rag",
  "limit": 5,
  "minScore": 0.5,
  "stage": "retrieval_query",
  "timestamp": "2025-01-27T10:30:00.200Z"
}
```

**What to Check:**
- ✅ Query is properly formatted
- ✅ Course slug is correct (if filtering by course)
- ✅ Limit and minScore are reasonable

---

### 5. Retrieval Results

**Stage:** `retrieval_complete`  
**When:** After RAG retrieval completes

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "k": 5,
  "scores": [0.92, 0.88, 0.75, 0.65, 0.60],
  "docIds": [
    { "courseSlug": "agentic-rag", "lessonSlug": "module-01", "chunkIndex": 3 },
    { "courseSlug": "agentic-rag", "lessonSlug": "module-02", "chunkIndex": 1 },
    ...
  ],
  "latency": 350,
  "stage": "retrieval_complete",
  "timestamp": "2025-01-27T10:30:00.550Z"
}
```

**What to Check:**
- ✅ `k` matches requested limit
- ✅ Scores are reasonable (> 0.5 for minScore)
- ✅ Latency is reasonable (< 500ms for vector search, < 200ms for keyword)
- ⚠️ If `k = 0`, check if embeddings are available or if query is too specific
- ⚠️ If `retrieval_failed`, check vector database connection

**Additional RAG Logs:**
- `[RAG] [requestId] Query embedding generated` - Embedding generation timing
- `[RAG] [requestId] Vector search completed` - Vector search results
- `[RAG] [requestId] Keyword search completed` - Keyword search fallback

---

### 6. Prompt Assembled

**Stage:** `prompt_assembled`  
**When:** After building LLM messages with RAG context

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "systemPromptLength": 5420,
  "totalMessages": 7,
  "retrievedChunksCount": 5,
  "retrievedChunks": [
    {
      "courseSlug": "agentic-rag",
      "lessonSlug": "module-01",
      "chunkIndex": 3,
      "score": 0.92
    },
    ...
  ],
  "latency": 50,
  "stage": "prompt_assembled",
  "timestamp": "2025-01-27T10:30:00.600Z"
}
```

**What to Check:**
- ✅ System prompt length is reasonable (< 20k tokens)
- ✅ Retrieved chunks are included
- ✅ Total messages count is correct (system + history + user)

---

### 7. Provider Call Started

**Stage:** `provider_call_started`  
**When:** Before calling LLM provider

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "isFallback": false,
  "messagesCount": 7,
  "systemPromptLength": 5420,
  "stage": "provider_call_started",
  "timestamp": "2025-01-27T10:30:00.650Z"
}
```

**What to Check:**
- ✅ Provider is correct
- ✅ Model is correct
- ✅ `isFallback` is false (if true, primary provider failed)
- ✅ Messages count matches expected

---

### 8. Provider Response Received

**Stage:** `provider_response_received`  
**When:** After LLM provider returns response

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "providerLatency": 2340,
  "totalLatency": 3500,
  "responseLength": 1250,
  "isFallback": false,
  "finishReason": "stop",
  "usage": {
    "promptTokens": 1250,
    "completionTokens": 350,
    "totalTokens": 1600
  },
  "stage": "provider_response_received",
  "timestamp": "2025-01-27T10:30:03.000Z"
}
```

**What to Check:**
- ✅ Provider latency is reasonable (< 10s for streaming, < 5s for non-streaming)
- ✅ Response length is > 0
- ✅ Finish reason is "stop" (not "length" or "content_filter")
- ✅ Token usage is reasonable
- ⚠️ If `provider_call_failed`, check error details

**Provider Error Logs:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "stage": "provider_call_failed",
  "statusCode": 429,
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "upstreamStatus": 429,
  "message": "OpenAI API error: 429 Rate limit exceeded",
  "latency": 150,
  "timestamp": "2025-01-27T10:30:00.800Z"
}
```

**What to Check:**
- ✅ `upstreamStatus` matches provider error
- ✅ `errorCode` is correctly mapped
- ✅ Error message is descriptive

---

### 9. Response Returned

**Stage:** `response_returned`  
**When:** After sending response to client

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "totalLatency": 3500,
  "responseLength": 1250,
  "nextActionsCount": 2,
  "conversationId": "conv-456",
  "stage": "response_returned",
  "timestamp": "2025-01-27T10:30:03.050Z"
}
```

**What to Check:**
- ✅ Total latency is reasonable (< 10s)
- ✅ Response length > 0
- ✅ Conversation ID is set

---

### 10. Request Completed

**Stage:** `request_complete`  
**When:** After entire request completes successfully

**Log Fields:**
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "stage": "request_complete",
  "statusCode": 200,
  "totalLatency": 3500,
  "path": "/api/ai-advisor/chat",
  "method": "POST",
  "conversationId": "conv-456",
  "timestamp": "2025-01-27T10:30:03.100Z"
}
```

**What to Check:**
- ✅ Status code is 200
- ✅ Total latency breakdown:
  - Context loading: ~50ms
  - Context data: ~100ms
  - RAG retrieval: ~300ms
  - Prompt assembly: ~50ms
  - Provider call: ~2000ms
  - Total: ~3500ms

---

## Latency Breakdown

Typical latency breakdown for a successful request:

| Stage | Typical Latency | Max Acceptable |
|-------|----------------|----------------|
| Request received | 0ms | 0ms |
| Context resolved | 30-100ms | 200ms |
| Context data fetched | 50-150ms | 300ms |
| Retrieval query | 0ms | 0ms |
| Retrieval results | 200-500ms (vector) / 50-200ms (keyword) | 1000ms |
| Prompt assembly | 10-50ms | 100ms |
| Provider call | 1000-5000ms | 10000ms |
| Response returned | 0-50ms | 100ms |
| **Total** | **1500-6000ms** | **12000ms** |

---

## Debugging Common Issues

### Issue: "Service Unavailable"

**Check Logs:**
1. Look for `provider_call_failed` stage
2. Check `errorCode` and `upstreamStatus`
3. Verify `LLM_API_KEY` is set (check `hasApiKey` in initial log)

**Example:**
```json
{
  "stage": "provider_call_failed",
  "errorCode": "SERVICE_UNAVAILABLE",
  "message": "LLM_API_KEY environment variable is required"
}
```

---

### Issue: Slow Response Times

**Check Logs:**
1. Compare `totalLatency` across stages
2. Identify bottleneck:
   - High `providerLatency` → Provider slow
   - High retrieval latency → Vector DB slow
   - High context latency → Database slow

**Example:**
```json
{
  "retrieval_complete": { "latency": 2000 }, // ⚠️ Too slow
  "provider_response_received": { "providerLatency": 8000 } // ⚠️ Too slow
}
```

---

### Issue: No RAG Results

**Check Logs:**
1. Look for `retrieval_complete` stage
2. Check `k` value (should be > 0)
3. Check if `retrieval_failed` stage appears
4. Verify embeddings are available (check `[RAG]` logs)

**Example:**
```json
{
  "stage": "retrieval_complete",
  "k": 0, // ⚠️ No results
  "scores": []
}
```

---

### Issue: Rate Limit Errors

**Check Logs:**
1. Look for `provider_call_failed` stage
2. Check `errorCode: "RATE_LIMIT_EXCEEDED"`
3. Check `upstreamStatus: 429`

**Example:**
```json
{
  "stage": "provider_call_failed",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "upstreamStatus": 429,
  "message": "OpenAI API error: 429 Rate limit exceeded"
}
```

---

## Enabling Debug Logs

### Environment Variables

```bash
# Enable debug logging
LOG_LEVEL=debug

# Or in .env.local
LOG_LEVEL=debug
```

### Running Locally

```bash
# Start dev server with debug logs
LOG_LEVEL=debug npm run dev

# Or set in .env.local
echo "LOG_LEVEL=debug" >> .env.local
npm run dev
```

---

## Log Format

All logs use structured JSON format with:
- **Request ID** (correlation ID) in every log
- **Stage** identifier for filtering
- **Timestamp** for ordering
- **Latency** measurements where applicable
- **PII redaction** for sensitive data

---

## Filtering Logs

### By Request ID

```bash
# Find all logs for a specific request
grep "req_1768693606406_11h3eg9" logs.txt
```

### By Stage

```bash
# Find all provider calls
grep '"stage": "provider_call_started"' logs.txt

# Find all failures
grep '"stage": ".*_failed"' logs.txt
```

### By User

```bash
# Find all logs for a user
grep '"userId": "user-123"' logs.txt
```

---

## Example Full Request Flow

```
[AI_ADVISOR] Request received { requestId: "req_123", stage: "request_received", ... }
[AI_ADVISOR] Context resolved { requestId: "req_123", stage: "context_resolved", latency: 45, ... }
[AI_ADVISOR] Context data fetched { requestId: "req_123", stage: "context_data_fetched", latency: 120, ... }
[AI_ADVISOR] Retrieval query { requestId: "req_123", stage: "retrieval_query", ... }
[RAG] [req_123] Query embedding generated { embeddingDimensions: 1536, latency: 150, ... }
[RAG] [req_123] Vector search completed { resultsCount: 5, latency: 200, ... }
[AI_ADVISOR] Retrieval results { requestId: "req_123", stage: "retrieval_complete", k: 5, scores: [0.92, 0.88, ...], latency: 350, ... }
[AI_ADVISOR] Prompt assembled { requestId: "req_123", stage: "prompt_assembled", retrievedChunksCount: 5, latency: 50, ... }
[AI_ADVISOR] Provider call started { requestId: "req_123", stage: "provider_call_started", provider: "openai", ... }
[AI_ADVISOR] Provider response received { requestId: "req_123", stage: "provider_response_received", providerLatency: 2340, ... }
[AI_ADVISOR] Response returned { requestId: "req_123", stage: "response_returned", totalLatency: 3500, ... }
[AI_ADVISOR] Request completed { requestId: "req_123", stage: "request_complete", statusCode: 200, ... }
```

---

## Next Steps

1. **Run locally** with `LOG_LEVEL=debug`
2. **Send test requests** to `/api/ai-advisor/chat`
3. **Collect logs** for analysis
4. **Identify bottlenecks** using latency breakdown
5. **Debug issues** using stage-specific logs

---

**End of Guide**
