# AI Advisor Diagnostic Audit

**Date:** 2025-01-27  
**Request ID:** `req_1768902621265_7sy30ze`  
**Purpose:** Comprehensive audit and diagnostic guide for AI Advisor issues

---

## Executive Summary

This document provides a comprehensive diagnostic framework for troubleshooting AI Advisor issues, with specific focus on request ID `req_1768902621265_7sy30ze`. It includes tools, queries, and procedures to identify root causes and apply fixes.

---

## Diagnostic Tools

### 1. Request ID Diagnostic Script

**Location:** `scripts/diagnose-request-id.ts`

**Usage:**
```bash
# Direct usage
tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze

# With environment variable
REQUEST_ID=req_1768902621265_7sy30ze tsx scripts/diagnose-request-id.ts
```

**What it does:**
- Queries `request_logs` table for the request ID
- Queries `advisor_conversations` table for conversation messages
- Analyzes error messages and stack traces
- Provides timeline analysis
- Suggests fixes based on error patterns

**Output includes:**
- Request log entries (status, duration, errors)
- Conversation messages (if stored)
- Error analysis and recommendations
- Next steps for troubleshooting

---

### 2. Admin Logs API

**Endpoint:** `GET /api/admin/logs?requestId=req_1768902621265_7sy30ze`

**Usage:**
```bash
# Query by request ID
curl -H "Cookie: your-auth-cookie" \
  "https://your-domain.com/api/admin/logs?requestId=req_1768902621265_7sy30ze"

# Query with filters
curl -H "Cookie: your-auth-cookie" \
  "https://your-domain.com/api/admin/logs?path=/api/ai-advisor/chat&status=500&requestId=req_1768902621265_7sy30ze"
```

**Query Parameters:**
- `requestId` - Filter by specific request ID
- `path` - Filter by endpoint path
- `status` - Filter by HTTP status code
- `limit` - Number of results (default: 100, max: 500)
- `offset` - Pagination offset

---

### 3. Database Queries

#### Query Request Logs
```sql
SELECT 
  request_id,
  user_id,
  path,
  method,
  status,
  duration,
  error_message,
  error_stack,
  ip_address,
  user_agent,
  created_at
FROM request_logs
WHERE request_id = 'req_1768902621265_7sy30ze'
ORDER BY created_at DESC;
```

#### Query Conversation Messages
```sql
SELECT 
  id,
  student_profile_id,
  conversation_id,
  role,
  content,
  metadata,
  created_at
FROM advisor_conversations
WHERE metadata->>'requestId' = 'req_1768902621265_7sy30ze'
ORDER BY created_at ASC;
```

#### Query Nearby Requests (Time Window)
```sql
-- Extract timestamp: 1768902621265
SELECT * FROM request_logs
WHERE created_at BETWEEN 
  (TIMESTAMP '1970-01-01' + INTERVAL '1 millisecond' * 1768902621265 - INTERVAL '1 minute')
  AND
  (TIMESTAMP '1970-01-01' + INTERVAL '1 millisecond' * 1768902621265 + INTERVAL '1 minute')
ORDER BY created_at DESC;
```

---

## Error Taxonomy

### Error Codes and Meanings

| Error Code | Status | Description | Common Causes |
|------------|--------|-------------|---------------|
| `SERVICE_UNAVAILABLE` | 503 | LLM provider not configured | Missing `LLM_API_KEY` env var |
| `UNAUTHORIZED` | 401 | Authentication failed | Invalid API key |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded | Too many requests to LLM provider |
| `TIMEOUT` | 504 | Request timeout | LLM provider slow response |
| `UPSTREAM_ERROR` | 500 | LLM provider API error | Provider API down (5xx) |
| `ValidationError` | 400 | Invalid request | Malformed request payload |
| `InternalError` | 500 | Internal server error | Unexpected error |

---

## Common Failure Scenarios

### 1. Missing LLM_API_KEY

**Symptoms:**
- Status: `503 Service Unavailable`
- Error Code: `SERVICE_UNAVAILABLE`
- Error Message: `LLM_API_KEY environment variable is required`

**Diagnosis:**
```bash
# Check environment variables
vercel env ls | grep LLM_API_KEY

# Or check health endpoint
curl https://your-domain.com/api/ai-advisor/health
```

**Fix:**
1. Add `LLM_API_KEY` to Vercel environment variables
2. Verify it's set for correct environment (Production/Preview)
3. Redeploy after adding env var

**Prevention:**
- Add startup validation
- Add health check endpoint
- Add CI/CD validation

---

### 2. Invalid API Key

**Symptoms:**
- Status: `401 Unauthorized`
- Error Code: `UNAUTHORIZED`
- Error Message: `OpenAI API error: 401 Unauthorized`

**Diagnosis:**
```bash
# Test API key directly
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $LLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4-turbo-preview", "messages": [{"role": "user", "content": "test"}], "max_tokens": 10}'
```

**Fix:**
1. Verify API key is correct (no extra spaces)
2. Check API key hasn't been revoked
3. Generate new API key if needed
4. Update environment variable

---

### 3. Rate Limit Exceeded

**Symptoms:**
- Status: `429 Too Many Requests`
- Error Code: `RATE_LIMIT_EXCEEDED`
- Error Message: `OpenAI API error: 429 Rate limit exceeded`

**Diagnosis:**
```bash
# Check logs for 429 errors
grep "RATE_LIMIT_EXCEEDED" logs.txt
grep "429" logs.txt
```

**Fix:**
1. Wait for rate limit window to reset
2. Upgrade API tier if needed
3. Implement rate limit handling with backoff
4. Add request queuing

---

### 4. Provider API Down

**Symptoms:**
- Status: `500 Internal Server Error` or `503 Service Unavailable`
- Error Code: `UPSTREAM_ERROR` or `ProviderUnavailable`
- Error Message: `OpenAI API error: 502/503/504`

**Diagnosis:**
```bash
# Check provider status
curl https://status.openai.com/api/v2/status.json

# Check logs for 5xx errors
grep "502\|503\|504" logs.txt
```

**Fix:**
1. Check provider status page
2. Wait for provider to recover
3. Implement retry logic with exponential backoff
4. Add circuit breaker

---

### 5. Timeout

**Symptoms:**
- Status: `504 Gateway Timeout`
- Error Code: `TIMEOUT`
- Error Message: `Response took too long` or `Stream timeout`

**Diagnosis:**
```bash
# Check logs for timeout errors
grep "TIMEOUT\|timeout" logs.txt
```

**Fix:**
1. Check LLM provider latency
2. Increase timeout if needed (currently 60s server, 45s client)
3. Add progressive timeout warnings
4. Add streaming heartbeat

---

### 6. Request Not Logged

**Symptoms:**
- No entry in `request_logs` table
- No conversation messages
- Request may have failed very early

**Possible Causes:**
1. Request failed before logging could occur
2. Request was made before `request_logs` table existed
3. Request ID is incorrect
4. Database connection issue

**Diagnosis:**
```bash
# Check Vercel logs
vercel logs --follow | grep "req_1768902621265_7sy30ze"

# Check application logs
grep "\[AI_ADVISOR\]" logs.txt | grep "req_1768902621265_7sy30ze"
```

**Fix:**
1. Check Vercel deployment logs
2. Check application logs for `[AI_ADVISOR]` entries
3. Verify request ID format
4. Check database connectivity

---

## Log Analysis

### Structured Log Format

All AI Advisor logs use this format:
```json
{
  "level": "info|warn|error",
  "message": "[AI_ADVISOR] Log message",
  "requestId": "req_1768902621265_7sy30ze",
  "userId": "user-123",
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "stage": "request_start|provider_call_failed|...",
  "statusCode": 200,
  "errorCode": "SERVICE_UNAVAILABLE",
  "error": "Error message",
  "elapsed": 1234
}
```

### Key Log Stages

1. `request_start` - Request received
2. `auth_check` - Authentication validation
3. `provider_config_check` - LLM configuration check
4. `request_received` - Request payload parsed
5. `context_resolved` - Active context loaded
6. `context_data_fetched` - Course/project/job data fetched
7. `retrieval_complete` - RAG retrieval completed
8. `provider_call_started` - LLM API call initiated
9. `provider_call_failed` - LLM API call failed ⚠️
10. `llm_call_failed` - LLM generation failed ⚠️
11. `top_level_error` - Unhandled error ⚠️

### Searching Logs

```bash
# Search by request ID
grep "req_1768902621265_7sy30ze" logs.txt

# Search by stage
grep '"stage": "provider_call_failed"' logs.txt

# Search by error code
grep '"errorCode": "SERVICE_UNAVAILABLE"' logs.txt

# Search by user
grep '"userId": "user-123"' logs.txt
```

---

## Troubleshooting Workflow

### Step 1: Run Diagnostic Script
```bash
tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze
```

### Step 2: Review Results
- Check if request was logged
- Check error message and status code
- Review stack trace if available

### Step 3: Check Vercel Logs
```bash
vercel logs --follow | grep "req_1768902621265_7sy30ze"
```

### Step 4: Check Application Logs
```bash
# Search for structured logs
grep "\[AI_ADVISOR\]" logs.txt | grep "req_1768902621265_7sy30ze"

# Search for error stages
grep '"stage": ".*_failed"' logs.txt | grep "req_1768902621265_7sy30ze"
```

### Step 5: Query Database
```sql
-- Check request logs
SELECT * FROM request_logs WHERE request_id = 'req_1768902621265_7sy30ze';

-- Check conversations
SELECT * FROM advisor_conversations WHERE metadata->>'requestId' = 'req_1768902621265_7sy30ze';
```

### Step 6: Identify Root Cause
- Match error code to failure scenario
- Review error message for specific details
- Check upstream status if available

### Step 7: Apply Fix
- Follow fix recommendations in this document
- Verify fix with test request
- Monitor for recurrence

---

## Prevention Strategies

### 1. Configuration Validation
- Add startup validation for required env vars
- Add health check endpoint
- Add CI/CD validation

### 2. Error Handling
- Add retry logic with exponential backoff
- Add circuit breaker for provider failures
- Add fallback provider support

### 3. Monitoring
- Add metrics (request rate, error rate, latency)
- Add alerting (circuit breaker open, high error rate)
- Add dashboards (success rate, latency, error breakdown)

### 4. Logging
- ✅ Request ID tracking (implemented)
- ✅ Structured logging (implemented)
- ✅ Error codes (implemented)
- ⚠️ Metrics/alerting (not implemented)
- ⚠️ Dashboards (not implemented)

---

## Related Documentation

- **Request Diagnosis:** `documentation/ai-advisor/REQUEST_DIAGNOSIS_req_1768902621265_7sy30ze.md`
- **Error Taxonomy:** `documentation/ai-advisor/ERROR_TAXONOMY.md`
- **Service Unavailable Reproduction:** `documentation/ai-advisor/SERVICE_UNAVAILABLE_REPRODUCTION.md`
- **Diagnostics & Logging:** `documentation/ai-advisor/DIAGNOSTICS_AND_LOGGING.md`
- **Logging Guide:** `documentation/ai-advisor/LOGGING_GUIDE.md`
- **AI Advisor Audit:** `documentation/ai-advisor/AI_ADVISOR_AUDIT.md`

---

## Quick Reference

### Diagnostic Commands
```bash
# Run diagnostic script
tsx scripts/diagnose-request-id.ts <request-id>

# Query admin logs API
curl "https://your-domain.com/api/admin/logs?requestId=<request-id>"

# Check health endpoint
curl https://your-domain.com/api/ai-advisor/health

# Search Vercel logs
vercel logs --follow | grep <request-id>
```

### Database Queries
```sql
-- Request logs
SELECT * FROM request_logs WHERE request_id = '<request-id>';

-- Conversations
SELECT * FROM advisor_conversations WHERE metadata->>'requestId' = '<request-id>';
```

### Error Code Reference
- `SERVICE_UNAVAILABLE` (503) - Missing API key
- `UNAUTHORIZED` (401) - Invalid API key
- `RATE_LIMIT_EXCEEDED` (429) - Rate limit
- `TIMEOUT` (504) - Request timeout
- `UPSTREAM_ERROR` (500) - Provider API error

---

**End of Diagnostic Audit**
