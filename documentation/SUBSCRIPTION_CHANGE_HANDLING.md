# Subscription Change Handling

## Overview

This document describes the logic for handling subscription tier changes (upgrades and downgrades), including when access changes take effect, cache invalidation, preventing access inconsistencies, and handling in-progress courses.

## Change Types

### Upgrade: Essential → Professional

**When Access Changes Take Effect**: **Immediately**

- User gains access to all courses instantly
- No grace period needed
- Access is granted as soon as the database is updated

**Process**:
1. User initiates upgrade
2. Payment processed (if applicable)
3. Database updated with new tier
4. Cache invalidated
5. Access granted immediately

### Downgrade: Professional → Essential

**When Access Changes Take Effect**: **At Current Period End** (Grace Period)

- User retains access to all courses until `current_period_end`
- After period end, access restricted to Essential tier courses only
- In-progress courses in restricted list lose access after grace period

**Process**:
1. User initiates downgrade
2. Database updated with new tier
3. Access continues until `current_period_end`
4. Cache invalidated
5. Warning shown about courses losing access
6. After period end, access restricted

## Access Change Timeline

### Upgrade Timeline

```
T0: User clicks "Upgrade to Professional"
    ↓
T1: Payment processed (if required)
    ↓
T2: Database updated (tier = 'professional')
    ↓
T3: Cache invalidated (< 1 second)
    ↓
T4: Access granted immediately ✅
```

**Total Time**: < 5 seconds

### Downgrade Timeline

```
T0: User clicks "Downgrade to Essential"
    ↓
T1: Warning shown (courses losing access)
    ↓
T2: User confirms downgrade
    ↓
T3: Database updated (tier = 'essential')
    ↓
T4: Cache invalidated (< 1 second)
    ↓
T5: Access continues (grace period) ✅
    ↓
T6: current_period_end reached
    ↓
T7: Access restricted to Essential courses only ⚠️
```

**Grace Period**: Until `current_period_end` (typically end of billing month)

## Cache Invalidation Strategy

### What Gets Invalidated

1. **Server-Side Cache**:
   - Next.js page cache for `/student/courses`
   - Next.js page cache for `/student/subscription`
   - Next.js page cache for `/student/dashboard`
   - Course detail pages

2. **Cache Tags**:
   - `subscription:{userId}`
   - `course-access:{userId}`
   - `user-tier:{userId}`

3. **Client-Side Cache**:
   - localStorage subscription data
   - sessionStorage course access data
   - Browser cache (via router refresh)

### Invalidation Flow

```
Subscription Tier Changed
    ↓
Database Trigger Fires
    ↓
PostgreSQL NOTIFY Event
    ↓
Application Server Receives Event
    ↓
┌─────────────────────────────────┐
│ 1. Invalidate Next.js Cache     │
│ 2. Clear Redis Cache (if used)  │
│ 3. Send WebSocket Notification  │
│ 4. Trigger Client Refresh       │
└─────────────────────────────────┘
```

### Cache TTL Settings

- **Subscription Data**: 5 minutes (changes infrequently)
- **Course Access Checks**: 1 minute (can change immediately)
- **User Tier**: 5 minutes (changes infrequently)

## Preventing Access Inconsistencies

### Strategy 1: Database as Source of Truth

**Principle**: Always check database for current subscription status

```typescript
// ❌ BAD: Using cached value
const tier = cachedTier; // May be stale

// ✅ GOOD: Always query database
const tier = await getUserSubscriptionTier(userId);
```

### Strategy 2: Real-Time Access Checks

**Principle**: Use database function for access checks (not cached results)

```typescript
// ✅ GOOD: Database function always uses current data
const hasAccess = await supabase.rpc('has_course_access', {
  p_user_id: userId,
  p_course_id: courseId,
});
```

### Strategy 3: Period-Based Validation

**Principle**: Always validate subscription period in access checks

```typescript
// ✅ GOOD: Checks both tier AND period
SELECT tier FROM subscriptions
WHERE student_profile_id = ?
  AND status = 'active'
  AND current_period_end > NOW(); // Critical check
```

### Strategy 4: Transactional Updates

**Principle**: Use database transactions for tier changes

```sql
BEGIN;
  UPDATE subscriptions SET tier = ? WHERE id = ?;
  INSERT INTO subscription_change_log ...;
  -- All or nothing
COMMIT;
```

### Strategy 5: Event-Driven Invalidation

**Principle**: Use database triggers to notify on changes

```sql
-- Trigger fires on tier change
CREATE TRIGGER subscription_tier_change_notification
  AFTER UPDATE OF tier ON subscriptions
  FOR EACH ROW
  WHEN (OLD.tier IS DISTINCT FROM NEW.tier)
  EXECUTE FUNCTION notify_subscription_change();
```

## Handling In-Progress Courses

### On Upgrade

**Behavior**: All courses become accessible immediately

- ✅ No action needed
- ✅ User can continue any in-progress course
- ✅ User can access previously locked courses

### On Downgrade

**Behavior**: Courses not in Essential tier lose access after grace period

**Process**:

1. **Before Downgrade**:
   ```sql
   -- Check which courses will lose access
   SELECT * FROM get_courses_losing_access_on_downgrade(student_profile_id);
   ```

2. **Show Warning**:
   - List courses that will lose access
   - Show progress for each course
   - Require user confirmation

3. **After Downgrade**:
   - User retains access until `current_period_end`
   - Warning banner shown on restricted courses
   - User can complete courses during grace period

4. **After Grace Period**:
   - Access to restricted courses revoked
   - Enrollment remains (for historical record)
   - Progress preserved (can resume if user upgrades again)

### Course State Preservation

**What's Preserved**:
- ✅ Enrollment records (not deleted)
- ✅ Progress percentage
- ✅ Completion status
- ✅ Last accessed timestamp

**What's Restricted**:
- ❌ Course content access (after grace period)
- ❌ New enrollments in restricted courses
- ❌ Progress updates (can't continue)

**Resume on Upgrade**:
- If user upgrades again, all previous progress is restored
- User can continue from where they left off

## Implementation Details

### Database Functions

#### `change_subscription_tier()`

Changes subscription tier and logs the change.

**Parameters**:
- `p_subscription_id`: UUID of subscription
- `p_new_tier`: New tier ('essential' | 'professional')
- `p_effective_immediately`: Whether change takes effect immediately
- `p_prorated_amount`: Prorated billing amount (for upgrades)

**Returns**: JSONB with change details

**Behavior**:
- Validates current subscription
- Updates tier and price
- Logs change to audit table
- Triggers notification event

#### `get_courses_losing_access_on_downgrade()`

Returns list of courses that will lose access on downgrade.

**Returns**: Table with course details and progress

**Use Case**: Show warning before downgrade

### API Endpoints

#### `POST /api/subscription/change-tier`

Changes subscription tier.

**Request Body**:
```json
{
  "newTier": "professional",
  "effectiveImmediately": true
}
```

**Response** (Upgrade):
```json
{
  "success": true,
  "message": "Subscription upgraded successfully",
  "subscription": {
    "id": "...",
    "oldTier": "essential",
    "newTier": "professional",
    "changeType": "upgrade",
    "effectiveImmediately": true
  }
}
```

**Response** (Downgrade - Warning):
```json
{
  "error": "downgrade_warning",
  "message": "You have in-progress courses that will lose access",
  "coursesLosingAccess": [
    {
      "id": "...",
      "slug": "multi-agent-systems",
      "title": "Multi-Agent Systems",
      "progress": 45
    }
  ],
  "requiresConfirmation": true
}
```

#### `PUT /api/subscription/change-tier/confirm-downgrade`

Confirms downgrade after user acknowledges warning.

**Request Body**:
```json
{
  "newTier": "essential",
  "confirmed": true
}
```

### Cache Invalidation Functions

#### `invalidateSubscriptionCache(userId)`

Invalidates all subscription-related cache for a user.

**Actions**:
- Revalidates Next.js paths
- Clears cache tags
- Triggers client refresh

#### `invalidateClientCache()`

Clears browser-side cache.

**Actions**:
- Clears localStorage
- Clears sessionStorage
- Triggers router refresh

## Error Handling

### Edge Cases

1. **Concurrent Changes**:
   - Database transaction prevents race conditions
   - Last write wins (with proper locking)

2. **Payment Failures**:
   - Tier change rolled back
   - User remains on current tier
   - Error message shown

3. **Cache Invalidation Failures**:
   - Logged but don't block tier change
   - Background job retries invalidation
   - User may see stale data briefly (resolves on next request)

4. **Period End During Active Session**:
   - Access check validates period on each request
   - User redirected if period expired
   - Graceful degradation

## Testing Scenarios

### Scenario 1: Upgrade Flow
1. User has Essential tier
2. User upgrades to Professional
3. ✅ Access granted immediately
4. ✅ All courses become accessible
5. ✅ Cache invalidated

### Scenario 2: Downgrade Flow
1. User has Professional tier
2. User has 3 in-progress courses (2 restricted, 1 allowed)
3. User downgrades to Essential
4. ✅ Warning shown with 2 courses
5. ✅ User confirms
6. ✅ Access continues until period end
7. ✅ After period end, 2 courses locked

### Scenario 3: Cache Invalidation
1. User changes tier
2. ✅ Server cache invalidated
3. ✅ Client cache cleared
4. ✅ Next request fetches fresh data

### Scenario 4: Concurrent Access
1. User changes tier
2. User simultaneously accesses course
3. ✅ Database check uses current tier
4. ✅ No stale access granted

## Best Practices

1. **Always Validate Period**: Check `current_period_end > NOW()` in access checks
2. **Use Database Functions**: Prefer `has_course_access()` over cached checks
3. **Log All Changes**: Maintain audit trail in `subscription_change_log`
4. **Grace Periods**: Give users time to complete courses on downgrade
5. **Clear Communication**: Warn users about access changes
6. **Preserve Progress**: Never delete enrollment or progress data
7. **Fail-Secure**: Deny access if subscription status is unclear

## Future Enhancements

1. **Proration**: Calculate exact prorated amounts for mid-period changes
2. **Webhooks**: Real-time notifications to external systems
3. **WebSocket**: Push updates to connected clients
4. **Redis Cache**: Distributed cache invalidation
5. **Analytics**: Track upgrade/downgrade patterns
6. **Retention**: Offer incentives to prevent downgrades
