# How to Verify All Migrations Are Applied to Supabase

This guide shows you multiple ways to verify that all your local migrations have been pushed to your Supabase database.

## Method 1: Using Supabase CLI (Recommended)

### Quick Check

```bash
# Check if project is linked
supabase status

# List all remote migrations
supabase db remote list

# Or use the migration list command
supabase migration list
```

### Compare Local vs Remote

```bash
# See what differences exist between local and remote
supabase db diff

# This will show you:
# - Migrations that exist locally but not remotely
# - Schema differences
```

### Push Missing Migrations

If you find missing migrations:

```bash
# Push all pending migrations
supabase db push

# This will:
# - Show you which migrations will be applied
# - Ask for confirmation
# - Apply them in order
```

## Method 2: Using SQL Query (Most Reliable)

Run this SQL in your Supabase Dashboard SQL Editor:

```sql
-- List all applied migrations
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC;
```

Then compare the list with your local migration files:

```bash
# List all local migrations
ls -1 supabase/migrations/*.sql | xargs -n1 basename
```

### Quick Verification Script

Use the provided SQL script:

```bash
# Copy the SQL from scripts/verify-migrations.sql
# Paste into Supabase SQL Editor and run
```

Or use the shell script:

```bash
chmod +x scripts/verify-migrations.sh
./scripts/verify-migrations.sh
```

## Method 3: Check Specific Migration

To verify a specific migration (e.g., the latest one):

```sql
-- Check if a specific migration is applied
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM supabase_migrations.schema_migrations 
      WHERE version = '20250122000001'
    ) THEN '✅ Applied'
    ELSE '❌ Not Applied'
  END as status;
```

Replace `20250122000001` with your migration version.

## Method 4: Verify Schema Objects

Sometimes a migration is marked as applied but the schema changes weren't fully created. Verify by checking for specific objects:

```sql
-- Check if a table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'project_images'
) as table_exists;

-- Check if a function exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.routines
  WHERE routine_schema = 'public'
  AND routine_name = 'your_function_name'
) as function_exists;
```

## Method 5: Automated Comparison Script

Use the provided shell script to automatically compare:

```bash
# Make script executable
chmod +x scripts/verify-migrations.sh

# Run it
./scripts/verify-migrations.sh
```

This script will:
- ✅ Check if Supabase CLI is installed
- ✅ Verify project is linked
- ✅ List all local migrations
- ✅ Fetch remote migrations
- ✅ Compare and show which are missing
- ✅ Provide instructions to apply missing ones

## Common Issues

### "Project not linked" Error

```bash
# Link your project first
supabase link --project-ref YOUR_PROJECT_REF_ID
```

### "Cannot fetch remote migrations"

If the CLI method doesn't work, use the SQL method instead. The SQL query directly queries the database and is more reliable.

### Migration Marked as Applied But Schema Missing

This can happen if a migration partially failed. Check the migration logs in Supabase Dashboard:
1. Go to **Database** → **Migrations**
2. Check for any failed migrations
3. If needed, run the migration SQL directly in SQL Editor

## Quick Reference

| Command | Purpose |
|---------|---------|
| `supabase status` | Check if project is linked |
| `supabase db remote list` | List remote migrations |
| `supabase db diff` | Compare local vs remote |
| `supabase db push` | Push pending migrations |
| `supabase migration list` | List migrations (alternative) |

## Your Current Migrations

You currently have **57 migration files** in `supabase/migrations/`. The latest is:
- `20250122000001_add_project_images_schema.sql`

To verify this specific migration:

```sql
SELECT 
  version,
  name,
  inserted_at
FROM supabase_migrations.schema_migrations 
WHERE version = '20250122000001';
```

And verify the table was created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'project_images';
```
