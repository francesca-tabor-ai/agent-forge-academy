# Schema Cache Refresh Guide

## Overview

When you add, rename, or modify columns in your database, Supabase/PostgREST maintains a schema cache to optimize API performance. If the schema cache becomes stale, you may encounter errors like:

- `Could not find the 'city' column of 'student_profiles' in the schema cache`
- `column "column_name" does not exist` (even though it exists in the database)

**This guide explains how to refresh the schema cache in all environments.**

---

## When to Refresh Schema Cache

You **must** refresh the schema cache after:

1. ✅ Adding new columns to existing tables
2. ✅ Renaming columns
3. ✅ Changing column types (e.g., VARCHAR to TEXT)
4. ✅ Dropping columns
5. ✅ Adding/removing indexes that affect API queries
6. ✅ Any migration that modifies table structure

---

## How to Refresh Schema Cache

### Option 1: Supabase Dashboard (Recommended for Production/Staging)

**Steps:**

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Scroll down to find **"Schema Cache"** section
4. Click **"Refresh schema cache"** or **"Reload schema"** button
5. Wait for confirmation (usually takes 10-30 seconds)

**Visual Path:**
```
Supabase Dashboard
  → Settings (left sidebar)
    → API
      → Schema Cache section
        → [Refresh schema cache] button
```

---

### Option 2: Supabase CLI (Local Development)

If you're running Supabase locally:

```bash
# Restart Supabase local instance (refreshes schema cache)
supabase stop
supabase start

# Or if using Docker Compose directly
docker-compose restart postgrest
```

**Note:** Restarting the entire Supabase instance will refresh all caches, including schema cache.

---

### Option 3: API Endpoint (Programmatic Refresh)

Supabase provides a management API endpoint to refresh the schema cache. This requires your **service role key** (keep it secret!).

**⚠️ Security Warning:** Never expose your service role key in client-side code or public repositories.

**Using cURL:**
```bash
curl -X POST \
  'https://<your-project-ref>.supabase.co/rest/v1/rpc/refresh_schema_cache' \
  -H 'apikey: <your-service-role-key>' \
  -H 'Authorization: Bearer <your-service-role-key>'
```

**Using Node.js/TypeScript:**
```typescript
const response = await fetch(
  `https://${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/refresh_schema_cache`,
  {
    method: 'POST',
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  }
);

if (!response.ok) {
  throw new Error(`Failed to refresh schema cache: ${response.statusText}`);
}
```

**Note:** Not all Supabase projects expose this RPC function. If it doesn't exist, use Option 1 or 2.

---

### Option 4: Manual PostgREST Reload (Advanced)

If you have direct database access, you can trigger a schema reload:

```sql
-- This requires superuser privileges
NOTIFY pgrst, 'reload schema';
```

**⚠️ Warning:** This requires superuser database access and is not recommended for production.

---

## Environment-Specific Instructions

### Local Development

**After running migrations locally:**

```bash
# Option A: Restart Supabase
supabase stop && supabase start

# Option B: Use the refresh script (if available)
./scripts/refresh-schema-cache.sh local
```

**Verification:**
```bash
# Test that the new column is accessible
curl -X GET \
  'http://localhost:54321/rest/v1/student_profiles?select=city&limit=1' \
  -H 'apikey: <your-anon-key>'
```

---

### Staging Environment

1. **Run migrations:**
   ```bash
   supabase db push --db-url <staging-db-url>
   ```

2. **Refresh schema cache:**
   - Go to Supabase Dashboard → Settings → API → Refresh schema cache
   - Or use the API endpoint (Option 3) with staging credentials

3. **Verify:**
   - Test API endpoint that uses the new column
   - Check application logs for schema errors

---

### Production Environment

**⚠️ Important:** Always refresh schema cache in production after migrations.

**Recommended Process:**

1. **Run migrations during low-traffic window:**
   ```bash
   supabase db push --db-url <production-db-url>
   ```

2. **Immediately refresh schema cache:**
   - Supabase Dashboard → Settings → API → Refresh schema cache
   - **Do not skip this step!**

3. **Monitor for errors:**
   - Check application logs
   - Monitor error rates
   - Verify API endpoints work correctly

4. **Rollback plan:**
   - If errors persist, check migration status
   - Verify column exists: `SELECT column_name FROM information_schema.columns WHERE table_name = 'student_profiles' AND column_name = 'city';`
   - Re-run schema cache refresh if needed

---

## Verification Steps

After refreshing the schema cache, verify it worked:

### 1. Check Column Exists in Database

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_profiles'
  AND column_name = 'city';
```

Expected result: Should show `city` column with `text` type.

### 2. Test API Access

```bash
# Test GET request with new column
curl -X GET \
  'https://<your-project>.supabase.co/rest/v1/student_profiles?select=id,city&limit=1' \
  -H 'apikey: <your-anon-key>'
```

Expected: Should return data without errors.

### 3. Test Application

- Navigate to pages that use the new column
- Check browser console for errors
- Verify functionality works as expected

---

## Troubleshooting

### Error Persists After Refresh

**Possible causes:**

1. **Migration didn't run:**
   ```sql
   -- Check migration status
   SELECT * FROM supabase_migrations.schema_migrations 
   ORDER BY version DESC LIMIT 5;
   ```

2. **Column name mismatch:**
   ```sql
   -- Verify exact column name
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'student_profiles';
   ```

3. **Multiple schema caches:**
   - Clear browser cache
   - Restart application server
   - Check if using CDN (may need CDN cache purge)

### Schema Cache Refresh Fails

1. **Check Supabase status:** https://status.supabase.com
2. **Verify permissions:** Ensure you have admin access to the project
3. **Try alternative method:** Use CLI restart or API endpoint
4. **Contact support:** If issue persists, contact Supabase support

---

## Best Practices

1. **Always refresh after migrations:** Make it part of your deployment checklist
2. **Test in staging first:** Verify schema refresh works in staging before production
3. **Monitor after refresh:** Watch error logs for 5-10 minutes after refresh
4. **Document in migrations:** Include refresh instructions in migration comments
5. **Automate when possible:** Use CI/CD to trigger schema refresh after migrations

---

## Related Documentation

- [Migration Guide](../migrations/VERIFY_MIGRATIONS.md)
- [Database Setup](../setup-config/DATABASE_SETUP.md)
- [Supabase API Documentation](https://supabase.com/docs/guides/api)

---

## Quick Reference

| Environment | Method | Command/Path |
|------------|--------|--------------|
| Local | Restart | `supabase stop && supabase start` |
| Staging | Dashboard | Settings → API → Refresh schema cache |
| Production | Dashboard | Settings → API → Refresh schema cache |
| All | API (if available) | `POST /rest/v1/rpc/refresh_schema_cache` |

---

**Last Updated:** 2026-01-18  
**Maintained By:** Development Team
