'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { PlaygroundState } from './types';

interface UsePersistenceOptions {
  caseId: string | null;
  state: PlaygroundState;
  enabled?: boolean;
  debounceMs?: number;
}

interface PersistenceResult {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  save: () => Promise<void>;
  load: () => Promise<PlaygroundState | null>;
}

export function usePersistence({
  caseId,
  state,
  enabled = true,
  debounceMs = 2000,
}: UsePersistenceOptions): PersistenceResult {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(navigator.onLine);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
    };
    const handleOffline = () => {
      isOnlineRef.current = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const save = useCallback(async () => {
    if (!enabled || !caseId || !isOnlineRef.current) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/tools/product-fundamentals/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save case');
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving case:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
      // Gracefully fallback - don't throw, just log
    } finally {
      setIsSaving(false);
    }
  }, [caseId, state, enabled]);

  // Debounced autosave
  useEffect(() => {
    if (!enabled || !caseId) {
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [state, caseId, enabled, debounceMs, save]);

  const load = useCallback(async (): Promise<PlaygroundState | null> => {
    if (!caseId || !isOnlineRef.current) {
      return null;
    }

    try {
      const response = await fetch(`/api/tools/product-fundamentals/cases/${caseId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Case doesn't exist yet
        }
        throw new Error('Failed to load case');
      }

      const data = await response.json();
      return data.case?.state || null;
    } catch (err) {
      console.error('Error loading case:', err);
      setError(err instanceof Error ? err.message : 'Failed to load');
      return null; // Gracefully fallback
    }
  }, [caseId]);

  return {
    isSaving,
    lastSaved,
    error,
    save,
    load,
  };
}
