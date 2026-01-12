/**
 * React Hook for client-side subscription data fetching
 * 
 * Use this if you need to fetch subscription data in a client component
 * with SWR or React Query for automatic refetching, caching, etc.
 * 
 * Example with SWR:
 * ```tsx
 * import useSWR from 'swr';
 * import { useSubscriptionData } from '@/lib/subscription/useSubscriptionData';
 * 
 * function MyComponent() {
 *   const { data, error, isLoading } = useSubscriptionData();
 *   // ...
 * }
 * ```
 * 
 * Example with React Query:
 * ```tsx
 * import { useQuery } from '@tanstack/react-query';
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
 * Fetcher function for SWR/React Query
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
 * Hook for use with SWR
 * 
 * @example
 * ```tsx
 * import useSWR from 'swr';
 * import { useSubscriptionDataSWR } from '@/lib/subscription/useSubscriptionData';
 * 
 * function MyComponent() {
 *   const { data, error, isLoading } = useSubscriptionDataSWR();
 * }
 * ```
 */
export function useSubscriptionDataSWR() {
  return useSWR<SubscriptionPageData>(API_ENDPOINT, fetchSubscriptionData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // 5 seconds
  });
}

/**
 * Hook for use with React Query
 * 
 * @example
 * ```tsx
 * import { useQuery } from '@tanstack/react-query';
 * import { useSubscriptionDataQuery } from '@/lib/subscription/useSubscriptionData';
 * 
 * function MyComponent() {
 *   const { data, error, isLoading } = useSubscriptionDataQuery();
 * }
 * ```
 */
export function useSubscriptionDataQuery() {
  // Dynamic import to avoid bundling React Query if not used
  const { useQuery } = require('@tanstack/react-query');
  return useQuery<SubscriptionPageData>({
    queryKey: ['subscription-data'],
    queryFn: fetchSubscriptionData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Manual fetch hook (fallback if SWR/React Query not available)
 * 
 * @example
 * ```tsx
 * import { useState, useEffect } from 'react';
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
