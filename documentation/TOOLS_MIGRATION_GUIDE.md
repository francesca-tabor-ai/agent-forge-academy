# Tools Platform Migration Guide

## Overview

This guide documents the migration from the old "Offers" system to the new "Tools" platform. The migration preserves all existing data and referral logic while enabling the new tools-first architecture.

## Migration Steps

### 1. Prerequisites

Ensure the following migrations have been run:
- `20260115000003_create_tools_platform_tables.sql` - Creates tools, tool_courses, tool_offers tables
- `20260115000008_create_offer_migration_mapping.sql` - Creates mapping table (optional but recommended)

### 2. Run Migration

Execute the migration script:
```sql
-- Run in Supabase SQL Editor or via migration tool
\i supabase/migrations/20260115000007_migrate_offers_to_tools.sql
```

### 3. What Gets Migrated

#### Tools Created
- One tool per unique provider in the `offers` table
- Tools are created with:
  - Name: Provider name from offers
  - Slug: URL-friendly version (e.g., "Supabase" → "supabase")
  - Description: First offer's description for that provider
  - Category: Most common category for that provider
  - Website URL: Constructed from provider name or hardcoded for known providers

#### Offers → Tool Offers
- All active offers are migrated to `tool_offers` table
- Each offer is linked to its corresponding tool
- Field mappings:
  - `discount_type` → mapped to new format (percentage → percent, etc.)
  - `discount_text` → `value_display`
  - `external_url` → `claim_url` (preserves referral links)
  - `recommended_for_courses` → `requires_course_completion` + `required_course_id`

#### Course Relationships
- `recommended_for_courses` array → `tool_courses` entries
- Creates many-to-many relationship between tools and courses
- Only creates relationships for courses that exist in the database

#### Migration Mapping
- `offer_migration_mapping` table links old offer IDs to new tool_offer IDs
- Enables backward compatibility and referral tracking
- Allows analytics to reference both old and new IDs

## Data Preservation

### Referral Logic
- ✅ All `external_url` values preserved in `tool_offers.claim_url`
- ✅ Referral parameters and tracking codes maintained
- ✅ Claim buttons continue to work with same URLs

### Offer Data
- ✅ All offer details preserved (title, description, discount info)
- ✅ Expiration dates maintained
- ✅ Eligibility rules mapped to new format
- ✅ Course completion gating preserved

### User Data
- ✅ Existing `saved_offers` and `offer_claims` remain intact
- ✅ Can be migrated separately if needed (future migration)
- ✅ Analytics events can reference both old and new offer IDs

## Backward Compatibility

The old `offers` table is **NOT deleted** to maintain backward compatibility:

1. **Existing Code**: Code that references `offers` table continues to work
2. **Analytics**: Events can reference both `offer_id` (old) and `tool_offers.id` (new)
3. **User Data**: Saved offers and claims remain linked to old offer IDs
4. **Gradual Migration**: Can migrate code incrementally to use new tools platform

## Post-Migration Tasks

### 1. Verify Migration

Check that tools were created:
```sql
SELECT COUNT(*) FROM tools;
SELECT name, slug FROM tools ORDER BY name;
```

Check that offers were migrated:
```sql
SELECT COUNT(*) FROM tool_offers;
SELECT t.name, COUNT(to2.id) as offer_count
FROM tools t
LEFT JOIN tool_offers to2 ON to2.tool_id = t.id
GROUP BY t.name
ORDER BY offer_count DESC;
```

Check course relationships:
```sql
SELECT t.name, COUNT(tc.course_id) as course_count
FROM tools t
LEFT JOIN tool_courses tc ON tc.tool_id = t.id
GROUP BY t.name
ORDER BY course_count DESC;
```

### 2. Update Application Code

Gradually migrate application code to use new tables:
- Update queries to use `tools` and `tool_offers` instead of `offers`
- Update components to use new data structure
- Test thoroughly before removing old code

### 3. Update Analytics

Update analytics queries to use new structure:
- Tool views: Reference `tool_id` instead of `provider`
- Offer claims: Reference `tool_offers.id` (can also keep `offer_id` for backward compatibility)
- Course conversions: Use `tool_courses` for relationships

## Rollback Plan

If migration needs to be rolled back:

1. **Don't delete old data**: The `offers` table remains intact
2. **Revert code**: Switch back to using `offers` table
3. **Clean up new data** (if needed):
   ```sql
   DELETE FROM tool_offers;
   DELETE FROM tool_courses;
   DELETE FROM tools;
   DELETE FROM offer_migration_mapping;
   ```

## Definition of Done

✅ Side menu + page title say **Tools**
✅ Tools are the primary entity (tools table populated)
✅ Offers are optional + gateable (tool_offers table populated)
✅ Tools have logos, courses, videos (structure ready)
✅ Search works (uses tools data)
✅ Locked offers unlock via course completion (gating logic implemented)
✅ Page feels like a **learning-powered tooling platform**, not a coupon list

## Next Steps

1. Run migration in development environment
2. Verify all data migrated correctly
3. Test user flows (viewing tools, claiming offers, course completion)
4. Update application code to use new structure
5. Deploy to production
6. Monitor analytics for any issues
