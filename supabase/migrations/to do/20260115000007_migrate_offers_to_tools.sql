-- Migration: Migrate existing Offers → Tools platform
-- This migration:
-- 1. Creates tools for unique providers from offers table
-- 2. Attaches existing offers as tool_offers
-- 3. Maps recommended_for_courses to tool_courses
-- 4. Preserves all referral logic and offer data

-- ============================================================================
-- STEP 1: Create tools from unique providers
-- ============================================================================

-- Insert tools for each unique provider in offers table
-- Only create tools that don't already exist
INSERT INTO tools (name, slug, description, category, logo_url, website_url, docs_url)
SELECT DISTINCT ON (LOWER(provider))
  provider AS name,
  LOWER(REPLACE(REPLACE(provider, ' ', '-'), '.', '')) AS slug,
  -- Use the first offer's description as tool description
  (SELECT description FROM offers o2 WHERE o2.provider = o1.provider AND o2.description IS NOT NULL LIMIT 1) AS description,
  -- Use the most common category for this provider
  (SELECT category FROM offers o2 WHERE o2.provider = o1.provider GROUP BY category ORDER BY COUNT(*) DESC LIMIT 1) AS category,
  -- Try to construct logo URL (can be updated later)
  NULL AS logo_url,
  -- Try to construct website URL from provider name
  CASE 
    WHEN provider ILIKE '%supabase%' THEN 'https://supabase.com'
    WHEN provider ILIKE '%openai%' OR provider ILIKE '%open ai%' THEN 'https://openai.com'
    WHEN provider ILIKE '%cursor%' THEN 'https://cursor.sh'
    WHEN provider ILIKE '%vercel%' THEN 'https://vercel.com'
    WHEN provider ILIKE '%anthropic%' OR provider ILIKE '%claude%' THEN 'https://anthropic.com'
    WHEN provider ILIKE '%github%' THEN 'https://github.com'
    WHEN provider ILIKE '%stripe%' THEN 'https://stripe.com'
    WHEN provider ILIKE '%twilio%' THEN 'https://twilio.com'
    WHEN provider ILIKE '%sendgrid%' THEN 'https://sendgrid.com'
    WHEN provider ILIKE '%aws%' OR provider ILIKE '%amazon%' THEN 'https://aws.amazon.com'
    WHEN provider ILIKE '%google%' THEN 'https://cloud.google.com'
    ELSE 'https://' || LOWER(REPLACE(REPLACE(provider, ' ', ''), '.', '')) || '.com'
  END AS website_url,
  NULL AS docs_url
FROM offers o1
WHERE is_active = true
  AND provider IS NOT NULL
  AND provider != ''
  -- Only create tools that don't already exist
  AND NOT EXISTS (
    SELECT 1 FROM tools t 
    WHERE LOWER(t.name) = LOWER(o1.provider)
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- STEP 2: Create tool_offers from existing offers
-- ============================================================================

-- Map existing offers to tool_offers
-- Match by provider name
INSERT INTO tool_offers (
  tool_id,
  title,
  description,
  discount_type,
  value_display,
  eligibility,
  expires_at,
  requires_course_completion,
  required_course_id,
  claim_url,
  is_active,
  created_at
)
SELECT 
  t.id AS tool_id,
  o.title,
  o.description,
  -- Map discount_type from offers to tool_offers format
  CASE o.discount_type
    WHEN 'percentage' THEN 'percent'
    WHEN 'fixed_amount' THEN 'credits' -- Assuming fixed_amount is credits
    WHEN 'free_credits' THEN 'credits'
    WHEN 'extended_trial' THEN 'trial'
    WHEN 'tier_upgrade' THEN 'free_tier'
    ELSE 'credits'
  END AS discount_type,
  -- Create value_display from discount_text or discount_value
  COALESCE(
    o.discount_text,
    CASE 
      WHEN o.discount_type = 'percentage' AND o.discount_value IS NOT NULL 
        THEN o.discount_value::text || '% off'
      WHEN o.discount_type = 'fixed_amount' AND o.discount_value IS NOT NULL 
        THEN '$' || o.discount_value::text || ' off'
      WHEN o.discount_type = 'free_credits' AND o.discount_value IS NOT NULL 
        THEN '$' || o.discount_value::text || ' credits'
      ELSE o.discount_text
    END,
    'Special offer'
  ) AS value_display,
  -- Map eligibility
  CASE 
    WHEN o.eligibility ILIKE '%student%' THEN 'students_only'
    WHEN o.eligibility ILIKE '%new user%' OR o.eligibility ILIKE '%new account%' THEN 'new_users'
    ELSE 'open'
  END AS eligibility,
  o.expiration_date AS expires_at,
  -- Determine if offer requires course completion
  -- Only set to true if we can find the required course
  CASE 
    WHEN o.recommended_for_courses IS NOT NULL 
      AND array_length(o.recommended_for_courses, 1) > 0
      AND EXISTS (
        SELECT 1 FROM courses c 
        WHERE c.slug = o.recommended_for_courses[1]
      )
      THEN true
    ELSE false
  END AS requires_course_completion,
  -- Get required_course_id from first recommended course (only if course exists)
  (
    SELECT c.id 
    FROM courses c 
    WHERE c.slug = o.recommended_for_courses[1]
    LIMIT 1
  ) AS required_course_id,
  -- Use external_url or fallback to provider website
  COALESCE(
    o.external_url,
    t.website_url,
    'https://' || LOWER(REPLACE(REPLACE(o.provider, ' ', ''), '.', '')) || '.com'
  ) AS claim_url,
  o.is_active,
  o.created_at
FROM offers o
INNER JOIN tools t ON LOWER(t.name) = LOWER(o.provider)
WHERE o.is_active = true
  -- Only migrate offers that haven't been migrated yet
  AND NOT EXISTS (
    SELECT 1 FROM tool_offers to2 
    WHERE to2.title = o.title 
      AND to2.tool_id = t.id
  );

-- ============================================================================
-- STEP 3: Create tool_courses from recommended_for_courses
-- ============================================================================

-- Map recommended_for_courses to tool_courses
-- This creates the many-to-many relationship between tools and courses
INSERT INTO tool_courses (tool_id, course_id)
SELECT DISTINCT
  t.id AS tool_id,
  c.id AS course_id
FROM offers o
INNER JOIN tools t ON LOWER(t.name) = LOWER(o.provider)
CROSS JOIN LATERAL unnest(o.recommended_for_courses) AS course_slug
INNER JOIN courses c ON c.slug = course_slug
WHERE o.is_active = true
  AND o.recommended_for_courses IS NOT NULL
  AND array_length(o.recommended_for_courses, 1) > 0
  -- Only create relationships that don't already exist
  AND NOT EXISTS (
    SELECT 1 FROM tool_courses tc 
    WHERE tc.tool_id = t.id 
      AND tc.course_id = c.id
  );

-- ============================================================================
-- STEP 4: Preserve referral logic
-- ============================================================================

-- Note: Referral logic is preserved through:
-- 1. claim_url in tool_offers (contains external_url from offers)
-- 2. All offer metadata is preserved in tool_offers table
-- 3. Existing offers table remains intact (not deleted) for backward compatibility
-- 4. Analytics events can reference both offer_id (old) and tool_offers.id (new)

-- ============================================================================
-- STEP 5: Create migration mapping for backward compatibility
-- ============================================================================

-- Create mapping table if it doesn't exist (idempotent)
CREATE TABLE IF NOT EXISTS offer_migration_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  new_tool_offer_id UUID NOT NULL REFERENCES tool_offers(id) ON DELETE CASCADE,
  migrated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(old_offer_id, new_tool_offer_id)
);

CREATE INDEX IF NOT EXISTS idx_offer_migration_mapping_old_offer_id ON offer_migration_mapping(old_offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_migration_mapping_new_tool_offer_id ON offer_migration_mapping(new_tool_offer_id);

-- Populate mapping after tool_offers are created
-- Match by title, tool, and creation time proximity
INSERT INTO offer_migration_mapping (old_offer_id, new_tool_offer_id)
SELECT 
  o.id AS old_offer_id,
  to2.id AS new_tool_offer_id
FROM offers o
INNER JOIN tools t ON LOWER(t.name) = LOWER(o.provider)
INNER JOIN tool_offers to2 ON to2.tool_id = t.id 
  AND to2.title = o.title
  AND ABS(EXTRACT(EPOCH FROM (to2.created_at - o.created_at))) < 60 -- Within 1 minute (same migration)
WHERE o.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM offer_migration_mapping omm 
    WHERE omm.old_offer_id = o.id
  )
ON CONFLICT (old_offer_id, new_tool_offer_id) DO NOTHING;

-- ============================================================================
-- STEP 6: Update tool descriptions with aggregated offer information
-- ============================================================================

-- Update tool descriptions to include offer count and other metadata
UPDATE tools t
SET description = COALESCE(
  t.description,
  (
    SELECT 
      'Get exclusive offers and discounts for ' || t.name || '. ' ||
      COUNT(*)::text || ' active offer' || 
      CASE WHEN COUNT(*) != 1 THEN 's' ELSE '' END || ' available.'
    FROM tool_offers to2
    WHERE to2.tool_id = t.id
      AND to2.is_active = true
  ),
  'Developer tool and platform.'
)
WHERE description IS NULL OR description = '';

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================

-- Migration complete:
-- 1. ✅ Tools created from unique providers in offers table
-- 2. ✅ Existing offers attached as tool_offers
-- 3. ✅ Course relationships mapped via tool_courses
-- 4. ✅ Referral logic preserved (claim_url contains external_url)
-- 5. ✅ Migration mapping created for backward compatibility
-- 6. ✅ Tool descriptions updated with offer counts
--
-- Note: The old offers table is NOT deleted to maintain backward compatibility
-- Existing code can continue to reference offers table while new code uses tools
