-- Create public_policy_areas table
-- This table stores UK public policy areas with their focus, key departments/agencies, key policy areas, industry sectors, and impact examples

-- Create public_policy_areas table
CREATE TABLE IF NOT EXISTS public_policy_areas (
  id VARCHAR(100) PRIMARY KEY, -- Slug identifier (e.g., 'economic-financial')
  name VARCHAR(255) NOT NULL, -- Display name (e.g., "Economic & Financial")
  focus TEXT NOT NULL, -- Description of the policy area focus
  key_departments_agencies TEXT[] DEFAULT '{}'::text[], -- Array of key departments/agencies
  key_policy_areas TEXT[] DEFAULT '{}'::text[], -- Array of key policy areas
  key_industry_sectors_affected TEXT[] DEFAULT '{}'::text[], -- Array of key industry sectors affected by this policy area
  examples_of_impact TEXT[] DEFAULT '{}'::text[], -- Array of examples showing how this policy area impacts industries
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_public_policy_areas_name ON public_policy_areas(name);
CREATE INDEX IF NOT EXISTS idx_public_policy_areas_key_departments ON public_policy_areas USING GIN(key_departments_agencies);
CREATE INDEX IF NOT EXISTS idx_public_policy_areas_key_policy_areas ON public_policy_areas USING GIN(key_policy_areas);
CREATE INDEX IF NOT EXISTS idx_public_policy_areas_industry_sectors ON public_policy_areas USING GIN(key_industry_sectors_affected);
CREATE INDEX IF NOT EXISTS idx_public_policy_areas_created_at ON public_policy_areas(created_at DESC);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_public_policy_areas_updated_at ON public_policy_areas;
CREATE TRIGGER update_public_policy_areas_updated_at
  BEFORE UPDATE ON public_policy_areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public_policy_areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can view public policy areas
DROP POLICY IF EXISTS "Authenticated users can view public policy areas" ON public_policy_areas;
CREATE POLICY "Authenticated users can view public policy areas"
  ON public_policy_areas
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage public policy areas
DROP POLICY IF EXISTS "Admins can manage public policy areas" ON public_policy_areas;
CREATE POLICY "Admins can manage public policy areas"
  ON public_policy_areas
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Comments for documentation
COMMENT ON TABLE public_policy_areas IS 'UK public policy areas with their focus, key departments/agencies, key policy areas, industry sectors affected, and impact examples';
COMMENT ON COLUMN public_policy_areas.id IS 'Unique identifier for the policy area (slug format, e.g., economic-financial)';
COMMENT ON COLUMN public_policy_areas.name IS 'Display name of the policy area';
COMMENT ON COLUMN public_policy_areas.focus IS 'Description of what this policy area focuses on';
COMMENT ON COLUMN public_policy_areas.key_departments_agencies IS 'Array of key departments and agencies related to this policy area';
COMMENT ON COLUMN public_policy_areas.key_policy_areas IS 'Array of key policy areas within this domain';
COMMENT ON COLUMN public_policy_areas.key_industry_sectors_affected IS 'Array of key industry sectors affected by this policy area';
COMMENT ON COLUMN public_policy_areas.examples_of_impact IS 'Array of examples showing how this policy area impacts different industries and sectors';
