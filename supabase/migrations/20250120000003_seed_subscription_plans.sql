-- Seed subscription_plans table with Stripe Product IDs and Price IDs
-- IMPORTANT: Replace 'price_REPLACE_ME' with actual Price IDs from Stripe Dashboard
-- 
-- To get Price IDs:
-- 1. Go to Stripe Dashboard → Products → each product
-- 2. Copy the Price ID (starts with price_...)
-- 3. Replace the placeholders below, OR
-- 4. Run: node scripts/get-stripe-price-ids.js (requires STRIPE_SECRET_KEY)

insert into public.subscription_plans (id, name, interval, stripe_product_id, stripe_price_id)
values
  ('essential_monthly', 'AI Growth Hub – Essential', 'month', 'prod_Tly7fWmByUigSA', 'price_REPLACE_ME'),
  ('pro_monthly',       'AI Growth Hub – Professional', 'month', 'prod_Tly7hTXuqPVic4', 'price_REPLACE_ME'),
  ('essential_annual',  'AI Growth Hub – Essential (Annual)', 'year', 'prod_Tly9xah25V3791', 'price_REPLACE_ME'),
  ('pro_annual',        'AI Growth Hub – Professional (Annual)', 'year', 'prod_TlyAaxUClcCq9n', 'price_REPLACE_ME')
on conflict (id) do update
set
  name = excluded.name,
  interval = excluded.interval,
  stripe_product_id = excluded.stripe_product_id,
  stripe_price_id = excluded.stripe_price_id;
