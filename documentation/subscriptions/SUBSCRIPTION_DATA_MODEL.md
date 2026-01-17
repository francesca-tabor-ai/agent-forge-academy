# Subscription Data Model Recommendation

## Executive Summary

This document provides a comprehensive recommendation for the subscription data model that unifies the existing tier-based system with the new Stripe integration. The recommended model uses **Stripe as the source of truth** for subscription state while maintaining a clean mapping between plans, tiers, and course access.

## Current State Analysis

### Existing Models (Coexisting)

1. **Old Tier-Based Model**:
   - `subscriptions` table with `student_profile_id`, `tier` enum, `status` enum
   - `subscription_tier_config` table
   - `subscription_tier_courses` junction table
   - Uses `has_course_access()` function

2. **New Stripe-Based Model**:
   - `stripe_customers` table
   - `subscription_plans` table
   - `subscriptions` table with `user_id`, `stripe_subscription_id` as primary key
   - `payments` table
   - `user_entitlements` view

### Problems with Current State

1. **Dual Models**: Two subscription systems coexist, causing confusion
2. **Inconsistent Lookups**: Some code uses `student_profile_id`, others use `user_id`
3. **Missing Plan-to-Tier Mapping**: `subscription_plans` doesn't map to `subscription_tier` enum
4. **Course Access Disconnect**: New Stripe model doesn't link to course access rules
5. **Status Mismatch**: Old enum status vs. Stripe text status values

## Recommended Unified Data Model

### Core Principles

1. **Stripe as Source of Truth**: All subscription state comes from Stripe via webhooks
2. **User-Centric**: Use `user_id` (from `auth.users`) as the primary lookup key
3. **Plan-Based**: Map Stripe prices to internal plans, which map to tiers
4. **Flexible Access Control**: Support both "all access" and "limited course" tiers
5. **Historical Tracking**: Keep payment history and subscription changes

### Schema Design

#### 1. `stripe_customers`
**Purpose**: Maps app users to Stripe customers (one-to-one)

```sql
CREATE TABLE stripe_customers (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE NOT NULL,
  email text, -- Cached from Stripe for quick lookups
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
```

**Key Points**:
- One Stripe customer per user
- Created when user first initiates checkout
- Updated by webhooks when customer data changes

#### 2. `subscription_plans`
**Purpose**: Catalog of available subscription plans (maps Stripe products/prices to internal plans)

```sql
CREATE TABLE subscription_plans (
  id text PRIMARY KEY, -- e.g., 'essential_monthly', 'pro_annual'
  name text NOT NULL, -- Display name: 'AI Growth Hub – Essential'
  tier text NOT NULL CHECK (tier IN ('essential', 'professional')), -- Maps to old enum
  interval text NOT NULL CHECK (interval IN ('month', 'year')),
  stripe_product_id text NOT NULL,
  stripe_price_id text NOT NULL UNIQUE,
  price_amount numeric(10, 2) NOT NULL, -- e.g., 39.00 for £39
  currency text NOT NULL DEFAULT 'gbp',
  has_all_course_access boolean NOT NULL DEFAULT false, -- true for Professional
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_plans_price_id ON subscription_plans(stripe_price_id);
CREATE INDEX idx_subscription_plans_tier ON subscription_plans(tier);
```

**Key Points**:
- Maps Stripe Price IDs to internal plan IDs
- Includes `tier` field to bridge old and new systems
- `has_all_course_access` flag determines access model
- Supports both monthly and annual billing

**Example Data**:
```
id                | name                              | tier         | interval | stripe_price_id | has_all_course_access
------------------|-----------------------------------|--------------|----------|------------------|----------------------
essential_monthly | AI Growth Hub – Essential         | essential    | month    | price_1234567890 | false
pro_monthly       | AI Growth Hub – Professional      | professional | month    | price_0987654321 | true
essential_annual  | AI Growth Hub – Essential (Annual) | essential    | year     | price_1122334455 | false
pro_annual        | AI Growth Hub – Professional (Annual) | professional | year  | price_5544332211 | true
```

#### 3. `subscriptions`
**Purpose**: Current subscription state per user (synced from Stripe)

```sql
CREATE TABLE subscriptions (
  id text PRIMARY KEY, -- Stripe subscription ID: 'sub_...'
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_price_id text NOT NULL,
  plan_id text REFERENCES subscription_plans(id), -- Denormalized for quick lookups
  status text NOT NULL, -- 'active', 'trialing', 'canceled', 'past_due', 'unpaid', etc.
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Ensure only one active subscription per user
  CONSTRAINT unique_active_subscription EXCLUDE (user_id WITH =) 
    WHERE (status IN ('active', 'trialing', 'past_due'))
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX idx_subscriptions_price_id ON subscriptions(stripe_price_id);
```

**Key Points**:
- Primary key is Stripe subscription ID (source of truth)
- `plan_id` is denormalized for performance (can be derived from `stripe_price_id`)
- Status values come directly from Stripe (not enum)
- Partial unique constraint ensures one active subscription per user
- All updates come from Stripe webhooks (never manually updated)

#### 4. `subscription_plan_courses`
**Purpose**: Maps subscription plans to specific courses (for limited-access plans)

```sql
CREATE TABLE subscription_plan_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(plan_id, course_id)
);

CREATE INDEX idx_plan_courses_plan_id ON subscription_plan_courses(plan_id);
CREATE INDEX idx_plan_courses_course_id ON subscription_plan_courses(course_id);
```

**Key Points**:
- Only plans with `has_all_course_access = false` need entries here
- Professional plans (`has_all_course_access = true`) don't need entries
- Used for Essential tier course access checks

**Example Data** (for Essential tier):
```
plan_id           | course_id
------------------|-----------------------------------
essential_monthly | <uuid-of-prompt-engineering>
essential_monthly | <uuid-of-ai-content-pipelines>
essential_monthly | <uuid-of-reddit-ai-visibility>
essential_monthly | <uuid-of-seo-to-aeo>
essential_monthly | <uuid-of-ai-governance>
essential_annual   | <same-course-ids>
```

#### 5. `payments`
**Purpose**: Payment history ledger (invoices and payment outcomes)

```sql
CREATE TABLE payments (
  id text PRIMARY KEY, -- Stripe payment_intent ID or charge ID
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text REFERENCES subscriptions(id),
  stripe_invoice_id text,
  amount integer NOT NULL, -- In smallest currency unit (pennies)
  currency text NOT NULL,
  status text NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'
  payment_method_type text, -- 'card', 'bank_account', etc.
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(stripe_subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
```

**Key Points**:
- Records all payment attempts (successful and failed)
- Amount stored in smallest currency unit (e.g., 3900 = £39.00)
- Used for payment history, analytics, and reconciliation

#### 6. `user_entitlements` (View)
**Purpose**: Convenience view for checking active subscriptions

```sql
CREATE OR REPLACE VIEW user_entitlements AS
SELECT
  s.user_id,
  s.id AS subscription_id,
  s.status,
  s.plan_id,
  sp.tier,
  sp.has_all_course_access,
  s.current_period_end,
  s.trial_end,
  (s.status IN ('active', 'trialing') 
   AND (s.current_period_end IS NULL OR s.current_period_end > now())) 
  AS is_active
FROM subscriptions s
JOIN subscription_plans sp ON sp.id = s.plan_id
WHERE s.status IN ('active', 'trialing', 'past_due')
  AND (s.current_period_end IS NULL OR s.current_period_end > now());
```

**Key Points**:
- Simplified view for access control checks
- Filters to only active/valid subscriptions
- Includes tier and access flags for quick lookups

## Access Control Logic

### Database Function: `has_course_access_v2()`

```sql
CREATE OR REPLACE FUNCTION has_course_access_v2(
  p_user_id UUID,
  p_course_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id text;
  v_has_all_access boolean;
  v_course_exists boolean;
BEGIN
  -- Check if course exists and is published
  SELECT EXISTS(
    SELECT 1 FROM courses 
    WHERE id = p_course_id AND is_published = true
  ) INTO v_course_exists;
  
  IF NOT v_course_exists THEN
    RETURN false;
  END IF;

  -- Get user's active subscription plan
  SELECT s.plan_id, sp.has_all_course_access
  INTO v_plan_id, v_has_all_access
  FROM subscriptions s
  JOIN subscription_plans sp ON sp.id = s.plan_id
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing')
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  LIMIT 1;

  -- If no active subscription, deny access
  IF v_plan_id IS NULL THEN
    RETURN false;
  END IF;

  -- If plan has all-access, grant access
  IF v_has_all_access THEN
    RETURN true;
  END IF;

  -- Otherwise, check if course is in subscription_plan_courses
  SELECT EXISTS(
    SELECT 1 FROM subscription_plan_courses
    WHERE plan_id = v_plan_id AND course_id = p_course_id
  ) INTO v_course_exists;

  RETURN v_course_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION has_course_access_v2(UUID, UUID) TO authenticated;
```

## Migration Strategy

### Phase 1: Add New Tables (Non-Breaking)

1. Create `subscription_plans` table with tier mapping
2. Create `subscription_plan_courses` table
3. Create `stripe_customers` table (if not exists)
4. Update `subscriptions` table to support both old and new structures

### Phase 2: Populate New Tables

1. Seed `subscription_plans` with Stripe Price IDs
2. Map existing `subscription_tier_courses` to `subscription_plan_courses`
3. Migrate existing subscriptions to new structure (if any)

### Phase 3: Update Access Control

1. Create `has_course_access_v2()` function
2. Update RLS policies to use new function
3. Update application code to use new function

### Phase 4: Deprecate Old Model

1. Mark old `subscription_tier_config` as deprecated
2. Remove old `has_course_access()` function (after migration)
3. Clean up unused columns from `subscriptions` table

## Key Design Decisions

### 1. Why `plan_id` in `subscriptions`?

**Decision**: Denormalize `plan_id` in `subscriptions` table

**Rationale**:
- Faster lookups (no JOIN needed for access checks)
- Can be derived from `stripe_price_id` if needed
- Updated by webhook when subscription changes

### 2. Why Separate `subscription_plan_courses`?

**Decision**: Use junction table instead of embedding in `subscription_plans`

**Rationale**:
- Flexible: Can add/remove courses without schema changes
- Supports multiple plans with same tier (monthly/annual)
- Normalized design for maintainability

### 3. Why Text Status Instead of Enum?

**Decision**: Use text status matching Stripe values

**Rationale**:
- Stripe is source of truth
- Stripe statuses may change/expand over time
- Avoids enum migration issues
- More flexible for future statuses

### 4. Why `user_id` Instead of `student_profile_id`?

**Decision**: Use `user_id` directly from `auth.users`

**Rationale**:
- Simpler lookup chain (no JOIN through profiles)
- Stripe customers are per-user, not per-profile
- More consistent with authentication model
- Can still link to student profiles if needed via `profiles.user_id`

### 5. Why Partial Unique Constraint?

**Decision**: Use `EXCLUDE` constraint for active subscriptions only

**Rationale**:
- Allows multiple historical subscriptions per user
- Prevents multiple active subscriptions
- More flexible than simple UNIQUE constraint

## Usage Examples

### Check if User Has Access to Course

```sql
SELECT has_course_access_v2('user-uuid', 'course-uuid');
```

### Get User's Active Subscription

```sql
SELECT 
  s.*,
  sp.name AS plan_name,
  sp.tier,
  sp.has_all_course_access
FROM subscriptions s
JOIN subscription_plans sp ON sp.id = s.plan_id
WHERE s.user_id = 'user-uuid'
  AND s.status IN ('active', 'trialing')
  AND (s.current_period_end IS NULL OR s.current_period_end > now());
```

### Get Courses Available to User's Plan

```sql
-- For plans with all access
SELECT c.*
FROM courses c
WHERE c.is_published = true
  AND EXISTS (
    SELECT 1 FROM user_entitlements ue
    WHERE ue.user_id = 'user-uuid'
      AND ue.is_active = true
      AND ue.has_all_course_access = true
  );

-- For plans with limited access
SELECT c.*
FROM courses c
JOIN subscription_plan_courses spc ON spc.course_id = c.id
WHERE c.is_published = true
  AND EXISTS (
    SELECT 1 FROM user_entitlements ue
    WHERE ue.user_id = 'user-uuid'
      AND ue.is_active = true
      AND ue.plan_id = spc.plan_id
  );
```

### Get User's Payment History

```sql
SELECT 
  p.*,
  s.id AS subscription_id,
  sp.name AS plan_name
FROM payments p
LEFT JOIN subscriptions s ON s.id = p.stripe_subscription_id
LEFT JOIN subscription_plans sp ON sp.id = s.plan_id
WHERE p.user_id = 'user-uuid'
ORDER BY p.created_at DESC;
```

## Row Level Security (RLS)

### Policies

```sql
-- stripe_customers: Users can view their own
CREATE POLICY "Users can view own customer" ON stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

-- subscriptions: Users can view their own
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- subscription_plans: Public read access
CREATE POLICY "Anyone can view plans" ON subscription_plans
  FOR SELECT USING (true);

-- subscription_plan_courses: Public read access
CREATE POLICY "Anyone can view plan courses" ON subscription_plan_courses
  FOR SELECT USING (true);

-- payments: Users can view their own
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);
```

## Benefits of This Model

1. **Unified**: Single source of truth (Stripe)
2. **Flexible**: Supports monthly/annual, different tiers, course mappings
3. **Performant**: Denormalized fields, proper indexes, efficient queries
4. **Maintainable**: Clear separation of concerns, normalized where appropriate
5. **Scalable**: Can add new plans/tiers without schema changes
6. **Auditable**: Payment history and subscription changes tracked
7. **Future-Proof**: Can extend to add-ons, usage-based pricing, etc.

## Next Steps

1. **Review and Approve**: Get stakeholder approval on this model
2. **Create Migration**: Write migration script to implement new tables
3. **Update Webhooks**: Ensure webhooks populate new structure
4. **Update Application Code**: Migrate access control functions
5. **Test Thoroughly**: Test all subscription flows with new model
6. **Deprecate Old Model**: Remove old tables/functions after migration

## Questions to Consider

1. **Historical Data**: Do we need to migrate existing subscriptions from old model?
2. **Backward Compatibility**: Should we support both models during transition?
3. **Course Access Caching**: Should we cache access checks for performance?
4. **Analytics**: Do we need additional tables for subscription analytics?
5. **Add-ons**: Will we support subscription add-ons in the future?
