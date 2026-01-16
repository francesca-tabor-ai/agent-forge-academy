# Segment Subscriptions Test Summary

## Overview

This document summarizes the test coverage for segment-based subscriptions functionality, including landing pages, Stripe checkout, webhooks, and access gating.

## Test Files

### 1. Integration Tests
**File:** `tests/integration/segment-subscriptions.test.ts`

**Coverage:**
- ✅ Landing page lists correct live courses
- ✅ Checkout endpoint uses correct Stripe price ID
- ✅ Webhook creates subscription row
- ✅ Access gating allows/denies correctly based on subscription status

**Test Categories:**

#### 1.1 Landing Page Course Listings
- Verifies that track segments return only live courses
- Verifies that industry segments return only live courses
- Verifies that role segments return only live courses
- Ensures non-live courses are excluded from segments

#### 1.2 Stripe Checkout Integration
- Tests monthly price ID lookup for tracks, industries, and roles
- Tests annual price ID lookup for tracks, industries, and roles
- Verifies correct price IDs are returned from `subscriptions.md`
- Handles non-existent segments gracefully

#### 1.3 Webhook Subscription Creation
- Tests creation of `segment_subscriptions` rows with correct data
- Tests updating existing subscriptions on webhook events
- Tests marking subscriptions as expired on cancellation
- Verifies all required fields are populated correctly

#### 1.4 Access Gating
- Tests access granted when user has active segment subscription
- Tests access denied when user has no subscription
- Tests access denied when subscription is expired
- Tests access denied when subscription period has ended
- Tests that access is limited to courses in subscribed segment only

### 2. Regression Tests
**File:** `tests/regression/segment-subscriptions.test.ts`

**Coverage:**
- Data consistency checks
- Integration point verification
- Format validation

**Test Categories:**

#### 2.1 Landing Page Data
- Verifies segments exist for each type (track, industry, role)
- Verifies hero images are present for all segments
- Ensures segment structure is consistent

#### 2.2 Stripe Integration
- Verifies subscription metadata exists for all segments
- Tests price ID retrieval for known segments
- Validates pricing format consistency (e.g., "£49/mo", "£490/yr")

#### 2.3 Access Gating Logic
- Tests segment discovery for courses
- Verifies maximum 3 segments returned per course
- Validates landing page path format

#### 2.4 Data Consistency
- Verifies no duplicate subscription entries
- Ensures segment keys are consistent across utilities
- Validates subscription metadata completeness

## Running Tests

### Run Integration Tests
```bash
npm run test:integration -- tests/integration/segment-subscriptions.test.ts
```

### Run Regression Tests
```bash
npm run test:regression -- tests/regression/segment-subscriptions.test.ts
```

### Run All Segment Subscription Tests
```bash
npm run test -- segment-subscriptions
```

## Test Requirements

### Prerequisites
- Supabase database with `segment_subscriptions` table
- Test user IDs (can be mocked or use existing test users)
- Access to `content/subscriptions.md` file
- Access to course metadata and segment definitions

### Environment Variables
Tests require:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` (for webhook tests, can be mocked)

## Test Coverage Summary

| Feature | Integration Tests | Regression Tests | Status |
|---------|-------------------|------------------|--------|
| Landing page course listings | ✅ | ✅ | Complete |
| Stripe price ID lookup | ✅ | ✅ | Complete |
| Webhook subscription creation | ✅ | - | Complete |
| Access gating logic | ✅ | ✅ | Complete |
| Data consistency | - | ✅ | Complete |

## Known Limitations

1. **Test User Management**: Tests use mock user IDs. In production, you may want to use actual test users with proper cleanup.

2. **Stripe Mocking**: Stripe client is mocked. For full integration testing, you may want to use Stripe test mode.

3. **Database Cleanup**: Tests clean up created subscriptions, but may need additional cleanup for edge cases.

4. **Live Course Filtering**: Tests assume `is_live` column exists in `courses` table. If not, tests will need adjustment.

## Future Enhancements

1. **E2E Tests**: Add Playwright tests for full user flow (landing page → checkout → access)
2. **Performance Tests**: Test segment lookup performance with large datasets
3. **Error Handling**: Add tests for error scenarios (network failures, invalid data)
4. **Concurrency Tests**: Test webhook handling with concurrent requests

## Definition of Done Checklist

- ✅ Landing pages exist for every Track/Industry/Role
- ✅ Hero images resolve from MD mappings (track/industry/role)
- ✅ Live courses are listed on each landing page
- ✅ Stripe monthly + annual subscriptions work per segment
- ✅ Paying grants access to related courses only
- ✅ `content/subscriptions.md` is the editable registry of Stripe IDs and pricing
- ✅ Tests verify all above functionality
