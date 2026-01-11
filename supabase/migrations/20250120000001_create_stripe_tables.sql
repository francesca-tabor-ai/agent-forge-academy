-- Create Stripe integration tables
-- This migration creates tables for mapping users to Stripe customers,
-- storing subscription plans, subscriptions, payments, and a convenience view

-- 1) Map app users -> Stripe customers
create table if not exists public.stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  created_at timestamptz not null default now()
);

-- 2) Store your app plans (maps to Stripe product + price)
create table if not exists public.subscription_plans (
  id text primary key, -- e.g. 'essential_monthly'
  name text not null,  -- 'AI Growth Hub – Essential'
  interval text not null check (interval in ('month','year')),
  stripe_product_id text not null,
  stripe_price_id text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3) Stripe subscriptions (source of truth for entitlements)
create table if not exists public.subscriptions (
  id text primary key, -- Stripe subscription id: sub_...
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_price_id text not null,
  status text not null,
  cancel_at_period_end boolean not null default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  canceled_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

-- 4) Payments ledger (optional but recommended for "who paid what")
create table if not exists public.payments (
  id text primary key, -- Stripe payment_intent id OR charge id
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  amount integer not null,           -- in smallest currency unit (e.g. pennies)
  currency text not null,
  status text not null,
  stripe_invoice_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

create index if not exists payments_user_id_idx on public.payments(user_id);

-- 5) Convenience: current entitlement view
create or replace view public.user_entitlements as
select
  s.user_id,
  s.status,
  s.stripe_price_id,
  s.current_period_end,
  (s.status in ('active','trialing')) as is_active
from public.subscriptions s
where s.current_period_end is null or s.current_period_end > now();
