-- Create Content Systems Studio tables
-- Tables: content_items, content_audit_events, content_variants
-- RLS: Students can only read/write their own data

BEGIN;

-- Create workflow_state enum type (idempotent)
DO $$ BEGIN
    CREATE TYPE workflow_state AS ENUM ('draft', 'review', 'approved', 'localised');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create content_items table
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  schema_id VARCHAR(255) NOT NULL,
  schema_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
  locale VARCHAR(10) NOT NULL,
  fields JSONB NOT NULL DEFAULT '{}',
  status workflow_state NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create content_audit_events table (append-only)
CREATE TABLE IF NOT EXISTS content_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event JSONB NOT NULL
);

-- Create content_variants table
CREATE TABLE IF NOT EXISTS content_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  variant JSONB NOT NULL
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_content_items_student_profile_id ON content_items(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_content_items_schema_id ON content_items(schema_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_audit_events_content_item_id ON content_audit_events(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_audit_events_student_profile_id ON content_audit_events(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_content_audit_events_created_at ON content_audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_content_variants_parent_content_item_id ON content_variants(parent_content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_variants_student_profile_id ON content_variants(student_profile_id);

-- Create trigger to update updated_at (idempotent)
DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
CREATE TRIGGER update_content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_items

-- Students can read their own content items
DROP POLICY IF EXISTS "Students can read own content items" ON content_items;
CREATE POLICY "Students can read own content items"
  ON content_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = content_items.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own content items
DROP POLICY IF EXISTS "Students can insert own content items" ON content_items;
CREATE POLICY "Students can insert own content items"
  ON content_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = content_items.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can update their own content items
DROP POLICY IF EXISTS "Students can update own content items" ON content_items;
CREATE POLICY "Students can update own content items"
  ON content_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = content_items.student_profile_id
      AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = content_items.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can delete their own content items
DROP POLICY IF EXISTS "Students can delete own content items" ON content_items;
CREATE POLICY "Students can delete own content items"
  ON content_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = content_items.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Optional: Instructors and admins can read for demo purposes
DROP POLICY IF EXISTS "Instructors and admins can read content items" ON content_items;
CREATE POLICY "Instructors and admins can read content items"
  ON content_items
  FOR SELECT
  USING (
    is_instructor(auth.uid()) OR is_admin(auth.uid())
  );

-- RLS Policies for content_audit_events (append-only)

-- Students can read their own audit events
DROP POLICY IF EXISTS "Students can read own audit events" ON content_audit_events;
CREATE POLICY "Students can read own audit events"
  ON content_audit_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = content_audit_events.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own audit events (append-only, no updates/deletes)
DROP POLICY IF EXISTS "Students can insert own audit events" ON content_audit_events;
CREATE POLICY "Students can insert own audit events"
  ON content_audit_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = content_audit_events.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Optional: Instructors and admins can read for demo purposes
DROP POLICY IF EXISTS "Instructors and admins can read audit events" ON content_audit_events;
CREATE POLICY "Instructors and admins can read audit events"
  ON content_audit_events
  FOR SELECT
  USING (
    is_instructor(auth.uid()) OR is_admin(auth.uid())
  );

-- RLS Policies for content_variants

-- Students can read their own variants
DROP POLICY IF EXISTS "Students can read own variants" ON content_variants;
CREATE POLICY "Students can read own variants"
  ON content_variants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = content_variants.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Students can insert their own variants
DROP POLICY IF EXISTS "Students can insert own variants" ON content_variants;
CREATE POLICY "Students can insert own variants"
  ON content_variants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM student_profiles sp
      JOIN profiles p ON p.id = sp.profile_id
      WHERE sp.id = content_variants.student_profile_id
      AND p.user_id = auth.uid()
    )
  );

-- Optional: Instructors and admins can read for demo purposes
DROP POLICY IF EXISTS "Instructors and admins can read variants" ON content_variants;
CREATE POLICY "Instructors and admins can read variants"
  ON content_variants
  FOR SELECT
  USING (
    is_instructor(auth.uid()) OR is_admin(auth.uid())
  );

COMMIT;
