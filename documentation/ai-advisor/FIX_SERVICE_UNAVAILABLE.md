# Fix: AI Advisor "Service Unavailable" Error

## Problem

You're seeing this error:
```
⚠️ Error — AI service is currently unavailable. Please contact support if this persists.
Request ID: req_1769463809536_xq440aq
```

## Root Cause

The `LLM_API_KEY` environment variable is **missing or not configured**. The AI Advisor requires this to connect to the LLM provider (OpenAI or Anthropic).

## Solution

### For Local Development

1. **Create or update `.env.local` file** in the project root:

```bash
# Required: LLM Provider API Key
LLM_API_KEY=sk-your-api-key-here

# Optional: Specify provider (defaults to 'openai')
LLM_PROVIDER=openai  # or 'anthropic'

# Optional: Model configuration
OPENAI_MODEL=gpt-4-turbo-preview
ANTHROPIC_MODEL=claude-3-opus-20240229
```

2. **Get your API key:**
   - **OpenAI**: Go to [OpenAI API Keys](https://platform.openai.com/api-keys) and create a new key
   - **Anthropic**: Go to [Anthropic Console](https://console.anthropic.com/) and create a new key

3. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

### For Production (Vercel)

1. **Go to Vercel Dashboard:**
   - Navigate to your project
   - Go to **Settings** → **Environment Variables**

2. **Add the environment variable:**
   - Click **Add New**
   - **Key**: `LLM_API_KEY`
   - **Value**: Your API key (e.g., `sk-...` for OpenAI or `sk-ant-...` for Anthropic)
   - **Mark as Sensitive**: ✅ (recommended)
   - **Environments**: Select all (Production, Preview, Development)
   - Click **Save**

3. **Optional: Add provider configuration:**
   - **Key**: `LLM_PROVIDER`
   - **Value**: `openai` or `anthropic`
   - **Environments**: All

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on the latest deployment
   - Click **Redeploy**
   - ⚠️ **Important**: Environment variables only apply after redeploy!

## Verify the Fix

### Option 1: Health Check Endpoint

After setting up the environment variable, check the health endpoint:

```bash
# Local development
curl http://localhost:3000/api/ai-advisor/health

# Production
curl https://your-domain.com/api/ai-advisor/health
```

**Expected response (200 OK):**
```json
{
  "ok": true,
  "status": "healthy",
  "checks": {
    "total": 5,
    "passed": 5,
    "warnings": 0,
    "failed": 0
  },
  "details": [
    {
      "name": "LLM Provider Configuration",
      "status": "pass",
      "message": "Provider configured (openai) and upstream reachable"
    }
  ]
}
```

**If still failing (503):**
```json
{
  "ok": false,
  "status": "unhealthy",
  "checks": {
    "failed": 1
  },
  "details": [
    {
      "name": "LLM Provider Configuration",
      "status": "fail",
      "message": "LLM_API_KEY or OPENAI_API_KEY environment variable is not set"
    }
  ]
}
```

### Option 2: Diagnostics Endpoint

```bash
curl https://your-domain.com/api/diagnostics/ai
```

**Expected response:**
```json
{
  "provider": "openai",
  "model": "gpt-4-turbo-preview",
  "hasApiKey": true,
  "providerConfigured": true
}
```

### Option 3: Try the AI Advisor

1. Navigate to the AI Advisor page in your app
2. Send a test message
3. If configured correctly, you should get a response instead of the error

## Troubleshooting

### Issue: Still getting error after setting environment variable

**Possible causes:**

1. **Didn't restart the server** (local development)
   - Solution: Stop and restart `npm run dev`

2. **Didn't redeploy** (Vercel)
   - Solution: Go to Deployments → Redeploy

3. **Wrong environment variable name**
   - Must be exactly: `LLM_API_KEY` (case-sensitive)
   - Check for typos or extra spaces

4. **Invalid API key**
   - Solution: Verify the key is valid and has correct permissions
   - For OpenAI: Check [API Keys page](https://platform.openai.com/api-keys)
   - For Anthropic: Check [Console](https://console.anthropic.com/)

5. **API key has no credits/quota**
   - Solution: Check your provider's billing/usage page

### Issue: Error persists with valid API key

Check the logs for the request ID:

1. **Local development**: Check terminal output for `[AI_ADVISOR]` logs
2. **Vercel**: 
   - Go to Deployments → Latest → Functions
   - Find `/api/ai-advisor/chat`
   - Search for your request ID: `req_1769463809536_xq440aq`
   - Look for error details

### Issue: Circuit breaker is open

If you see "Circuit breaker is OPEN" in logs:

- The provider has had repeated failures
- Wait a few minutes and try again
- Check if the LLM provider (OpenAI/Anthropic) is experiencing outages

## Environment Variables Reference

### Required
- `LLM_API_KEY` - Your LLM provider API key

### Optional
- `LLM_PROVIDER` - Provider to use (`openai` or `anthropic`, default: `openai`)
- `OPENAI_MODEL` - OpenAI model (default: `gpt-4-turbo-preview`)
- `OPENAI_BASE_URL` - Custom OpenAI API URL (default: `https://api.openai.com/v1`)
- `ANTHROPIC_MODEL` - Anthropic model (default: `claude-3-opus-20240229`)
- `ANTHROPIC_BASE_URL` - Custom Anthropic API URL (default: `https://api.anthropic.com/v1`)

## Related Documentation

- [AI Advisor Diagnostics Guide](./DIAGNOSTICS_AND_LOGGING.md)
- [Error Taxonomy](./ERROR_TAXONOMY.md)
- [Vercel Environment Variables Setup](../setup-config/VERCEL_ENV_VAR_CHECKLIST.md)
