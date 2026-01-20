# APIJobs Endpoint Testing Guide

This guide explains how to test the APIJobs integration endpoint after setting up your API key.

## Quick Test

### 1. Start Your Development Server

```bash
npm run dev
```

### 2. Test the Endpoint

#### Option A: Using curl (Terminal)

```bash
# Basic test - search for software engineer jobs
curl "http://localhost:3000/api/jobs/fetch-apijobs?q=software%20engineer"

# Search for AI/ML jobs
curl "http://localhost:3000/api/jobs/fetch-apijobs?q=AI%20engineer&remote=true"

# Search with location
curl "http://localhost:3000/api/jobs/fetch-apijobs?q=data%20scientist&location=San%20Francisco"

# Search with pagination
curl "http://localhost:3000/api/jobs/fetch-apijobs?q=developer&page=1&limit=5"
```

#### Option B: Using the Test Script

```bash
# Run the automated test suite
npm run test:apijobs
```

This will run multiple test cases and show you a summary.

#### Option C: Using Browser

Open in your browser:
```
http://localhost:3000/api/jobs/fetch-apijobs?q=software%20engineer
```

#### Option D: Using Postman or Insomnia

1. Create a new GET request
2. URL: `http://localhost:3000/api/jobs/fetch-apijobs`
3. Add query parameters:
   - `q`: software engineer
   - `remote`: true (optional)
   - `location`: San Francisco (optional)
   - `page`: 1 (optional)
   - `limit`: 10 (optional)

## Expected Response

### Success Response

```json
{
  "ok": true,
  "jobs": [
    {
      "title": "Software Engineer",
      "company": "Example Corp",
      "location": "Remote",
      "description": "...",
      // ... other job fields
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "requestId": "apijobs-1234567890-abc123",
  "responseTime": "450ms"
}
```

### Error Response (Missing API Key)

```json
{
  "ok": false,
  "error": {
    "code": "CONFIG_ERROR",
    "message": "APIJOBS_API_KEY not configured. Please add it to environment variables."
  },
  "requestId": "apijobs-1234567890-abc123"
}
```

### Error Response (API Error)

```json
{
  "ok": false,
  "error": {
    "code": "API_ERROR",
    "message": "APIJobs API error: 401 Unauthorized",
    "details": "..."
  },
  "requestId": "apijobs-1234567890-abc123",
  "responseTime": "250ms"
}
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | No | "software engineer" | Search query |
| `location` | string | No | - | Location filter |
| `remote` | boolean | No | false | Set to "true" for remote jobs |
| `page` | number | No | 1 | Page number (starts at 1) |
| `limit` | number | No | 10 | Results per page (max 50) |

## Testing in Production (Vercel)

### 1. Verify API Key in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify `APIJOBS_API_KEY` is set for **Production** environment
5. Ensure it's marked as **Sensitive**

### 2. Redeploy (if needed)

If you just added the key:
1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**

### 3. Test Production Endpoint

```bash
# Replace with your actual domain
curl "https://your-domain.vercel.app/api/jobs/fetch-apijobs?q=AI%20engineer&remote=true"
```

Or use the test script with production URL:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app npm run test:apijobs
```

## Troubleshooting

### Issue: "APIJOBS_API_KEY not configured"

**Solution**:
1. Check `.env.local` file exists in project root
2. Verify the key is named exactly `APIJOBS_API_KEY`
3. Restart your dev server after adding the key
4. For production, verify it's set in Vercel and redeploy

### Issue: "401 Unauthorized" or "403 Forbidden"

**Possible Causes**:
- Invalid API key
- API key expired
- Wrong authentication format

**Solution**:
1. Verify API key is correct (no extra spaces)
2. Check APIJobs dashboard for key status
3. Regenerate key if needed
4. Verify authentication header format in code

### Issue: "Timeout" or Slow Response

**Possible Causes**:
- APIJobs API is slow
- Network issues
- Rate limiting

**Solution**:
1. Check APIJobs status page
2. Verify you're within rate limits (50 calls/month for free tier)
3. Check Vercel function logs for timeout details

### Issue: "Failed to parse response"

**Possible Causes**:
- API response format changed
- API returned HTML error page instead of JSON

**Solution**:
1. Check raw response in logs
2. Verify APIJobs API documentation for current format
3. Update endpoint code if API format changed

## Verification Checklist

- [ ] API key added to `.env.local` (local development)
- [ ] API key added to Vercel Environment Variables (production)
- [ ] Dev server restarted after adding key locally
- [ ] Production redeployed after adding key to Vercel
- [ ] Basic endpoint test successful (returns jobs or proper error)
- [ ] Test script runs without errors
- [ ] Response format matches expected structure
- [ ] Error handling works (test with invalid key)

## Next Steps

After successful testing:

1. **Integrate with existing jobs endpoint**: Modify `/api/jobs/route.ts` to optionally fetch from APIJobs
2. **Add job syncing**: Create a cron job to periodically sync jobs from APIJobs to your database
3. **Add caching**: Cache APIJobs responses to reduce API calls
4. **Add rate limiting**: Implement rate limiting to stay within free tier limits
5. **Monitor usage**: Set up alerts for API usage approaching limits

## Related Documentation

- [Job APIs and API Keys Setup](./JOB_APIS_AND_API_KEYS.md)
- [Jobs API Fix](./JOBS_API_FIX.md)
