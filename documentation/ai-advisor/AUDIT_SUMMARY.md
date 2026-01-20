# AI Advisor Audit Summary

**Date:** 2025-01-27  
**Request ID:** `req_1768902621265_7sy30ze`  
**Status:** ✅ Diagnostic tools and documentation created

---

## What Was Done

### 1. Created Diagnostic Script
**File:** `scripts/diagnose-request-id.ts`

A comprehensive TypeScript script that:
- Queries `request_logs` table for the request ID
- Queries `advisor_conversations` table for conversation messages
- Analyzes error messages and provides recommendations
- Shows timeline analysis and nearby requests
- Provides actionable next steps

**Usage:**
```bash
tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze
```

---

### 2. Enhanced Admin Logs API
**File:** `app/api/admin/logs/route.ts`

Added support for querying by `requestId`:
- New query parameter: `requestId`
- Allows filtering logs by specific request ID
- Works with existing filters (path, status)

**Usage:**
```bash
GET /api/admin/logs?requestId=req_1768902621265_7sy30ze
```

---

### 3. Created Diagnostic Documentation

#### Request-Specific Diagnosis
**File:** `documentation/ai-advisor/REQUEST_DIAGNOSIS_req_1768902621265_7sy30ze.md`

Comprehensive guide for diagnosing this specific request:
- Request ID format validation
- SQL queries for logs and conversations
- Common failure scenarios
- Troubleshooting checklist
- Fix recommendations

#### Diagnostic Audit
**File:** `documentation/ai-advisor/AI_ADVISOR_DIAGNOSTIC_AUDIT.md`

Complete diagnostic framework:
- All diagnostic tools and how to use them
- Error taxonomy and meanings
- Common failure scenarios with fixes
- Log analysis guide
- Troubleshooting workflow
- Prevention strategies

---

## How to Use

### Step 1: Run Diagnostic Script
```bash
tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze
```

This will:
- Query the database for request logs
- Query conversation messages
- Analyze errors and provide recommendations
- Show timeline and nearby requests

### Step 2: Review Results
The script output will show:
- ✅ If request was logged (status, duration, errors)
- ✅ If conversation messages were stored
- ✅ Error analysis with specific recommendations
- ✅ Next steps for troubleshooting

### Step 3: Check Additional Sources
If needed, check:
- **Vercel Logs:** `vercel logs --follow | grep req_1768902621265_7sy30ze`
- **Admin API:** `GET /api/admin/logs?requestId=req_1768902621265_7sy30ze`
- **Database:** Run SQL queries from documentation

### Step 4: Apply Fix
Based on error code and message:
- Follow fix recommendations in documentation
- Verify fix with test request
- Monitor for recurrence

---

## Diagnostic Tools Available

### 1. Command-Line Script
```bash
tsx scripts/diagnose-request-id.ts <request-id>
```

### 2. Admin API Endpoint
```bash
GET /api/admin/logs?requestId=<request-id>
```

### 3. Database Queries
See `REQUEST_DIAGNOSIS_req_1768902621265_7sy30ze.md` for SQL queries

### 4. Vercel Logs
```bash
vercel logs --follow | grep <request-id>
```

---

## Common Issues and Fixes

### Missing LLM_API_KEY
- **Error:** `SERVICE_UNAVAILABLE` (503)
- **Fix:** Add `LLM_API_KEY` to Vercel environment variables

### Invalid API Key
- **Error:** `UNAUTHORIZED` (401)
- **Fix:** Verify API key is correct and not expired

### Rate Limit
- **Error:** `RATE_LIMIT_EXCEEDED` (429)
- **Fix:** Wait and retry, or upgrade API plan

### Provider Down
- **Error:** `UPSTREAM_ERROR` (500)
- **Fix:** Check provider status, wait for recovery

### Timeout
- **Error:** `TIMEOUT` (504)
- **Fix:** Check provider latency, increase timeout if needed

---

## Documentation Structure

```
documentation/ai-advisor/
├── AUDIT_SUMMARY.md (this file)
├── REQUEST_DIAGNOSIS_req_1768902621265_7sy30ze.md (request-specific)
├── AI_ADVISOR_DIAGNOSTIC_AUDIT.md (comprehensive guide)
├── AI_ADVISOR_AUDIT.md (system audit)
├── ERROR_TAXONOMY.md (error codes)
├── SERVICE_UNAVAILABLE_REPRODUCTION.md (reproduction guide)
├── DIAGNOSTICS_AND_LOGGING.md (logging guide)
└── LOGGING_GUIDE.md (detailed logging)
```

---

## Next Steps

1. **Run Diagnostic Script**
   ```bash
   tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze
   ```

2. **Review Output**
   - Check if request was logged
   - Review error message and status code
   - Follow recommended fixes

3. **Check Additional Sources**
   - Vercel logs if needed
   - Admin API if needed
   - Database queries if needed

4. **Apply Fix**
   - Based on error code
   - Verify with test request
   - Document resolution

---

## Files Created/Modified

### Created
- ✅ `scripts/diagnose-request-id.ts` - Diagnostic script
- ✅ `documentation/ai-advisor/REQUEST_DIAGNOSIS_req_1768902621265_7sy30ze.md` - Request-specific diagnosis
- ✅ `documentation/ai-advisor/AI_ADVISOR_DIAGNOSTIC_AUDIT.md` - Comprehensive diagnostic guide
- ✅ `documentation/ai-advisor/AUDIT_SUMMARY.md` - This summary

### Modified
- ✅ `app/api/admin/logs/route.ts` - Added `requestId` query parameter support

---

## Quick Reference

### Diagnostic Commands
```bash
# Run diagnostic script
tsx scripts/diagnose-request-id.ts req_1768902621265_7sy30ze

# Query admin logs API
curl "https://your-domain.com/api/admin/logs?requestId=req_1768902621265_7sy30ze"

# Check health endpoint
curl https://your-domain.com/api/ai-advisor/health

# Search Vercel logs
vercel logs --follow | grep req_1768902621265_7sy30ze
```

### Database Queries
```sql
-- Request logs
SELECT * FROM request_logs WHERE request_id = 'req_1768902621265_7sy30ze';

-- Conversations
SELECT * FROM advisor_conversations WHERE metadata->>'requestId' = 'req_1768902621265_7sy30ze';
```

---

**End of Summary**
