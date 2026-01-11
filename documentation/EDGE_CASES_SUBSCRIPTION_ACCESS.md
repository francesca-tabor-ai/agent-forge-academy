# Edge Case Analysis: Subscription-Based Course Access

## Overview

This document analyzes edge cases for subscription-based course access control and defines expected behavior, user-facing messages, and backend handling strategies for each case.

## Edge Cases

### 1. Expired Subscriptions

**Scenario**: User's subscription `current_period_end` has passed, but subscription record still exists.

**Expected Behavior**:
- ❌ Access denied to all courses
- ⚠️ User redirected to subscription page
- 📧 User notified about expired subscription
- 🔄 User can renew/reactivate subscription

**User-Facing Message**:
```
"Your subscription has expired. Please renew your subscription to continue accessing courses."
```

**Backend Handling Strategy**:
```typescript
// Check period_end on every access request
if (subscription.current_period_end <= NOW()) {
  // Update status to 'expired' if not already
  UPDATE subscriptions 
  SET status = 'expired' 
  WHERE id = ? AND current_period_end <= NOW();
  
  // Deny access
  return { allowed: false, status: 403, error: 'Subscription expired' };
}
```

**Implementation**:
- ✅ Already handled in `canUserAccessCourse()` - checks `periodEnd <= now`
- ✅ Database function `has_course_access()` validates period
- ⚠️ Should auto-update status to 'expired' when period ends

**Recovery Path**:
1. User visits subscription page
2. Sees expired status
3. Can renew/reactivate subscription
4. Access restored immediately after renewal

---

### 2. Payment Failures

**Scenario**: Payment provider reports failed payment, but subscription status may still be 'active'.

**Expected Behavior**:
- ⚠️ Access continues during grace period (typically 3-7 days)
- 📧 User notified of payment failure
- 🔒 Access revoked after grace period if payment not updated
- 💳 User prompted to update payment method

**User-Facing Message**:
```
"Your payment failed. Please update your payment method to avoid losing access. 
You have [X] days to update your payment before access is suspended."
```

**Backend Handling Strategy**:
```typescript
// Check payment status from payment provider
const paymentStatus = await checkPaymentStatus(subscription.stripe_subscription_id);

if (paymentStatus === 'failed' || paymentStatus === 'past_due') {
  // Calculate grace period
  const gracePeriodEnd = subscription.current_period_end + GRACE_PERIOD_DAYS;
  
  if (NOW() <= gracePeriodEnd) {
    // Still in grace period - allow access but show warning
    return { 
      allowed: true, 
      status: 200,
      warning: 'Payment failed - update payment method',
      gracePeriodDays: calculateDaysRemaining(gracePeriodEnd)
    };
  } else {
    // Grace period expired - revoke access
    UPDATE subscriptions SET status = 'paused' WHERE id = ?;
    return { allowed: false, status: 403, error: 'Payment failed - access suspended' };
  }
}
```

**Implementation**:
- ⚠️ Need to add payment status checking
- ⚠️ Need grace period logic
- ⚠️ Need to update subscription status based on payment

**Recovery Path**:
1. User updates payment method
2. Payment provider processes payment
3. Subscription status updated to 'active'
4. Access restored immediately

---

### 3. Missing Subscription Records

**Scenario**: User exists but has no subscription record in database.

**Expected Behavior**:
- ❌ Access denied to all courses
- 📧 User prompted to subscribe
- 🔄 User can start new subscription

**User-Facing Message**:
```
"A subscription is required to access courses. Please choose a subscription plan to get started."
```

**Backend Handling Strategy**:
```typescript
// Check if subscription exists
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('student_profile_id', studentProfileId)
  .single();

if (!subscription) {
  // No subscription found
  return {
    allowed: false,
    status: 403,
    error: 'No subscription found. Please subscribe to access courses.',
    requiresSubscription: true,
    redirectTo: '/student/subscription'
  };
}
```

**Implementation**:
- ✅ Already handled in `canUserAccessCourse()` - returns false if no subscription
- ✅ Guard middleware checks for subscription
- ✅ Error message guides user to subscription page

**Recovery Path**:
1. User visits subscription page
2. Selects subscription tier
3. Completes payment
4. Subscription created
5. Access granted immediately

---

### 4. Course Renamed or Deleted

**Scenario**: Course slug changes or course is deleted from database.

**Expected Behavior**:
- ❌ Access denied if course doesn't exist
- 🔄 Redirect to courses list if course deleted
- ⚠️ Handle renamed courses gracefully
- 📝 Log course access attempts for deleted courses

**User-Facing Message** (Course Not Found):
```
"The course you're looking for doesn't exist or has been removed. 
Please browse our available courses."
```

**User-Facing Message** (Course Renamed):
```
"This course has been moved. Redirecting you to the updated course..."
```

**Backend Handling Strategy**:
```typescript
// Check if course exists
const { data: course, error } = await supabase
  .from('courses')
  .select('id, slug, is_published')
  .eq('id', courseId)
  .single();

if (error || !course) {
  // Course doesn't exist
  // Check if course was renamed (by checking slug history or redirects table)
  const { data: redirect } = await supabase
    .from('course_redirects')
    .select('new_course_id')
    .eq('old_course_id', courseId)
    .single();
  
  if (redirect) {
    // Course was renamed - redirect to new course
    return {
      allowed: false,
      status: 301,
      redirect: `/student/courses/${redirect.new_course_id}`,
      message: 'Course has been moved'
    };
  }
  
  // Course deleted or never existed
  return {
    allowed: false,
    status: 404,
    error: 'Course not found. It may have been removed.',
    redirectTo: '/student/courses'
  };
}
```

**Implementation**:
- ✅ Already handled - checks if course exists
- ⚠️ Should add course redirects table for renamed courses
- ⚠️ Should log deleted course access attempts

**Recovery Path**:
1. User redirected to courses list
2. Can browse available courses
3. If course renamed, automatic redirect to new course

---

### 5. Subscription Price Changes

**Scenario**: Subscription tier price changes (e.g., Essential increases from £39 to £45/month).

**Expected Behavior**:
- ✅ Existing subscriptions keep current price (grandfathered)
- ✅ New subscriptions use new price
- ✅ Price changes don't affect access
- 📧 Users notified of price changes (for future renewals)

**User-Facing Message** (Price Increase Notification):
```
"Subscription prices have been updated. Your current subscription will continue at 
your current rate until [renewal date]. After renewal, the new price will apply."
```

**Backend Handling Strategy**:
```typescript
// When checking subscription, use stored price_monthly, not tier config price
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('tier, price_monthly, current_period_end')
  .eq('student_profile_id', studentProfileId)
  .single();

// Use subscription.price_monthly (grandfathered price)
// NOT subscription_tier_config.price_monthly (current price)

// Access check uses tier, not price
// Price only affects billing, not access
```

**Implementation**:
- ✅ Already handled - access check uses `tier`, not `price_monthly`
- ✅ Subscriptions store their own `price_monthly` (grandfathered)
- ✅ Price changes in `subscription_tier_config` don't affect existing subscriptions

**Recovery Path**:
1. User continues with current price until renewal
2. At renewal, new price applies
3. User can cancel if they don't want new price
4. Access continues regardless of price

---

## Additional Edge Cases

### 6. Subscription Status: 'paused'

**Scenario**: Subscription is paused (e.g., user requested pause, payment issue).

**Expected Behavior**:
- ❌ Access denied during pause
- 📧 User notified of pause status
- 🔄 User can resume subscription

**User-Facing Message**:
```
"Your subscription is currently paused. Please resume your subscription to access courses."
```

**Backend Handling**:
```typescript
if (subscription.status === 'paused') {
  return {
    allowed: false,
    status: 403,
    error: 'Subscription is paused. Please resume to access courses.',
    requiresResume: true
  };
}
```

---

### 7. Subscription Status: 'trial'

**Scenario**: User is on trial subscription.

**Expected Behavior**:
- ✅ Access granted during trial
- ⚠️ Access limited to trial tier (if applicable)
- 📧 User notified of trial end date
- 🔄 User must add payment method before trial ends

**User-Facing Message**:
```
"Your trial ends in [X] days. Add a payment method to continue your subscription 
and avoid interruption."
```

**Backend Handling**:
```typescript
if (subscription.status === 'trial') {
  // Check trial end date
  if (subscription.trial_end_at && subscription.trial_end_at <= NOW()) {
    // Trial expired
    UPDATE subscriptions SET status = 'expired' WHERE id = ?;
    return { allowed: false, status: 403, error: 'Trial expired' };
  }
  
  // Trial active - grant access based on tier
  // Access logic same as 'active' status
}
```

---

### 8. Subscription Status: 'canceled'

**Scenario**: User canceled subscription but period hasn't ended yet.

**Expected Behavior**:
- ✅ Access continues until `current_period_end`
- 📧 User notified of cancellation
- ⚠️ Access will end on period end date
- 🔄 User can reactivate before period ends

**User-Facing Message**:
```
"Your subscription has been canceled. You'll continue to have access until 
[period_end_date]. After that, access will be restricted."
```

**Backend Handling**:
```typescript
if (subscription.status === 'canceled') {
  // Check if still within period
  if (subscription.current_period_end > NOW()) {
    // Still have access until period end
    return { 
      allowed: true, 
      status: 200,
      warning: 'Subscription canceled - access ends on [date]'
    };
  } else {
    // Period ended - no access
    return { allowed: false, status: 403, error: 'Subscription canceled' };
  }
}
```

---

### 9. Multiple Subscription Records (Data Integrity Issue)

**Scenario**: User somehow has multiple subscription records (shouldn't happen due to UNIQUE constraint).

**Expected Behavior**:
- ⚠️ Use most recent active subscription
- 📝 Log data integrity issue
- 🔧 Admin notification for cleanup

**Backend Handling**:
```typescript
// Should never happen due to UNIQUE constraint, but handle defensively
const { data: subscriptions } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('student_profile_id', studentProfileId)
  .order('created_at', { ascending: false });

if (subscriptions && subscriptions.length > 1) {
  // Data integrity issue - log and use most recent
  console.error('Multiple subscriptions found', { studentProfileId, count: subscriptions.length });
  
  // Use most recent active subscription
  const activeSubscription = subscriptions.find(s => s.status === 'active') 
    || subscriptions[0];
  
  // TODO: Notify admin to clean up duplicate
}
```

---

### 10. Course Unpublished During Active Session

**Scenario**: Course is unpublished while user is viewing it.

**Expected Behavior**:
- ⚠️ User can continue viewing if already loaded
- ❌ New access attempts denied
- 🔄 User redirected if trying to refresh/reload

**User-Facing Message**:
```
"This course is no longer available. You've been redirected to the courses page."
```

**Backend Handling**:
```typescript
// Check is_published on every request
if (!course.is_published) {
  return {
    allowed: false,
    status: 403,
    error: 'Course is no longer available',
    redirectTo: '/student/courses'
  };
}
```

---

### 11. Subscription Tier Config Missing

**Scenario**: `subscription_tier_config` table missing entry for a tier.

**Expected Behavior**:
- ❌ Access denied (fail-secure)
- 📝 Log configuration error
- 🔧 Admin notification

**Backend Handling**:
```typescript
const { data: tierConfig } = await supabase
  .from('subscription_tier_config')
  .select('has_all_access')
  .eq('tier', subscription.tier)
  .single();

if (!tierConfig) {
  // Configuration missing - deny access and log
  console.error('Tier config missing', { tier: subscription.tier });
  // TODO: Notify admin
  return { allowed: false, status: 500, error: 'Configuration error' };
}
```

---

### 12. Database Connection Failures

**Scenario**: Database is unavailable or connection fails.

**Expected Behavior**:
- ❌ Access denied (fail-secure)
- 📧 User sees generic error message
- 📝 Error logged for monitoring
- 🔄 Retry logic for transient failures

**User-Facing Message**:
```
"We're experiencing technical difficulties. Please try again in a few moments."
```

**Backend Handling**:
```typescript
try {
  const { data, error } = await supabase.rpc('has_course_access', {...});
  // ...
} catch (error) {
  // Database connection error
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    // Transient error - could retry
    return {
      allowed: false,
      status: 503,
      error: 'Service temporarily unavailable. Please try again.',
      retryAfter: 60 // seconds
    };
  }
  
  // Other errors - fail secure
  return {
    allowed: false,
    status: 500,
    error: 'Internal server error. Please try again later.'
  };
}
```

---

## Error Message Reference

### Access Denied Messages

| Scenario | Status | Message |
|----------|--------|---------|
| No subscription | 403 | "A subscription is required to access this course. Please choose a subscription plan to get started." |
| Expired subscription | 403 | "Your subscription has expired. Please renew your subscription to continue accessing courses." |
| Payment failed | 403 | "Your payment failed. Please update your payment method to avoid losing access." |
| Paused subscription | 403 | "Your subscription is paused. Please resume your subscription to access courses." |
| Canceled subscription | 403 | "Your subscription has been canceled. Access is no longer available." |
| Insufficient tier | 403 | "This course requires Professional Access. Please upgrade your subscription." |
| Course not found | 404 | "The course you're looking for doesn't exist or has been removed." |
| Course unpublished | 403 | "This course is no longer available." |
| Database error | 500 | "We're experiencing technical difficulties. Please try again later." |

### Warning Messages

| Scenario | Message |
|----------|---------|
| Payment failed (grace period) | "Your payment failed. Please update your payment method. You have [X] days before access is suspended." |
| Trial ending soon | "Your trial ends in [X] days. Add a payment method to continue your subscription." |
| Subscription canceled (grace period) | "Your subscription has been canceled. You'll continue to have access until [date]." |

## Implementation Checklist

### Backend Functions to Update

- [x] `canUserAccessCourse()` - Handle expired subscriptions
- [x] `guardCourseAccess()` - Handle missing subscriptions
- [ ] Add payment status checking
- [ ] Add grace period logic
- [ ] Add course redirect handling
- [ ] Add subscription status auto-update (expired)
- [ ] Add data integrity checks

### API Routes to Update

- [x] `GET /api/courses/:courseId` - Handle course not found
- [x] `POST /api/courses/enroll` - Handle subscription checks
- [ ] Add payment status endpoint
- [ ] Add subscription status endpoint
- [ ] Add course redirect endpoint

### Frontend Components to Update

- [ ] Add expired subscription banner
- [ ] Add payment failure banner (already exists)
- [ ] Add course not found page
- [ ] Add subscription status indicators
- [ ] Add grace period countdown

## Monitoring and Alerts

### Metrics to Track

1. **Expired Subscriptions**: Count of users with expired subscriptions
2. **Payment Failures**: Count of failed payments
3. **Missing Subscriptions**: Users without subscription records
4. **Course Access Denials**: Reasons for access denials
5. **Data Integrity Issues**: Multiple subscriptions, missing configs

### Alerts to Set Up

1. **High Expired Subscription Rate**: > 10% of active subscriptions
2. **Payment Failure Spike**: > 5% failure rate
3. **Data Integrity Issues**: Any duplicate subscriptions
4. **Configuration Errors**: Missing tier configs
5. **Database Connection Failures**: Connection error rate > 1%

## Testing Edge Cases

### Test Cases

1. ✅ Expired subscription access attempt
2. ✅ Payment failure during active subscription
3. ✅ User with no subscription record
4. ✅ Accessing deleted course
5. ✅ Accessing renamed course
6. ✅ Price change doesn't affect access
7. ✅ Paused subscription access
8. ✅ Trial subscription access
9. ✅ Canceled subscription (during grace period)
10. ✅ Database connection failure

See `tests/unit/subscription-access.test.ts` for test implementations.
