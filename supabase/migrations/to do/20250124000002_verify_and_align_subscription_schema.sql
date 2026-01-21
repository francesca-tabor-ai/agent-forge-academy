-- Verify and align subscription schema to match required structure
-- This migration ensures all required tables and fields exist

-- ============================================================================
-- 1. USER TABLE (extends auth.users)
-- ============================================================================
-- Note: auth.users already has: id, email
-- We need to add: billingEmail (optional), stripeCustomerId (optional)

-- Add billing_email to profiles (closest to user table)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'billing_email'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN billing_email TEXT;
    
    COMMENT ON COLUMN public.profiles.billing_email IS 'Optional billing email override (defaults to auth.users.email)';
  END IF;
END $$;

-- stripe_customers table already exists and maps user_id -> stripe_customer_id
-- This serves as the stripeCustomerId field

-- ============================================================================
-- 2. PLAN TABLE (enhance subscription_plans)
-- ============================================================================
-- Required: id, code, name, priceMonthly (pennies), currency, interval, 
--           description, features JSON, createdAt/updatedAt

DO $$
BEGIN
  -- Add code column (e.g., 'starter', 'pro', 'essential', 'professional')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans' 
    AND column_name = 'code'
  ) THEN
    ALTER TABLE public.subscription_plans 
    ADD COLUMN code TEXT;
    
    -- Extract code from id (e.g., 'essential_monthly' -> 'essential')
    UPDATE public.subscription_plans 
    SET code = SPLIT_PART(id, '_', 1)
    WHERE code IS NULL;
    
    COMMENT ON COLUMN public.subscription_plans.code IS 'Plan code: starter, pro, essential, professional, etc.';
  END IF;

  -- Add price_monthly in pennies (currently stored in subscription_tier_config)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans' 
    AND column_name = 'price_monthly'
  ) THEN
    ALTER TABLE public.subscription_plans 
    ADD COLUMN price_monthly INTEGER; -- in pennies
    
    -- Populate from subscription_tier_config if available
    UPDATE public.subscription_plans sp
    SET price_monthly = CAST(stc.price_monthly * 100 AS INTEGER)
    FROM public.subscription_tier_config stc
    WHERE SPLIT_PART(sp.id, '_', 1) = stc.tier::TEXT
    AND sp.price_monthly IS NULL;
    
    COMMENT ON COLUMN public.subscription_plans.price_monthly IS 'Monthly price in smallest currency unit (pennies)';
  END IF;

  -- Add currency
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans' 
    AND column_name = 'currency'
  ) THEN
    ALTER TABLE public.subscription_plans 
    ADD COLUMN currency TEXT DEFAULT 'GBP';
    
    COMMENT ON COLUMN public.subscription_plans.currency IS 'Currency code (e.g., GBP, USD)';
  END IF;

  -- Add description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.subscription_plans 
    ADD COLUMN description TEXT;
    
    -- Populate from subscription_tier_config if available
    UPDATE public.subscription_plans sp
    SET description = stc.description
    FROM public.subscription_tier_config stc
    WHERE SPLIT_PART(sp.id, '_', 1) = stc.tier::TEXT
    AND sp.description IS NULL;
    
    COMMENT ON COLUMN public.subscription_plans.description IS 'Plan description';
  END IF;

  -- Add features JSON
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans' 
    AND column_name = 'features'
  ) THEN
    ALTER TABLE public.subscription_plans 
    ADD COLUMN features JSONB DEFAULT '{}'::jsonb;
    
    -- Populate default features based on tier
    UPDATE public.subscription_plans sp
    SET features = CASE
      WHEN SPLIT_PART(sp.id, '_', 1) = 'essential' THEN jsonb_build_object(
        'courseAccess', 'Limited courses',
        'projectLimit', 5,
        'portfolioLimit', 1,
        'jobAccess', true,
        'aiAdvisorUsage', 'Unlimited',
        'toolDiscounts', false
      )
      WHEN SPLIT_PART(sp.id, '_', 1) IN ('professional', 'pro') THEN jsonb_build_object(
        'courseAccess', 'All courses',
        'projectLimit', 10,
        'portfolioLimit', 3,
        'jobAccess', true,
        'aiAdvisorUsage', 'Unlimited',
        'toolDiscounts', true
      )
      ELSE jsonb_build_object(
        'courseAccess', 'All courses',
        'projectLimit', 10,
        'portfolioLimit', 1,
        'jobAccess', true,
        'aiAdvisorUsage', 'Unlimited',
        'toolDiscounts', false
      )
    END
    WHERE features = '{}'::jsonb;
    
    COMMENT ON COLUMN public.subscription_plans.features IS 'Plan features as JSON: { courseAccess, projectLimit, portfolioLimit, jobAccess, aiAdvisorUsage, toolDiscounts }';
  END IF;

  -- Add updated_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscription_plans' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.subscription_plans 
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    
    -- Create trigger for updated_at
    DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
    CREATE TRIGGER update_subscription_plans_updated_at
      BEFORE UPDATE ON public.subscription_plans
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================================================
-- 3. SUBSCRIPTION TABLE (enhance existing)
-- ============================================================================
-- Required: id, userId (FK), planId (FK), status, currentPeriodStart, 
--           currentPeriodEnd, cancelAtPeriodEnd, stripeSubscriptionId, 
--           createdAt/updatedAt

DO $$
BEGIN
  -- Ensure user_id exists (already handled in 20250120000001_create_stripe_tables.sql)
  -- Add plan_id FK to subscription_plans
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions' 
    AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE public.subscriptions 
    ADD COLUMN plan_id TEXT REFERENCES public.subscription_plans(id);
    
    -- Populate plan_id from stripe_price_id if available
    UPDATE public.subscriptions s
    SET plan_id = sp.id
    FROM public.subscription_plans sp
    WHERE s.stripe_price_id = sp.stripe_price_id
    AND s.plan_id IS NULL;
    
    -- Populate plan_id from tier if stripe_price_id not available
    UPDATE public.subscriptions s
    SET plan_id = sp.id
    FROM public.subscription_plans sp
    WHERE s.tier::TEXT = SPLIT_PART(sp.id, '_', 1)
    AND s.plan_id IS NULL
    AND s.stripe_price_id IS NULL;
    
    COMMENT ON COLUMN public.subscriptions.plan_id IS 'Foreign key to subscription_plans.id';
  END IF;

  -- Ensure cancel_at_period_end exists (already handled in 20250120000001)
  -- Ensure current_period_start exists (already exists)
  -- Ensure current_period_end exists (already exists)
  -- Ensure stripe_subscription_id exists (already exists as stripe_subscription_id or id)
  
  -- Ensure created_at and updated_at exist (already exist)
END $$;

-- ============================================================================
-- 4. INVOICE TABLE (enhance payments table or create invoices table)
-- ============================================================================
-- Required: id, userId (FK), stripeInvoiceId, invoiceNumber, amountPaid (pennies),
--           currency, status, invoiceDate, pdfUrl/hostedInvoiceUrl, 
--           createdAt/updatedAt

-- Create dedicated invoices table (separate from payments for clarity)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  invoice_number TEXT, -- e.g., "INV-001" or Stripe invoice number
  amount_paid INTEGER NOT NULL, -- in smallest currency unit (pennies)
  currency TEXT NOT NULL DEFAULT 'GBP',
  status TEXT NOT NULL CHECK (status IN ('paid', 'open', 'void', 'uncollectible', 'draft')),
  invoice_date TIMESTAMPTZ NOT NULL,
  pdf_url TEXT,
  hosted_invoice_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON public.invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON public.invoices(invoice_date);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate data from payments table to invoices if payments has invoice data
DO $$
BEGIN
  -- Only migrate if invoices table is empty and payments has invoice data
  IF NOT EXISTS (SELECT 1 FROM public.invoices LIMIT 1) THEN
    INSERT INTO public.invoices (
      user_id,
      stripe_invoice_id,
      invoice_number,
      amount_paid,
      currency,
      status,
      invoice_date,
      created_at,
      updated_at
    )
    SELECT DISTINCT ON (p.stripe_invoice_id)
      p.user_id,
      p.stripe_invoice_id,
      COALESCE(p.stripe_invoice_id, 'INV-' || LPAD(ROW_NUMBER() OVER (ORDER BY p.created_at)::TEXT, 3, '0')) AS invoice_number,
      p.amount,
      p.currency,
      CASE 
        WHEN p.status = 'succeeded' THEN 'paid'
        WHEN p.status = 'failed' THEN 'uncollectible'
        ELSE 'open'
      END AS status,
      p.created_at AS invoice_date,
      p.created_at,
      p.created_at
    FROM public.payments p
    WHERE p.stripe_invoice_id IS NOT NULL
    ON CONFLICT (stripe_invoice_id) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- 5. VERIFICATION QUERIES (commented out - run manually to verify)
-- ============================================================================

-- Verify User fields:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'profiles' 
-- AND column_name IN ('billing_email');

-- Verify Plan fields:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'subscription_plans' 
-- AND column_name IN ('code', 'price_monthly', 'currency', 'description', 'features', 'updated_at');

-- Verify Subscription fields:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'subscriptions' 
-- AND column_name IN ('user_id', 'plan_id', 'status', 'current_period_start', 'current_period_end', 'cancel_at_period_end', 'stripe_subscription_id');

-- Verify Invoice fields:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'invoices' 
-- AND column_name IN ('user_id', 'stripe_invoice_id', 'invoice_number', 'amount_paid', 'currency', 'status', 'invoice_date', 'pdf_url', 'hosted_invoice_url');

-- ============================================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles linked to auth.users. Contains billing_email override.';
COMMENT ON TABLE public.stripe_customers IS 'Maps auth.users.id to Stripe customer IDs (serves as stripeCustomerId field)';
COMMENT ON TABLE public.subscription_plans IS 'Subscription plans with code, price, features, etc.';
COMMENT ON TABLE public.subscriptions IS 'User subscriptions with plan_id FK to subscription_plans';
COMMENT ON TABLE public.invoices IS 'Invoice records with Stripe invoice data and PDF URLs';
