# Subscription Schema Verification

This document verifies that the database schema matches the required structure for the subscription system.

## Required Schema

### 1. User Table

**Location:** `auth.users` (Supabase built-in) + `public.profiles` + `public.stripe_customers`

| Field | Type | Required | Location | Status |
|-------|------|----------|----------|--------|
| `id` | UUID | ✅ | `auth.users.id` | ✅ Exists |
| `email` | TEXT | ✅ | `auth.users.email` | ✅ Exists |
| `billingEmail` | TEXT | ❌ Optional | `profiles.billing_email` | ✅ Added in migration |
| `stripeCustomerId` | TEXT | ❌ Optional | `stripe_customers.stripe_customer_id` | ✅ Exists |

**Notes:**
- `auth.users` is the primary user table (Supabase built-in)
- `profiles.billing_email` provides optional billing email override
- `stripe_customers` table maps `user_id` → `stripe_customer_id`

### 2. Subscription Table

**Location:** `public.subscriptions`

| Field | Type | Required | Status |
|-------|------|----------|--------|
| `id` | UUID/TEXT | ✅ | ✅ Exists (UUID for old, TEXT for new Stripe-based) |
| `userId` | UUID (FK) | ✅ | ✅ Exists as `user_id` |
| `planId` | TEXT (FK) | ✅ | ✅ Added in migration as `plan_id` |
| `status` | TEXT/ENUM | ✅ | ✅ Exists (enum for old, text for new) |
| `currentPeriodStart` | TIMESTAMPTZ | ✅ | ✅ Exists as `current_period_start` |
| `currentPeriodEnd` | TIMESTAMPTZ | ✅ | ✅ Exists as `current_period_end` |
| `cancelAtPeriodEnd` | BOOLEAN | ✅ | ✅ Exists as `cancel_at_period_end` |
| `stripeSubscriptionId` | TEXT | ❌ Optional | ✅ Exists as `stripe_subscription_id` or `id` |
| `createdAt` | TIMESTAMPTZ | ✅ | ✅ Exists as `created_at` |
| `updatedAt` | TIMESTAMPTZ | ✅ | ✅ Exists as `updated_at` |

**Notes:**
- Table supports both old structure (`student_profile_id`, `tier` enum) and new structure (`user_id`, `stripe_price_id`)
- `plan_id` FK added to link to `subscription_plans.id`
- Status can be enum (`active`, `trial`, `paused`, `canceled`, `expired`) or text (`active`, `trialing`, `past_due`, etc.)

### 3. Plan Table

**Location:** `public.subscription_plans`

| Field | Type | Required | Status |
|-------|------|----------|--------|
| `id` | TEXT | ✅ | ✅ Exists (e.g., 'essential_monthly') |
| `code` | TEXT | ✅ | ✅ Added in migration (extracted from `id`) |
| `name` | TEXT | ✅ | ✅ Exists |
| `priceMonthly` | INTEGER | ✅ | ✅ Added in migration as `price_monthly` (in pennies) |
| `currency` | TEXT | ✅ | ✅ Added in migration (default: 'GBP') |
| `interval` | TEXT | ✅ | ✅ Exists ('month' or 'year') |
| `description` | TEXT | ❌ Optional | ✅ Added in migration |
| `features` | JSONB | ❌ Optional | ✅ Added in migration (default features) |
| `createdAt` | TIMESTAMPTZ | ✅ | ✅ Exists as `created_at` |
| `updatedAt` | TIMESTAMPTZ | ✅ | ✅ Added in migration as `updated_at` |

**Notes:**
- `code` is extracted from `id` (e.g., 'essential_monthly' → 'essential')
- `price_monthly` is in smallest currency unit (pennies for GBP)
- `features` JSON structure:
  ```json
  {
    "courseAccess": "All courses" | "Limited courses",
    "projectLimit": 5 | 10,
    "portfolioLimit": 1 | 3,
    "jobAccess": true,
    "aiAdvisorUsage": "Unlimited",
    "toolDiscounts": true | false
  }
  ```

### 4. Invoice Table

**Location:** `public.invoices` (new table)

| Field | Type | Required | Status |
|-------|------|----------|--------|
| `id` | UUID | ✅ | ✅ Created |
| `userId` | UUID (FK) | ✅ | ✅ Created as `user_id` |
| `stripeInvoiceId` | TEXT | ❌ Optional | ✅ Created as `stripe_invoice_id` |
| `invoiceNumber` | TEXT | ✅ | ✅ Created as `invoice_number` |
| `amountPaid` | INTEGER | ✅ | ✅ Created as `amount_paid` (in pennies) |
| `currency` | TEXT | ✅ | ✅ Created (default: 'GBP') |
| `status` | TEXT | ✅ | ✅ Created (paid/open/void/uncollectible/draft) |
| `invoiceDate` | TIMESTAMPTZ | ✅ | ✅ Created as `invoice_date` |
| `pdfUrl` | TEXT | ❌ Optional | ✅ Created as `pdf_url` |
| `hostedInvoiceUrl` | TEXT | ❌ Optional | ✅ Created as `hosted_invoice_url` |
| `createdAt` | TIMESTAMPTZ | ✅ | ✅ Created as `created_at` |
| `updatedAt` | TIMESTAMPTZ | ✅ | ✅ Created as `updated_at` |

**Notes:**
- New table created separate from `payments` for clarity
- Data migrated from `payments` table if available
- `pdf_url` and `hosted_invoice_url` can be populated from Stripe API

## Migration Status

✅ **Migration:** `20250124000001_verify_and_align_subscription_schema.sql`

This migration:
1. Adds `billing_email` to `profiles` table
2. Enhances `subscription_plans` with `code`, `price_monthly`, `currency`, `description`, `features`, `updated_at`
3. Adds `plan_id` FK to `subscriptions` table
4. Creates `invoices` table with all required fields
5. Migrates invoice data from `payments` table

## Verification Queries

Run these queries to verify the schema:

```sql
-- Verify User fields
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name IN ('billing_email');

-- Verify Plan fields
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'subscription_plans' 
AND column_name IN ('code', 'price_monthly', 'currency', 'description', 'features', 'updated_at');

-- Verify Subscription fields
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'subscriptions' 
AND column_name IN ('user_id', 'plan_id', 'status', 'current_period_start', 'current_period_end', 'cancel_at_period_end', 'stripe_subscription_id');

-- Verify Invoice fields
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'invoices' 
AND column_name IN ('user_id', 'stripe_invoice_id', 'invoice_number', 'amount_paid', 'currency', 'status', 'invoice_date', 'pdf_url', 'hosted_invoice_url');
```

## Next Steps

1. **Run the migration** to apply schema changes
2. **Populate missing data:**
   - Update `subscription_plans.price_monthly` from Stripe prices if needed
   - Update `subscription_plans.features` with actual feature sets
   - Sync `subscriptions.plan_id` for existing subscriptions
3. **Stripe Integration:**
   - If invoices aren't persisted, create a server function to fetch from Stripe API
   - Map Stripe invoice data to `invoices` table structure
   - Populate `pdf_url` and `hosted_invoice_url` from Stripe

## Related Tables

- `public.stripe_customers` - Maps users to Stripe customers
- `public.payments` - Payment ledger (separate from invoices)
- `public.subscription_tier_config` - Legacy tier configuration (still used for access control)
