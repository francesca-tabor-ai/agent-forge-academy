# Stripe Webhook Route Validation

## ✅ Route Location

**Correct**: `app/api/stripe/webhook/route.ts`

This is the correct location for Next.js App Router.

## ✅ Route Implementation Validation

### 1. Accepts POST ✅
```typescript
export async function POST(request: NextRequest) {
```
- Correctly exports POST handler

### 2. Reads Raw Body ✅
```typescript
const body = await request.text();
```
- Uses `request.text()` to get raw body string
- Required for signature verification (must be raw, not parsed JSON)

### 3. Verifies Signature ✅
```typescript
const signature = request.headers.get('stripe-signature');

if (!signature) {
  return NextResponse.json(
    { error: 'Missing stripe-signature header' },
    { status: 400 }
  );
}

event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```
- Gets signature from `stripe-signature` header
- Validates signature exists
- Uses `stripe.webhooks.constructEvent()` to verify
- Uses `STRIPE_WEBHOOK_SECRET` from environment

### 4. Error Handling ✅
```typescript
try {
  event = stripe.webhooks.constructEvent(...);
} catch (err: any) {
  console.error('Webhook signature verification failed:', err.message);
  return NextResponse.json(
    { error: `Webhook Error: ${err.message}` },
    { status: 400 }
  );
}
```
- Catches signature verification errors
- Returns 400 for invalid signatures
- Logs errors for debugging

### 5. Event Processing ✅
```typescript
try {
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(...);
      break;
    // ... other events
  }
  return NextResponse.json({ received: true });
} catch (error: any) {
  console.error('Error processing webhook:', error);
  return NextResponse.json(
    { error: 'Webhook processing failed' },
    { status: 500 }
  );
}
```
- Processes events in try-catch
- Returns 200 on success
- Returns 500 on processing errors (Stripe will retry)

## ✅ Event Handlers

All required events are handled:

- ✅ `customer.subscription.created` → `handleSubscriptionCreated()`
- ✅ `customer.subscription.updated` → `handleSubscriptionUpdated()`
- ✅ `customer.subscription.deleted` → `handleSubscriptionDeleted()`
- ✅ `invoice.payment_succeeded` → `handlePaymentSucceeded()`
- ✅ `invoice.payment_failed` → `handlePaymentFailed()`
- ✅ `customer.subscription.trial_will_end` → `handleTrialWillEnd()`

## Testing Checklist

### Local Testing with Stripe CLI

1. **Start Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Get Webhook Secret**:
   - Stripe CLI will output: `Ready! Your webhook signing secret is whsec_...`
   - Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

3. **Trigger Test Event**:
   ```bash
   stripe trigger customer.subscription.created
   ```

4. **Expected Results**:
   - ✅ Stripe CLI shows: `triggered`
   - ✅ Server logs show: `Subscription created: sub_...`
   - ✅ No 400 errors
   - ✅ No signature verification errors
   - ✅ Database has new subscription record

### Production Testing

1. **Configure Webhook in Stripe Dashboard**:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: All subscription and invoice events
   - Copy webhook signing secret

2. **Test with Stripe Dashboard**:
   - Go to Webhooks → Your endpoint → Send test webhook
   - Select event type
   - Verify it's received and processed

## Common Issues & Solutions

### Issue: "Missing stripe-signature header"
**Solution**: Ensure Stripe is sending webhook to correct endpoint

### Issue: "Webhook signature verification failed"
**Solution**: 
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Ensure using raw body (not parsed JSON)
- Verify webhook endpoint URL is correct

### Issue: "Tier config not found for price ID"
**Solution**: 
- Ensure `stripe_price_id` is set in `subscription_tier_config` table
- Price ID must match Stripe Price ID exactly

### Issue: "Profile not found for email"
**Solution**: 
- User must have profile in database
- Email in Stripe customer must match profile email

## Validation Status

✅ **Route exists at correct location**
✅ **Accepts POST requests**
✅ **Reads raw body correctly**
✅ **Verifies signature with STRIPE_WEBHOOK_SECRET**
✅ **Handles all required events**
✅ **Proper error handling**
✅ **Returns correct status codes**

## Ready for Testing

The webhook route is correctly implemented and ready for testing with:

```bash
stripe trigger customer.subscription.created
```

Expected output:
- Stripe CLI: `✓ Triggered customer.subscription.created`
- Server logs: `Subscription created: sub_...`
- No errors
