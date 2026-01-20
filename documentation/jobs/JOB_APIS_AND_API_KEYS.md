# Job APIs for Tech & AI Roles - Setup Guide

This document lists free and paid APIs for fetching tech and AI job listings, along with instructions on where and how to securely add API keys in your codebase, Vercel, and Supabase.

---

## Job APIs for Tech & AI Roles

### Free Tier Options

| API | Free Tier | Key Features | Best For |
|-----|-----------|--------------|----------|
| **APIJobs** | 50 calls/month | 3M+ active jobs globally; advanced filtering (skills, experience, salary, remote); tech/AI focus | Job boards, market analysis, skill-based matching |
| **Hirebase** | 10 API calls/day | 1.7M+ real-time job listings; deduplicated; structured data; advanced filters (industry, location) | Job aggregators, real-time job feeds |
| **JSearch API (RapidAPI)** | 250 requests/month | Aggregated from multiple job boards; tech job focus; JSON responses | Quick integrations, testing |
| **Adzuna API** | 1,000 requests/month | UK, US, AU job listings; salary data; company info | Salary analysis, regional job markets |

### Paid Options

| API | Pricing | Key Features | Best For |
|-----|---------|--------------|----------|
| **Jobdata API** | Paid plans available | Aggregated job listings globally; direct ATS apply links; remote filters; company context | Production job boards, ATS integrations |
| **CrustData Job Listing API** | Custom pricing | 30+ data points per listing; company context (size, industry); remote/hybrid flags; real-time updates | Recruiting tools, analytics dashboards |
| **Simple Job Data API** | Paid/Pro tiers | Everyday job listings; direct ATS apply links; geo filters; clean structured data | Job aggregators, app integrations |
| **Job Postings API (JobDataFeeds)** | Usage-based | Real-time & historical data; from job boards & ATS; JSON/XML/CSV output; rich metadata | Aggregators, analytics, market research |
| **SharpAPI - Job Positions API** | Paid | Database of 16,000+ job positions/titles; related roles with relevancy; structured search | Career pathing, role matching, recommendation engines |
| **Fantastic.jobs (via Apify)** | $4.00 per 1,000 jobs | Real job postings from 140k+ company career sites; 41 ATS platforms; enriched company & LinkedIn data; ~60 fields per job | Comprehensive job data, company research |
| **Gateway APIs - Jobs API** | Paid (sandbox available) | Create & distribute job listings; post to 100+ job boards; job description generation; fraud detection; performance tracking | ATS systems, HR platforms, company careers pages |

### API Comparison

| Feature | APIJobs | Hirebase | Jobdata API | CrustData | SharpAPI |
|---------|---------|----------|-------------|-----------|----------|
| **Free Tier** | ✅ 50/month | ✅ 10/day | ❌ | ❌ | ❌ |
| **Tech/AI Focus** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Remote Filter** | ✅ | ✅ | ✅ | ✅ | N/A |
| **Salary Data** | ✅ | ✅ | ✅ | ✅ | N/A |
| **Company Info** | ✅ | ✅ | ✅ | ✅ | N/A |
| **Skills Matching** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **ATS Integration** | ❌ | ❌ | ✅ | ❌ | N/A |
| **Real-time Updates** | ✅ | ✅ | ✅ | ✅ | N/A |

---

## Where to Add API Keys

### 1. Local Development (Codebase)

#### Step 1: Create `.env.local` File

Create a `.env.local` file in the project root (this file is already in `.gitignore`):

```bash
# In project root
touch .env.local
```

#### Step 2: Add API Keys

Add your job API keys to `.env.local`:

```env
# Job API Keys
APIJOBS_API_KEY=your_apijobs_key_here
HIREBASE_API_KEY=your_hirebase_key_here
JOBDATA_API_KEY=your_jobdata_key_here
CRUSTDATA_API_KEY=your_crustdata_key_here
SHARPAPI_API_KEY=your_sharpapi_key_here

# Existing Supabase keys (keep these)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Step 3: Create `.env.example` Template

Create a `.env.example` file (this should be committed to git) to document required variables:

```env
# Job API Keys
APIJOBS_API_KEY=
HIREBASE_API_KEY=
JOBDATA_API_KEY=
CRUSTDATA_API_KEY=
SHARPAPI_API_KEY=

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

#### Step 4: Use in Code

In your API routes or server-side code, access keys via `process.env`:

```typescript
// app/api/jobs/fetch-external/route.ts
const apijobsKey = process.env.APIJOBS_API_KEY;
const hirebaseKey = process.env.HIREBASE_API_KEY;

async function fetchJobsFromAPIJobs(params: any) {
  const response = await fetch(`https://api.apijobs.dev/v1/jobs?${new URLSearchParams(params)}`, {
    headers: {
      'Authorization': `Bearer ${apijobsKey}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}
```

**⚠️ Important**: 
- Never commit `.env.local` to git (it's in `.gitignore`)
- Never log API keys in console.log or error messages
- Only use server-side (API routes, server components) - never expose in client-side code

---

### 2. Vercel (Production/Preview/Development)

#### Step 1: Navigate to Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

#### Step 2: Add Job API Keys

For each job API key:

1. Click **Add New**
2. Enter the **Key** (exactly as shown, case-sensitive):
   - `APIJOBS_API_KEY`
   - `HIREBASE_API_KEY`
   - `JOBDATA_API_KEY`
   - `CRUSTDATA_API_KEY`
   - `SHARPAPI_API_KEY`
3. Enter the **Value** (your actual API key)
4. Mark as **Sensitive** (recommended) - this hides the value after saving
5. Select **all environments**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click **Save**

#### Step 3: Verify Variables

After adding variables:

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy** (environment variables only apply after redeploy)

#### Step 4: Pull Variables Locally (Optional)

To sync Vercel environment variables to your local `.env.local`:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Pull environment variables
vercel env pull .env.local
```

This will create/update your `.env.local` with variables from Vercel.

#### Environment-Specific Configuration

You can set different API keys for different environments:

- **Production**: Use production API keys (paid plans)
- **Preview**: Use preview/test API keys (free tiers or test accounts)
- **Development**: Use development API keys (free tiers)

To set environment-specific values:
1. When adding a variable, select only the environment(s) you want
2. Add the same variable name again with different value for other environments

---

### 3. Supabase (Edge Functions & Database)

#### Option A: Supabase Edge Functions

If you're using Supabase Edge Functions to fetch jobs:

##### Local Development

1. Create `.env` file in `supabase/functions/` directory:

```bash
# supabase/functions/.env
APIJOBS_API_KEY=your_apijobs_key_here
HIREBASE_API_KEY=your_hirebase_key_here
```

2. Access in Edge Function code:

```typescript
// supabase/functions/fetch-jobs/index.ts
const apijobsKey = Deno.env.get('APIJOBS_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');

async function fetchJobs() {
  const response = await fetch(`https://api.apijobs.dev/v1/jobs`, {
    headers: {
      'Authorization': `Bearer ${apijobsKey}`,
    },
  });
  return response.json();
}
```

##### Production (Supabase Dashboard)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Edge Functions** → **Secrets**
4. Click **Add Secret**
5. Enter:
   - **Name**: `APIJOBS_API_KEY`
   - **Value**: Your API key
6. Click **Save**
7. Repeat for other API keys

##### Production (Supabase CLI)

```bash
# Set secrets via CLI
supabase secrets set APIJOBS_API_KEY=your_key_here
supabase secrets set HIREBASE_API_KEY=your_key_here
```

#### Option B: Supabase Vault (Database Secrets)

For storing secrets in the database (encrypted):

1. **Via SQL**:

```sql
-- Create a secret
SELECT vault.create_secret('your_api_key_value', 'APIJOBS_API_KEY');

-- Access the secret (in a function or view)
SELECT decrypted_secrets.secret
FROM vault.decrypted_secrets
WHERE name = 'APIJOBS_API_KEY';
```

2. **Via Supabase Dashboard**:
   - Go to **Database** → **Vault**
   - Click **New Secret**
   - Enter name and value
   - Click **Save**

**⚠️ Note**: Vault secrets are encrypted and can only be accessed via SQL functions or views with proper permissions.

---

## Implementation Example

### Complete Setup: APIJobs Integration

#### 1. Add API Key to `.env.local`

```env
APIJOBS_API_KEY=your_apijobs_api_key_here
```

#### 2. Create API Route

```typescript
// app/api/jobs/fetch-apijobs/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.APIJOBS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'APIJOBS_API_KEY not configured' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'software engineer';
  const location = searchParams.get('location') || '';
  const remote = searchParams.get('remote') === 'true';

  try {
    const params = new URLSearchParams({
      query,
      ...(location && { location }),
      ...(remote && { remote: 'true' }),
    });

    const response = await fetch(
      `https://api.apijobs.dev/v1/jobs?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`APIJobs API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      ok: true,
      jobs: data.jobs || [],
      total: data.total || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'API_ERROR',
          message: error.message || 'Failed to fetch jobs',
        },
      },
      { status: 500 }
    );
  }
}
```

#### 3. Add to Vercel

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `APIJOBS_API_KEY` with your key
3. Select all environments
4. Mark as Sensitive
5. Redeploy

#### 4. Test the Integration

```bash
# Local test
curl http://localhost:3000/api/jobs/fetch-apijobs?q=AI%20engineer&remote=true

# Production test (after deployment)
curl https://your-domain.vercel.app/api/jobs/fetch-apijobs?q=AI%20engineer&remote=true
```

---

## Security Best Practices

### 1. Never Expose Keys to Client-Side

❌ **DON'T**:
```typescript
// ❌ BAD - Exposes key to browser
const API_KEY = process.env.APIJOBS_API_KEY; // In client component
```

✅ **DO**:
```typescript
// ✅ GOOD - Server-side only
// app/api/jobs/route.ts (API route)
const API_KEY = process.env.APIJOBS_API_KEY; // Server-side only
```

### 2. Use Environment-Specific Keys

- **Development**: Free tier keys or test accounts
- **Preview**: Separate test keys
- **Production**: Production API keys (paid plans)

### 3. Rotate Keys Periodically

- Change API keys every 90 days (or as per API provider policy)
- If a key is leaked, rotate immediately
- Update in Vercel, Supabase, and `.env.local`

### 4. Monitor API Usage

- Set up alerts for unusual API usage
- Track API call counts and costs
- Use API provider dashboards to monitor usage

### 5. Rate Limiting

Implement rate limiting in your API routes to prevent abuse:

```typescript
// Example: Simple rate limiting
const rateLimit = new Map();

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;

  const userRequests = rateLimit.get(ip) || [];
  const recentRequests = userRequests.filter(
    (time: number) => now - time < windowMs
  );

  if (recentRequests.length >= maxRequests) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);

  // Continue with API call...
}
```

### 6. Error Handling

Never expose API keys in error messages:

❌ **DON'T**:
```typescript
throw new Error(`API call failed with key: ${apiKey}`);
```

✅ **DO**:
```typescript
safeLogger.error('API call failed', { 
  error: error.message,
  // Don't log the key
});
```

---

## Quick Checklist

### Local Development
- [ ] Created `.env.local` file
- [ ] Added all required API keys
- [ ] Created `.env.example` template (committed to git)
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Tested API integration locally

### Vercel
- [ ] Added all API keys to Vercel Environment Variables
- [ ] Marked keys as Sensitive
- [ ] Set for all environments (Production, Preview, Development)
- [ ] Redeployed after adding variables
- [ ] Verified keys work in production

### Supabase (if using Edge Functions)
- [ ] Added secrets via Dashboard or CLI
- [ ] Tested Edge Function locally with `.env` file
- [ ] Verified secrets are accessible in production functions

### Security
- [ ] Never exposed keys to client-side code
- [ ] Implemented rate limiting
- [ ] Set up API usage monitoring
- [ ] Documented key rotation schedule
- [ ] Verified no keys in git history

---

## Troubleshooting

### Issue: "API key not found" in production

**Solution**:
1. Verify key is set in Vercel Environment Variables
2. Ensure key is set for the correct environment (Production)
3. Redeploy after adding the key
4. Check key name matches exactly (case-sensitive)

### Issue: API calls work locally but fail in Vercel

**Possible Causes**:
1. Key only in `.env.local` (not in Vercel)
2. Key set for wrong environment
3. Not redeployed after adding key

**Solution**:
1. Add key to Vercel (not just `.env.local`)
2. Verify environment selection
3. Redeploy

### Issue: Rate limit exceeded

**Solution**:
1. Check API provider dashboard for usage
2. Implement rate limiting in your code
3. Consider upgrading API plan
4. Cache API responses to reduce calls

### Issue: API key exposed in error logs

**Solution**:
1. Review error logging code
2. Use safe logging utilities (like `safeLogger`)
3. Never log `process.env` values directly
4. Rotate exposed keys immediately

---

## Related Documentation

- [Vercel Supabase Environment Variables Setup](../setup-config/VERCEL_SUPABASE_ENV_SETUP.md)
- [Jobs API Fix](./JOBS_API_FIX.md)
- [API Setup and Integration](../api/API_SETUP_AND_INTEGRATION.md)
- [Environment Variables Setup](../setup-config/SETUP_ENV.md)

---

## API Provider Links

- **APIJobs**: https://apijobs.dev
- **Hirebase**: https://www.hirebase.org
- **Jobdata API**: https://jobdataapi.com
- **CrustData**: https://crustdata.com
- **SharpAPI**: https://sharpapi.com
- **JSearch API**: https://rapidapi.com/letscrape-6bRBa3EguV5/api/jsearch
- **Adzuna API**: https://developer.adzuna.com
- **Fantastic.jobs**: https://apify.com/fantastic-jobs/career-site-job-listing-api
- **Gateway APIs**: https://gatewayapis.com

---

## Next Steps

1. **Choose an API**: Based on your needs (free tier, features, pricing)
2. **Sign up**: Create accounts and get API keys
3. **Add keys**: Follow setup instructions above
4. **Implement**: Create API routes to fetch jobs
5. **Integrate**: Connect to existing `/api/jobs` endpoint
6. **Test**: Verify integration works in all environments
7. **Monitor**: Set up usage tracking and alerts
