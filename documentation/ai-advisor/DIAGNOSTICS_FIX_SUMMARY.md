# AI Advisor Service Unavailable - Fix Summary

## Overview
This document summarizes the fixes applied to diagnose and resolve "AI Advisor service unavailable" errors with Request ID tracking.

## Changes Made

### 1. Enhanced Structured Logging ✅

**File**: `app/api/ai-advisor/chat/route.ts`

- All error logs now include:
  - `requestId` - Unique identifier for each request
  - `userId` - User ID (when available)
  - `provider` - LLM provider name (openai/anthropic)
  - `model` - Model name being used
  - `statusCode` - HTTP status code
  - `errorCode` - Structured error code (SERVICE_UNAVAILABLE, UNAUTHORIZED, etc.)
  - `message` - Error message (sanitized, no secrets)
  - `stack` - Stack trace (development only)
  - `stage` - Processing stage where error occurred

**Example log entry**:
```json
{
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "stage": "provider_call_failed",
  "statusCode": 503,
  "errorCode": "SERVICE_UNAVAILABLE",
  "message": "LLM_API_KEY environment variable is required"
}
```

### 2. Startup Guard ✅

**File**: `app/api/ai-advisor/chat/route.ts`

- Early validation of `LLM_API_KEY` environment variable
- Logs configuration errors before authentication check
- Returns 503 with clear error message if API key is missing
- Error includes `requestId` for traceability

### 3. Request ID in All Responses ✅

**File**: `app/api/ai-advisor/chat/route.ts`

- Request ID included in:
  - Response headers: `X-Request-ID`
  - Error response body: `error.requestId`
  - Success response body: `requestId`

**Example error response**:
```json
{
  "ok": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "AI service is not configured. Please contact support.",
    "requestId": "req_1768693606406_11h3eg9"
  }
}
```

### 4. Diagnostics Endpoint ✅

**File**: `app/api/diagnostics/ai/route.ts`

- Enhanced to check fallback provider availability
- Returns comprehensive configuration status

**Endpoint**: `GET /api/diagnostics/ai`

**Response**:
```json
{
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "hasApiKey": true,
  "providerConfigured": true,
  "fallbackAvailable": true,
  "fallbackProvider": "anthropic",
  "version": "abc1234",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes**:
- `200` - Provider configured and working
- `503` - Provider not configured or failed

### 5. Fallback Provider Support ✅

**Files**: 
- `lib/ai/llm.ts` - Added `getLLMProviderWithFallback()`
- `app/api/ai-advisor/chat/route.ts` - Integrated fallback mechanism

**How it works**:
1. Try primary provider (from `LLM_PROVIDER` env var)
2. If primary fails and `LLM_FALLBACK_PROVIDER` is set, try fallback
3. Log fallback usage for monitoring
4. Return error only if both providers fail

**Configuration**:
```env
LLM_PROVIDER=openai
LLM_FALLBACK_PROVIDER=anthropic
LLM_API_KEY=sk-...  # Works for both providers
```

### 6. UI Request ID Display ✅

**File**: `components/ai-advisor/AIAdvisor.tsx`

- UI already correctly extracts and displays requestId from:
  - Response headers (`X-Request-ID`)
  - Error response body (`error.requestId`)
  - Streaming error messages

**Error message format**:
```
⚠️ **Service unavailable** — The AI service is currently unavailable. Please contact support if this persists.

**Request ID:** req_1768693606406_11h3eg9
```

## How to Diagnose Issues

### Step 1: Get Request ID from UI
When user sees error, note the Request ID displayed in the error message.

### Step 2: Check Diagnostics Endpoint
```bash
curl https://your-domain.com/api/diagnostics/ai
```

This will show:
- Whether API key is configured
- Whether provider can be instantiated
- Fallback provider availability

### Step 3: Search Vercel Logs
1. Go to Vercel Dashboard → Project → Deployments → Latest → Functions
2. Find `/api/ai-advisor/chat` function
3. Search logs for the Request ID: `req_1768693606406_11h3eg9`

### Step 4: Common Issues and Fixes

#### Issue: `LLM_API_KEY environment variable is required`
**Fix**: Add `LLM_API_KEY` to Vercel environment variables
- Settings → Environment Variables
- Add `LLM_API_KEY` with your API key
- Redeploy (required)

#### Issue: `OpenAI API error: 401 Unauthorized`
**Fix**: API key is invalid or expired
- Verify key is correct in Vercel
- Check key hasn't been revoked
- Ensure key has correct permissions

#### Issue: `OpenAI API error: 429 rate limit`
**Fix**: Rate limit exceeded
- Wait before retrying
- Check usage limits in OpenAI dashboard
- Consider upgrading plan

#### Issue: `OpenAI API error: 400 Bad Request`
**Fix**: Invalid model name or request format
- Check `OPENAI_MODEL` env var matches available models
- Verify model name is correct (e.g., `gpt-4-turbo-preview`)

## Environment Variables

### Required
- `LLM_API_KEY` - API key for LLM provider (OpenAI or Anthropic)

### Optional
- `LLM_PROVIDER` - Provider to use (`openai` or `anthropic`). Default: `openai`
- `LLM_FALLBACK_PROVIDER` - Fallback provider if primary fails
- `OPENAI_MODEL` - OpenAI model name. Default: `gpt-4-turbo-preview`
- `ANTHROPIC_MODEL` - Anthropic model name. Default: `claude-3-opus-20240229`

## Testing

### Test Diagnostics Endpoint
```bash
# Should return 200 if configured
curl https://your-domain.com/api/diagnostics/ai

# Should return 503 if not configured
# (after removing LLM_API_KEY)
```

### Test Error Handling
1. Remove `LLM_API_KEY` from Vercel env vars
2. Send message in AI Advisor
3. Verify:
   - UI shows "Service unavailable" banner
   - Request ID is displayed
   - Request ID appears in Vercel logs

### Test Fallback Provider
1. Set `LLM_PROVIDER=openai`
2. Set `LLM_FALLBACK_PROVIDER=anthropic`
3. Intentionally break primary provider (invalid key)
4. Verify fallback is used (check logs for "Using fallback provider")

## Monitoring

### Key Metrics to Watch
- Request success rate (200 vs 503/500)
- Provider fallback usage
- Average response latency
- Error codes distribution

### Log Patterns to Search
- `[AI_ADVISOR] Configuration error` - Missing env vars
- `[AI_ADVISOR] LLM provider error` - Provider initialization failed
- `[AI_ADVISOR] Using fallback provider` - Fallback activated
- `[AI_ADVISOR] Error in streaming LLM response` - Streaming errors

## Definition of Done ✅

- ✅ AI Advisor API returns 200 in normal operation
- ✅ Error state is traceable via Request ID
- ✅ Configuration errors are fixed (env vars + model selection)
- ✅ Structured logging includes all required fields
- ✅ Request ID appears in all responses (headers + body)
- ✅ Diagnostics endpoint provides health check
- ✅ Fallback provider support prevents hard downtime
- ✅ UI correctly displays Request ID in error messages
