# Fix "Missing Supabase environment variables" (CV Upload) — Vercel Checklist

## Quick Fix Steps

### 1. Open Vercel Environment Variables

1. Go to **Vercel Dashboard** → Select your **Project**
2. Navigate to **Settings** → **Environment Variables**

### 2. Select Environment

In the **Environments** dropdown, select:
- **Production** (required)
- **Preview** (optional, if you test preview deployments)
- **Development** (optional, for local development)

**Note**: Repeat steps 3-6 for each environment you want to configure.

### 3. Add/Verify Server-Side Variables

These are used by API routes and server-side code:

| Variable Name | Value | Sensitive |
|--------------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) | ❌ No |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase **Service Role** key | ✅ **Yes** |

**Where to find these:**
- **URL**: Supabase Dashboard → Project Settings → API → Project URL
- **Service Role Key**: Supabase Dashboard → Project Settings → API → `service_role` `secret` key

### 4. Add/Verify Client-Side Variables

These are exposed to the browser (must start with `NEXT_PUBLIC_`):

| Variable Name | Value | Sensitive |
|--------------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase URL as above | ❌ No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase **Anon/Public** key | ❌ No |

**Where to find these:**
- **URL**: Same as above
- **Anon Key**: Supabase Dashboard → Project Settings → API → `anon` `public` key

### 5. Optional: CV Upload Bucket Configuration

| Variable Name | Value | Sensitive |
|--------------|-------|-----------|
| `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` | Bucket name (defaults to `resumes` if not set) | ❌ No |

**Note**: Only needed if you're using a bucket name other than `resumes`.

### 6. Double-Check Common Gotchas

Before saving, verify:

- ✅ **No leading/trailing spaces** in values
  - Click at the end of the value and press `End` key - cursor should not move
  - Select all text and check for spaces at start/end

- ✅ **Keys match exactly** (case-sensitive + underscores)
  - `NEXT_PUBLIC_SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL ` with trailing space)
  - `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_SERVICE_ROLE_KEY` with typo)

- ✅ **Values are set for the correct environment(s)**
  - Production: Required for production deployments
  - Preview: Optional, for preview deployments
  - Development: Optional, for local development

- ✅ **Sensitive flag is ON** for `SUPABASE_SERVICE_ROLE_KEY`
  - This prevents the key from being exposed in build logs

### 7. Save Changes

Click **Save** after adding/editing each variable.

### 8. Redeploy (Required!)

**⚠️ Critical**: Environment variable changes only take effect after redeployment.

1. Go to **Deployments** tab
2. Find the latest **Production** deployment
3. Click **⋯** (three dots) → **Redeploy**
4. Wait for deployment to complete

**Alternative**: Push a new commit to trigger automatic deployment.

### 9. Re-Test CV Upload

After redeployment:

1. Navigate to `/student/portfolio` page
2. Try uploading a CV file
3. Check browser console for errors
4. Monitor Network tab for API responses

### 10. Debug if Still Failing

If CV upload still fails:

1. **Check Runtime Logs**:
   - Vercel Dashboard → **Deployments** → Select deployment → **Runtime Logs**
   - Filter by `/api/portfolio/cv`
   - Look for error messages about missing env vars

2. **Verify Environment Variables are Available**:
   - Visit: `https://your-domain.vercel.app/api/admin/verify-supabase-env`
   - This endpoint checks if env vars are present at runtime
   - Requires admin authentication

3. **Check Browser Console**:
   - Open DevTools → Console
   - Look for errors about missing Supabase configuration
   - Should see: "CV upload temporarily unavailable" if env vars are missing

4. **Verify Supabase Storage Bucket**:
   - Supabase Dashboard → Storage → Buckets
   - Ensure `resumes` bucket exists (or matches `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET`)
   - Check bucket policies are configured

## Complete Variable List

For reference, here are all Supabase-related environment variables used in this project:

### Required (Production)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional

```
NEXT_PUBLIC_SUPABASE_RESUME_BUCKET=resumes
```

## Verification

After setting up, verify using:

1. **Admin Health Check**: `/api/admin/health` (requires admin auth)
2. **Verification Endpoint**: `/api/admin/verify-supabase-env` (requires admin auth)
3. **Browser Console**: Check for console logs (if debug mode enabled)
4. **CV Upload Test**: Try uploading a small PDF file

## Troubleshooting

### Error: "Server misconfigured: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"

**Cause**: Server-side environment variables are missing.

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is set in Vercel
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel (with Sensitive = ON)
3. Ensure variables are set for the correct environment (Production/Preview)
4. Redeploy after adding variables

### Error: "CV upload temporarily unavailable. Please try again later."

**Cause**: Client-side environment variables are missing.

**Solution**:
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is set in Vercel
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in Vercel
3. Ensure variables are set for the correct environment
4. Redeploy after adding variables

### Error: "Bucket not found"

**Cause**: Storage bucket doesn't exist or bucket name doesn't match.

**Solution**:
1. Create `resumes` bucket in Supabase Storage
2. Or set `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` to match your bucket name
3. Redeploy after changes

## Related Documentation

- [Vercel Supabase Env Setup](./VERCEL_SUPABASE_ENV_SETUP.md) - Detailed setup guide
- [CV Upload E2E Testing](./CV_UPLOAD_E2E_TESTING.md) - Testing guide
- [Supabase Env Verification Report](./SUPABASE_ENV_VERIFICATION_REPORT.md) - Technical verification
