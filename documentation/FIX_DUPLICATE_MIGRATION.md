# Fix Duplicate Migration Error

## Error
```
ERROR: duplicate key value violates unique constraint "schema_migrations_pkey"
Key (version)=(20250115000004) already exists.
```

This means migration `20250115000004` is already recorded in the `schema_migrations` table, but you're trying to run it again.

## Solution Options

### Option 1: Check if Migration Was Actually Applied (Recommended)

First, verify if the migration changes were actually applied to your database:

```sql
-- Check if the columns from migration 20250115000004 exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'student_profiles' 
  AND column_name IN (
    'weekly_jobs_emails_enabled',
    'weekly_email_day',
    'weekly_email_hour',
    'weekly_learning_email_last_sent_at',
    'weekly_jobs_email_last_sent_at'
  );
```

**If all columns exist**: The migration was successfully applied. You can skip it.

**If columns are missing**: The migration was recorded but not fully applied. See Option 2.

### Option 2: Run Migration SQL Directly (If Not Fully Applied)

If the migration was recorded but not fully applied, run the SQL directly in Supabase SQL Editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20250115000004_update_email_preferences_add_jobs.sql`
3. Paste and run it directly
4. The migration is already marked as complete, so this won't cause duplicate errors

### Option 3: Remove from schema_migrations (If Migration Failed Partially)

⚠️ **Only do this if you're sure the migration wasn't fully applied**

```sql
-- Check what's in schema_migrations
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';

-- If you need to remove it (be careful!)
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250115000004';
```

Then re-run the migration normally.

### Option 4: Skip This Migration and Continue

If the migration was successfully applied, you can continue with the next migrations. The error is just Supabase preventing duplicate runs, which is actually a safety feature.

## Recommended Approach

1. **Check if migration was applied** (Option 1)
2. **If applied**: Continue with next migrations - the error is just a safety check
3. **If not applied**: Run SQL directly (Option 2) or remove from schema_migrations (Option 3)

## Verify Migration Status

Check all applied migrations:

```sql
SELECT version, name, inserted_at 
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 20;
```

## Next Steps

After resolving this, continue with your other migrations:
- `20250120000001_create_stripe_tables.sql`
- `20250120000002_add_stripe_rls_policies.sql`
- `20250120000003_seed_subscription_plans.sql`
