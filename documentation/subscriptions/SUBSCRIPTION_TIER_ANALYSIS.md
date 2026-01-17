# Subscription Tier to Course Access Analysis

## Summary

This document analyzes how subscription tiers map to course access in the Supabase Postgres schema.

---

## 1. Enum Values for `subscription_tier`

### Enum Definition
The `subscription_tier` enum is defined in `20250113000001_create_subscriptions_and_access_control.sql`:

```sql
CREATE TYPE subscription_tier AS ENUM ('essential', 'professional');
```

### Enum Values:
- **`'essential'`** → **"Essential Access"** ✅
- **`'professional'`** → "Professional Access"

**Answer:** The enum value `'essential'` corresponds to **"Essential Access"**.

---

## 2. Tier Configuration Storage

### Tables:

#### `public.subscription_tier_config`
Stores tier metadata and configuration:
- **Primary Key:** `tier` (subscription_tier enum)
- **Columns:**
  - `tier` - The subscription tier enum value
  - `name` - Display name (e.g., "Essential Access")
  - `description` - Tier description
  - `price_monthly` - Monthly price (NUMERIC)
  - `currency` - Currency code (default: 'GBP')
  - `has_all_access` - Boolean flag (if true, grants access to ALL courses)
  - `stripe_product_id` - Stripe Product ID (added in migration 20250117000001)
  - `stripe_price_id` - Stripe Price ID (added in migration 20250113000006)
  - `created_at`, `updated_at` - Timestamps

#### `public.subscription_tier_courses`
Maps specific courses to tiers (only used when `has_all_access = false`):
- **Columns:**
  - `tier` - The subscription tier enum value
  - `course_id` - UUID reference to `courses.id`
  - `created_at` - Timestamp
- **Unique Constraint:** `(tier, course_id)`

### Current Configuration:

| Tier | Name | Price | Has All Access | Stripe Product ID |
|------|------|-------|----------------|-------------------|
| `essential` | Essential Access | £39/month | ❌ No | `prod_Tly7fWmByUigSA` |
| `professional` | Professional Access | £79/month | ✅ Yes | `prod_Tly7hTXuqPVic4` |

---

## 3. SQL Queries

### Query 1: All Tiers + Their Config
```sql
SELECT 
    stc.tier,
    stc.name,
    stc.description,
    stc.price_monthly,
    stc.currency,
    stc.has_all_access,
    stc.stripe_product_id,
    stc.stripe_price_id,
    CASE 
        WHEN stc.has_all_access THEN '✅ All courses'
        ELSE '❌ Limited courses (see subscription_tier_courses)'
    END AS access_type
FROM subscription_tier_config stc
ORDER BY 
    CASE stc.tier
        WHEN 'essential' THEN 1
        WHEN 'professional' THEN 2
        ELSE 3
    END;
```

### Query 2: Course Entitlements by Tier (Aggregated)
```sql
SELECT 
    stc.tier,
    stc.name AS tier_name,
    stc.has_all_access,
    CASE 
        WHEN stc.has_all_access THEN 'ALL COURSES' 
        ELSE 'LIMITED COURSES'
    END AS access_type,
    COALESCE(
        json_agg(
            json_build_object(
                'course_id', c.id,
                'slug', c.slug,
                'title', c.title,
                'is_published', c.is_published
            ) ORDER BY c.slug
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
    ) AS entitled_courses,
    COUNT(c.id) AS course_count
FROM subscription_tier_config stc
LEFT JOIN subscription_tier_courses stc_courses 
    ON stc.tier = stc_courses.tier 
    AND stc.has_all_access = false
LEFT JOIN courses c 
    ON stc_courses.course_id = c.id
GROUP BY stc.tier, stc.name, stc.has_all_access
ORDER BY 
    CASE stc.tier
        WHEN 'essential' THEN 1
        WHEN 'professional' THEN 2
        ELSE 3
    END;
```

### Query 3: Course Entitlements by Tier (Detailed)
```sql
SELECT 
    stc.tier,
    stc.name AS tier_name,
    stc.has_all_access,
    CASE 
        WHEN stc.has_all_access THEN 'ALL COURSES (no explicit mapping needed)'
        ELSE c.slug
    END AS course_slug,
    CASE 
        WHEN stc.has_all_access THEN 'All published courses'
        ELSE c.title
    END AS course_title,
    CASE 
        WHEN stc.has_all_access THEN NULL
        ELSE c.is_published
    END AS is_published
FROM subscription_tier_config stc
LEFT JOIN subscription_tier_courses stc_courses 
    ON stc.tier = stc_courses.tier 
    AND stc.has_all_access = false
LEFT JOIN courses c 
    ON stc_courses.course_id = c.id
ORDER BY 
    CASE stc.tier
        WHEN 'essential' THEN 1
        WHEN 'professional' THEN 2
        ELSE 3
    END,
    c.slug;
```

**Note:** All queries are available in `supabase/queries/subscription_tier_analysis.sql`

---

## 4. What's In Place vs What's Missing

### ✅ What's Already in Place:

1. **Enum Definition:** `subscription_tier` enum with `'essential'` and `'professional'` values
2. **Tier Configuration Table:** `subscription_tier_config` with all necessary fields
3. **Course Mapping Table:** `subscription_tier_courses` for explicit course-to-tier mappings
4. **Essential Access Configuration:**
   - Tier config exists with name "Essential Access"
   - Price: £39/month
   - `has_all_access = false` (correctly set)
   - Stripe Product ID: `prod_Tly7fWmByUigSA`
5. **Professional Access Configuration:**
   - Tier config exists with name "Professional Access"
   - Price: £79/month
   - `has_all_access = true` (correctly set)
   - Stripe Product ID: `prod_Tly7hTXuqPVic4`
6. **Access Control Function:** `has_course_access(user_id, course_id)` function exists
7. **RLS Policies:** Proper Row Level Security policies are in place
8. **Seed Data:** Migration `20250113000002_seed_subscription_tiers_and_courses.sql` seeds:
   - Both tier configurations
   - Essential Access mapped to 5 specific courses:
     - `prompt-engineering`
     - `ai-content-pipelines`
     - `reddit-ai-visibility`
     - `seo-to-aeo`
     - `ai-governance-eu-ai-act`

### ⚠️ Potential Issues / Missing Items:

1. **Stripe Price IDs:** 
   - The `stripe_price_id` column exists but may not be populated
   - Migration `20250113000006_add_stripe_fields.sql` adds the column but doesn't seed values
   - **Action Needed:** Populate `stripe_price_id` for each tier (monthly and annual if applicable)

2. **Annual Billing Support:**
   - Current schema only supports monthly pricing
   - Annual product IDs are mentioned in comments but not stored:
     - Essential Annual: `prod_Tly9xah25V3791`
     - Professional Annual: `prod_TlyAaxUClcCq9n`
   - **Action Needed:** If annual billing is required, consider:
     - Adding `price_annual` column
     - Or creating separate tier configs for annual plans
     - Or using a `billing_interval` field

3. **Course Verification:**
   - The seed script maps courses by slug, but doesn't verify they exist
   - **Action Needed:** Run verification query to ensure all 5 Essential Access courses exist and are published

4. **Missing Indexes:**
   - No composite index on `subscription_tier_courses(tier, course_id)` for faster lookups
   - **Note:** Unique constraint exists, but explicit index might help

5. **Documentation:**
   - No clear documentation on how to add/remove courses from Essential Access
   - **Action Needed:** Create admin guide for managing tier-course mappings

---

## 5. Verification Queries

### Check if Essential Access courses exist:
```sql
SELECT 
    'Expected Essential Access Courses' AS check_type,
    c.slug,
    c.title,
    c.is_published,
    CASE 
        WHEN c.id IS NULL THEN '❌ MISSING'
        WHEN c.is_published = false THEN '⚠️  EXISTS BUT NOT PUBLISHED'
        WHEN EXISTS (
            SELECT 1 FROM subscription_tier_courses stc_courses
            WHERE stc_courses.tier = 'essential'::subscription_tier
            AND stc_courses.course_id = c.id
        ) THEN '✅ MAPPED'
        ELSE '⚠️  EXISTS BUT NOT MAPPED'
    END AS status
FROM (VALUES
    ('prompt-engineering'),
    ('ai-content-pipelines'),
    ('reddit-ai-visibility'),
    ('seo-to-aeo'),
    ('ai-governance-eu-ai-act')
) AS expected(slug)
LEFT JOIN courses c ON c.slug = expected.slug
ORDER BY status, c.slug;
```

---

## 6. Recommendations

1. **Populate Stripe Price IDs:** Ensure `stripe_price_id` is set for both tiers
2. **Add Verification Script:** Create a script to verify all Essential Access courses exist and are mapped
3. **Consider Annual Plans:** If needed, extend schema to support annual billing
4. **Add Admin Interface:** Consider creating admin functions/APIs to manage tier-course mappings
5. **Add Monitoring:** Track which courses are accessed by which tier for analytics

---

## Files Reference

- **Schema Creation:** `supabase/migrations/20250113000001_create_subscriptions_and_access_control.sql`
- **Seed Data:** `supabase/migrations/20250113000002_seed_subscription_tiers_and_courses.sql`
- **Stripe Integration:** 
  - `supabase/migrations/20250113000006_add_stripe_fields.sql`
  - `supabase/migrations/20250117000001_add_stripe_product_ids.sql`
  - `supabase/migrations/20250117000002_update_stripe_product_ids.sql`
- **Analysis Queries:** `supabase/queries/subscription_tier_analysis.sql`
