# "AI Service Unavailable" Reproduction Protocol

**Date:** 2025-01-27  
**Purpose:** Identify exact conditions that trigger "AI service unavailable" and reproduce in deployed environment

---

## 1. Where "AI Service Unavailable" is Produced

### 1.1 Server-Side (Backend)

**Location:** `app/api/ai-advisor/chat/route.ts`

**Condition 1: Missing LLM_API_KEY** (Line 762-789)
```typescript
if (!llmApiKey) {
  return NextResponse.json(
    { 
      ok: false,
      error: { 
        code: 'SERVICE_UNAVAILABLE', 
        message: 'AI service is not configured. Please contact support.',
        requestId 
      } 
    },
    { status: 503 }
  );
}
```

**Trigger:** `process.env.LLM_API_KEY` is `undefined` or empty string

**Condition 2: Provider Initialization Failure** (Lines 1183-1223, 1424-1469)
```typescript
if (errorMessage.includes('LLM_API_KEY') || errorMessage.includes('required')) {
  errorCode = 'SERVICE_UNAVAILABLE';
  statusCode = 503;
  message: 'AI service is not configured. Please contact support.'
}
```

**Trigger:** `getLLMProvider()` throws error containing "LLM_API_KEY" or "required"

**Condition 3: Provider API Call Failure** (Lines 1076-1124, 1379-1432)
```typescript
// Error from provider layer
if (errorMessage.includes('LLM_API_KEY') || errorMessage.includes('required')) {
  errorCode = 'SERVICE_UNAVAILABLE';
  statusCode = 503;
}
```

**Trigger:** Provider layer (`lib/ai/llm.ts`) throws error about missing API key

---

### 1.2 Client-Side (UI)

**Location:** `components/ai-advisor/AIAdvisor.tsx` (Line 573-574)

```typescript
else if (error.message?.includes('SERVICE_UNAVAILABLE') || 
         error.message?.includes('not configured') || 
         error.message?.includes('LLM_API_KEY')) {
  errorContent = "⚠️ **Service unavailable** — The AI service is currently unavailable. Please contact support if this persists." + (requestId !== 'N/A' ? `\n\n**Request ID:** ${requestId}` : '');
}
```

**Trigger:** Error message from API contains:
- `"SERVICE_UNAVAILABLE"`
- `"not configured"`
- `"LLM_API_KEY"`

**Display:** Error banner with `data-testid="service-unavailable-banner"`

---

## 2. Exact Conditions That Trigger It

### 2.1 Condition Matrix

| Condition | Location | Error Code | Status Code | Message |
|-----------|----------|------------|-------------|---------|
| **Missing LLM_API_KEY env var** | `chat/route.ts:762` | `SERVICE_UNAVAILABLE` | 503 | "AI service is not configured. Please contact support." |
| **Provider init fails (missing key)** | `chat/route.ts:1183` | `SERVICE_UNAVAILABLE` | 503 | "AI service is not configured. Please contact support." |
| **Provider API call fails (401)** | `chat/route.ts:1086` | `UNAUTHORIZED` | 401 | "AI service error. Please try again." |
| **Provider API call fails (429)** | `chat/route.ts:1088` | `RATE_LIMIT_EXCEEDED` | 429 | "AI service error. Please try again." |
| **Provider API call fails (5xx)** | `chat/route.ts:1080` | `UPSTREAM_ERROR` | 500 | "AI service error. Please try again." |
| **Invalid base URL** | `lib/ai/llm.ts:115` | `UPSTREAM_ERROR` | 500 | "OpenAI API error: ..." |
| **Network timeout** | `lib/ai/llm.ts:123` | `TIMEOUT` | 504 | "Response took too long. Please try again." |

**Note:** Only conditions 1-2 produce `SERVICE_UNAVAILABLE`. Others produce different error codes but may be displayed as "Service unavailable" in UI if error message contains keywords.

---

### 2.2 Specific Error Classes

**Class 1: Configuration Error (Missing Env Var)**
- **Error:** `LLM_API_KEY environment variable is required`
- **Source:** `lib/ai/llm.ts:60` or `lib/ai/llm.ts:85`
- **Caught at:** `app/api/ai-advisor/chat/route.ts:762` or `1183`
- **Result:** `SERVICE_UNAVAILABLE` (503)

**Class 2: Provider Initialization Error**
- **Error:** `Unsupported LLM provider: {provider}`
- **Source:** `lib/ai/llm.ts:71`
- **Caught at:** `app/api/ai-advisor/chat/route.ts:1183`
- **Result:** `UPSTREAM_ERROR` (500) - **NOT SERVICE_UNAVAILABLE**

**Class 3: Provider API Error (401 Unauthorized)**
- **Error:** `OpenAI API error: 401 {error details}`
- **Source:** `lib/ai/llm.ts:143` or `191`
- **Caught at:** `app/api/ai-advisor/chat/route.ts:1086`
- **Result:** `UNAUTHORIZED` (401) - **NOT SERVICE_UNAVAILABLE**

**Class 4: Provider API Error (429 Rate Limit)**
- **Error:** `OpenAI API error: 429 {error details}`
- **Source:** `lib/ai/llm.ts:143` or `191`
- **Caught at:** `app/api/ai-advisor/chat/route.ts:1088`
- **Result:** `RATE_LIMIT_EXCEEDED` (429) - **NOT SERVICE_UNAVAILABLE**

**Class 5: Provider API Error (5xx)**
- **Error:** `OpenAI API error: 502/503/504 {error details}`
- **Source:** `lib/ai/llm.ts:143` or `191`
- **Caught at:** `app/api/ai-advisor/chat/route.ts:1080`
- **Result:** `UPSTREAM_ERROR` (500) - **NOT SERVICE_UNAVAILABLE** (but may be displayed as "Service unavailable" in UI)

**Class 6: Network/Timeout Error**
- **Error:** `Failed to fetch` or timeout
- **Source:** Network layer or fetch timeout
- **Caught at:** `app/api/ai-advisor/chat/route.ts:1292`
- **Result:** `TIMEOUT` (504) - **NOT SERVICE_UNAVAILABLE**

---

### 2.3 Catch-All vs Specific

**Current Implementation:** ⚠️ **Mixed - Some specific, some catch-all**

**Specific Checks:**
- ✅ Missing `LLM_API_KEY` → `SERVICE_UNAVAILABLE` (specific)
- ✅ Error message contains "LLM_API_KEY" → `SERVICE_UNAVAILABLE` (specific)
- ✅ Error message contains "401" → `UNAUTHORIZED` (specific)
- ✅ Error message contains "429" → `RATE_LIMIT_EXCEEDED` (specific)

**Catch-All:**
- ❌ All other errors → `UPSTREAM_ERROR` (catch-all)
- ❌ Provider API 5xx errors → `UPSTREAM_ERROR` (catch-all, should be specific)
- ❌ Network errors → `UPSTREAM_ERROR` (catch-all, should be `NETWORK_ERROR`)

**Issue:** Provider failures (5xx, network) are not distinguished from configuration errors, making debugging difficult.

---

## 3. Root Cause Analysis

### 3.1 Provider Failure

**Check:** Provider API reachable from deployment network

**Test:**
```bash
# From deployment environment
curl -X GET https://api.openai.com/v1/models \
  -H "Authorization: Bearer $LLM_API_KEY" \
  --max-time 10
```

**Expected:** 200 OK with models list

**If Fails:**
- ❌ Network connectivity issue
- ❌ Firewall blocking OpenAI API
- ❌ DNS resolution failure
- ❌ Invalid API key

**Logs to Check:**
- `[AI_ADVISOR] Provider call failed` with `upstreamStatus: 502/503/504`
- Network timeout errors

---

### 3.2 Missing Index (Vector Store)

**Check:** Vector store reachable and index exists

**Test:**
```sql
-- Check if pgvector extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if match_lesson_chunks function exists
SELECT proname FROM pg_proc WHERE proname = 'match_lesson_chunks';

-- Check if embeddings exist
SELECT COUNT(*) FROM lesson_chunks WHERE embedding IS NOT NULL;

-- Check if vector index exists
SELECT indexname FROM pg_indexes 
WHERE tablename = 'lesson_chunks' 
AND indexname LIKE '%embedding%';
```

**Expected:**
- ✅ `vector` extension installed
- ✅ `match_lesson_chunks` function exists
- ✅ At least some chunks have embeddings
- ✅ Vector index exists

**If Fails:**
- ⚠️ RAG falls back to keyword search (silent, no error)
- ⚠️ Response quality may degrade
- ❌ **Does NOT cause "Service unavailable"** - RAG failures are non-fatal

**Note:** Vector store issues do NOT trigger "Service unavailable" - they cause silent fallback to keyword search.

---

### 3.3 Authentication

**Check:** API key is valid and has correct permissions

**Test:**
```bash
# Test API key validity
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $LLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4-turbo-preview",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 10
  }'
```

**Expected:** 200 OK with completion

**If Fails with 401:**
- ❌ Invalid API key
- ❌ API key revoked
- ❌ Wrong API key format

**Logs to Check:**
- `[AI_ADVISOR] Provider call failed` with `errorCode: UNAUTHORIZED`, `upstreamStatus: 401`

---

### 3.4 Network

**Check:** Network connectivity from deployment to provider

**Test:**
```bash
# Test DNS resolution
nslookup api.openai.com

# Test connectivity
ping -c 3 api.openai.com

# Test HTTPS connectivity
curl -I https://api.openai.com/v1/models --max-time 5
```

**Expected:** All succeed

**If Fails:**
- ❌ DNS resolution failure
- ❌ Network unreachable
- ❌ Firewall blocking

**Logs to Check:**
- `[AI_ADVISOR] Provider call failed` with network errors
- Timeout errors

---

## 4. Checklist: Local vs Deployed Environment

### 4.1 Environment Variables Comparison

**Required Variables:**

| Variable | Local (.env.local) | Deployed (Vercel) | Purpose |
|----------|-------------------|-------------------|---------|
| `LLM_API_KEY` | ✅ Required | ✅ Required | LLM provider API key |
| `LLM_PROVIDER` | `openai` (default) | `openai` (default) | Provider selection |
| `OPENAI_MODEL` | `gpt-4-turbo-preview` (default) | `gpt-4-turbo-preview` (default) | Model selection |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` (default) | `https://api.openai.com/v1` (default) | Provider base URL |
| `LLM_FALLBACK_PROVIDER` | Optional | Optional | Fallback provider |
| `ANTHROPIC_MODEL` | N/A (if using Anthropic) | N/A (if using Anthropic) | Anthropic model |
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com/v1` (default) | `https://api.anthropic.com/v1` (default) | Anthropic base URL |

**Check Commands:**

```bash
# Local
cat .env.local | grep LLM

# Deployed (Vercel CLI)
vercel env ls

# Or via Vercel Dashboard
# Settings → Environment Variables
```

**Common Issues:**
- ❌ `LLM_API_KEY` not set in deployed environment
- ❌ `LLM_API_KEY` has typo or extra whitespace
- ❌ `LLM_API_KEY` is from wrong provider (OpenAI key when `LLM_PROVIDER=anthropic`)
- ❌ `OPENAI_BASE_URL` points to invalid URL

---

### 4.2 Provider Reachability

**Local Test:**
```bash
# Test OpenAI API from local machine
curl -X GET https://api.openai.com/v1/models \
  -H "Authorization: Bearer $LLM_API_KEY" \
  --max-time 10
```

**Deployed Test:**
```bash
# Test from deployment (via health endpoint)
curl https://your-app.vercel.app/api/ai-advisor/health

# Expected response:
{
  "ok": true,
  "providerConfigured": true,
  "upstreamHealthy": true,
  "provider": "openai"
}
```

**If `upstreamHealthy: false`:**
- ❌ Provider API not reachable from deployment network
- ❌ Firewall blocking
- ❌ Network timeout
- ❌ Invalid API key

**Check Logs:**
- Health endpoint logs: `Provider configured but upstream check failed`

---

### 4.3 Rate Limit Events

**Check Rate Limit Status:**

**Local:**
```bash
# Check API usage (if using OpenAI dashboard)
# https://platform.openai.com/usage
```

**Deployed:**
```bash
# Check logs for 429 errors
grep "RATE_LIMIT_EXCEEDED" logs.txt
grep "429" logs.txt
```

**Log Pattern:**
```json
{
  "stage": "provider_call_failed",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "upstreamStatus": 429,
  "message": "OpenAI API error: 429 Rate limit exceeded"
}
```

**If Rate Limited:**
- ⚠️ **Does NOT cause "Service unavailable"** - Returns `RATE_LIMIT_EXCEEDED` (429)
- ⚠️ UI shows: "Rate limit exceeded" (not "Service unavailable")

**Note:** Rate limits are handled separately and don't trigger "Service unavailable".

---

### 4.4 Vector Store Reachability

**Check Vector Store:**

**Local:**
```bash
# Connect to local Supabase
psql $DATABASE_URL

# Run checks
SELECT * FROM pg_extension WHERE extname = 'vector';
SELECT COUNT(*) FROM lesson_chunks WHERE embedding IS NOT NULL;
```

**Deployed:**
```bash
# Connect to production Supabase
psql $PRODUCTION_DATABASE_URL

# Run same checks
```

**Check Vector Search Function:**
```sql
-- Check if function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'match_lesson_chunks';

-- Test function (if embeddings exist)
SELECT * FROM match_lesson_chunks(
  (SELECT embedding FROM lesson_chunks WHERE embedding IS NOT NULL LIMIT 1),
  0.7,
  5,
  NULL
) LIMIT 1;
```

**Expected:**
- ✅ `vector` extension installed
- ✅ `match_lesson_chunks` function exists
- ✅ Some chunks have embeddings
- ✅ Function executes without error

**If Fails:**
- ⚠️ Falls back to keyword search (silent)
- ⚠️ **Does NOT cause "Service unavailable"**

**Note:** Vector store issues are non-fatal and don't trigger "Service unavailable".

---

## 5. Reproduction Steps

### 5.1 Reproduce "Service Unavailable" Locally

**Step 1: Remove LLM_API_KEY**
```bash
# Comment out or remove from .env.local
# LLM_API_KEY=sk-...
```

**Step 2: Start Dev Server**
```bash
npm run dev
```

**Step 3: Send Request**
```bash
curl -X POST http://localhost:3000/api/ai-advisor/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "message": "test",
    "studentProfileId": "test-id",
    "conversationHistory": []
  }'
```

**Expected Response:**
```json
{
  "ok": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "AI service is not configured. Please contact support.",
    "requestId": "req_..."
  }
}
```

**Step 4: Check Logs**
```bash
# Should see:
[AI_ADVISOR] Configuration error {
  "errorCode": "SERVICE_UNAVAILABLE",
  "message": "LLM_API_KEY environment variable is required"
}
```

---

### 5.2 Reproduce in Deployed Environment

**Step 1: Check Environment Variables**
```bash
# Via Vercel CLI
vercel env ls

# Or check Vercel Dashboard
# Settings → Environment Variables
```

**Step 2: Test Health Endpoint**
```bash
curl https://your-app.vercel.app/api/ai-advisor/health

# If SERVICE_UNAVAILABLE:
{
  "ok": false,
  "providerConfigured": false,
  "upstreamHealthy": false,
  "error": "LLM_API_KEY or OPENAI_API_KEY environment variable is not set"
}
```

**Step 3: Test Chat Endpoint**
```bash
curl -X POST https://your-app.vercel.app/api/ai-advisor/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "message": "test",
    "studentProfileId": "test-id",
    "conversationHistory": []
  }'
```

**Step 4: Check Deployment Logs**
```bash
# Via Vercel CLI
vercel logs --follow

# Or check Vercel Dashboard
# Deployments → [deployment] → Logs
```

**Look for:**
- `[AI_ADVISOR] Configuration error` with `SERVICE_UNAVAILABLE`
- `hasApiKey: false` in initial log
- `errorCode: SERVICE_UNAVAILABLE` in error log

---

## 6. Diagnostic Queries

### 6.1 Check Environment Variables

**Local:**
```bash
# Check if LLM_API_KEY is set
echo $LLM_API_KEY

# Check all LLM-related env vars
env | grep -E "LLM|OPENAI|ANTHROPIC"
```

**Deployed (Vercel):**
```bash
# Via Vercel CLI
vercel env ls | grep -E "LLM|OPENAI|ANTHROPIC"

# Or check health endpoint
curl https://your-app.vercel.app/api/ai-advisor/health | jq
```

---

### 6.2 Check Provider Reachability

**Test from Local:**
```bash
# Test OpenAI API
curl -X GET https://api.openai.com/v1/models \
  -H "Authorization: Bearer $LLM_API_KEY" \
  --max-time 10 \
  -v
```

**Test from Deployment:**
```bash
# Use health endpoint (tests upstream)
curl https://your-app.vercel.app/api/ai-advisor/health | jq

# Check upstreamHealthy field
```

**If `upstreamHealthy: false`:**
- Check network connectivity
- Check firewall rules
- Verify API key is valid
- Check provider status page

---

### 6.3 Check Rate Limits

**Check Logs:**
```bash
# Search for rate limit errors
grep -i "rate.*limit\|429" logs.txt

# Or in Vercel logs
vercel logs | grep -i "rate.*limit\|429"
```

**Check API Usage:**
- OpenAI: https://platform.openai.com/usage
- Anthropic: Check dashboard for usage limits

**If Rate Limited:**
- ⚠️ Returns `RATE_LIMIT_EXCEEDED` (429), not `SERVICE_UNAVAILABLE`
- Wait for rate limit window to reset
- Consider upgrading API tier

---

### 6.4 Check Vector Store

**Check Database:**
```sql
-- Check extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check function
SELECT proname FROM pg_proc WHERE proname = 'match_lesson_chunks';

-- Check embeddings
SELECT 
  COUNT(*) as total_chunks,
  COUNT(embedding) as chunks_with_embeddings,
  COUNT(*) - COUNT(embedding) as chunks_without_embeddings
FROM lesson_chunks;

-- Check index
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'lesson_chunks' 
AND indexname LIKE '%embedding%';
```

**Test Vector Search:**
```sql
-- Get a sample embedding
SELECT embedding FROM lesson_chunks 
WHERE embedding IS NOT NULL 
LIMIT 1;

-- Test function (replace with actual embedding)
SELECT * FROM match_lesson_chunks(
  '[your-embedding-vector-here]'::vector(1536),
  0.7,
  5,
  NULL
);
```

**If Vector Search Fails:**
- ⚠️ Falls back to keyword search (non-fatal)
- ⚠️ **Does NOT cause "Service unavailable"**
- Check logs for: `[RAG] Vector search failed, falling back to keyword search`

---

## 7. Common Scenarios

### Scenario 1: Missing LLM_API_KEY in Deployment

**Symptoms:**
- Health endpoint returns `providerConfigured: false`
- Chat endpoint returns 503 with `SERVICE_UNAVAILABLE`
- Logs show: `LLM_API_KEY environment variable is required`

**Fix:**
1. Add `LLM_API_KEY` to Vercel environment variables
2. Redeploy or wait for next deployment
3. Verify: `curl https://your-app.vercel.app/api/ai-advisor/health`

---

### Scenario 2: Invalid API Key

**Symptoms:**
- Health endpoint returns `upstreamHealthy: false`
- Chat endpoint returns 401 with `UNAUTHORIZED`
- Logs show: `OpenAI API error: 401`

**Fix:**
1. Verify API key is correct (no extra spaces, correct format)
2. Check API key hasn't been revoked
3. Generate new API key if needed
4. Update environment variable

---

### Scenario 3: Provider API Down

**Symptoms:**
- Health endpoint returns `upstreamHealthy: false`
- Chat endpoint returns 500/502/503 with `UPSTREAM_ERROR`
- Logs show: `OpenAI API error: 502/503/504`

**Fix:**
1. Check provider status page (https://status.openai.com)
2. Wait for provider to recover
3. Consider implementing retry logic

---

### Scenario 4: Network Connectivity Issue

**Symptoms:**
- Health endpoint times out
- Chat endpoint times out
- Logs show: `Failed to fetch` or timeout errors

**Fix:**
1. Check deployment network connectivity
2. Check firewall rules
3. Verify DNS resolution
4. Check Vercel network settings

---

### Scenario 5: Rate Limited

**Symptoms:**
- Chat endpoint returns 429 with `RATE_LIMIT_EXCEEDED`
- Logs show: `OpenAI API error: 429 Rate limit exceeded`
- ⚠️ **NOT "Service unavailable"** - Different error code

**Fix:**
1. Wait for rate limit window to reset
2. Upgrade API tier
3. Implement rate limit handling with backoff

---

## 8. Verification Checklist

### ✅ Checklist: Local vs Deployed

- [ ] **Environment Variables**
  - [ ] `LLM_API_KEY` set in both local and deployed
  - [ ] `LLM_PROVIDER` matches in both
  - [ ] `OPENAI_BASE_URL` is valid (if custom)
  - [ ] No typos or extra whitespace

- [ ] **Provider Reachability**
  - [ ] Health endpoint returns `upstreamHealthy: true` (deployed)
  - [ ] Can reach `api.openai.com` from deployment network
  - [ ] No firewall blocking provider API

- [ ] **Rate Limits**
  - [ ] No 429 errors in logs
  - [ ] API usage within limits
  - [ ] Rate limit handling implemented

- [ ] **Vector Store**
  - [ ] `vector` extension installed
  - [ ] `match_lesson_chunks` function exists
  - [ ] Some chunks have embeddings
  - [ ] Vector index exists

- [ ] **Authentication**
  - [ ] API key is valid
  - [ ] API key has correct permissions
  - [ ] No 401 errors in logs

---

## 9. Quick Diagnostic Script

```bash
#!/bin/bash
# Quick diagnostic for "Service Unavailable" issues

echo "=== Environment Variables ==="
echo "LLM_API_KEY: ${LLM_API_KEY:+SET} ${LLM_API_KEY:-NOT SET}"
echo "LLM_PROVIDER: ${LLM_PROVIDER:-openai (default)}"
echo "OPENAI_BASE_URL: ${OPENAI_BASE_URL:-https://api.openai.com/v1 (default)}"

echo ""
echo "=== Provider Reachability ==="
if [ -n "$LLM_API_KEY" ]; then
  curl -s -X GET https://api.openai.com/v1/models \
    -H "Authorization: Bearer $LLM_API_KEY" \
    --max-time 10 \
    -o /dev/null -w "Status: %{http_code}\n"
else
  echo "Cannot test - LLM_API_KEY not set"
fi

echo ""
echo "=== Health Endpoint ==="
curl -s http://localhost:3000/api/ai-advisor/health | jq

echo ""
echo "=== Vector Store ==="
# Requires DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
  psql $DATABASE_URL -c "SELECT COUNT(*) as chunks_with_embeddings FROM lesson_chunks WHERE embedding IS NOT NULL;"
  psql $DATABASE_URL -c "SELECT proname FROM pg_proc WHERE proname = 'match_lesson_chunks';"
else
  echo "Cannot test - DATABASE_URL not set"
fi
```

---

## 10. Summary

### Root Causes of "Service Unavailable"

1. **Missing LLM_API_KEY** (Most Common)
   - ✅ Specific check, returns `SERVICE_UNAVAILABLE`
   - ✅ Easy to diagnose via health endpoint

2. **Provider Initialization Failure**
   - ✅ Specific check, returns `SERVICE_UNAVAILABLE`
   - ✅ Logged with error details

3. **Provider API Failure (5xx)**
   - ❌ **NOT SERVICE_UNAVAILABLE** - Returns `UPSTREAM_ERROR`
   - ⚠️ May be displayed as "Service unavailable" in UI (string matching)

4. **Network Issues**
   - ❌ **NOT SERVICE_UNAVAILABLE** - Returns `TIMEOUT` or `NETWORK_ERROR`
   - ⚠️ May be displayed as "Service unavailable" in UI (string matching)

5. **Rate Limits**
   - ❌ **NOT SERVICE_UNAVAILABLE** - Returns `RATE_LIMIT_EXCEEDED`
   - ✅ Separate error code

6. **Vector Store Issues**
   - ❌ **NOT SERVICE_UNAVAILABLE** - Silent fallback to keyword search
   - ⚠️ Non-fatal, doesn't cause errors

### Key Findings

- ✅ **"Service unavailable" is NOT a catch-all** - Only triggered by missing API key
- ⚠️ **UI may show "Service unavailable" for other errors** - Due to string matching in error message
- ❌ **Provider failures (5xx) are NOT mapped to SERVICE_UNAVAILABLE** - They return `UPSTREAM_ERROR`
- ✅ **Vector store issues are non-fatal** - Don't cause "Service unavailable"

---

**End of Reproduction Protocol**
