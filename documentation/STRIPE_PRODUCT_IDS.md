# Stripe Product IDs Configuration

This document contains the Stripe Product IDs for all subscription tiers and instructions for setting them up.

## Product IDs

### Essential Access
- **Monthly**: `prod_Tly7fWmByUigSA`
- **Annual**: `prod_Tly9xah25V3791`

### Professional Access
- **Monthly**: `prod_Tly7hTXuqPVic4`
- **Annual**: `prod_TlyAaxUClcCq9n`

## Setup Instructions

### Step 1: Run Database Migrations

The migrations will add the `stripe_product_id` column and update it with the product IDs:

```bash
# Run migrations (if using Supabase CLI)
supabase migration up

# Or apply migrations manually via Supabase Dashboard SQL Editor
```

Migrations:
- `20250117000001_add_stripe_product_ids.sql` - Adds `stripe_product_id` column
- `20250117000002_update_stripe_product_ids.sql` - Updates product IDs

### Step 2: Get Price IDs from Stripe

**Option A: Use the Helper Script (Recommended)**

```bash
# Make sure STRIPE_SECRET_KEY is set
export STRIPE_SECRET_KEY=sk_test_...

# Run the script
node scripts/get-stripe-price-ids.js
```

This script will:
- Fetch all Price IDs for each product
- Display them in a readable format
- Generate SQL update statements

**Option B: Manual Lookup**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Click on each product
3. Find the Price ID (starts with `price_`) for the monthly/annual price
4. Copy the Price ID

### Step 3: Update Price IDs in Database

After getting the Price IDs, update the database:

```sql
-- Update Essential tier with monthly price ID
UPDATE subscription_tier_config
SET stripe_price_id = 'price_XXXXXXXXXXXXX'
WHERE tier = 'essential';

-- Update Professional tier with monthly price ID
UPDATE subscription_tier_config
SET stripe_price_id = 'price_XXXXXXXXXXXXX'
WHERE tier = 'professional';
```

## Important Notes

1. **Price IDs Required**: The system uses `stripe_price_id` for checkout sessions. This is different from Product IDs and is required for the checkout flow to work.

2. **Annual vs Monthly**: The current system supports monthly subscriptions by default. If you want to add annual billing:
   - You may need to add a `billing_period` field to `subscription_tier_config`
   - Or create separate tier entries for annual plans
   - Update the checkout session creation to handle both

3. **Price ID Mapping**: Each product can have multiple prices (monthly, annual, etc.). You'll need to map:
   - Essential Monthly: Product `prod_Tly7fWmByUigSA` → Price ID `price_XXXXX`
   - Essential Annual: Product `prod_Tly9xah25V3791` → Price ID `price_XXXXX`
   - Professional Monthly: Product `prod_Tly7hTXuqPVic4` → Price ID `price_XXXXX`
   - Professional Annual: Product `prod_TlyAaxUClcCq9n` → Price ID `price_XXXXX`

4. **Webhook Processing**: The webhook handler uses `stripe_price_id` to determine which tier a subscription belongs to. Make sure Price IDs are correctly mapped.

## Verification

After setup, verify the configuration:

```sql
SELECT 
  tier,
  name,
  stripe_product_id,
  stripe_price_id,
  price_monthly
FROM subscription_tier_config
ORDER BY tier;
```

Both `stripe_product_id` and `stripe_price_id` should be populated.

## Next Steps

1. ✅ Product IDs documented
2. ✅ Database migrations created
3. ✅ Helper script created
4. ⏳ Get Price IDs from Stripe (use helper script or manual lookup)
5. ⏳ Update `stripe_price_id` in `subscription_tier_config` table
6. ⏳ Test checkout flow
7. ⏳ Test webhook processing
8. ⏳ (Optional) Add annual billing support
