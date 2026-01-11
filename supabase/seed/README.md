# Seed Data Workflow

This directory contains seed scripts to populate the database with initial data for development and testing.

## Seed Scripts

Run scripts in this order:

1. **`00_reset.sql`** (Optional) - Resets seed data by truncating tables
2. **`01_seed_core.sql`** - Seeds core data: subscription plans
3. **`02_seed_content.sql`** - Seeds content: courses from course metadata
4. **`03_seed_events.sql`** - Seeds events: demo days, workshops, networking events
5. **`04_seed_jobs_offers.sql`** - Seeds jobs and offers: job listings and tool discounts
6. **`99_verify.sql`** - Verification script to check seed data integrity

## Usage

### Using the run-seeds.sh script (Recommended)

```bash
# Run all seed scripts
./scripts/run-seeds.sh

# Run with reset (clears existing seed data first)
./scripts/run-seeds.sh --reset
```

### Manual execution

```bash
# Load environment variables
export $(grep -v '^#' .env | xargs)

# Run each script in order
psql "$SUPABASE_DB_URL" -f supabase/seed/00_reset.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/01_seed_core.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/02_seed_content.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/03_seed_events.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/04_seed_jobs_offers.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/99_verify.sql
```

## What Gets Seeded

### Core Data (`01_seed_core.sql`)
- **subscription_plans**: Stripe product/price mappings
  - ⚠️ **Note**: Update with your actual Stripe product and price IDs

### Content (`02_seed_content.sql`)
- **courses**: All courses from `lib/course-metadata.ts`
  - 20 courses across 6 categories
  - All courses are published by default

### Events (`03_seed_events.sql`)
- **events**: Sample demo days, workshops, and networking events
  - Note: `event_presentations` and `event_attendance` require actual profile IDs
  - These are populated when students enroll and RSVP

### Jobs & Offers (`04_seed_jobs_offers.sql`)
- **jobs**: 6 sample job listings
  - Mix of entry, mid, senior, and lead positions
  - Includes recommended and stretch roles
- **offers**: 5 sample tool discounts
  - Supabase, OpenAI, Vercel, Pinecone, LangSmith offers

## Schema Discovery

Before creating or updating seed scripts, you can discover the actual database schema to ensure accuracy:

```bash
# Run the schema discovery script
./scripts/discover-schema.sh
```

This will generate `supabase/seed/SCHEMA_DISCOVERY.md` with:
- All tables and columns with their data types
- Foreign key relationships (to understand seeding order)

Alternatively, you can run the queries manually:

```bash
# Discover all columns
psql "$SUPABASE_DB_URL" -c "
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public'
order by table_name, ordinal_position;
"

# Discover foreign keys
psql "$SUPABASE_DB_URL" -c "
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as references_table,
  ccu.column_name as references_column
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
order by tc.table_name;
"
```

## Important Notes

1. **Stripe Integration**: Update `01_seed_core.sql` with your actual Stripe product and price IDs
2. **User Data**: Seed scripts do NOT create user profiles (these come from auth)
3. **Idempotent**: Scripts use `ON CONFLICT` clauses to be safely re-runnable
4. **Reset Warning**: `00_reset.sql` will delete seed data - use with caution!
5. **Schema Accuracy**: Seed scripts are based on migration files. Use schema discovery to verify column names and types match your database.

## Verification

After running seeds, check the output of `99_verify.sql` to ensure:
- Subscription plans are seeded
- Courses are seeded (20 expected)
- Events are seeded (4 expected)
- Jobs are seeded (6 expected)
- Offers are seeded (5 expected)
