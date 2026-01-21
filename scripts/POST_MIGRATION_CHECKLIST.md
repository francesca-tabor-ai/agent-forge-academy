# Post-Migration Checklist

After completing all 106 migrations, use this checklist to verify everything is working correctly.

## ✅ Step 1: Organize Migrations

Move applied migrations to the `migrated/` folder:

```bash
# Automatic (if DB vars are still set)
./scripts/organize-after-migration.sh

# Or manual:
./scripts/get-applied-migrations.sh > applied-migrations.txt
tsx scripts/organize-migrations.ts applied-migrations.txt
```

## ✅ Step 2: Smoke Test Schema

### Quick automated test:
```bash
./scripts/smoke-test-schema.sh
```

### Manual verification in Supabase SQL Editor:
Run `scripts/verify-migration-completion.sql` for detailed checks.

**Key things to verify:**
- ✅ All 106 migrations are recorded in `schema_migrations`
- ✅ Key tables exist: `profiles`, `student_profiles`, `courses`, `subscriptions`
- ✅ RLS is enabled on sensitive tables
- ✅ Indexes exist on key columns
- ✅ Enum types are created (`user_role`, `subscription_tier`)

## ✅ Step 3: Verify RLS Policies

Test Row Level Security policies:

```sql
-- Test as anonymous user
SET ROLE anon;
SELECT * FROM profiles LIMIT 1;  -- Should be restricted
RESET ROLE;

-- Test as authenticated user (replace with actual user_id)
SET ROLE authenticated;
SELECT * FROM profiles WHERE user_id = 'your-user-id';
RESET ROLE;
```

**Key RLS checks:**
- ✅ Users can only see their own profiles
- ✅ Students can only see their own student_profiles
- ✅ Courses are accessible based on subscription tier
- ✅ Portfolio projects have proper access controls

## ✅ Step 4: App-Level Testing

Start your local/staging environment and test:

### Authentication Flow
- [ ] Sign up creates a profile
- [ ] Login works correctly
- [ ] Role assignment works (student/tutor/recruiter)

### Data Access
- [ ] Users can read their own data
- [ ] Users cannot access other users' data
- [ ] Subscription checks work for course access
- [ ] Portfolio projects display correctly

### Write Operations
- [ ] Users can update their own profiles
- [ ] Students can create portfolio projects
- [ ] Course enrollment works
- [ ] No permission errors in console

## ✅ Step 5: Backup / Snapshot

**Strongly recommended** - Create a backup of this known-good state:

### Using Supabase Dashboard:
1. Go to **Settings** → **Database**
2. Click **Backup** or **Create Point-in-Time Recovery**

### Using pg_dump:
```bash
pg_dump -h your-host -U your-user -d postgres > backup-$(date +%Y%m%d).sql
```

## ✅ Step 6: Production Safety Checks

Before deploying to production:

- [ ] All migrations are idempotent (safe to run multiple times)
- [ ] No hardcoded values that differ between environments
- [ ] RLS policies are tested and working
- [ ] Indexes are optimized for query patterns
- [ ] Foreign key constraints are correct
- [ ] Triggers and functions work as expected

## 🔧 Helper Scripts

- `scripts/smoke-test-schema.sh` - Quick automated schema checks
- `scripts/verify-migration-completion.sql` - Detailed SQL verification queries
- `scripts/get-applied-migrations.sh` - Get list of applied migrations
- `scripts/organize-after-migration.sh` - Organize migrations automatically

## 🆘 Troubleshooting

If you encounter issues:

1. **Check migration status:**
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10;
   ```

2. **Verify specific table:**
   ```sql
   \d table_name  -- In psql
   -- Or
   SELECT * FROM information_schema.columns WHERE table_name = 'table_name';
   ```

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'table_name';
   ```

4. **Review migration logs** in Supabase Dashboard → Logs → Postgres Logs
