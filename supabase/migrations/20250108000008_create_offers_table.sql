-- Create offers table for tool discounts
-- Provides curated, high-signal offers that support building AI projects

-- Create offer category enum (idempotent)
DO $$ BEGIN
    CREATE TYPE offer_category AS ENUM ('api', 'hosting', 'monitoring', 'data', 'tools', 'services');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create discount type enum (idempotent)
DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'free_credits', 'extended_trial', 'tier_upgrade');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category offer_category NOT NULL,
  discount_text VARCHAR(255) NOT NULL, -- e.g., "20% off first 3 months"
  discount_type discount_type NOT NULL,
  discount_value NUMERIC(10, 2), -- Percentage or amount
  discount_code VARCHAR(100), -- For copy-to-clipboard
  external_url TEXT, -- Link to claim offer
  eligibility TEXT, -- e.g., "New users only", "Requires student email"
  recommended_for_courses TEXT[], -- Array of course slugs
  original_price VARCHAR(50),
  discounted_price VARCHAR(50),
  features TEXT[], -- Array of feature strings
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_recommended BOOLEAN NOT NULL DEFAULT false, -- Can be manually flagged
  expiration_date TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER, -- NULL means unlimited
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_offers_is_recommended ON offers(is_recommended) WHERE is_recommended = true;
CREATE INDEX IF NOT EXISTS idx_offers_category ON offers(category);
CREATE INDEX IF NOT EXISTS idx_offers_expiration_date ON offers(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at DESC);

-- Create trigger to update updated_at (idempotent)
DROP TRIGGER IF EXISTS update_offers_updated_at ON offers;
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can read active offers
CREATE POLICY "Students can view active offers"
  ON offers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admins can manage all offers
CREATE POLICY "Admins can manage offers"
  ON offers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
