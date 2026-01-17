# Subscription Button Actions

## Overview

All subscription page buttons are now wired to real endpoints and server actions with proper authentication, validation, and revalidation.

## Button Actions

### 1. Upgrade Plan

**Button Location:** `CurrentPlanCard` component

**Action:** `handleUpgradePlan()`

**Implementation:**
- Finds next higher tier plan from available plans
- Creates Stripe Checkout session via `/api/stripe/create-checkout-session`
- Redirects user to Stripe Checkout
- On success, redirects back with `?success=true` query param

**Endpoint:** `POST /api/stripe/create-checkout-session`

**Body:**
```json
{
  "plan_id": "professional_monthly",
  "successUrl": "/student/subscription?success=true",
  "cancelUrl": "/student/subscription?canceled=true"
}
```

**Validation:**
- ✅ User authentication required
- ✅ Plan must exist and be active
- ✅ Stripe price ID must be configured

**Revalidation:**
- Handled by Stripe webhook after checkout completion
- Page reloads on redirect with updated data

### 2. Manage Plan

**Button Location:** `CurrentPlanCard` component

**Action:** `handleUpdatePayment()` (reused for manage plan)

**Implementation:**
- Opens Stripe Customer Portal via `/api/stripe/create-portal-session`
- User can manage subscription, payment method, and billing in Stripe portal
- Redirects back to subscription page after portal session

**Endpoint:** `POST /api/stripe/create-portal-session`

**Body:**
```json
{
  "returnUrl": "/student/subscription"
}
```

**Validation:**
- ✅ User authentication required
- ✅ Active subscription with Stripe customer ID required

**Revalidation:**
- Handled by Stripe webhook after portal changes
- Page reloads on redirect with updated data

### 3. Cancel Subscription

**Button Location:** `CurrentPlanCard` component → `CancelSubscriptionModal`

**Action:** `handleCancelSubscription()`

**Implementation:**
- Calls `/api/subscription/cancel` endpoint
- Cancels at period end by default (can be immediate)
- Updates Stripe subscription
- Database updated via webhook

**Endpoint:** `POST /api/subscription/cancel`

**Body:**
```json
{
  "cancelImmediately": false
}
```

**Validation:**
- ✅ User authentication required
- ✅ Active subscription required
- ✅ User ownership verified (subscription.user_id === auth.uid)

**Revalidation:**
- ✅ `revalidatePath('/student/subscription')` called
- Page reloads to show updated status

**Server Action Alternative:**
- `cancelSubscription()` in `app/actions/subscription.ts`
- Can be used directly in server components

### 4. Update Payment Method

**Button Location:** `BillingInformation` component

**Action:** `handleOpenBillingPortal()`

**Implementation:**
- Opens Stripe Customer Portal via `/api/stripe/create-portal-session`
- User can update payment method in Stripe portal
- Redirects back to subscription page

**Endpoint:** `POST /api/stripe/create-portal-session`

**Validation:**
- ✅ User authentication required
- ✅ Active subscription with Stripe customer ID required

**Revalidation:**
- Handled by Stripe webhook after portal changes
- Page reloads on redirect with updated data

### 5. Update Email

**Button Location:** `BillingInformation` component

**Action:** `handleUpdateEmail()`

**Implementation:**
- Prompts user for new billing email
- Calls `/api/subscription/update-billing-email`
- Updates `profiles.billing_email` in database
- Revalidates subscription page

**Endpoint:** `POST /api/subscription/update-billing-email`

**Body:**
```json
{
  "billingEmail": "newemail@example.com"
}
```

**Validation:**
- ✅ User authentication required
- ✅ Email format validation
- ✅ User ownership verified (profile.user_id === auth.uid)

**Revalidation:**
- ✅ `revalidatePath('/student/subscription')` called
- Page reloads to show updated email

**Server Action Alternative:**
- `updateBillingEmail()` in `app/actions/subscription.ts`
- Can be used directly in server components

## Change Plan (Alternative Flow)

**Button Location:** `ChangePlanModal` component

**Action:** `handleChangePlan()`

**Implementation:**
- Updates subscription plan via `/api/subscription/update`
- Changes Stripe subscription price
- Handles proration automatically

**Endpoint:** `POST /api/subscription/update`

**Body:**
```json
{
  "plan_id": "professional_monthly",
  "proration_behavior": "create_prorations"
}
```

**Validation:**
- ✅ User authentication required
- ✅ Active subscription required
- ✅ Plan must exist and be active
- ✅ User ownership verified

**Revalidation:**
- ✅ `revalidatePath('/student/subscription')` called
- Page reloads to show updated plan

## Authentication & Authorization

All endpoints validate:

1. **User Authentication:**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

2. **User Ownership:**
   - Subscriptions: `subscription.user_id === user.id`
   - Profiles: `profile.user_id === user.id`
   - Prevents users from accessing other users' data

3. **Active Subscription:**
   - Required for most actions
   - Checks `status IN ('active', 'trialing')`
   - Checks `current_period_end > now()`

## Revalidation

All actions that modify subscription data call:

```typescript
revalidatePath('/student/subscription');
```

This ensures:
- Next.js cache is cleared
- Fresh data is fetched on next page load
- User sees updated information immediately

## Error Handling

All actions include:

1. **Try/Catch Blocks:**
   - Catch and log errors
   - Return user-friendly error messages

2. **User Feedback:**
   - Success messages for completed actions
   - Error alerts for failed actions
   - Loading states during API calls

3. **Graceful Degradation:**
   - Fallback to Stripe portal if direct updates fail
   - Clear error messages for missing data

## Success/Cancel Handling

The subscription page handles Stripe redirects:

- `?success=true` - Shows success message
- `?canceled=true` - Shows canceled message

**Implementation:**
```typescript
// In page.tsx
const showSuccess = searchParams.success === 'true';
const showCanceled = searchParams.canceled === 'true';

// In SubscriptionPageContent
{showSuccess && <SuccessBanner />}
{showCanceled && <CanceledBanner />}
```

## Files Modified

1. **Server Actions:**
   - `app/actions/subscription.ts` - Cancel and update email actions

2. **API Routes:**
   - `app/api/subscription/cancel/route.ts` - Added revalidation
   - `app/api/subscription/update/route.ts` - Added revalidation
   - `app/api/subscription/update-billing-email/route.ts` - New route
   - `app/api/stripe/create-portal-session/route.ts` - Updated for new subscription structure

3. **Components:**
   - `components/subscription/SubscriptionPageContent.tsx` - Wired up all buttons
   - `components/subscription/BillingInformation.tsx` - Added update email handler
   - `components/subscription/SubscriptionPage.tsx` - Added success/cancel props
   - `app/(student)/student/subscription/page.tsx` - Added searchParams handling

## Testing Checklist

- [x] Upgrade Plan → Creates checkout session
- [x] Manage Plan → Opens billing portal
- [x] Cancel Subscription → Updates Stripe + DB
- [x] Update Payment Method → Opens billing portal
- [x] Update Email → Updates DB + revalidates
- [x] Change Plan → Updates subscription
- [x] All actions validate auth
- [x] All actions validate ownership
- [x] All actions revalidate page
- [x] Success/cancel messages display
- [x] Error handling works

## Next Steps

All buttons are now wired to real actions. The subscription page is fully functional with:
- ✅ Real API calls
- ✅ Proper authentication
- ✅ Ownership validation
- ✅ Page revalidation
- ✅ User feedback
- ✅ Error handling
