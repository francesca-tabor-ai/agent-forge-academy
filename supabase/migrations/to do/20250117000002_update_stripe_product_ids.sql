-- Update subscription_tier_config with Stripe Product IDs
-- Run this after migration 20250117000001_add_stripe_product_ids.sql

-- Update Essential tier with monthly product ID
UPDATE subscription_tier_config
SET stripe_product_id = 'prod_Tly7fWmByUigSA'
WHERE tier = 'essential';

-- Update Professional tier with monthly product ID
UPDATE subscription_tier_config
SET stripe_product_id = 'prod_Tly7hTXuqPVic4'
WHERE tier = 'professional';

-- Note: Annual product IDs are:
-- Essential Annual: prod_Tly9xah25V3791
-- Professional Annual: prod_TlyAaxUClcCq9n
-- These can be stored if you add support for annual billing periods
