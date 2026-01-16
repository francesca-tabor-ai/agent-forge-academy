-- Create Pricing & Risk Lab tables
-- Tables: pricing_scenarios, pricing_experiments, pricing_snapshots, pricing_audit_events
-- RLS: Students can only read/write their own data

BEGIN;

-- Create pricing_scenarios table
CREATE TABLE IF NOT EXISTS pricing_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pricing_experiments table
CREATE TABLE IF NOT EXISTS pricing_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  draft JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pricing_snapshots table
CREATE TABLE IF NOT EXISTS pricing_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES pricing_experiments(id) ON DELETE SET NULL,
  snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create pricing_audit_events table (append-only)
CREATE TABLE IF NOT EXISTS pricing_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event JSONB NOT NULL DEFAULT '{}'
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pricing_scenarios_student_profile_id ON pricing_scenarios(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_pricing_scenarios_created_at ON pricing_scenarios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_experiments_student_profile_id ON pricing_experiments(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_pricing_experiments_status ON pricing_experiments(status);
CREATE INDEX IF NOT EXISTS idx_pricing_experiments_created_at ON pricing_experiments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_snapshots_student_profile_id ON pricing_snapshots(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_pricing_snapshots_experiment_id ON pricing_snapshots(experiment_id);
CREATE INDEX IF NOT EXISTS idx_pricing_snapshots_created_at ON pricing_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_audit_events_student_profile_id ON pricing_audit_events(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_pricing_audit_events_created_at ON pricing_audit_events(created_at DESC);

-- Create trigger to update updated_at (idempotent)
DROP TRIGGER IF EXISTS update_pricing_scenarios_updated_at ON pricing_scenarios;
CREATE TRIGGER update_pricing_scenarios_updated_at
  BEFORE UPDATE ON pricing_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pricing_experiments_updated_at ON pricing_experiments;
CREATE TRIGGER update_pricing_experiments_updated_at
  BEFORE UPDATE ON pricing_experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE pricing_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_audit_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pricing_scenarios

-- Students can read their own scenarios
DROP POLICY IF EXISTS "Students can read own pricing scenarios" ON pricing_scenarios;
CREATE POLICY "Students can read own pricing scenarios"
  ON pricing_scenarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_scenarios.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own scenarios
DROP POLICY IF EXISTS "Students can insert own pricing scenarios" ON pricing_scenarios;
CREATE POLICY "Students can insert own pricing scenarios"
  ON pricing_scenarios
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_scenarios.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can update their own scenarios
DROP POLICY IF EXISTS "Students can update own pricing scenarios" ON pricing_scenarios;
CREATE POLICY "Students can update own pricing scenarios"
  ON pricing_scenarios
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_scenarios.student_profile_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_scenarios.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can delete their own scenarios
DROP POLICY IF EXISTS "Students can delete own pricing scenarios" ON pricing_scenarios;
CREATE POLICY "Students can delete own pricing scenarios"
  ON pricing_scenarios
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_scenarios.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for pricing_experiments

-- Students can read their own experiments
DROP POLICY IF EXISTS "Students can read own pricing experiments" ON pricing_experiments;
CREATE POLICY "Students can read own pricing experiments"
  ON pricing_experiments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_experiments.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own experiments
DROP POLICY IF EXISTS "Students can insert own pricing experiments" ON pricing_experiments;
CREATE POLICY "Students can insert own pricing experiments"
  ON pricing_experiments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_experiments.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can update their own experiments
DROP POLICY IF EXISTS "Students can update own pricing experiments" ON pricing_experiments;
CREATE POLICY "Students can update own pricing experiments"
  ON pricing_experiments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_experiments.student_profile_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_experiments.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can delete their own experiments
DROP POLICY IF EXISTS "Students can delete own pricing experiments" ON pricing_experiments;
CREATE POLICY "Students can delete own pricing experiments"
  ON pricing_experiments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_experiments.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for pricing_snapshots

-- Students can read their own snapshots
DROP POLICY IF EXISTS "Students can read own pricing snapshots" ON pricing_snapshots;
CREATE POLICY "Students can read own pricing snapshots"
  ON pricing_snapshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_snapshots.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own snapshots
DROP POLICY IF EXISTS "Students can insert own pricing snapshots" ON pricing_snapshots;
CREATE POLICY "Students can insert own pricing snapshots"
  ON pricing_snapshots
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_snapshots.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can delete their own snapshots
DROP POLICY IF EXISTS "Students can delete own pricing snapshots" ON pricing_snapshots;
CREATE POLICY "Students can delete own pricing snapshots"
  ON pricing_snapshots
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_snapshots.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for pricing_audit_events (append-only)

-- Students can read their own audit events
DROP POLICY IF EXISTS "Students can read own pricing audit events" ON pricing_audit_events;
CREATE POLICY "Students can read own pricing audit events"
  ON pricing_audit_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_audit_events.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own audit events (append-only, no updates/deletes)
DROP POLICY IF EXISTS "Students can insert own pricing audit events" ON pricing_audit_events;
CREATE POLICY "Students can insert own pricing audit events"
  ON pricing_audit_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = pricing_audit_events.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Optional: Admins can read all audit events
DROP POLICY IF EXISTS "Admins can read all pricing audit events" ON pricing_audit_events;
CREATE POLICY "Admins can read all pricing audit events"
  ON pricing_audit_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

COMMIT;
