-- Add Row Level Security (RLS) policies for Stripe tables
-- Users can only see their own subscription data

-- Enable RLS on Stripe tables
alter table public.stripe_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

-- RLS Policy: Users can read their own stripe customer record
DROP POLICY IF EXISTS "read own stripe customer" ON public.stripe_customers;
create policy "read own stripe customer"
on public.stripe_customers
for select
using (user_id = auth.uid());

-- RLS Policy: Users can read their own subscriptions
DROP POLICY IF EXISTS "read own subscriptions" ON public.subscriptions;
create policy "read own subscriptions"
on public.subscriptions
for select
using (user_id = auth.uid());

-- RLS Policy: Users can read their own payments
DROP POLICY IF EXISTS "read own payments" ON public.payments;
create policy "read own payments"
on public.payments
for select
using (user_id = auth.uid());

-- IMPORTANT:
-- Webhooks will use the Supabase Service Role key (bypasses RLS),
-- so you do NOT need insert/update policies for users.
