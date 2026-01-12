-- Add Row Level Security (RLS) policies for Stripe tables
-- Users can only see their own subscription data

-- Enable RLS on Stripe tables
alter table public.stripe_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

-- RLS Policy: Users can read their own stripe customer record
DROP POLICY IF EXISTS "read own stripe customer" ON public.stripe_customers;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "read own stripe customer"
    ON public.stripe_customers
    FOR SELECT
    USING (user_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- RLS Policy: Users can read their own subscriptions
DROP POLICY IF EXISTS "read own subscriptions" ON public.subscriptions;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "read own subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (user_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- RLS Policy: Users can read their own payments
DROP POLICY IF EXISTS "read own payments" ON public.payments;
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "read own payments"
    ON public.payments
    FOR SELECT
    USING (user_id = auth.uid())';
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- IMPORTANT:
-- Webhooks will use the Supabase Service Role key (bypasses RLS),
-- so you do NOT need insert/update policies for users.
