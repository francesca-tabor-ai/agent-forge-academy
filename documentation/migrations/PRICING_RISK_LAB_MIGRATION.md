# Pricing & Risk Lab - Supabase Migration Guide

This guide shows you how to apply the Pricing & Risk Lab persistence migration to your Supabase database.

## Migration File

- `supabase/migrations/20260131000003_create_pricing_risk_lab_tables.sql`

This migration creates:
- `pricing_scenarios` table
- `pricing_experiments` table
- `pricing_snapshots` table
- `pricing_audit_events` table (append-only)
- RLS policies for all tables
- Indexes for performance

## Method 1: Using Supabase CLI (Recommended)

### Step 1: Check if project is linked

```bash
cd /Users/francescatabor/Documents/1.Technology/Github/agent-forge-academy
supabase status
```

### Step 2: If not linked, link your project

```bash
# Get your project reference ID from Supabase Dashboard
# Settings → General → Reference ID
supabase link --project-ref YOUR_PROJECT_REF_ID
```

### Step 3: Push the migration

```bash
# Push all pending migrations (including the new pricing-risk-lab migration)
supabase db push
```

This will:
- Show you which migrations will be applied
- Ask for confirmation
- Apply them in order

### Step 4: Verify the migration

```bash
# List all remote migrations
supabase db remote list

# Or check migration status
supabase migration list
```

## Method 2: Using Supabase Dashboard SQL Editor

If you prefer to run the migration manually:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of:
   ```
   supabase/migrations/20260131000003_create_pricing_risk_lab_tables.sql
   ```
4. Click **Run** to execute the migration

## Method 3: Using psql (Direct Database Connection)

If you have direct database access:

```bash
# Set your connection details
HOST="aws-1-eu-west-1.pooler.supabase.com"
PORT="5432"
DB="postgres"
USER="postgres.YOUR_PROJECT_REF"

# Run the migration
psql -h $HOST -p $PORT -d $DB -U $USER \
  -f supabase/migrations/20260131000003_create_pricing_risk_lab_tables.sql
```

## Verification Queries

After running the migration, verify the tables were created:

### 1. Check if tables exist

```sql
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'pricing_scenarios',
    'pricing_experiments',
    'pricing_snapshots',
    'pricing_audit_events'
  )
ORDER BY table_name;
```

### 2. Check RLS policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN (
  'pricing_scenarios',
  'pricing_experiments',
  'pricing_snapshots',
  'pricing_audit_events'
)
ORDER BY tablename, policyname;
```

### 3. Check indexes

```sql
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN (
  'pricing_scenarios',
  'pricing_experiments',
  'pricing_snapshots',
  'pricing_audit_events'
)
ORDER BY tablename, indexname;
```

### 4. Verify migration was recorded

```sql
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations
WHERE version = '20260131000003'
ORDER BY inserted_at DESC;
```

## Expected Results

After successful migration, you should see:

✅ **4 tables created:**
- `pricing_scenarios`
- `pricing_experiments`
- `pricing_snapshots`
- `pricing_audit_events`

✅ **RLS enabled on all tables**

✅ **Multiple RLS policies per table:**
- Students can read their own data
- Students can insert their own data
- Students can update their own data (except audit_events)
- Students can delete their own data (except audit_events)
- Admins can read all audit events

✅ **Indexes created for performance**

✅ **Triggers for `updated_at` timestamps**

## Troubleshooting

### If migration fails with "relation already exists"

The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. However, if you see this error, it might mean:
- The migration was partially applied
- Check which tables exist and manually fix if needed

### If RLS policies fail

The migration uses `DROP POLICY IF EXISTS` before creating policies, so it's safe to re-run. If you see policy errors:
- Check if policies exist: `SELECT * FROM pg_policies WHERE tablename = 'pricing_scenarios';`
- Manually drop and recreate if needed

### If you need to rollback

To remove the tables (⚠️ **WARNING: This will delete all data**):

```sql
DROP TABLE IF EXISTS pricing_audit_events CASCADE;
DROP TABLE IF EXISTS pricing_snapshots CASCADE;
DROP TABLE IF EXISTS pricing_experiments CASCADE;
DROP TABLE IF EXISTS pricing_scenarios CASCADE;
```

## Next Steps

After the migration is applied:

1. ✅ Tables are created and RLS is enabled
2. ✅ API routes are ready at `/api/tools/pricing-risk-lab/*`
3. ✅ `usePricingRiskLab` hook has persistence functions
4. 🎉 You can now save/load scenarios, experiments, and snapshots!

The persistence is **optional** and has **graceful fallback** - if saving fails, the UI will continue to work with in-memory state only.
