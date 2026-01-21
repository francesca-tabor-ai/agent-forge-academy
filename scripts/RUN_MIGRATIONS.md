# Running All Migrations

You have 106 migration files in `supabase/migrations/to do/` that need to be run. Here are several methods:

## Method 1: Using psql (Recommended for bulk runs)

### Quick Setup

```bash
# Set your database connection details
export DB_HOST='aws-1-eu-west-1.pooler.supabase.com'  # Your Supabase host
export DB_PORT='5432'
export DB_NAME='postgres'
export DB_USER='postgres.YOUR_PROJECT_REF'  # Replace with your project ref
export DB_PASSWORD='your-database-password'

# Run all migrations
./scripts/run-all-migrations-psql.sh
```

### One-liner (if you have connection details)

```bash
cd /Users/francescatabor/Documents/1.Technology/Github/agent-forge-academy && \
for file in "supabase/migrations/to do"/*.sql; do \
  echo "Running: $(basename $file)"; \
  PGPASSWORD='your-password' psql \
    -h aws-1-eu-west-1.pooler.supabase.com \
    -p 5432 \
    -d postgres \
    -U postgres.YOUR_PROJECT_REF \
    -f "$file"; \
done
```

### Step-by-step with error handling

```bash
# Set connection variables
export DB_HOST='aws-1-eu-west-1.pooler.supabase.com'
export DB_PORT='5432'
export DB_NAME='postgres'
export DB_USER='postgres.YOUR_PROJECT_REF'
export DB_PASSWORD='your-password'

# Run migrations one by one
cd supabase/migrations/"to do"
for file in *.sql; do
  echo "Running: $file"
  PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -d "$DB_NAME" \
    -U "$DB_USER" \
    -f "$file" \
    -v ON_ERROR_STOP=1
done
```

## Method 2: Using Supabase CLI

```bash
# First, temporarily move migrations back to main directory
mv "supabase/migrations/to do"/*.sql supabase/migrations/

# Push all migrations
supabase db push

# Move back to "to do" folder (optional)
mv supabase/migrations/*.sql "supabase/migrations/to do/"
```

## Method 3: Using Supabase SQL Editor (Manual)

1. Go to your Supabase Dashboard → SQL Editor
2. Run each migration file in order (they're sorted by timestamp)

### Generate list of files to run:

```bash
ls -1 "supabase/migrations/to do"/*.sql | sort
```

### Or combine all into one file:

```bash
cat "supabase/migrations/to do"/*.sql > all-migrations-combined.sql
```

Then copy the contents of `all-migrations-combined.sql` into the SQL Editor.

## Method 4: Using the helper script

```bash
# Interactive script with multiple options
./scripts/run-all-migrations.sh psql
./scripts/run-all-migrations.sh supabase-cli
./scripts/run-all-migrations.sh sql-editor
```

## Finding Your Database Connection Details

1. Go to Supabase Dashboard → Settings → Database
2. Find "Connection string" or "Connection pooling"
3. Your connection details will be:
   - **Host**: `aws-1-eu-west-1.pooler.supabase.com` (or your region)
   - **Port**: `5432` or `6543` (for connection pooling)
   - **Database**: `postgres`
   - **User**: `postgres.YOUR_PROJECT_REF`
   - **Password**: Your database password

## Important Notes

- Migrations are run in alphabetical order (by filename timestamp)
- If a migration fails, the script will stop (with `ON_ERROR_STOP=1`)
- Some migrations may be idempotent (safe to run multiple times)
- After running, move completed migrations to `migrated/` folder

## Verify Migrations Were Applied

```sql
-- Run in Supabase SQL Editor
SELECT version, name, inserted_at
FROM supabase_migrations.schema_migrations 
ORDER BY version DESC;
```

Then use the organize script to move applied migrations:

```bash
# Save the version list to a file, then:
tsx scripts/organize-migrations.ts applied-versions.txt
```
