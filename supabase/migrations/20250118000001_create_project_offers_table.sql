-- Create project_offers table
-- Links offers to portfolio projects so students can track which offers they use for which projects

-- Create project_offers table
CREATE TABLE IF NOT EXISTS project_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(project_id, offer_id) -- Prevent duplicate links
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_project_offers_project_id ON project_offers(project_id);
CREATE INDEX IF NOT EXISTS idx_project_offers_offer_id ON project_offers(offer_id);
CREATE INDEX IF NOT EXISTS idx_project_offers_created_at ON project_offers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE project_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Students can read project_offers for their own projects
DROP POLICY IF EXISTS "Students can read project_offers for own projects" ON project_offers;
CREATE POLICY "Students can read project_offers for own projects"
  ON project_offers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      JOIN student_profiles sp ON sp.id = pp.student_profile_id
      JOIN profiles p ON p.id = sp.profile_id
      WHERE pp.id = project_offers.project_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policy: Students can insert project_offers for their own projects
DROP POLICY IF EXISTS "Students can insert project_offers for own projects" ON project_offers;
CREATE POLICY "Students can insert project_offers for own projects"
  ON project_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      JOIN student_profiles sp ON sp.id = pp.student_profile_id
      JOIN profiles p ON p.id = sp.profile_id
      WHERE pp.id = project_offers.project_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policy: Students can delete project_offers for their own projects
DROP POLICY IF EXISTS "Students can delete project_offers for own projects" ON project_offers;
CREATE POLICY "Students can delete project_offers for own projects"
  ON project_offers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_projects pp
      JOIN student_profiles sp ON sp.id = pp.student_profile_id
      JOIN profiles p ON p.id = sp.profile_id
      WHERE pp.id = project_offers.project_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policy: Admins can manage all project_offers
DROP POLICY IF EXISTS "Admins can manage all project_offers" ON project_offers;
CREATE POLICY "Admins can manage all project_offers"
  ON project_offers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
