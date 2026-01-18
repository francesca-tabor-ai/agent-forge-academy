'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to the top of the page on route changes.
 * This ensures users always start at the top when navigating to a new page.
 * 
 * Features:
 * - Listens for pathname changes (route navigation)
 * - Scrolls to top immediately on route change
 * - Disables browser-native scroll restoration to prevent conflicts
 * - Lightweight with no delays or animations
 */
export function ScrollToTop() {
  const pathname = usePathname();

  // Disable browser-native scroll restoration once on mount
  // This ensures our app controls scroll behavior, not the browser
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []); // Run once on mount

  // Scroll to top on route change
  useEffect(() => {
    // Using window.scrollTo(0, 0) for immediate scroll without animation
    window.scrollTo(0, 0);
  }, [pathname]); // Trigger on every pathname change

  return null; // This component doesn't render anything
}
