# AI Advisor Diagnostics and Logging

## Overview

This document describes the enhanced logging and diagnostics capabilities added to the AI Advisor service to help diagnose and fix "Service Unavailable" errors.

## Request ID Tracking

Every AI Advisor request now includes a unique `requestId` that appears in:
- **Logs**: All structured logs include `requestId` for correlation
- **Error Responses**: All error responses include `requestId` in both:
  - Response body: `{ error: { requestId: "req_..." } }`
  - Response header: `X-Request-ID: req_...`
- **UI Error Messages**: The frontend extracts and displays `requestId` in error messages

### Request ID Format

- **Production**: `req_{timestamp}_{random}` (e.g., `req_1768693606406_11h3eg9`)
- **Mock Mode**: `mock-req-chat-12345` (deterministic for testing)

## Structured Logging

All logs now use the `[AI_ADVISOR]` prefix and include:

```typescript
{
  requestId: string,        // Unique request identifier
  userId: string,          // User ID (if authenticated)
  provider: string,        // 'openai' | 'anthropic'
  model: string,           // Model name (e.g., 'gpt-4-turbo-preview')
  stage: string,           // Processing stage (e.g., 'request_start', 'provider_call_failed')
  statusCode?: number,     // HTTP status code
  errorCode?: string,      // Error code (e.g., 'SERVICE_UNAVAILABLE')
  error?: string,          // Error message (sanitized, no secrets)
  elapsed?: number,        // Duration in milliseconds
}
```

### Log Stages

- `request_start`: Request received
- `auth_check`: Authentication validation
- `provider_config_check`: LLM provider configuration check
- `request_processing`: Processing request
- `provider_call_failed`: LLM provider call failed
- `streaming_error`: Error during streaming
- `llm_call_failed`: LLM API call failed
- `empty_completion`: LLM returned empty response
- `response_complete`: Response generated successfully
- `request_complete`: Request completed successfully
- `top_level_error`: Unhandled error in top-level catch

## Diagnostics Endpoint

### GET /api/diagnostics/ai

Quick health check endpoint to verify AI Advisor configuration.

**Response:**
```json
{
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "hasApiKey": true,
  "providerConfigured": true,
  "version": "abc1234",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes:**
- `200`: Provider configured and ready
- `503`: Provider not configured (missing API key or initialization failed)
- `500`: Diagnostics check failed

**Usage:**
```bash
# Check AI Advisor configuration
curl https://your-domain.com/api/diagnostics/ai

# In browser console
fetch('/api/diagnostics/ai').then(r => r.json()).then(console.log)
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `SERVICE_UNAVAILABLE` | 503 | LLM provider not configured (missing API key) |
| `UNAUTHORIZED` | 401 | Authentication failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `BAD_REQUEST` | 400 | Invalid request |
| `TIMEOUT` | 504 | Request timeout |
| `EMPTY_COMPLETION` | 500 | LLM returned empty response |
| `UPSTREAM_ERROR` | 500 | LLM provider API error |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Troubleshooting Guide

### 1. Service Unavailable (503)

**Symptoms:**
- UI shows: "⚠️ **Service unavailable** — The AI service is currently unavailable..."
- Request ID displayed in error message

**Diagnosis:**
1. Check diagnostics endpoint: `GET /api/diagnostics/ai`
   - If `hasApiKey: false` → Missing `LLM_API_KEY` env var
   - If `providerConfigured: false` → Provider initialization failed

2. Check Vercel logs:
   - Search for request ID from error message
   - Look for `[AI_ADVISOR]` logs with `stage: 'provider_config_check'` or `stage: 'provider_call_failed'`

3. Verify environment variables:
   ```bash
   # Required
   LLM_API_KEY=sk-...
   LLM_PROVIDER=openai  # or 'anthropic'
   
   # Optional (provider-specific)
   OPENAI_MODEL=gpt-4-turbo-preview
   ANTHROPIC_MODEL=claude-3-opus-20240229
   ```

**Fix:**
- Add `LLM_API_KEY` to Vercel environment variables
- Ensure it's set for the correct environment (Production/Preview)
- Redeploy after adding env vars

### 2. Finding Failing Requests in Vercel Logs

1. Get Request ID from UI error message
2. In Vercel Dashboard:
   - Go to Project → Deployments → Latest → Functions
   - Find `/api/ai-advisor/chat` function
   - Search logs for: `req_1768693606406_11h3eg9` (your request ID)
3. Look for logs with:
   - `[AI_ADVISOR]` prefix
   - Matching `requestId`
   - `stage: 'provider_call_failed'` or `stage: 'llm_call_failed'`

### 3. Common Configuration Issues

**Issue: Missing API Key**
```
Error: LLM_API_KEY environment variable is required
```
- **Fix**: Add `LLM_API_KEY` to Vercel environment variables

**Issue: Invalid Provider**
```
Error: Unsupported LLM provider: xyz
```
- **Fix**: Set `LLM_PROVIDER=openai` or `LLM_PROVIDER=anthropic`

**Issue: Invalid API Key**
```
Error: OpenAI API error: 401 Unauthorized
```
- **Fix**: Verify API key is valid and has correct permissions

**Issue: Rate Limit**
```
Error: OpenAI API error: 429 Rate limit exceeded
```
- **Fix**: Wait and retry, or upgrade API plan

## Environment Variables

### Required
- `LLM_API_KEY`: API key for LLM provider (OpenAI or Anthropic)

### Optional
- `LLM_PROVIDER`: Provider to use (`openai` or `anthropic`, default: `openai`)
- `OPENAI_MODEL`: OpenAI model name (default: `gpt-4-turbo-preview`)
- `OPENAI_BASE_URL`: OpenAI API base URL (default: `https://api.openai.com/v1`)
- `ANTHROPIC_MODEL`: Anthropic model name (default: `claude-3-opus-20240229`)
- `ANTHROPIC_BASE_URL`: Anthropic API base URL (default: `https://api.anthropic.com/v1`)

## Log Examples

### Successful Request
```json
{
  "level": "info",
  "message": "[AI_ADVISOR] Request completed",
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "stage": "request_complete",
  "statusCode": 200,
  "totalLatency": 2345
}
```

### Configuration Error
```json
{
  "level": "error",
  "message": "[AI_ADVISOR] Configuration error",
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "stage": "provider_config_check",
  "statusCode": 503,
  "errorCode": "SERVICE_UNAVAILABLE",
  "error": "LLM_API_KEY environment variable is required"
}
```

### Provider API Error
```json
{
  "level": "error",
  "message": "[AI_ADVISOR] LLM provider error",
  "requestId": "req_1768693606406_11h3eg9",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "stage": "provider_call_failed",
  "statusCode": 503,
  "errorCode": "SERVICE_UNAVAILABLE",
  "error": "OpenAI API error: 401 Unauthorized"
}
```

## Best Practices

1. **Always include Request ID in support tickets** - Makes debugging much faster
2. **Check diagnostics endpoint first** - Quick way to verify configuration
3. **Search logs by Request ID** - Most efficient way to find specific failures
4. **Monitor for `SERVICE_UNAVAILABLE` errors** - Indicates configuration issues
5. **Verify env vars are set for correct environment** - Production vs Preview mismatch is common

## Related Files

- `app/api/ai-advisor/chat/route.ts` - Main API route with enhanced logging
- `app/api/diagnostics/ai/route.ts` - Diagnostics endpoint
- `components/ai-advisor/AIAdvisor.tsx` - Frontend with requestId extraction
- `lib/ai/llm.ts` - LLM provider implementation
