# Row Level Security (RLS) and Seeding

## The Problem

Supabase tables with Row Level Security (RLS) enabled will block inserts unless:
1. The user has the appropriate RLS policy permissions, OR
2. You bypass RLS entirely

## The Solution: Direct Database Connection

**Recommended**: Use the direct database connection string with `psql`. This automatically bypasses RLS.

### Why This Works

When you connect via `psql` using the direct database connection string:
- You're connecting **directly to PostgreSQL** (not through PostgREST)
- RLS policies only apply to **PostgREST API requests**
- Direct PostgreSQL connections bypass RLS automatically
- No special configuration needed

### Connection String Format

Get your connection string from:
- **Supabase Dashboard** → **Project Settings** → **Database**
- Use **"Direct connection"** or **"Transaction pooler"** connection string

Example formats:
```
# Direct connection
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

# Transaction pooler (recommended for connection pooling)
postgresql://postgres.[PROJECT]:[PASSWORD]@[HOST]:5432/postgres
```

### Usage

1. Add to `.env`:
   ```env
   SUPABASE_DB_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@[HOST]:5432/postgres"
   ```

2. Run seeds:
   ```bash
   ./scripts/run-seeds.sh
   ```

The script uses `psql` with this connection string, which automatically bypasses RLS.

## Alternative Approaches (Not Recommended)

### Option 1: Temporarily Disable RLS (Dev Only)

```sql
-- ⚠️ ONLY FOR DEVELOPMENT - NEVER IN PRODUCTION
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
-- Run seeds...
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
```

**Problems:**
- Must disable/enable for each table
- Easy to forget to re-enable
- Not recommended even for dev

### Option 2: Use Service Role Key (Not Recommended for Seeding)

You could use the Supabase API with the service role key, but:
- Slower (goes through API layer)
- More complex (requires API client setup)
- Less reliable for bulk inserts

**Direct database connection is preferred.**

## Verification

After seeding, verify RLS is still enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

All tables should show `rowsecurity = true` (RLS enabled).

## Summary

✅ **Use**: Direct database connection string with `psql`  
❌ **Don't use**: Temporarily disabling RLS  
❌ **Don't use**: Service role API for seeding (slower, more complex)

The direct database connection approach is:
- Simple (just use the connection string)
- Fast (direct PostgreSQL connection)
- Safe (RLS remains enabled, just bypassed for seeding)
- Recommended by Supabase
