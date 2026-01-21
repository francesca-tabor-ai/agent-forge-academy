-- Create mapping table to preserve link between old offers and new tool_offers
-- This allows backward compatibility and referral tracking

CREATE TABLE IF NOT EXISTS offer_migration_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  new_tool_offer_id UUID NOT NULL REFERENCES tool_offers(id) ON DELETE CASCADE,
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(old_offer_id, new_tool_offer_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_offer_migration_mapping_old_offer_id ON offer_migration_mapping(old_offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_migration_mapping_new_tool_offer_id ON offer_migration_mapping(new_tool_offer_id);

-- Enable RLS
ALTER TABLE offer_migration_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view mappings
DROP POLICY IF EXISTS "Authenticated users can view offer mappings" ON offer_migration_mapping;
CREATE POLICY "Authenticated users can view offer mappings"
  ON offer_migration_mapping
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Admins can manage mappings
DROP POLICY IF EXISTS "Admins can manage offer mappings" ON offer_migration_mapping;
CREATE POLICY "Admins can manage offer mappings"
  ON offer_migration_mapping
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Populate mapping table after migration
-- This should be run after the main migration
INSERT INTO offer_migration_mapping (old_offer_id, new_tool_offer_id)
SELECT 
  o.id AS old_offer_id,
  to2.id AS new_tool_offer_id
FROM offers o
INNER JOIN tools t ON LOWER(t.name) = LOWER(o.provider)
INNER JOIN tool_offers to2 ON to2.tool_id = t.id 
  AND to2.title = o.title
  AND to2.created_at >= (SELECT MIN(created_at) FROM tool_offers WHERE tool_id = t.id)
WHERE o.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM offer_migration_mapping omm 
    WHERE omm.old_offer_id = o.id
  );

COMMENT ON TABLE offer_migration_mapping IS 'Maps old offers table IDs to new tool_offers IDs for backward compatibility and referral tracking';
