-- =====================================================
-- STRIPE MIGRATIONS - Run in Supabase SQL Editor
-- =====================================================
-- Run these migrations in order, one at a time
-- Copy each section and run it separately

-- =====================================================
-- MIGRATION 1: Create Stripe Tables
-- =====================================================
-- Copy and run the entire contents of:
-- supabase/migrations/20250120000001_create_stripe_tables.sql

-- =====================================================
-- MIGRATION 2: Add RLS Policies
-- =====================================================
-- Copy and run the entire contents of:
-- supabase/migrations/20250120000002_add_stripe_rls_policies.sql

-- =====================================================
-- MIGRATION 3: Seed Subscription Plans
-- =====================================================
-- IMPORTANT: Update Price IDs before running!
-- 1. Get Price IDs from Stripe Dashboard or run:
--    node scripts/get-stripe-price-ids.js
-- 2. Update price_REPLACE_ME in the migration file
-- 3. Copy and run the updated SQL from:
--    supabase/migrations/20250120000003_seed_subscription_plans.sql

-- =====================================================
-- VERIFICATION: Check if tables were created
-- =====================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('stripe_customers', 'subscription_plans', 'subscriptions', 'payments')
ORDER BY table_name;

-- Check if subscription_plans were seeded
SELECT id, name, interval, stripe_product_id, stripe_price_id, active
FROM subscription_plans
ORDER BY id;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('stripe_customers', 'subscriptions', 'payments');
