# AI Advisor Request Diagnosis

**Request ID:** `req_1768902621265_7sy30ze`  
**Date:** 2025-01-27  
**Purpose:** Diagnose specific request failure

---

## Request ID Analysis

### Format Validation
- **Format:** `req_{timestamp}_{random}`
- **Timestamp:** `1768902621265` → `2025-12-28T00:03:41.265Z` (if valid)
- **Random:** `7sy30ze`
- **Status:** ✅ Format appears valid

### Timestamp Extraction
```javascript
const timestamp = 1768902621265;
const requestTime = new Date(timestamp);
// Result: 2025-12-28T00:03:41.265Z (if timestamp is milliseconds)
```

**Note:** If this timestamp is in the future, it may indicate:
- System clock issue
- Timestamp is in seconds (not milliseconds) → `2025-12-28` would be incorrect
- Request ID format mismatch

---

## Diagnostic Steps

### 1. Query Request Logs

Run the diagnostic script:
```bash
tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze
```

Or query directly:
```sql
-- Query request_logs table
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

**Expected Results:**
- If found: Status code, error message, duration, stack trace
- If not found: Request may have failed before logging, or request ID is incorrect

---

### 2. Query Conversation Messages

```sql
-- Query advisor_conversations for this request ID
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

**Expected Results:**
- If found: User message and/or assistant response with metadata
- If not found: Request may have failed before storing conversation

---

### 3. Check Vercel Logs

Search Vercel deployment logs for:
```
req_1768902621265_7sy30ze
```

Or search for structured logs:
```
[AI_ADVISOR] ... requestId: "req_1768902621265_7sy30ze"
```

**Key Log Stages to Look For:**
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

---

## Common Failure Scenarios

### Scenario 1: Missing LLM_API_KEY

**Symptoms:**
- Status: `503 Service Unavailable`
- Error Code: `SERVICE_UNAVAILABLE`
- Error Message: `LLM_API_KEY environment variable is required`

**Log Pattern:**
```json
{
  "stage": "provider_config_check",
  "errorCode": "SERVICE_UNAVAILABLE",
  "error": "LLM_API_KEY environment variable is required"
}
```

**Fix:**
1. Check Vercel environment variables
2. Verify `LLM_API_KEY` is set for correct environment (Production/Preview)
3. Redeploy after adding env var

---

### Scenario 2: Invalid API Key

**Symptoms:**
- Status: `401 Unauthorized`
- Error Code: `UNAUTHORIZED`
- Error Message: `OpenAI API error: 401 Unauthorized`

**Log Pattern:**
```json
{
  "stage": "provider_call_failed",
  "errorCode": "UNAUTHORIZED",
  "upstreamStatus": 401,
  "error": "OpenAI API error: 401 Unauthorized"
}
```

**Fix:**
1. Verify API key is correct (no extra spaces)
2. Check API key hasn't been revoked
3. Generate new API key if needed

---

### Scenario 3: Rate Limit Exceeded

**Symptoms:**
- Status: `429 Too Many Requests`
- Error Code: `RATE_LIMIT_EXCEEDED`
- Error Message: `OpenAI API error: 429 Rate limit exceeded`

**Log Pattern:**
```json
{
  "stage": "provider_call_failed",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "upstreamStatus": 429,
  "error": "OpenAI API error: 429 Rate limit exceeded"
}
```

**Fix:**
1. Wait for rate limit window to reset
2. Upgrade API tier if needed
3. Implement rate limit handling with backoff

---

### Scenario 4: Provider API Down

**Symptoms:**
- Status: `500 Internal Server Error` or `503 Service Unavailable`
- Error Code: `UPSTREAM_ERROR` or `ProviderUnavailable`
- Error Message: `OpenAI API error: 502/503/504`

**Log Pattern:**
```json
{
  "stage": "provider_call_failed",
  "errorCode": "UPSTREAM_ERROR",
  "upstreamStatus": 502,
  "error": "OpenAI API error: 502 Bad Gateway"
}
```

**Fix:**
1. Check provider status page (https://status.openai.com)
2. Wait for provider to recover
3. Consider implementing retry logic

---

### Scenario 5: Timeout

**Symptoms:**
- Status: `504 Gateway Timeout`
- Error Code: `TIMEOUT`
- Error Message: `Response took too long` or `Stream timeout`

**Log Pattern:**
```json
{
  "stage": "stream_timeout",
  "errorCode": "TIMEOUT",
  "error": "Stream timeout"
}
```

**Fix:**
1. Check LLM provider latency
2. Increase timeout if needed
3. Check network connectivity

---

### Scenario 6: Request Not Logged

**Symptoms:**
- No entry in `request_logs` table
- No conversation messages
- Request may have failed very early

**Possible Causes:**
1. Request failed before logging could occur
2. Request was made before `request_logs` table existed
3. Request ID is incorrect
4. Database connection issue

**Next Steps:**
1. Check Vercel logs for this request ID
2. Check application logs for `[AI_ADVISOR]` entries
3. Verify request ID format

---

## Diagnostic Queries

### Check Request Logs
```sql
SELECT * FROM request_logs 
WHERE request_id = 'req_1768902621265_7sy30ze';
```

### Check Conversation Messages
```sql
SELECT * FROM advisor_conversations 
WHERE metadata->>'requestId' = 'req_1768902621265_7sy30ze';
```

### Check Nearby Requests (Time Window)
```sql
-- Extract timestamp from request ID
-- req_1768902621265_7sy30ze → timestamp = 1768902621265

SELECT * FROM request_logs
WHERE created_at BETWEEN 
  (TIMESTAMP '1970-01-01' + INTERVAL '1 millisecond' * 1768902621265 - INTERVAL '1 minute')
  AND
  (TIMESTAMP '1970-01-01' + INTERVAL '1 millisecond' * 1768902621265 + INTERVAL '1 minute')
ORDER BY created_at DESC;
```

### Check Error Patterns
```sql
-- Find all errors around this time
SELECT 
  request_id,
  status,
  error_message,
  created_at
FROM request_logs
WHERE status >= 400
  AND created_at BETWEEN 
    (TIMESTAMP '1970-01-01' + INTERVAL '1 millisecond' * 1768902621265 - INTERVAL '5 minutes')
    AND
    (TIMESTAMP '1970-01-01' + INTERVAL '1 millisecond' * 1768902621265 + INTERVAL '5 minutes')
ORDER BY created_at DESC
LIMIT 20;
```

---

## Troubleshooting Checklist

- [ ] Run diagnostic script: `tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze`
- [ ] Check `request_logs` table for this request ID
- [ ] Check `advisor_conversations` table for metadata.requestId
- [ ] Search Vercel logs for this request ID
- [ ] Search application logs for `[AI_ADVISOR]` entries
- [ ] Verify environment variables are set correctly
- [ ] Check LLM provider status page
- [ ] Verify request ID format is correct
- [ ] Check timestamp validity (not in future)
- [ ] Review error taxonomy: `documentation/ai-advisor/ERROR_TAXONOMY.md`

---

## Related Documentation

- **Error Taxonomy:** `documentation/ai-advisor/ERROR_TAXONOMY.md`
- **Service Unavailable Reproduction:** `documentation/ai-advisor/SERVICE_UNAVAILABLE_REPRODUCTION.md`
- **Diagnostics & Logging:** `documentation/ai-advisor/DIAGNOSTICS_AND_LOGGING.md`
- **Logging Guide:** `documentation/ai-advisor/LOGGING_GUIDE.md`
- **AI Advisor Audit:** `documentation/ai-advisor/AI_ADVISOR_AUDIT.md`

---

## Next Steps

1. **Run Diagnostic Script**
   ```bash
   tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze
   ```

2. **Review Results**
   - Check if request was logged
   - Check error message and status code
   - Review stack trace if available

3. **Check Vercel Logs**
   - Search for request ID in deployment logs
   - Look for `[AI_ADVISOR]` structured logs
   - Identify failure stage

4. **Apply Fix**
   - Based on error code and message
   - Follow fix recommendations in this document
   - Verify fix with test request

5. **Document Resolution**
   - Update this document with findings
   - Add to known issues if recurring
   - Update error taxonomy if new error pattern

---

**End of Diagnosis Document**
