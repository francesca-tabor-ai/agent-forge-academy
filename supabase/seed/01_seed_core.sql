-- Seed core data: subscription plans and other foundational data
-- This should run after migrations but before content seeding

BEGIN;

-- Seed subscription plans
-- These map to Stripe products and prices
-- Based on migration: 20250120000003_seed_subscription_plans.sql
-- IMPORTANT: Replace 'price_REPLACE_ME' with actual Price IDs from Stripe Dashboard
-- 
-- To get Price IDs:
-- 1. Go to Stripe Dashboard → Products → each product
-- 2. Copy the Price ID (starts with price_...)
-- 3. Replace the placeholders below, OR
-- 4. Run: node scripts/get-stripe-price-ids.js (requires STRIPE_SECRET_KEY)

INSERT INTO subscription_plans (id, name, interval, stripe_product_id, stripe_price_id, active)
VALUES
  ('essential_monthly', 'AI Growth Hub – Essential', 'month', 'prod_Tly7fWmByUigSA', 'price_REPLACE_ME', true),
  ('pro_monthly', 'AI Growth Hub – Professional', 'month', 'prod_Tly7hTXuqPVic4', 'price_REPLACE_ME', true),
  ('essential_annual', 'AI Growth Hub – Essential (Annual)', 'year', 'prod_Tly9xah25V3791', 'price_REPLACE_ME', true),
  ('pro_annual', 'AI Growth Hub – Professional (Annual)', 'year', 'prod_TlyAaxUClcCq9n', 'price_REPLACE_ME', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  interval = EXCLUDED.interval,
  stripe_product_id = EXCLUDED.stripe_product_id,
  stripe_price_id = EXCLUDED.stripe_price_id,
  active = EXCLUDED.active;

COMMIT;
