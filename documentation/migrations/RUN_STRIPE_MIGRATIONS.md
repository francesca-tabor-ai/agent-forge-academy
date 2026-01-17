# Running Stripe Migrations

This guide shows you how to run the three new Stripe migration files.

## Migration Files

1. `20250120000001_create_stripe_tables.sql` - Creates the Stripe tables
2. `20250120000002_add_stripe_rls_policies.sql` - Adds Row Level Security policies
3. `20250120000003_seed_subscription_plans.sql` - Seeds the subscription plans (requires Price IDs)

## Option 1: Using Supabase CLI (Recommended)

### If you have Supabase CLI linked to your project:

```bash
# Navigate to project root
cd /Users/francescatabor/Documents/1.Technology/Github/agent-forge-academy

# Push all new migrations
supabase db push

# Or push specific migration
supabase migration up
```

### If you need to link your project first:

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Then push migrations
supabase db push
```

## Option 2: Using Supabase Dashboard SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Run each migration file in order:

### Step 1: Create Stripe Tables
Copy and paste the contents of `supabase/migrations/20250120000001_create_stripe_tables.sql` and run it.

### Step 2: Add RLS Policies
Copy and paste the contents of `supabase/migrations/20250120000002_add_stripe_rls_policies.sql` and run it.

### Step 3: Seed Subscription Plans
**IMPORTANT**: Before running this migration, you need to replace `price_REPLACE_ME` with actual Price IDs from Stripe.

1. Get your Price IDs from Stripe Dashboard or run:
   ```bash
   node scripts/get-stripe-price-ids.js
   ```
   (Requires `STRIPE_SECRET_KEY` in your environment)

2. Update `supabase/migrations/20250120000003_seed_subscription_plans.sql` with actual Price IDs

3. Copy and paste the updated SQL into Supabase SQL Editor and run it.

## Option 3: Using psql (Direct Database Connection)

If you have direct database access:

```bash
# Set your database connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations in order
psql $DATABASE_URL -f supabase/migrations/20250120000001_create_stripe_tables.sql
psql $DATABASE_URL -f supabase/migrations/20250120000002_add_stripe_rls_policies.sql
psql $DATABASE_URL -f supabase/migrations/20250120000003_seed_subscription_plans.sql
```

## Verification

After running migrations, verify the tables were created:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('stripe_customers', 'subscription_plans', 'subscriptions', 'payments');

-- Check subscription_plans were seeded
SELECT * FROM subscription_plans;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('stripe_customers', 'subscriptions', 'payments');
```

## Troubleshooting

### Error: "relation already exists"
- Some tables might already exist. The migrations use `IF NOT EXISTS` so this is safe to ignore.

### Error: "duplicate key value violates unique constraint"
- The seed migration uses `ON CONFLICT DO UPDATE`, so you can safely re-run it.

### Missing Price IDs
- You must update `20250120000003_seed_subscription_plans.sql` with actual Stripe Price IDs before running it.
- Get Price IDs from Stripe Dashboard → Products → each product → copy Price ID

## Next Steps

After migrations are complete:

1. ✅ Tables created
2. ✅ RLS policies enabled
3. ✅ Subscription plans seeded (with real Price IDs)
4. ✅ Webhook handler ready at `/api/stripe/webhook`
5. ✅ Checkout endpoint ready at `/api/stripe/create-checkout-session`
6. ✅ Access control utilities ready in `lib/utils/stripe-subscription-access.ts`
