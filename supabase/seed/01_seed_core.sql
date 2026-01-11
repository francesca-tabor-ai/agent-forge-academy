-- Seed core data: subscription plans and other foundational data
-- This should run after migrations but before content seeding

BEGIN;

-- Seed subscription plans
-- These map to Stripe products and prices
-- Update with your actual Stripe product/price IDs

INSERT INTO subscription_plans (id, name, interval, stripe_product_id, stripe_price_id, active)
VALUES
  ('essential_monthly', 'AI Growth Hub – Essential', 'month', 'prod_placeholder', 'price_placeholder', true),
  ('essential_yearly', 'AI Growth Hub – Essential', 'year', 'prod_placeholder', 'price_placeholder', true),
  ('pro_monthly', 'AI Growth Hub – Pro', 'month', 'prod_placeholder', 'price_placeholder', true),
  ('pro_yearly', 'AI Growth Hub – Pro', 'year', 'prod_placeholder', 'price_placeholder', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  interval = EXCLUDED.interval,
  stripe_product_id = EXCLUDED.stripe_product_id,
  stripe_price_id = EXCLUDED.stripe_price_id,
  active = EXCLUDED.active;

-- Note: To use real Stripe IDs, update the placeholders above with:
-- 1. Create products in Stripe Dashboard
-- 2. Create prices for each product
-- 3. Replace 'prod_placeholder' and 'price_placeholder' with actual IDs
-- Example: stripe_product_id = 'prod_ABC123', stripe_price_id = 'price_XYZ789'

COMMIT;
