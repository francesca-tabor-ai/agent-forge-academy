# Stripe Integration Plan

## Overview

This document outlines the Stripe integration needed to make the subscription system fully functional.

## Required Stripe Endpoints

### 1. Webhook Handler
**Endpoint**: `POST /api/stripe/webhook`

**Purpose**: Handle Stripe events to keep database in sync

**Required Events**:
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes (tier, price, status)
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment
- `customer.subscription.trial_will_end` - Trial ending soon (7 days before)

### 2. Create Checkout Session
**Endpoint**: `POST /api/stripe/create-checkout-session`

**Purpose**: Create Stripe Checkout session for new subscriptions

**Request Body**:
```json
{
  "tier": "essential" | "professional",
  "successUrl": "/student/subscription?success=true",
  "cancelUrl": "/student/subscription?canceled=true"
}
```

**Response**:
```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### 3. Create Customer Portal Session
**Endpoint**: `POST /api/stripe/create-portal-session`

**Purpose**: Create Stripe Customer Portal session for managing existing subscriptions

**Request Body**:
```json
{
  "returnUrl": "/student/subscription"
}
```

**Response**:
```json
{
  "portalUrl": "https://billing.stripe.com/..."
}
```

### 4. Update Subscription (Tier Change)
**Endpoint**: `POST /api/subscription/change-tier` (already exists, needs Stripe integration)

**Purpose**: Update subscription tier in Stripe and database

**Stripe Integration Needed**:
- Update Stripe subscription with new price
- Handle proration
- Sync status back to database

## Database Schema Updates

### Add `stripe_customer_id` to subscriptions table

```sql
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
ON subscriptions(stripe_customer_id);
```

## Stripe Product & Price Setup

### Products Needed

1. **Essential Access**
   - Price: £39/month
   - Billing: Recurring monthly
   - Metadata: `tier: essential`

2. **Professional Access**
   - Price: £79/month
   - Billing: Recurring monthly
   - Metadata: `tier: professional`

### Price IDs

Store Stripe Price IDs in `subscription_tier_config`:

```sql
ALTER TABLE subscription_tier_config
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);
```

## Webhook Event Handling

### Event: `customer.subscription.created`

**Action**:
1. Create subscription record in database
2. Link to student profile
3. Set status to 'active' or 'trial'
4. Store `stripe_subscription_id` and `stripe_customer_id`

### Event: `customer.subscription.updated`

**Action**:
1. Update subscription tier if price changed
2. Update `current_period_start` and `current_period_end`
3. Update status (active, canceled, etc.)
4. Log change in `subscription_change_log`

### Event: `customer.subscription.deleted`

**Action**:
1. Update status to 'canceled'
2. Set `canceled_at` timestamp
3. Keep access until `current_period_end` (grace period)

### Event: `invoice.payment_succeeded`

**Action**:
1. Update `current_period_start` and `current_period_end`
2. Ensure status is 'active'
3. Clear any payment failure flags

### Event: `invoice.payment_failed`

**Action**:
1. Call `handle_payment_failure()` function
2. Set grace period (7 days)
3. Notify user (email/UI banner)
4. After grace period, set status to 'paused'

### Event: `customer.subscription.trial_will_end`

**Action**:
1. Notify user trial ending soon
2. Show banner in UI
3. Prompt to add payment method

## Implementation Checklist

### Backend API Routes

- [ ] `POST /api/stripe/webhook` - Webhook handler
- [ ] `POST /api/stripe/create-checkout-session` - Checkout session
- [ ] `POST /api/stripe/create-portal-session` - Customer portal
- [ ] Update `POST /api/subscription/change-tier` - Stripe integration

### Database

- [ ] Add `stripe_customer_id` column
- [ ] Add `stripe_price_id` to `subscription_tier_config`
- [ ] Create indexes for Stripe IDs

### Frontend

- [ ] Update subscription page to use Stripe Checkout
- [ ] Add "Manage Subscription" button (Customer Portal)
- [ ] Add payment failure banner
- [ ] Add trial ending banner

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Security Considerations

1. **Webhook Signature Verification**: Always verify Stripe webhook signatures
2. **Idempotency**: Handle duplicate webhook events
3. **Error Handling**: Log all webhook processing errors
4. **Rate Limiting**: Protect webhook endpoint from abuse

## Testing

### Test Scenarios

1. New subscription creation
2. Subscription upgrade (Essential → Professional)
3. Subscription downgrade (Professional → Essential)
4. Payment success
5. Payment failure
6. Subscription cancellation
7. Trial expiration
8. Webhook retry handling

## Error Handling

### Webhook Processing Errors

- Log error with event ID
- Return 500 to Stripe (will retry)
- Don't update database if error occurs
- Alert admin for persistent failures

### Checkout Errors

- Handle Stripe API errors gracefully
- Show user-friendly error messages
- Log errors for debugging

## Monitoring

### Metrics to Track

1. Webhook processing time
2. Failed webhook events
3. Payment success rate
4. Payment failure rate
5. Subscription creation rate
6. Tier change rate

### Alerts

1. High webhook failure rate (> 5%)
2. Payment failure spike (> 10%)
3. Webhook processing errors
4. Stripe API errors
