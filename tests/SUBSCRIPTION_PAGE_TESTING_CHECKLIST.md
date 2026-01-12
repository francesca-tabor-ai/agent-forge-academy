# Subscription Page Testing Checklist

## Overview

This checklist verifies that the subscription page is fully functional with all data sourced from `getSubscriptionData()` and no hard-coded values.

## Pre-Testing Setup

### Test Users Required

1. **User with Active Subscription**
   - Has active subscription in database
   - Has Stripe customer ID
   - Has payment method on file
   - Has invoices in database/Stripe

2. **User with Canceled Subscription**
   - Has subscription with `status = 'canceled'`
   - Has `cancel_at_period_end = true` or `ended_at` set
   - Still has access until period end

3. **User with No Subscription**
   - No subscription record in database
   - No Stripe customer ID
   - Should see "No active plan" state

4. **User with Missing Payment Method**
   - Has active subscription
   - No payment method in Stripe
   - Should show "No payment method on file"

5. **User with Billing Email Override**
   - Has `profiles.billing_email` set
   - Should display override instead of user email

## Test Cases

### ✅ Test 1: User with Active Subscription

**Setup:**
- User has active subscription (status: 'active' or 'trialing')
- Subscription has valid `current_period_end`
- Plan details exist in `subscription_plans` or `subscription_tier_config`

**Expected Results:**
- [ ] Plan name displays from `plan.name` (not hard-coded)
- [ ] Plan price displays formatted as currency (e.g., "£39.00")
- [ ] Billing cycle displays from `plan.interval` (monthly/annual)
- [ ] Renewal date displays as "D MMMM YYYY" format (e.g., "15 February 2024")
- [ ] Renewal date comes from `plan.renewsOn` (not hard-coded)
- [ ] Status badge shows "Active" or "Trial" based on `plan.status`
- [ ] Plan description displays from `plan.description`
- [ ] Plan features display from `plan.features` JSON
- [ ] No hard-coded plan names (e.g., "Starter", "Pro")
- [ ] No hard-coded prices (e.g., "£29.00")

**Verification:**
```sql
-- Check subscription data
SELECT s.*, sp.name, sp.code, sp.price_monthly 
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.user_id = '<test_user_id>';
```

### ✅ Test 2: Canceled Subscription

**Setup:**
- User has subscription with `status = 'canceled'`
- Or `cancel_at_period_end = true` with future `current_period_end`

**Expected Results:**
- [ ] Status badge shows "Canceled" (gray badge)
- [ ] Renewal date wording changes to "Access ends on [date]"
- [ ] Period end date displays correctly from `plan.renewsOn`
- [ ] Cancel button is hidden or disabled
- [ ] Manage plan button may still be available (to reactivate)
- [ ] No hard-coded "Renews on" text for canceled subscriptions

**Verification:**
```sql
-- Check canceled subscription
SELECT s.*, s.status, s.cancel_at_period_end, s.current_period_end
FROM subscriptions s
WHERE s.user_id = '<test_user_id>' 
AND (s.status = 'canceled' OR s.cancel_at_period_end = true);
```

### ✅ Test 3: No Active Subscription

**Setup:**
- User has no subscription record
- Or subscription has expired (`current_period_end < now()`)

**Expected Results:**
- [ ] Shows "No Active Subscription" message
- [ ] Displays CTA button to "View Plans" or "Subscribe"
- [ ] Plan section shows empty state (not broken)
- [ ] Billing section shows no payment method
- [ ] Invoice list is empty or shows message
- [ ] No hard-coded "Starter" plan displayed

**Verification:**
```sql
-- Verify no active subscription
SELECT * FROM subscriptions 
WHERE user_id = '<test_user_id>' 
AND status IN ('active', 'trialing')
AND current_period_end > NOW();
-- Should return 0 rows
```

### ✅ Test 4: Invoice List

**Setup:**
- User has invoices in `invoices` table
- Or invoices exist in Stripe for the customer

**Expected Results:**
- [ ] Invoice list displays from `invoices` array (not hard-coded)
- [ ] Invoice dates formatted as "D MMMM YYYY" (e.g., "15 February 2024")
- [ ] Invoice numbers display from `invoice.invoiceNumber` (not "INV-001")
- [ ] Invoice amounts formatted with GBP locale (e.g., "£39.00")
- [ ] Invoice status badges styled dynamically:
  - `paid` → Green badge
  - `open` → Yellow badge
  - `void` → Gray badge
  - `uncollectible` → Red badge
  - `draft` → Blue badge
- [ ] Download links work (open PDF or hosted invoice URL)
- [ ] Invoices sorted by date (newest first)
- [ ] No hard-coded invoice IDs (e.g., "INV-001", "INV-002")

**Verification:**
```sql
-- Check invoices
SELECT * FROM invoices 
WHERE user_id = '<test_user_id>'
ORDER BY invoice_date DESC;
```

### ✅ Test 5: Billing Email Override

**Setup:**
- User has `profiles.billing_email` set to different email
- User's auth email is different from billing email

**Expected Results:**
- [ ] Billing email displays `billing.billingEmail` (override)
- [ ] Not showing hard-coded email (e.g., "info@francescatabor.com")
- [ ] Update email button works
- [ ] After update, new email displays immediately
- [ ] Database updated correctly

**Verification:**
```sql
-- Check billing email
SELECT p.billing_email, u.email 
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.user_id = '<test_user_id>';
```

### ✅ Test 6: Payment Method Missing

**Setup:**
- User has active subscription
- No payment method in Stripe (or payment method deleted)

**Expected Results:**
- [ ] Shows "No payment method on file" message
- [ ] Not showing hard-coded payment method (e.g., "Visa •••• 4242")
- [ ] Update Payment Method button works
- [ ] Opens Stripe portal to add payment method
- [ ] After adding, payment method displays correctly

**Verification:**
- Check Stripe customer: `stripe.customers.retrieve(customer_id)`
- Check `invoice_settings.default_payment_method` is null

### ✅ Test 7: Payment Method Display

**Setup:**
- User has payment method in Stripe

**Expected Results:**
- [ ] Brand displays from `billing.paymentMethod.brand` (e.g., "Visa", "Mastercard")
- [ ] Last 4 digits display from `billing.paymentMethod.last4` (not "4242")
- [ ] Expiry displays as "MM/YYYY" from `expMonth/expYear` (not "12/2025")
- [ ] No hard-coded payment method details

### ✅ Test 8: Next Invoice

**Setup:**
- User has active subscription
- Upcoming invoice exists in Stripe

**Expected Results:**
- [ ] Next invoice amount displays formatted (e.g., "£39.00")
- [ ] Next invoice date displays as "D MMMM YYYY"
- [ ] Date comes from `nextInvoice.invoiceDate` (not hard-coded)
- [ ] If no upcoming invoice, shows "No upcoming invoice"
- [ ] Amount comes from Stripe API (not hard-coded)

### ✅ Test 9: Button Actions

**All buttons should call real endpoints:**

- [ ] **Upgrade Plan** → Creates Stripe Checkout session
- [ ] **Manage Plan** → Opens Stripe Customer Portal
- [ ] **Cancel Subscription** → Calls `/api/subscription/cancel`
- [ ] **Update Payment Method** → Opens Stripe Customer Portal
- [ ] **Update Email** → Calls `/api/subscription/update-billing-email`
- [ ] **Change Plan** → Calls `/api/subscription/update`

**Verification:**
- Check browser network tab for API calls
- Verify responses are successful
- Check page revalidates after actions

### ✅ Test 10: Data Source Verification

**Verify all data comes from `getSubscriptionData()`:**

- [ ] No hard-coded plan names in components
- [ ] No hard-coded prices in components
- [ ] No hard-coded dates in components
- [ ] No hard-coded payment methods
- [ ] No hard-coded emails
- [ ] No hard-coded invoice IDs
- [ ] All values come from `subscriptionData` prop

**Code Verification:**
```bash
# Search for hard-coded values
grep -r "Starter\|£29\|£39\|Visa.*4242\|info@francescatabor\|INV-001" components/subscription/
# Should only find comments/examples, not actual values
```

## Edge Cases

### ✅ Test 11: Trial Subscription

**Setup:**
- User has subscription with `status = 'trial'` or `trialing`
- `trial_end` date is in the future

**Expected Results:**
- [ ] Status badge shows "Trial (X days remaining)"
- [ ] Trial end date displays correctly
- [ ] Days remaining calculated correctly
- [ ] Payment error banner shows if trial ending soon (≤7 days)

### ✅ Test 12: Paused Subscription

**Setup:**
- User has subscription with `status = 'paused'`

**Expected Results:**
- [ ] Status badge shows "Paused" (yellow badge)
- [ ] Appropriate messaging for paused state
- [ ] Reactivation options available

### ✅ Test 13: Multiple Invoices

**Setup:**
- User has 20+ invoices

**Expected Results:**
- [ ] Invoice list shows latest first
- [ ] "Show all" / "Show less" toggle works
- [ ] Pagination or limit works correctly
- [ ] All invoices have working download links

### ✅ Test 14: Currency Formatting

**Setup:**
- Test with different currencies (GBP, USD, EUR)

**Expected Results:**
- [ ] All amounts formatted with correct currency symbol
- [ ] Uses `Intl.NumberFormat` with correct locale
- [ ] GBP shows "£", USD shows "$", EUR shows "€"
- [ ] Decimal places consistent (2 decimal places)

### ✅ Test 15: Date Formatting

**Setup:**
- Test with various dates

**Expected Results:**
- [ ] All dates formatted as "D MMMM YYYY" (e.g., "15 February 2024")
- [ ] Uses `toLocaleDateString('en-GB')` with correct options
- [ ] No hard-coded dates displayed
- [ ] Handles timezone correctly

## Performance Tests

### ✅ Test 16: Page Load Performance

**Expected Results:**
- [ ] Loading skeleton shows immediately
- [ ] Page loads within 2 seconds
- [ ] No layout shift when data loads
- [ ] Smooth transition from loading to content

### ✅ Test 17: Error Handling

**Expected Results:**
- [ ] Error boundary catches errors gracefully
- [ ] User-friendly error message displayed
- [ ] Retry button works
- [ ] Navigation options available
- [ ] No blank page or crash

## Integration Tests

### ✅ Test 18: Stripe Integration

**Setup:**
- User has Stripe customer and subscription

**Expected Results:**
- [ ] Payment method fetched from Stripe
- [ ] Next invoice fetched from Stripe
- [ ] Invoices synced from Stripe if not in DB
- [ ] Portal sessions work correctly
- [ ] Checkout sessions work correctly

### ✅ Test 19: Database Integration

**Expected Results:**
- [ ] Subscription data fetched from database
- [ ] Plan details fetched correctly
- [ ] Invoices fetched from `invoices` table
- [ ] Billing email from `profiles.billing_email`
- [ ] All queries use proper indexes

## Regression Tests

### ✅ Test 20: No Hard-Coded Values

**Code Review Checklist:**
- [ ] No hard-coded plan names ("Starter", "Pro", "Career")
- [ ] No hard-coded prices ("£29", "£39", "£79")
- [ ] No hard-coded dates ("15 February 2024")
- [ ] No hard-coded payment methods ("Visa •••• 4242")
- [ ] No hard-coded emails ("info@francescatabor.com")
- [ ] No hard-coded invoice IDs ("INV-001", "INV-002")
- [ ] All values come from `subscriptionData` prop
- [ ] All data sourced from `getSubscriptionData()`

**Verification Command:**
```bash
# Search for common hard-coded values
grep -r "Starter\|Pro\|Career\|£29\|£39\|£79\|Visa.*4242\|info@francescatabor\|INV-001\|15 February\|February 2024" \
  components/subscription/ \
  app/(student)/student/subscription/ \
  --exclude-dir=node_modules \
  -i
```

## Test Execution

### Manual Testing Steps

1. **Set up test users** with different subscription states
2. **Navigate to** `/student/subscription` for each user
3. **Verify** all data displays correctly
4. **Test** all button actions
5. **Verify** no hard-coded values appear
6. **Check** browser console for errors
7. **Verify** network requests succeed

### Automated Testing (Future)

Consider adding:
- Unit tests for `getSubscriptionData()`
- Integration tests for API routes
- E2E tests for user flows
- Visual regression tests

## Expected Output

After completing all tests:

✅ **Zero hard-coded values** in subscription page
✅ **All data** sourced from `getSubscriptionData()`
✅ **All actions** use server-side routes/actions
✅ **Proper loading states** during data fetch
✅ **Proper error states** for failures
✅ **All buttons** functional and wired correctly

## Test Results Template

```
Test Case | Status | Notes
----------|--------|------
Test 1: Active Subscription | ✅/❌ | 
Test 2: Canceled Subscription | ✅/❌ |
Test 3: No Subscription | ✅/❌ |
Test 4: Invoice List | ✅/❌ |
Test 5: Billing Email Override | ✅/❌ |
Test 6: Payment Method Missing | ✅/❌ |
Test 7: Payment Method Display | ✅/❌ |
Test 8: Next Invoice | ✅/❌ |
Test 9: Button Actions | ✅/❌ |
Test 10: Data Source Verification | ✅/❌ |
Test 11: Trial Subscription | ✅/❌ |
Test 12: Paused Subscription | ✅/❌ |
Test 13: Multiple Invoices | ✅/❌ |
Test 14: Currency Formatting | ✅/❌ |
Test 15: Date Formatting | ✅/❌ |
Test 16: Page Load Performance | ✅/❌ |
Test 17: Error Handling | ✅/❌ |
Test 18: Stripe Integration | ✅/❌ |
Test 19: Database Integration | ✅/❌ |
Test 20: No Hard-Coded Values | ✅/❌ |
```

## Notes

- All tests should be performed in a test environment
- Use test Stripe keys for Stripe integration tests
- Verify database state before and after each test
- Document any issues found during testing
