# Subscription Data Loader

## Overview

Server-side data loader for fetching complete subscription page data. This replaces client-side API calls with server-side data fetching for better performance and SEO.

## Implementation

### File: `lib/subscription/getSubscriptionData.ts`

**Function:** `getSubscriptionData()`

Returns a `SubscriptionPageData` object with all subscription information for the authenticated user.

### Data Structure

```typescript
type SubscriptionPageData = {
  plan: {
    name: string;
    code: string;
    status: 'active' | 'trial' | 'paused' | 'canceled';
    price: string; // Formatted currency string (e.g., "£39.00")
    interval: 'month' | 'year';
    renewsOn: string | null; // ISO date string
    description: string | null;
    features: Record<string, any> | null; // JSON features object
  } | null;
  billing: {
    brand: string | null;
    last4: string | null;
    expMonth: number | null;
    expYear: number | null;
    billingEmail: string;
  };
  nextInvoice: {
    amount: string; // Formatted currency string
    currency: string;
    invoiceDate: string; // ISO date string
  } | null;
  invoices: Array<{
    invoiceDate: string; // ISO date string
    invoiceNumber: string;
    amount: string; // Formatted currency string
    currency: string;
    status: 'paid' | 'open' | 'void' | 'uncollectible' | 'draft';
    downloadUrl: string | null;
  }>;
};
```

## Features

### 1. User Authentication
- Uses `createUserSupabaseClient()` to get authenticated user
- Returns `null` if user not authenticated

### 2. Subscription Data
- Handles both old structure (`student_profile_id`, `tier` enum) and new structure (`user_id`, `plan_id` FK)
- Fetches plan details from `subscription_plans` or `subscription_tier_config`
- Maps subscription status to frontend format
- Calculates renewal date from `current_period_end`

### 3. Billing Information
- Fetches payment method from Stripe API if `stripe_customer_id` exists
- Falls back gracefully if Stripe data unavailable
- Uses `billing_email` from profiles table, or defaults to user email

### 4. Next Invoice
- Fetches upcoming invoice from Stripe API
- Handles case where no upcoming invoice exists (e.g., canceled subscription)
- Formats amount as currency string

### 5. Invoice History
- Fetches from `invoices` table (latest first, limit 50)
- Falls back to Stripe API if no invoices in database
- Formats all amounts as currency strings
- Includes download URLs (PDF or hosted invoice URL)

### 6. Amount Formatting
- **All amounts are formatted as currency strings on the server**
- Uses `Intl.NumberFormat` for proper currency formatting
- Supports GBP, USD, EUR (extensible)
- Example: `3900` pennies → `"£39.00"`

## Usage

### In Server Components

```typescript
import { getSubscriptionData } from '@/lib/subscription/getSubscriptionData';

export default async function SubscriptionPage() {
  const subscriptionData = await getSubscriptionData();
  
  if (!subscriptionData) {
    redirect('/auth/login');
  }
  
  return <SubscriptionPageContent data={subscriptionData} />;
}
```

### In API Routes

```typescript
import { getSubscriptionData } from '@/lib/subscription/getSubscriptionData';

export async function GET(request: NextRequest) {
  const data = await getSubscriptionData();
  
  if (!data) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json(data);
}
```

## Integration

### Updated Files

1. **`app/(student)/student/subscription/page.tsx`**
   - Now uses `getSubscriptionData()` server-side
   - Passes data directly to client component
   - No more client-side API calls

2. **`components/subscription/SubscriptionPage.tsx`**
   - Receives data as props (no loading state needed)
   - Converts `SubscriptionPageData` to `SubscriptionData` format for compatibility
   - Removed client-side fetching logic

## Error Handling

- Returns `null` if user not authenticated
- Logs warnings for non-critical Stripe errors (payment method, invoices)
- Throws errors for critical failures (database queries)
- Gracefully handles missing subscriptions (returns empty state)

## Performance Benefits

1. **Server-Side Rendering**: Data fetched on server, no client-side loading
2. **No API Round-Trip**: Direct database queries, faster than HTTP requests
3. **SEO Friendly**: Data available on initial page load
4. **Better UX**: No loading spinners, instant data display

## Database Queries

The function performs the following queries:

1. Get user from auth session
2. Get profile (for billing email)
3. Get subscription (by `user_id` or `student_profile_id`)
4. Get plan details (from `subscription_plans` or `subscription_tier_config`)
5. Get invoices (from `invoices` table, latest first)

## Stripe API Calls

If Stripe customer ID exists:

1. **Payment Method**: `stripe.customers.retrieve()` with expanded payment method
2. **Next Invoice**: `stripe.invoices.retrieveUpcoming()`
3. **Invoice History** (fallback): `stripe.invoices.list()` if no invoices in DB

## Currency Formatting

All amounts are formatted on the server using:
- `Intl.NumberFormat` for locale-aware formatting
- Currency symbols: £ (GBP), $ (USD), € (EUR)
- 2 decimal places minimum/maximum

Example outputs:
- `3900` pennies → `"£39.00"`
- `7900` pennies → `"£79.00"`
- `10000` pennies → `"$100.00"` (USD)

## Migration Notes

The old API route (`/api/subscription/data`) is still available but no longer used by the subscription page. It can be kept for backward compatibility or removed if not needed elsewhere.

## Testing

To test the data loader:

```typescript
// In a server component or API route
const data = await getSubscriptionData();
console.log(data);
```

Expected output structure matches `SubscriptionPageData` type with all fields populated (or null where appropriate).
