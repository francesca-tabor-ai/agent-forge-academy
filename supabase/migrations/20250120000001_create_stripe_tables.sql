-- Create Stripe integration tables
-- This migration creates tables for mapping users to Stripe customers,
-- storing subscription plans, subscriptions, payments, and a convenience view
-- 
-- NOTE: If an old subscriptions table exists (with student_profile_id), 
-- this migration will add user_id column and Stripe fields to it.
-- The old and new subscription systems can coexist.

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
-- Handle both old and new table structures
DO $$
BEGIN
  -- Check if subscriptions table exists with old structure (student_profile_id)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions' 
    AND column_name = 'student_profile_id'
  ) THEN
    -- Old table exists - add Stripe-specific columns if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscriptions' 
      AND column_name = 'user_id'
    ) THEN
      -- Add user_id column (nullable, can be populated from student_profiles later)
      ALTER TABLE public.subscriptions 
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add Stripe-specific columns
    ALTER TABLE public.subscriptions 
    ADD COLUMN IF NOT EXISTS stripe_customer_id text,
    ADD COLUMN IF NOT EXISTS stripe_price_id text,
    ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS trial_start timestamptz,
    ADD COLUMN IF NOT EXISTS trial_end timestamptz,
    ADD COLUMN IF NOT EXISTS ended_at timestamptz;
  ELSE
    -- Old table doesn't exist, create new Stripe-based subscriptions table
    CREATE TABLE IF NOT EXISTS public.subscriptions (
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
  END IF;
END $$;

-- Create indexes only if user_id column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions' 
    AND column_name = 'user_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status)';
  END IF;
END $$;

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
-- Only create view if user_id column exists
-- Handle both old enum status ('trial') and new text status ('trialing')
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions' 
    AND column_name = 'user_id'
  ) THEN
    -- Check if stripe_price_id exists (new structure) or not (old structure)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'subscriptions' 
      AND column_name = 'stripe_price_id'
    ) THEN
      -- New Stripe-based structure with text status
      EXECUTE $view$
        CREATE OR REPLACE VIEW public.user_entitlements AS
        SELECT
          s.user_id,
          s.status::text AS status,
          s.stripe_price_id,
          s.current_period_end,
          (s.status::text IN ('active','trialing','trial')) AS is_active
        FROM public.subscriptions s
        WHERE s.current_period_end IS NULL OR s.current_period_end > now()
      $view$;
    ELSE
      -- Old structure with enum status, but user_id was added
      EXECUTE $view$
        CREATE OR REPLACE VIEW public.user_entitlements AS
        SELECT
          s.user_id,
          s.status::text AS status,
          NULL::text AS stripe_price_id,
          s.current_period_end,
          (s.status::text IN ('active','trial')) AS is_active
        FROM public.subscriptions s
        WHERE s.current_period_end IS NULL OR s.current_period_end > now()
      $view$;
    END IF;
  END IF;
END $$;
