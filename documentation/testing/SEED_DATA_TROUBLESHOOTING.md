# Seed Data Troubleshooting Guide

## Why No Records Are Showing Up

### The Main Issue

**Most seed files have their INSERT statements commented out!** They are designed as **templates/examples** that you need to uncomment and adapt.

### Which Tables Actually Get Seeded

Only **4 seed files** have active INSERT statements:

1. ✅ **`01_seed_core.sql`** → `subscription_plans` table
2. ✅ **`02_seed_content.sql`** → `courses` table  
3. ✅ **`03_seed_events.sql`** → `events` table
4. ✅ **`04_seed_jobs_offers.sql`** → `jobs` and `offers` tables

### Which Tables Are NOT Seeded (Commented Out)

All other seed files (05-26) have their INSERT statements wrapped in `/* */` comments. These are **examples only**:

- ❌ `profiles` - Requires `auth.users` (cannot seed without user accounts)
- ❌ `student_profiles` - Requires `profiles`
- ❌ `portfolio_projects` - Requires `student_profiles`
- ❌ `payments` - Requires `auth.users`
- ❌ `questions` - Requires `student_profiles`
- ❌ `course_enrollments` - Requires `courses` + `student_profiles`
- ❌ And many more...

## How to Verify What Data Exists

### Option 1: Run the Verification Script

```bash
# Make sure you have SUPABASE_DB_URL in your .env
psql "$SUPABASE_DB_URL" -f supabase/seed/99_verify.sql
```

This will show you:
- Counts for all seeded tables
- Counts for user-dependent tables (will be 0 unless you have auth.users)
- Sample data from each seeded table

### Option 2: Check in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Table Editor**
2. Check these tables (should have data):
   - `subscription_plans` (should have 4 records)
   - `courses` (should have 20 records)
   - `events` (should have 15 records)
   - `jobs` (should have 25 records)
   - `offers` (should have 20 records)

3. These tables will be **empty** (this is expected):
   - `profiles` (requires auth.users)
   - `student_profiles` (requires profiles)
   - `portfolio_projects` (requires student_profiles)
   - All other user-dependent tables

## Common Issues and Solutions

### Issue 1: "I see no data in any tables"

**Possible causes:**
1. Seed files failed silently
2. RLS policies are blocking your view
3. You're looking at the wrong database/schema

**Solution:**
```bash
# Re-run the seed files that actually insert data
psql "$SUPABASE_DB_URL" -f supabase/seed/01_seed_core.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/02_seed_content.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/03_seed_events.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/04_seed_jobs_offers.sql

# Then verify
psql "$SUPABASE_DB_URL" -f supabase/seed/99_verify.sql
```

### Issue 2: "I see data in subscription_plans/courses/events/jobs/offers, but nothing else"

**This is expected!** The other tables require:
- `auth.users` (created via Supabase Auth signup)
- `profiles` (created automatically when users sign up, or manually seeded)
- `student_profiles` (created from profiles with role='student')

**To seed user-dependent data:**
1. First, create some test users via Supabase Auth (signup/login)
2. Then uncomment and run the relevant seed files (e.g., `22_seed_profiles.sql`)

### Issue 3: "RLS is blocking me from seeing data"

**If you're using the Supabase Dashboard:**
- RLS shouldn't block you in the Table Editor (you're using the service role)
- If you see data in the verification script but not in the dashboard, check:
  - Are you looking at the correct project?
  - Are you looking at the `public` schema?

**If you're using the API:**
- Use the **service role key** (bypasses RLS) for admin operations
- Or use the **direct database connection** (bypasses RLS automatically)

### Issue 4: "Seed files ran but I see errors"

**Check for common errors:**
1. **Foreign key violations** - Make sure parent tables are seeded first
2. **Missing Stripe IDs** - `01_seed_core.sql` has placeholder `price_REPLACE_ME` values
3. **UUID format errors** - Make sure UUIDs are valid format
4. **Transaction rollbacks** - Check if `BEGIN;` / `COMMIT;` blocks are correct

## How to Seed User-Dependent Data

### Step 1: Create Test Users

You need `auth.users` first. Options:

**Option A: Use Supabase Auth (Recommended)**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → Create test users manually
3. Or use the signup flow in your app

**Option B: Create users via SQL (Advanced)**
```sql
-- This requires superuser access
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at)
VALUES 
  (gen_random_uuid(), 'student1@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW()),
  (gen_random_uuid(), 'student2@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW());
```

### Step 2: Seed Profiles

Once you have `auth.users`, uncomment and run:

```sql
-- In 22_seed_profiles.sql, uncomment Example 4 (the simplest one):
INSERT INTO profiles (user_id, role, created_at)
SELECT 
  au.id as user_id,
  CASE 
    WHEN RANDOM() < 0.7 THEN 'student'::user_role
    WHEN RANDOM() < 0.9 THEN 'tutor'::user_role
    ELSE 'recruiter'::user_role
  END as role,
  au.created_at as created_at
FROM auth.users au
LEFT JOIN profiles p ON p.user_id = au.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role;
```

### Step 3: Seed Student Profiles

After profiles exist, `student_profiles` are typically created automatically via triggers. If not, you can create them manually:

```sql
INSERT INTO student_profiles (profile_id)
SELECT p.id
FROM profiles p
WHERE p.role = 'student'
  AND NOT EXISTS (
    SELECT 1 FROM student_profiles sp WHERE sp.profile_id = p.id
  );
```

### Step 4: Seed Other User-Dependent Data

Once you have `student_profiles`, you can uncomment and run:
- `21_seed_portfolio_projects.sql` - Portfolio projects
- `24_seed_questions.sql` - Questions
- `12_seed_course_enrollments.sql` - Course enrollments
- And other user-dependent seed files

## Quick Reference: What Gets Seeded

| Table | Seed File | Has Active INSERTs? | Requires |
|-------|-----------|---------------------|----------|
| `subscription_plans` | `01_seed_core.sql` | ✅ Yes | Nothing |
| `courses` | `02_seed_content.sql` | ✅ Yes | Nothing |
| `events` | `03_seed_events.sql` | ✅ Yes | Nothing |
| `jobs` | `04_seed_jobs_offers.sql` | ✅ Yes | Nothing |
| `offers` | `04_seed_jobs_offers.sql` | ✅ Yes | Nothing |
| `profiles` | `22_seed_profiles.sql` | ❌ No (commented) | `auth.users` |
| `student_profiles` | Auto-created | N/A | `profiles` with role='student' |
| `portfolio_projects` | `21_seed_portfolio_projects.sql` | ❌ No (commented) | `student_profiles` |
| `questions` | `24_seed_questions.sql` | ❌ No (commented) | `student_profiles` |
| `payments` | `20_seed_payments.sql` | ❌ No (commented) | `auth.users` |
| All others | Various | ❌ No (commented) | Various dependencies |

## Next Steps

1. **Run the verification script** to see what data exists:
   ```bash
   psql "$SUPABASE_DB_URL" -f supabase/seed/99_verify.sql
   ```

2. **If core tables are empty**, re-run the seed files:
   ```bash
   ./scripts/run-seeds.sh
   ```

3. **If you need user-dependent data**, create test users first, then uncomment the relevant seed files.

4. **Check the README** in `supabase/seed/README.md` for detailed information about each seed file.
