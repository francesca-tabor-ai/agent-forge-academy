# Subscription Functionality Completion Checklist

## ✅ Completed

### Backend
- [x] Database schema (subscriptions, subscription_tier_config, subscription_tier_courses)
- [x] Access control functions (canUserAccessCourse, has_course_access)
- [x] API route guarding (guardCourseAccess)
- [x] Edge case handling (expired, payment failures, etc.)
- [x] Stripe webhook handler
- [x] Stripe checkout session endpoint
- [x] Stripe customer portal endpoint
- [x] Centralized Stripe client

### Database
- [x] Subscription tables and migrations
- [x] Stripe fields (stripe_customer_id, stripe_price_id)
- [x] RLS policies
- [x] Database functions for access checks

### Documentation
- [x] Integration plan
- [x] Setup guide
- [x] Edge case analysis
- [x] Test plan

## ⚠️ Missing / Needs Implementation

### 1. Frontend Integration with Stripe

**Priority: HIGH**

#### A. Subscription Page - Connect to Stripe
- [ ] Update `app/(student)/student/subscription/page.tsx` to fetch real subscription data from database
- [ ] Replace mock data with actual database queries
- [ ] Connect "Subscribe" buttons to `POST /api/stripe/create-checkout-session`
- [ ] Connect "Manage Subscription" button to `POST /api/stripe/create-portal-session`
- [ ] Handle success/cancel URL parameters from Stripe redirects

#### B. UpgradeModal Component
- [ ] Implement `handleUpgrade` function in `components/courses/UpgradeModal.tsx`
- [ ] Call `POST /api/stripe/create-checkout-session` with tier: 'professional'
- [ ] Redirect to Stripe Checkout

#### C. Subscription Management
- [ ] Connect "Update Payment Method" to Stripe Customer Portal
- [ ] Connect "Cancel Subscription" to Stripe Customer Portal (or handle via API)
- [ ] Show payment failure banners based on subscription status

### 2. Subscription Change Tier - Stripe Integration

**Priority: HIGH**

#### Update `app/api/subscription/change-tier/route.ts`
- [ ] When changing tier, also update Stripe subscription
- [ ] Use Stripe API to change subscription price
- [ ] Handle proration in Stripe
- [ ] Sync Stripe changes back to database via webhook

**Current State**: Only updates database, doesn't sync with Stripe

### 3. Real Subscription Data Fetching

**Priority: HIGH**

#### Update Subscription Page
- [ ] Fetch subscription from `subscriptions` table
- [ ] Fetch tier config from `subscription_tier_config`
- [ ] Map database fields to `SubscriptionData` type
- [ ] Handle cases where user has no subscription

**Current State**: Uses mock data

### 4. Success/Cancel URL Handling

**Priority: MEDIUM**

#### Handle Stripe Redirects
- [ ] Create success page or handle `?success=true` query param
- [ ] Show success message after subscription creation
- [ ] Handle `?canceled=true` query param
- [ ] Refresh subscription data after successful payment

### 5. Payment Status Indicators

**Priority: MEDIUM**

#### Payment Error Handling
- [ ] Check subscription status for payment failures
- [ ] Show payment failure banners
- [ ] Show trial ending warnings
- [ ] Show grace period countdown

**Current State**: Has components but not connected to real data

### 6. Environment Variables Setup

**Priority: HIGH**

#### Required Environment Variables
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (for client-side if needed)
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public key for client
- [ ] `NEXT_PUBLIC_APP_URL` - App URL for redirects

### 7. Stripe Products & Prices Setup

**Priority: HIGH**

#### In Stripe Dashboard
- [ ] Create "Essential Access" product (£39/month)
- [ ] Create "Professional Access" product (£79/month)
- [ ] Copy Price IDs
- [ ] Update `subscription_tier_config` table with `stripe_price_id` values

### 8. Testing

**Priority: MEDIUM**

#### End-to-End Testing
- [ ] Test new subscription creation flow
- [ ] Test subscription upgrade flow
- [ ] Test subscription downgrade flow
- [ ] Test payment success webhook
- [ ] Test payment failure webhook
- [ ] Test subscription cancellation
- [ ] Test customer portal access

## Implementation Priority

### Phase 1: Critical (Must Have)
1. Connect frontend to Stripe checkout/portal
2. Update subscription page to use real data
3. Set up Stripe products and prices
4. Configure environment variables

### Phase 2: Important (Should Have)
1. Integrate tier changes with Stripe
2. Handle success/cancel URLs
3. Payment status indicators

### Phase 3: Nice to Have (Could Have)
1. Enhanced error handling
2. Email notifications
3. Analytics tracking

## Quick Start Guide

### 1. Set Up Stripe Products
```sql
-- After creating products in Stripe Dashboard
UPDATE subscription_tier_config
SET stripe_price_id = 'price_xxxxxxxxxxxxx'
WHERE tier = 'essential';

UPDATE subscription_tier_config
SET stripe_price_id = 'price_xxxxxxxxxxxxx'
WHERE tier = 'professional';
```

### 2. Update Frontend Components

**UpgradeModal.tsx**:
```typescript
const handleUpgrade = async () => {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tier: 'professional',
      successUrl: `${window.location.origin}/student/subscription?success=true`,
      cancelUrl: `${window.location.origin}/student/subscription?canceled=true`,
    }),
  });
  
  const { checkoutUrl } = await response.json();
  window.location.href = checkoutUrl;
};
```

**SubscriptionPageContent.tsx**:
```typescript
const handleManageSubscription = async () => {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      returnUrl: `${window.location.origin}/student/subscription`,
    }),
  });
  
  const { portalUrl } = await response.json();
  window.location.href = portalUrl;
};
```

### 3. Update Subscription Page Data Fetching

Replace mock data with real database queries in `app/(student)/student/subscription/page.tsx`.

## Summary

**Backend**: ✅ Complete
**Database**: ✅ Complete
**Stripe Integration**: ✅ API endpoints ready
**Frontend**: ⚠️ Needs implementation
**Testing**: ⚠️ Needs end-to-end testing

**Main Gap**: Frontend components exist but aren't connected to Stripe APIs yet.
