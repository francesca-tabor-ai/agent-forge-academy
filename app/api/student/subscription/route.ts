import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionData } from '@/lib/subscription/getSubscriptionData';

// Force dynamic rendering - this route uses cookies for authentication
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * GET /api/student/subscription
 * 
 * Returns subscription page data for the authenticated user.
 * 
 * This is an alternative to server-side rendering for cases where:
 * - The page must be a client component
 * - You need client-side data fetching with SWR/React Query
 * - You want to refresh data without page reload
 * 
 * Preferred approach: Use server-side rendering in page.tsx with direct DB fetch
 * for better performance and SEO.
 * 
 * @returns SubscriptionPageData or error response
 */
export async function GET(request: NextRequest) {
  try {
    const subscriptionData = await getSubscriptionData();

    if (!subscriptionData) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(subscriptionData, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error('Error fetching subscription data:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error.message || 'Failed to fetch subscription data' 
      },
      { status: 500 }
    );
  }
}
