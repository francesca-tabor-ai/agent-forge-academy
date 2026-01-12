# Managing Tier-to-Course Entitlements

This document describes how to manage subscription tier course entitlements in a maintainable way.

## Overview

Course entitlements are stored in `public.subscription_tier_courses` and determine which courses each subscription tier can access. This is the **source of truth** for tier entitlements.

## Two Approaches

### Option A: Seed/Update Script Pattern (Recommended for Version Control)

**File:** `supabase/seed/update_tier_entitlements.sql`

**When to use:**
- Version-controlled updates
- Bulk changes
- Migrations
- Team collaboration (changes tracked in git)

**How it works:**
1. Lists course slugs in a VALUES clause
2. Uses replace-all semantics (deletes old, inserts new)
3. Idempotent - safe to run multiple times
4. Version-controlled in git

**Example:**
```sql
-- Update Essential Access entitlements
DELETE FROM subscription_tier_courses WHERE tier = 'essential';
INSERT INTO subscription_tier_courses (tier, course_id)
SELECT 'essential'::subscription_tier, c.id
FROM courses c
WHERE c.slug IN (
    'prompt-engineering',
    'ai-content-pipelines',
    'reddit-ai-visibility',
    'seo-to-aeo',
    'ai-governance-eu-ai-act'
);
```

**Run it:**
```bash
psql "$SUPABASE_DB_URL" -f supabase/seed/update_tier_entitlements.sql
```

### Option B: Admin Function (Recommended for Programmatic Updates)

**Function:** `public.set_tier_course_entitlements(tier, course_slugs[])`

**When to use:**
- Admin panels
- One-off changes
- Automation/scripts
- API integrations

**How it works:**
- Takes tier enum and array of course slugs
- Replaces all entitlements for that tier
- Returns JSONB with success status and counts
- Validates tier exists and doesn't have `has_all_access = true`

**Example:**
```sql
-- Update Essential Access to include 6 courses
SELECT set_tier_course_entitlements(
    'essential'::subscription_tier,
    ARRAY[
        'prompt-engineering',
        'ai-content-pipelines',
        'reddit-ai-visibility',
        'seo-to-aeo',
        'ai-governance-eu-ai-act',
        'spec-driven-development'  -- New course added
    ]
);
```

**Response:**
```json
{
  "success": true,
  "tier": "essential",
  "requested_courses": 6,
  "inserted_courses": 6,
  "deleted_courses": 5,
  "not_found_slugs": []
}
```

**From application code:**
```typescript
const { data, error } = await supabase.rpc('set_tier_course_entitlements', {
  p_tier: 'essential',
  p_course_slugs: [
    'prompt-engineering',
    'ai-content-pipelines',
    // ... etc
  ]
});
```

## Recommended Constraints & Indexes

The following are already in place (see migration `20250123000004_manage_tier_course_entitlements.sql`):

### Constraints
- **Unique constraint:** `(tier, course_id)` - prevents duplicate mappings
- **Foreign key:** `course_id` → `courses.id` ON DELETE CASCADE

### Indexes
- `idx_subscription_tier_courses_tier` - Fast filtering by tier
- `idx_subscription_tier_courses_course_id` - Reverse lookups (which tiers have access)
- `idx_subscription_tier_courses_tier_course_id` - Composite index for `has_course_access()` function

## Examples

### Example 1: Update Essential Access Entitlements (Script Pattern)

Edit `supabase/seed/update_tier_entitlements.sql`:

```sql
WHERE c.slug IN (
    'prompt-engineering',
    'ai-content-pipelines',
    'reddit-ai-visibility',
    'seo-to-aeo',
    'ai-governance-eu-ai-act',
    'spec-driven-development'  -- Add new course
)
```

Run:
```bash
psql "$SUPABASE_DB_URL" -f supabase/seed/update_tier_entitlements.sql
```

### Example 2: Update Essential Access Entitlements (Function)

```sql
SELECT set_tier_course_entitlements(
    'essential'::subscription_tier,
    ARRAY[
        'prompt-engineering',
        'ai-content-pipelines',
        'reddit-ai-visibility',
        'seo-to-aeo',
        'ai-governance-eu-ai-act',
        'spec-driven-development'
    ]
);
```

### Example 3: Remove a Course from Essential Access

**Script pattern:**
Remove the slug from the list in `update_tier_entitlements.sql` and run it.

**Function pattern:**
Call the function with the updated list (without the removed course).

### Example 4: Add a New Tier with Limited Access

1. Add tier to `subscription_tier_config`:
```sql
INSERT INTO subscription_tier_config (tier, name, price_monthly, has_all_access)
VALUES ('starter', 'Starter Access', 19.00, false);
```

2. Set entitlements using either approach:
```sql
-- Function approach
SELECT set_tier_course_entitlements(
    'starter'::subscription_tier,
    ARRAY['prompt-engineering', 'ai-content-pipelines']
);
```

Or add to the seed script:
```sql
-- In update_tier_entitlements.sql
DELETE FROM subscription_tier_courses WHERE tier = 'starter';
INSERT INTO subscription_tier_courses (tier, course_id)
SELECT 'starter'::subscription_tier, c.id
FROM courses c
WHERE c.slug IN ('prompt-engineering', 'ai-content-pipelines');
```

## Important Notes

1. **All-Access Tiers:** Tiers with `has_all_access = true` (like Professional) don't need entries in `subscription_tier_courses`. The system automatically grants access to all published courses.

2. **Use Slugs, Not IDs:** Always use course slugs in management scripts/functions. Course IDs are UUIDs and change between environments.

3. **Idempotency:** Both approaches are idempotent - safe to run multiple times.

4. **Validation:** The function validates that:
   - Tier exists
   - Tier doesn't have `has_all_access = true`
   - Course slugs exist (warns if not found)

5. **Testing:** Always test changes in staging before applying to production.

## Workflow Recommendations

### For Regular Updates (Recommended)
1. Edit `supabase/seed/update_tier_entitlements.sql`
2. Commit to git
3. Run in staging
4. Verify entitlements
5. Run in production
6. Commit migration if needed

### For Quick/One-Off Changes
1. Use `set_tier_course_entitlements()` function
2. Document change in git commit message
3. Optionally update seed script to match

### For Admin Panels
1. Build UI that calls `set_tier_course_entitlements()`
2. Show validation errors from function response
3. Log changes for audit trail

## Verification Queries

Check current entitlements:
```sql
SELECT 
    stc.tier,
    stc.name AS tier_name,
    COUNT(c.id) AS course_count,
    string_agg(c.slug, ', ' ORDER BY c.slug) AS courses
FROM subscription_tier_courses stc_courses
JOIN subscription_tier_config stc ON stc.tier = stc_courses.tier
JOIN courses c ON c.id = stc_courses.course_id
WHERE stc.has_all_access = false
GROUP BY stc.tier, stc.name
ORDER BY stc.tier;
```

Check if a specific course is in a tier:
```sql
SELECT EXISTS(
    SELECT 1 FROM subscription_tier_courses stc
    JOIN courses c ON c.id = stc.course_id
    WHERE stc.tier = 'essential'::subscription_tier
    AND c.slug = 'prompt-engineering'
);
```

## Troubleshooting

**Issue:** Function returns error "Tier has all_access=true"
- **Solution:** Tiers with all-access don't use `subscription_tier_courses`. Check `subscription_tier_config.has_all_access`.

**Issue:** Course slug not found
- **Solution:** Verify course exists and slug is correct. Check `courses` table.

**Issue:** Changes not taking effect
- **Solution:** Verify subscription is active and `current_period_end > NOW()`. Check `has_course_access()` function.
