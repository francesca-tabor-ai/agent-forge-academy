'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Component that checks for new GitHub-synced projects after profile save
 * and refreshes the page to show them
 */
export function GitHubSyncStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [syncChecked, setSyncChecked] = useState(false);

  useEffect(() => {
    // Check if we just saved a profile with GitHub URL
    const profileSaved = searchParams.get('profileSaved');
    const githubUrlSaved = searchParams.get('githubUrlSaved');

    if ((profileSaved === '1' || githubUrlSaved === '1') && !syncChecked) {
      setSyncChecked(true);

      // Wait a bit for async GitHub sync to complete, then refresh
      // GitHub sync typically takes 2-5 seconds
      const refreshTimer = setTimeout(() => {
        router.refresh();
      }, 5000); // Wait 5 seconds for sync to complete

      return () => clearTimeout(refreshTimer);
    }
  }, [searchParams, router, syncChecked]);

  return null; // This component doesn't render anything
}
