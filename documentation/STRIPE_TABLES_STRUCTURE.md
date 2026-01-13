# Stripe Tables Structure

<style>
/* Architecture/Flow/Diagram/Code Block Styling - White Text on Black Background */
pre, code, pre code {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  border: 1px solid #333333;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
}

/* Ensure all code blocks maintain black background */
pre {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

/* Selection state - dark background, white text */
pre::selection, code::selection, pre code::selection {
  background-color: #333333 !important;
  color: #FFFFFF !important;
}

pre ::selection, code ::selection {
  background-color: #333333 !important;
  color: #FFFFFF !important;
}

/* Highlight/Mark state - dark accent, white text */
pre mark, code mark, pre code mark {
  background-color: #444444 !important;
  color: #FFFFFF !important;
}

/* Hover state - stay black */
pre:hover, code:hover {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}

/* Focus state - stay black with subtle outline */
pre:focus, code:focus {
  background-color: #000000 !important;
  color: #FFFFFF !important;
  outline: 1px solid #666666;
}

/* Nested elements inherit white text */
pre *, code *, pre code * {
  color: #FFFFFF !important;
}

/* Prevent theme overrides */
pre.prose, code.prose {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}
</style>

This document explains the new Stripe integration tables and how they fit into the Supabase project.

## Overview

After implementing the Stripe integration, you'll see these new tables in your Supabase project:

1. **`stripe_customers`** - Maps app users to Stripe customers
2. **`subscription_plans`** - Your canonical plan list mapped to Stripe products and prices
3. **`subscriptions`** - Current subscription state per user (source of truth from Stripe)
4. **`payments`** - Invoices and payment outcomes

## Table Details

### 1. `stripe_customers`

**Purpose**: Maps app users to Stripe customers

**Schema**:
```sql
stripe_customers (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  stripe_customer_id text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
)
```

**What you'll see**:
- One row per user who has created a Stripe customer
- Links your app's `auth.users.id` to Stripe's `cus_...` customer ID
- Created automatically when a user starts checkout
- Updated by webhooks when subscriptions are created

**Example data**:
```
user_id                              | stripe_customer_id | created_at
-------------------------------------|--------------------|------------------
550e8400-e29b-41d4-a716-446655440000 | cus_ABC123         | 2025-01-20 10:00:00
```

### 2. `subscription_plans`

**Purpose**: Your canonical plan list mapped to Stripe products and prices

**Schema**:
```sql
subscription_plans (
  id text PRIMARY KEY,                    -- e.g. 'essential_monthly'
  name text NOT NULL,                     -- 'AI Growth Hub – Essential'
  interval text NOT NULL,                 -- 'month' | 'year'
  stripe_product_id text NOT NULL,       -- 'prod_...'
  stripe_price_id text NOT NULL,          -- 'price_...'
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
)
```

**What you'll see**:
- Pre-defined list of all available subscription plans
- Maps your internal plan IDs to Stripe Product IDs and Price IDs
- Used by checkout session creation to look up the correct Stripe price
- Used by webhooks to determine which plan a subscription belongs to

**Example data**:
```
id                | name                              | interval | stripe_product_id    | stripe_price_id
------------------|-----------------------------------|----------|----------------------|------------------
essential_monthly | AI Growth Hub – Essential         | month    | prod_Tly7fWmByUigSA | price_1234567890
pro_monthly       | AI Growth Hub – Professional      | month    | prod_Tly7hTXuqPVic4 | price_0987654321
essential_annual  | AI Growth Hub – Essential (Annual) | year     | prod_Tly9xah25V3791 | price_1122334455
pro_annual        | AI Growth Hub – Professional (Annual) | year  | prod_TlyAaxUClcCq9n | price_5544332211
```

### 3. `subscriptions`

**Purpose**: Current subscription state per user (source of truth from Stripe)

**Schema**:
```sql
subscriptions (
  id text PRIMARY KEY,                    -- Stripe subscription ID: 'sub_...'
  user_id uuid NOT NULL REFERENCES auth.users(id),
  stripe_customer_id text NOT NULL,      -- 'cus_...'
  stripe_price_id text NOT NULL,          -- 'price_...'
  status text NOT NULL,                   -- 'active', 'trialing', 'canceled', etc.
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
)
```

**What you'll see**:
- One row per active/past subscription
- Primary key is the Stripe subscription ID (`sub_...`)
- All data synced from Stripe via webhooks
- This is the **source of truth** for subscription status
- Used by access control to check if user has active subscription

**Example data**:
```
id              | user_id                            | stripe_customer_id | stripe_price_id | status   | current_period_end
----------------|------------------------------------|--------------------|-----------------|----------|-------------------
sub_ABC123      | 550e8400-e29b-41d4-a716-446655440000 | cus_XYZ789        | price_1234567890 | active   | 2025-02-20 10:00:00
sub_DEF456      | 660e8400-e29b-41d4-a716-446655440001 | cus_UVW012        | price_0987654321 | trialing | 2025-02-27 10:00:00
```

**Key Points**:
- **Never manually update this table** - webhooks handle all updates
- Status values come directly from Stripe: `active`, `trialing`, `canceled`, `past_due`, `unpaid`, etc.
- Period dates are in UTC timestamptz format
- `cancel_at_period_end=true` means subscription will cancel at period end

### 4. `payments`

**Purpose**: Invoices and payment outcomes

**Schema**:
```sql
payments (
  id text PRIMARY KEY,                    -- Stripe payment_intent or charge ID
  user_id uuid NOT NULL REFERENCES auth.users(id),
  stripe_customer_id text NOT NULL,      -- 'cus_...'
  amount integer NOT NULL,                -- In smallest currency unit (pennies)
  currency text NOT NULL,                 -- 'gbp', 'usd', etc.
  status text NOT NULL,                   -- 'succeeded', 'failed', 'pending'
  stripe_invoice_id text,                 -- 'in_...'
  stripe_subscription_id text,            -- 'sub_...'
  created_at timestamptz NOT NULL DEFAULT now()
)
```

**What you'll see**:
- Payment records from successful and failed payments
- Linked to users and subscriptions
- Amount stored in smallest currency unit (e.g., 3900 = £39.00)
- Used for payment history and analytics

**Example data**:
```
id              | user_id                            | amount | currency | status    | stripe_subscription_id
----------------|------------------------------------|--------|----------|-----------|----------------------
pi_ABC123       | 550e8400-e29b-41d4-a716-446655440000 | 3900   | gbp      | succeeded | sub_ABC123
pi_DEF456       | 550e8400-e29b-41d4-a716-446655440000 | 3900   | gbp      | succeeded | sub_ABC123
pi_GHI789       | 660e8400-e29b-41d4-a716-446655440001 | 7900   | gbp      | failed    | sub_DEF456
```

## View: `user_entitlements`

**Purpose**: Convenience view for checking active subscriptions

**Schema**:
```sql
CREATE VIEW user_entitlements AS
SELECT
  s.user_id,
  s.status,
  s.stripe_price_id,
  s.current_period_end,
  (s.status IN ('active', 'trialing')) AS is_active
FROM subscriptions s
WHERE s.current_period_end IS NULL OR s.current_period_end > now();
```

**What you'll see**:
- Simplified view of active subscriptions
- Filters out expired subscriptions
- `is_active=true` means user has active/trialing subscription with valid period
- Used by access control utilities

## How It All Works Together

### 1. User Starts Checkout
```
User clicks "Subscribe" 
  → POST /api/stripe/create-checkout-session
  → Creates/retrieves Stripe customer
  → Inserts into stripe_customers table
  → Creates Stripe Checkout Session
```

### 2. User Completes Payment
```
User completes payment in Stripe
  → Stripe sends checkout.session.completed webhook
  → Webhook ensures stripe_customers record exists
```

### 3. Subscription Created
```
Stripe creates subscription
  → Stripe sends customer.subscription.created webhook
  → Webhook inserts into subscriptions table
  → Links user_id to subscription via stripe_customer_id
```

### 4. Payment Processed
```
Invoice paid
  → Stripe sends invoice.paid webhook
  → Webhook inserts/updates payments table
  → Webhook updates subscriptions.current_period_end
```

### 5. Access Control
```
User tries to access course
  → Query subscriptions table for user_id
  → Check status='active' or 'trialing'
  → Check current_period_end > now()
  → Match stripe_price_id to subscription_plans to get plan
```

### 6. Subscription Changes
```
User cancels/upgrades/downgrades
  → POST /api/subscription/cancel or /api/subscription/update
  → Calls Stripe API
  → Stripe sends customer.subscription.updated webhook
  → Webhook updates subscriptions table
```

## Key Principles

1. **Stripe is the source of truth** - All subscription data comes from Stripe via webhooks
2. **Never manually update subscriptions** - Always go through Stripe API or webhooks
3. **User ID is the primary lookup** - All queries use `user_id`, not student_profile_id
4. **Webhooks handle all sync** - Database updates happen automatically via webhooks

## Migration Notes

### Old Structure (Still Exists)
- `subscriptions` table with `student_profile_id` (old structure)
- `subscription_tier_config` table (tier-based)
- `subscription_tier_courses` table (course access mapping)

### New Structure (Stripe-Based)
- `stripe_customers` table (user ↔ customer mapping)
- `subscription_plans` table (plan catalog)
- `subscriptions` table (new structure with `user_id`)
- `payments` table (payment ledger)

**Note**: Both structures may coexist during migration. The new Stripe-based structure is used for new subscriptions, while old subscriptions may still reference the old structure.

## Access Control

Use the utilities in `lib/utils/stripe-subscription-access.ts`:

```typescript
import { hasActiveSubscription, getUserPlanId } from '@/lib/utils/stripe-subscription-access';

// Check if user has active subscription
const hasAccess = await hasActiveSubscription(userId);

// Get user's plan ID
const planId = await getUserPlanId(userId); // e.g., 'pro_monthly'
```

## Database Queries

### Check if user has active subscription
```sql
SELECT * FROM subscriptions
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND status IN ('active', 'trialing')
  AND current_period_end > now();
```

### Get user's plan details
```sql
SELECT sp.*, s.status, s.current_period_end
FROM subscriptions s
JOIN subscription_plans sp ON sp.stripe_price_id = s.stripe_price_id
WHERE s.user_id = '550e8400-e29b-41d4-a716-446655440000'
  AND s.status IN ('active', 'trialing')
  AND s.current_period_end > now();
```

### Get user's payment history
```sql
SELECT * FROM payments
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY created_at DESC;
```

## Row Level Security (RLS)

All tables have RLS enabled:
- Users can only see their own records
- Webhooks use service role key (bypasses RLS)
- No insert/update policies needed for users (webhooks handle it)
