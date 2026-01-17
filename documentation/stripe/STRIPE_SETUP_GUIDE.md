# Stripe Integration Setup Guide

## Quick Start

This guide walks you through setting up Stripe integration for the subscription system.

## Prerequisites

1. Stripe account (https://stripe.com)
2. Stripe API keys (from Stripe Dashboard)
3. Environment variables configured

## Step 1: Install Dependencies

```bash
npm install stripe
```

## Step 2: Configure Stripe Products & Prices

### In Stripe Dashboard

1. **Create Products**:
   - Essential Access (£39/month)
   - Professional Access (£79/month)

2. **Create Prices**:
   - Essential: £39/month, recurring monthly
   - Professional: £79/month, recurring monthly

3. **Note the Price IDs**:
   - Copy the Price ID for each tier (starts with `price_...`)

### Update Database

```sql
-- Update subscription_tier_config with Stripe Price IDs
UPDATE subscription_tier_config
SET stripe_price_id = 'price_xxxxxxxxxxxxx'
WHERE tier = 'essential';

UPDATE subscription_tier_config
SET stripe_price_id = 'price_xxxxxxxxxxxxx'
WHERE tier = 'professional';
```

## Step 3: Environment Variables

Add to `.env.local`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Public keys (for client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

## Step 4: Configure Webhook Endpoint

### In Stripe Dashboard

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Add to `STRIPE_WEBHOOK_SECRET` in environment variables

### For Local Development

Use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook secret for local development.

## Step 5: Run Database Migration

```bash
# Apply migration to add Stripe fields
supabase migration up
```

Or manually run:
```sql
-- See: supabase/migrations/20250113000006_add_stripe_fields.sql
```

## Step 6: Test Integration

### Test Checkout Flow

1. Call `POST /api/stripe/create-checkout-session`:
```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "tier": "essential",
    "successUrl": "/student/subscription?success=true",
    "cancelUrl": "/student/subscription?canceled=true"
  }'
```

2. Redirect user to returned `checkoutUrl`
3. Complete test payment in Stripe Checkout
4. Verify webhook received and subscription created

### Test Webhook

Use Stripe CLI to send test events:

```bash
# Test subscription created
stripe trigger customer.subscription.created

# Test payment succeeded
stripe trigger invoice.payment_succeeded

# Test payment failed
stripe trigger invoice.payment_failed
```

## API Endpoints Created

### 1. `POST /api/stripe/webhook`
- Handles Stripe webhook events
- Keeps database in sync with Stripe
- **No authentication required** (uses signature verification)

### 2. `POST /api/stripe/create-checkout-session`
- Creates Stripe Checkout session
- Returns checkout URL
- **Requires authentication**

**Request**:
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
  "checkoutUrl": "https://checkout.stripe.com/...",
  "sessionId": "cs_..."
}
```

### 3. `POST /api/stripe/create-portal-session`
- Creates Stripe Customer Portal session
- Returns portal URL
- **Requires authentication**

**Request**:
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

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Create subscription record in database |
| `customer.subscription.updated` | Update subscription (tier, status, period) |
| `customer.subscription.deleted` | Mark subscription as canceled |
| `invoice.payment_succeeded` | Update subscription period, ensure active status |
| `invoice.payment_failed` | Trigger payment failure handler with grace period |
| `customer.subscription.trial_will_end` | Log event (UI handles display) |

## Frontend Integration

### Create Checkout Session

```typescript
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tier: 'essential',
    successUrl: '/student/subscription?success=true',
    cancelUrl: '/student/subscription?canceled=true',
  }),
});

const { checkoutUrl } = await response.json();
window.location.href = checkoutUrl;
```

### Open Customer Portal

```typescript
const response = await fetch('/api/stripe/create-portal-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    returnUrl: '/student/subscription',
  }),
});

const { portalUrl } = await response.json();
window.location.href = portalUrl;
```

## Security Checklist

- [x] Webhook signature verification implemented
- [x] Environment variables secured (not in git)
- [x] API routes require authentication (except webhook)
- [x] Error handling for all Stripe API calls
- [x] Idempotency handling for webhooks
- [x] Logging for debugging

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook endpoint URL is correct
2. Verify webhook secret matches
3. Check Stripe Dashboard for failed deliveries
4. Use Stripe CLI to test locally

### Subscription Not Created

1. Check webhook logs
2. Verify user profile exists
3. Check tier config has Stripe price ID
4. Verify database migration applied

### Payment Failures Not Handled

1. Check `handle_payment_failure` function exists
2. Verify grace period logic
3. Check webhook event is being received

## Next Steps

1. Update subscription page UI to use Stripe Checkout
2. Add "Manage Subscription" button (Customer Portal)
3. Add payment failure banner component
4. Add trial ending banner component
5. Test all webhook events
6. Monitor webhook processing in production

## Support

For Stripe API issues, see:
- Stripe API Docs: https://stripe.com/docs/api
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Stripe Customer Portal: https://stripe.com/docs/billing/subscriptions/integrating-customer-portal
