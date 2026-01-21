-- Create saved_offers and offer_claims tables
-- Allows students to save offers and track claims

-- Create offer claim status enum
DO $$ BEGIN
    CREATE TYPE offer_claim_status AS ENUM ('claimed', 'not_claimed', 'requires_verification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create saved_offers table
CREATE TABLE IF NOT EXISTS saved_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  reminder_days_before_expiry INTEGER, -- e.g., 3 for "remind me 3 days before"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_profile_id, offer_id)
);

-- Create offer_claims table
CREATE TABLE IF NOT EXISTS offer_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  status offer_claim_status NOT NULL DEFAULT 'claimed',
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project_id UUID REFERENCES portfolio_projects(id) ON DELETE SET NULL, -- Track which project it's used for
  notes TEXT, -- Optional notes from student
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_profile_id, offer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_offers_student_profile_id ON saved_offers(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_saved_offers_offer_id ON saved_offers(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_claims_student_profile_id ON offer_claims(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_offer_claims_offer_id ON offer_claims(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_claims_status ON offer_claims(status);

-- Create trigger to update updated_at for offer_claims
DROP TRIGGER IF EXISTS update_offer_claims_updated_at ON offer_claims;
CREATE TRIGGER update_offer_claims_updated_at
  BEFORE UPDATE ON offer_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE saved_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_offers
DROP POLICY IF EXISTS "Students can manage their own saved offers" ON saved_offers;
CREATE POLICY "Students can manage their own saved offers"
  ON saved_offers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = saved_offers.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for offer_claims
DROP POLICY IF EXISTS "Students can manage their own offer claims" ON offer_claims;
CREATE POLICY "Students can manage their own offer claims"
  ON offer_claims
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = offer_claims.student_profile_id
      AND p.user_id = auth.uid()
    )
  );
