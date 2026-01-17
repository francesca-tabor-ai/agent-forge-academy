# Vercel Supabase Environment Variables Setup

This guide ensures that Supabase environment variables are correctly configured in Vercel for all environments.

## Required Environment Variables

The following environment variables **must** be set in Vercel for all environments (Production, Preview, Development):

### Critical Variables

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Your Supabase project URL
   - Format: `https://your-project-id.supabase.co`
   - Found in: Supabase Dashboard → Project Settings → API → Project URL
   - **Must not have trailing or leading spaces**

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Your Supabase anonymous/public key
   - Format: JWT token (long string)
   - Found in: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`
   - **Must not have trailing or leading spaces**

### Optional but Recommended

3. **`SUPABASE_SERVICE_ROLE_KEY`**
   - Your Supabase service role key (for server-side operations)
   - Format: JWT token (long string)
   - Found in: Supabase Dashboard → Project Settings → API → Project API keys → `service_role` `secret`
   - **⚠️ Keep this secret - never expose to client-side code**

4. **`NEXT_PUBLIC_SUPABASE_RESUME_BUCKET`**
   - Storage bucket name for CV/resume uploads
   - Default: `resumes` (if not set)
   - Must match the bucket name created in Supabase Storage

## Step-by-Step Setup in Vercel

### 1. Navigate to Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### 2. Add Each Variable

For each required variable:

1. Click **Add New**
2. Enter the **Key** (exactly as shown above, case-sensitive)
3. Enter the **Value** (copy from Supabase, ensure no spaces)
4. Select **all environments**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **Save**

### 3. Verify No Trailing Spaces

**Common Issue**: When copying from Supabase dashboard, trailing spaces may be included.

**How to Check**:
- After pasting, click at the end of the value and press `End` key
- If cursor moves, there are trailing spaces
- Delete any trailing spaces

**How to Fix**:
- Select all text in the value field
- Copy again from Supabase (ensure you don't select trailing whitespace)
- Or manually delete spaces at the beginning/end

### 4. Verify Values Match Supabase

Compare the values in Vercel with Supabase Dashboard:

1. **Supabase URL**:
   - Vercel: `NEXT_PUBLIC_SUPABASE_URL`
   - Supabase: Project Settings → API → Project URL
   - Must match exactly (including `https://`)

2. **Anon Key**:
   - Vercel: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Supabase: Project Settings → API → `anon` `public` key
   - Must match exactly (entire JWT token)

### 5. Redeploy After Changes

⚠️ **Important**: After adding or editing environment variables:

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or trigger a new deployment by pushing to your branch

Environment variables are only available after a redeploy.

## Verification

### Option 1: Use Verification Endpoint (Recommended)

After deploying, visit:
```
https://your-domain.vercel.app/api/admin/verify-supabase-env
```

This endpoint will check:
- ✅ Variables are present
- ✅ No trailing/leading spaces
- ✅ Valid URL format
- ✅ Keys are non-empty
- ✅ Clients can be created
- ✅ CV upload configuration

**Response Example**:
```json
{
  "verified": true,
  "summary": {
    "total": 7,
    "passed": 6,
    "failed": 0,
    "warnings": 1
  },
  "checks": [
    {
      "name": "Environment Variables Present",
      "status": "pass",
      "message": "All required Supabase env vars are present"
    },
    // ... more checks
  ]
}
```

### Option 2: Use Admin Health Check

Visit:
```
https://your-domain.vercel.app/api/admin/health
```

Requires admin authentication. Includes Supabase env var check.

### Option 3: Test CV Upload Flow

1. Log in as a student
2. Navigate to portfolio page
3. Try uploading a CV
4. If env vars are missing, you'll see an error message

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**:
1. Verify variables are set in Vercel
2. Ensure they're set for the correct environment (Production/Preview/Development)
3. Redeploy after adding variables

### Issue: "Invalid URL format" or Connection Errors

**Possible Causes**:
1. Trailing/leading spaces in `NEXT_PUBLIC_SUPABASE_URL`
2. Missing `https://` prefix
3. Wrong project URL

**Solution**:
1. Copy URL directly from Supabase Dashboard
2. Paste into Vercel (ensure no spaces)
3. Verify it starts with `https://`
4. Redeploy

### Issue: "Bucket not found" in CV Upload

**Possible Causes**:
1. `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` not set or incorrect
2. Bucket doesn't exist in Supabase Storage

**Solution**:
1. Create bucket in Supabase: Storage → New Bucket → Name: `resumes`
2. Set `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET=resumes` in Vercel
3. Redeploy

### Issue: Variables work locally but not in Vercel

**Possible Causes**:
1. Variables only set in `.env.local` (not in Vercel)
2. Variables set for wrong environment in Vercel
3. Not redeployed after adding variables

**Solution**:
1. Add variables to Vercel (not just `.env.local`)
2. Ensure all environments are selected
3. Redeploy

## Environment-Specific Configuration

### Production
- Use production Supabase project
- Use production API keys
- Set for **Production** environment in Vercel

### Preview
- Can use same Supabase project as production
- Or use separate preview Supabase project
- Set for **Preview** environment in Vercel

### Development
- Use local Supabase or development project
- Set for **Development** environment in Vercel
- Or use `.env.local` for local development

## Security Notes

1. **Never commit** `.env.local` or `.env` files to git
2. **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to client-side code
3. **Rotate keys** if accidentally exposed
4. **Use different projects** for production and development if possible

## Quick Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel (all environments)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel (all environments)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (all environments)
- [ ] `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` set (optional, defaults to "resumes")
- [ ] No trailing/leading spaces in any values
- [ ] Values match Supabase Dashboard exactly
- [ ] Redeployed after adding/editing variables
- [ ] Verified using `/api/admin/verify-supabase-env` endpoint
- [ ] Tested CV upload flow

## Related Documentation

- [CV Upload Bucket Setup](./CV_UPLOAD_BUCKET_FIX.md)
- [Supabase Setup](./SETUP_ENV.md)
- [API Setup and Integration](./API_SETUP_AND_INTEGRATION.md)
