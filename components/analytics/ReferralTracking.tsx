'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Tracks sales referral landing events
 * Fires 'sales_referral_landing' event (GA4) and 'sales_referral_visit' event (Vercel Analytics)
 * when 'ref' query param is present
 * Only fires once per session using sessionStorage
 */
export function ReferralTracking() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check if already fired in this session
    const eventKey = 'sales_referral_landing_fired';
    if (sessionStorage.getItem(eventKey)) {
      return;
    }

    // Check for 'ref' query parameter
    const ref = searchParams.get('ref');
    if (!ref) {
      return;
    }

    // Get UTM parameters
    const utmCampaign = searchParams.get('utm_campaign') || undefined;
    const utmContent = searchParams.get('utm_content') || undefined;

    // Get destination path from current URL
    const destinationPath = window.location.pathname;

    // Fire GA4 event if available
    if (window.gtag) {
      window.gtag('event', 'sales_referral_landing', {
        ref,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
      });
    }

    // Fire Vercel Analytics event if available
    if (window.va) {
      window.va('track', 'sales_referral_visit', {
        slug: ref,
        ref: ref,
        campaign: utmCampaign,
        destinationPath: destinationPath,
      });
    }

    // Mark as fired in this session
    sessionStorage.setItem(eventKey, 'true');
  }, [searchParams]);

  return null;
}

// Extend Window interface for gtag and Vercel Analytics
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    va?: (method: 'track', eventName: string, properties?: Record<string, any>) => void;
  }
}
