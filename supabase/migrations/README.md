# Migration Organization

This directory contains Supabase database migrations organized into two folders:

- **`migrated/`** - Migrations that have been applied to the database
- **`to do/`** - Migrations that still need to be applied

## Current Status

All migration files have been moved to the `to do/` folder initially. To organize them properly:

## How to Organize Migrations

### Step 1: Get List of Applied Migrations

Run this SQL query in your Supabase Dashboard SQL Editor:

```sql
SELECT version
FROM supabase_migrations.schema_migrations 
ORDER BY version;
```

### Step 2: Save the Results

**Option A: Save to a text file**
1. Copy the version column results (one version per line)
2. Save to a file, e.g., `applied-migrations.txt`

**Option B: Use comma-separated list**
1. Copy all versions and join with commas
2. Use directly with the script

### Step 3: Run the Organization Script

```bash
# Using a text file
tsx scripts/organize-migrations.ts applied-migrations.txt

# Or using comma-separated versions
tsx scripts/organize-migrations.ts --versions "20250107000001,20250107000002,20250107000003"
```

The script will:
- Move applied migrations to `migrated/`
- Keep unmigrated files in `to do/`
- Show a summary of what was organized

## Manual Organization

If you prefer to organize manually:

1. Query your database for applied migrations (see Step 1 above)
2. For each migration file in `to do/`:
   - If the version is in your applied list → move to `migrated/`
   - If not → leave in `to do/`

## Migration Files

Migration files follow the naming pattern: `YYYYMMDDHHMMSS_description.sql`

The version (first 14 digits) is used to match against the `supabase_migrations.schema_migrations` table.

## Helper SQL Query

See `supabase/queries/get-applied-migrations.sql` for a ready-to-use query.
