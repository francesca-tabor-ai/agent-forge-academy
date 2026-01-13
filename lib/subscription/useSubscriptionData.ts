/**
 * React Hook for client-side subscription data fetching
 * 
 * Use this if you need to fetch subscription data in a client component
 * with SWR for automatic refetching, caching, etc.
 * 
 * Example:
 * ```tsx
 * import { useSubscriptionData } from '@/lib/subscription/useSubscriptionData';
 * 
 * function MyComponent() {
 *   const { data, error, isLoading } = useSubscriptionData();
 *   // ...
 * }
 * ```
 */

'use client';

import { useState, useEffect } from 'react';
import type { SubscriptionPageData } from './getSubscriptionData';
import useSWR from 'swr';

const API_ENDPOINT = '/api/student/subscription';

/**
 * Fetcher function for SWR
 */
async function fetchSubscriptionData(): Promise<SubscriptionPageData> {
  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to fetch subscription data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Hook for fetching subscription data with SWR
 * 
 * @example
 * ```tsx
 * import { useSubscriptionData } from '@/lib/subscription/useSubscriptionData';
 * 
 * function MyComponent() {
 *   const { data, error, isLoading } = useSubscriptionData();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return <SubscriptionContent data={data} />;
 * }
 * ```
 */
export function useSubscriptionData() {
  return useSWR<SubscriptionPageData>(API_ENDPOINT, fetchSubscriptionData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // 5 seconds
  });
}

/**
 * @deprecated Use `useSubscriptionData` instead. This function is kept for backwards compatibility.
 */
export function useSubscriptionDataSWR() {
  return useSubscriptionData();
}

/**
 * Manual fetch hook (fallback if SWR not available)
 * 
 * @example
 * ```tsx
 * import { useSubscriptionDataManual } from '@/lib/subscription/useSubscriptionData';
 * 
 * function MyComponent() {
 *   const { data, error, isLoading } = useSubscriptionDataManual();
 * }
 * ```
 */
export function useSubscriptionDataManual() {
  const [data, setData] = useState<SubscriptionPageData | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setIsLoading(true);
        setError(undefined);
        const result = await fetchSubscriptionData();
        if (!cancelled) {
          setData(result);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, error, isLoading };
}
