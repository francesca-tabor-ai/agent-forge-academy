# Running Subscription Tier Migrations

This guide provides instructions for running the subscription tier management migrations.

## Prerequisites

- Access to your Supabase database
- `psql` installed (or use Supabase SQL Editor)
- Database connection credentials

## Migration Files

1. `20250123000001_ensure_essential_access_courses.sql` - Ensures Essential Access courses are mapped
2. `20250123000003_enforce_subscription_based_enrollment.sql` - Enrollment enforcement
3. `20250123000004_manage_tier_course_entitlements.sql` - Entitlement management functions

## Method 1: Using psql Command Line (Recommended)

### Step 1: Ensure Essential Access Courses are Mapped

```bash
psql -h aws-1-eu-west-1.pooler.supabase.com -p 5432 -d postgres -U postgres.rptqldhfoxonvkvzdrsf \
  -f supabase/migrations/20250123000001_ensure_essential_access_courses.sql
```

**What this does:**
- Ensures Essential Access tier has access to 5 specific courses:
  - prompt-engineering
  - ai-content-pipelines
  - reddit-ai-visibility
  - seo-to-aeo
  - ai-governance-eu-ai-act
- Idempotent - safe to run multiple times

### Step 2: Enforce Subscription-Based Enrollment

```bash
psql -h aws-1-eu-west-1.pooler.supabase.com -p 5432 -d postgres -U postgres.rptqldhfoxonvkvzdrsf \
  -f supabase/migrations/20250123000003_enforce_subscription_based_enrollment.sql
```

**What this does:**
- Creates RLS policy to enforce subscription access on enrollment
- Creates `enroll_in_course()` function for convenient enrollment
- Ensures users can only enroll in courses they have subscription access to

### Step 3: Add Entitlement Management Functions

```bash
psql -h aws-1-eu-west-1.pooler.supabase.com -p 5432 -d postgres -U postgres.rptqldhfoxonvkvzdrsf \
  -f supabase/migrations/20250123000004_manage_tier_course_entitlements.sql
```

**What this does:**
- Adds recommended indexes for performance
- Creates `set_tier_course_entitlements()` function for admin management
- Ensures proper constraints are in place

## Method 2: Run All Migrations at Once

You can run all three migrations in sequence:

```bash
# Set your connection details
HOST="aws-1-eu-west-1.pooler.supabase.com"
PORT="5432"
DB="postgres"
USER="postgres.rptqldhfoxonvkvzdrsf"

# Run migrations in order
psql -h $HOST -p $PORT -d $DB -U $USER \
  -f supabase/migrations/20250123000001_ensure_essential_access_courses.sql

psql -h $HOST -p $PORT -d $DB -U $USER \
  -f supabase/migrations/20250123000003_enforce_subscription_based_enrollment.sql

psql -h $HOST -p $PORT -d $DB -U $USER \
  -f supabase/migrations/20250123000004_manage_tier_course_entitlements.sql
```

## Method 3: Using psql Interactive Session

If you're already in a psql session:

```sql
-- Run migration 1
\i /Users/francescatabor/Documents/1.Technology/Github/agent-forge-academy/supabase/migrations/20250123000001_ensure_essential_access_courses.sql

-- Run migration 2
\i /Users/francescatabor/Documents/1.Technology/Github/agent-forge-academy/supabase/migrations/20250123000003_enforce_subscription_based_enrollment.sql

-- Run migration 3
\i /Users/francescatabor/Documents/1.Technology/Github/agent-forge-academy/supabase/migrations/20250123000004_manage_tier_course_entitlements.sql
```

Or use relative paths if you're in the project directory:

```sql
\i supabase/migrations/20250123000001_ensure_essential_access_courses.sql
\i supabase/migrations/20250123000003_enforce_subscription_based_enrollment.sql
\i supabase/migrations/20250123000004_manage_tier_course_entitlements.sql
```

## Method 4: Using Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file
4. Run them in order (1, 3, 4)

## Verification Queries

After running the migrations, verify everything is set up correctly:

### 1. Check Essential Access Course Mappings

```sql
SELECT 
    stc.tier,
    c.slug,
    c.title
FROM subscription_tier_courses stc
JOIN courses c ON c.id = stc.course_id
WHERE stc.tier = 'essential'::subscription_tier
ORDER BY c.slug;
```

**Expected:** Should show 5 courses for Essential Access

### 2. Check Enrollment Function Exists

```sql
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'enroll_in_course';
```

**Expected:** Should return 1 row with function name

### 3. Check Entitlement Management Function Exists

```sql
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'set_tier_course_entitlements';
```

**Expected:** Should return 1 row with function name

### 4. Check RLS Policy on course_enrollments

```sql
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies
WHERE tablename = 'course_enrollments'
AND policyname LIKE '%subscription%';
```

**Expected:** Should show policy "Students can enroll only in courses with subscription access"

### 5. Check Indexes

```sql
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'subscription_tier_courses'
AND schemaname = 'public';
```

**Expected:** Should show multiple indexes including composite index

## Troubleshooting

### Error: "relation does not exist"
- Make sure you've run migrations in the correct order
- Check that prerequisite tables exist (subscriptions, courses, etc.)

### Error: "permission denied"
- Ensure you're using a user with sufficient privileges
- For Supabase, use the service role key or database owner

### Error: "duplicate key value"
- Migrations are idempotent - this is usually safe to ignore
- The migration will update existing records if needed

## Migration Order

Run migrations in this order:
1. ✅ `20250123000001_ensure_essential_access_courses.sql` (already run if view works)
2. ✅ `20250123000002_create_user_course_access_view.sql` (already run - view exists)
3. ⏳ `20250123000003_enforce_subscription_based_enrollment.sql` (run next)
4. ⏳ `20250123000004_manage_tier_course_entitlements.sql` (run last)

## Quick Run Script

Create a script to run all migrations:

```bash
#!/bin/bash
# Run all subscription tier migrations

HOST="aws-1-eu-west-1.pooler.supabase.com"
PORT="5432"
DB="postgres"
USER="postgres.rptqldhfoxonvkvzdrsf"

echo "Running migration 1: Ensure Essential Access courses..."
psql -h $HOST -p $PORT -d $DB -U $USER \
  -f supabase/migrations/20250123000001_ensure_essential_access_courses.sql

echo "Running migration 3: Enforce subscription-based enrollment..."
psql -h $HOST -p $PORT -d $DB -U $USER \
  -f supabase/migrations/20250123000003_enforce_subscription_based_enrollment.sql

echo "Running migration 4: Add entitlement management functions..."
psql -h $HOST -p $PORT -d $DB -U $USER \
  -f supabase/migrations/20250123000004_manage_tier_course_entitlements.sql

echo "✅ All migrations completed!"
```

Save as `scripts/run-subscription-migrations.sh`, make executable (`chmod +x`), and run it.
