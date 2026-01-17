# Subscription & Access Model

## Overview

This document describes the subscription-based access control system for the AI education platform. The system supports two subscription tiers with different course access levels.

## Subscription Tiers

### 1. Essential Access (£39/month)
- **Price**: £39.00 per month
- **Access**: Limited to 5 specific courses:
  1. Prompt Engineering (`prompt-engineering`)
  2. AI-Content Pipelines (`ai-content-pipelines`)
  3. Reddit AI Visibility (`reddit-ai-visibility`)
  4. SEO → AEO (`seo-to-aeo`)
  5. AI Governance & the EU AI Act (`ai-governance-eu-ai-act`)

### 2. Professional Access (£79/month)
- **Price**: £79.00 per month
- **Access**: All courses on the platform

## Database Schema

### Tables

#### 1. `subscriptions`
Stores active subscriptions for students.

**Key Fields:**
- `id` (UUID, Primary Key)
- `student_profile_id` (UUID, Foreign Key → `student_profiles.id`, Unique)
- `tier` (subscription_tier enum: 'essential' | 'professional')
- `status` (subscription_status enum: 'active' | 'trial' | 'paused' | 'canceled' | 'expired')
- `price_monthly` (NUMERIC(10, 2))
- `currency` (VARCHAR(3), default 'GBP')
- `started_at` (TIMESTAMPTZ)
- `current_period_start` (TIMESTAMPTZ)
- `current_period_end` (TIMESTAMPTZ)
- `canceled_at` (TIMESTAMPTZ, nullable)
- `trial_end_at` (TIMESTAMPTZ, nullable)
- `stripe_subscription_id` (VARCHAR(255), nullable) - For payment provider integration

**Constraints:**
- One subscription per student (UNIQUE constraint on `student_profile_id`)
- `price_monthly > 0`
- `current_period_end > current_period_start`

#### 2. `subscription_tier_config`
Stores metadata for each subscription tier.

**Key Fields:**
- `tier` (subscription_tier enum, Primary Key)
- `name` (VARCHAR(255)) - Display name
- `description` (TEXT)
- `price_monthly` (NUMERIC(10, 2))
- `currency` (VARCHAR(3), default 'GBP')
- `has_all_access` (BOOLEAN) - If `true`, grants access to all courses

**Design Decision:**
- `has_all_access` flag allows Professional tier to bypass course mapping
- Essential tier has `has_all_access = false` and relies on explicit course mappings

#### 3. `subscription_tier_courses`
Junction table mapping subscription tiers to specific courses.

**Key Fields:**
- `id` (UUID, Primary Key)
- `tier` (subscription_tier enum, Foreign Key)
- `course_id` (UUID, Foreign Key → `courses.id`)
- `created_at` (TIMESTAMPTZ)

**Constraints:**
- Unique combination of `tier` and `course_id`

**Design Decision:**
- Only Essential tier has entries in this table
- Professional tier doesn't need entries because `has_all_access = true`

### Enums

#### `subscription_tier`
```sql
'enum' | 'essential' | 'professional'
```

#### `subscription_status`
```sql
'enum' | 'active' | 'trial' | 'paused' | 'canceled' | 'expired'
```

## Access Control Logic

### Database Function: `has_course_access()`

The system uses a PostgreSQL function to check course access:

```sql
has_course_access(p_user_id UUID, p_course_id UUID) RETURNS BOOLEAN
```

**Logic:**
1. Verify course exists and is published
2. Check if user has an active subscription:
   - Status must be `'active'`
   - `current_period_end > NOW()`
3. If no active subscription → deny access
4. If tier has `has_all_access = true` → grant access
5. Otherwise, check if course exists in `subscription_tier_courses` for that tier

### Row Level Security (RLS)

#### Course Enrollments
- Students can only enroll in courses they have subscription access to
- Policy uses `has_course_access()` function to verify access

#### Subscriptions
- Students can view their own subscription
- Admins can view and manage all subscriptions

#### Subscription Tier Config & Mappings
- Public read access (needed for access checks)
- Admin-only write access

## API Integration

### Enrollment Endpoint
`POST /api/courses/enroll`

**Access Check:**
- Verifies subscription access before allowing enrollment
- Returns 403 with `requires_subscription: true` if access denied

**Example Response (Access Denied):**
```json
{
  "error": "Course access denied. Please upgrade your subscription to access this course.",
  "requires_subscription": true
}
```

## Design Decisions

### 1. Hybrid Access Model
- **Why**: Flexible and maintainable
- **How**: 
  - `has_all_access` flag for unlimited access tiers
  - Explicit course mapping for limited access tiers
- **Benefit**: Easy to add new tiers or modify access without schema changes

### 2. Single Active Subscription
- **Why**: Simplifies billing and access logic
- **How**: UNIQUE constraint on `student_profile_id`
- **Benefit**: No ambiguity about which subscription applies

### 3. Period-Based Access
- **Why**: Aligns with subscription billing cycles
- **How**: `current_period_start` and `current_period_end` fields
- **Benefit**: Automatic expiration handling

### 4. Database Function for Access Checks
- **Why**: Centralized logic, reusable across RLS and API
- **How**: `has_course_access()` function with `SECURITY DEFINER`
- **Benefit**: Consistent access control, easier to maintain

### 5. Course Mapping via Junction Table
- **Why**: Normalized design, easy to modify
- **How**: `subscription_tier_courses` table
- **Benefit**: Can add/remove courses from tiers without schema changes

## Usage Examples

### Check if User Has Access to Course
```sql
SELECT has_course_access('user-uuid', 'course-uuid');
```

### Get User's Subscription
```sql
SELECT s.*, stc.name, stc.has_all_access
FROM subscriptions s
JOIN subscription_tier_config stc ON stc.tier = s.tier
JOIN student_profiles sp ON sp.id = s.student_profile_id
JOIN profiles p ON p.id = sp.profile_id
WHERE p.user_id = 'user-uuid'
  AND s.status = 'active'
  AND s.current_period_end > NOW();
```

### Get Courses Available to Tier
```sql
-- For Essential tier (limited access)
SELECT c.*
FROM courses c
JOIN subscription_tier_courses stc ON stc.course_id = c.id
WHERE stc.tier = 'essential'
  AND c.is_published = true;

-- For Professional tier (all access)
SELECT *
FROM courses
WHERE is_published = true;
```

## Migration Files

1. `20250113000001_create_subscriptions_and_access_control.sql`
   - Creates subscription tables, enums, and access function
   - Sets up RLS policies

2. `20250113000002_seed_subscription_tiers_and_courses.sql`
   - Seeds tier configurations
   - Maps Essential tier to 5 specific courses

3. `20250113000003_update_course_enrollment_rls_with_subscription_check.sql`
   - Updates enrollment RLS to enforce subscription access

## Future Enhancements

1. **Payment Integration**: Connect `stripe_subscription_id` to payment provider
2. **Trial Periods**: Implement trial logic using `trial_end_at`
3. **Upgrade/Downgrade**: Handle tier changes mid-period
4. **Proration**: Calculate prorated charges for tier changes
5. **Usage Tracking**: Track course access attempts for analytics
