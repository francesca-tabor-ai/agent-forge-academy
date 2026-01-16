/**
 * Clinical AI Sandbox - Audit Log Persistence
 * 
 * Handles optional persistence of audit logs to Supabase.
 * Includes debouncing/batching and graceful degradation.
 */

import type { AuditLogEntry } from './types';

interface PendingLogEntry {
  entry: AuditLogEntry;
  timestamp: number;
}

// Queue of pending log entries to persist
let pendingLogs: PendingLogEntry[] = [];
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isPersisting = false;

// Debounce delay (ms) - wait for more entries before persisting
const DEBOUNCE_DELAY = 1000; // 1 second
const BATCH_SIZE = 10; // Max entries per batch

/**
 * Persist a single audit log entry to Supabase
 * Gracefully degrades if API fails (silently fails)
 */
async function persistLogEntry(entry: AuditLogEntry): Promise<void> {
  try {
    const response = await fetch('/api/tools/clinical-audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool_id: 'clinical-ai-sandbox',
        entry: {
          ...entry,
          timestamp: entry.timestamp?.toISOString() || new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      // Silently fail - don't break the UI
      console.warn('Failed to persist audit log entry:', response.status, response.statusText);
    }
  } catch (error) {
    // Silently fail - don't break the UI
    console.warn('Error persisting audit log entry:', error);
  }
}

/**
 * Persist a batch of audit log entries
 */
async function persistBatch(entries: PendingLogEntry[]): Promise<void> {
  if (isPersisting || entries.length === 0) {
    return;
  }

  isPersisting = true;

  try {
    // Persist entries in parallel (up to BATCH_SIZE)
    const batch = entries.slice(0, BATCH_SIZE);
    await Promise.allSettled(batch.map(({ entry }) => persistLogEntry(entry)));

    // Remove persisted entries from queue
    pendingLogs = pendingLogs.slice(batch.length);

    // If there are more entries, schedule another batch
    if (pendingLogs.length > 0) {
      setTimeout(() => {
        isPersisting = false;
        persistBatch(pendingLogs);
      }, DEBOUNCE_DELAY);
    } else {
      isPersisting = false;
    }
  } catch (error) {
    // Silently fail - don't break the UI
    console.warn('Error persisting audit log batch:', error);
    isPersisting = false;
  }
}

/**
 * Queue an audit log entry for persistence
 * Uses debouncing to batch multiple entries together
 */
export function queueAuditLogForPersistence(entry: AuditLogEntry): void {
  // Add to pending queue
  pendingLogs.push({
    entry,
    timestamp: Date.now(),
  });

  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Schedule persistence after debounce delay
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    persistBatch(pendingLogs);
  }, DEBOUNCE_DELAY);

  // If queue is getting large, persist immediately
  if (pendingLogs.length >= BATCH_SIZE) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    persistBatch(pendingLogs);
  }
}

/**
 * Flush all pending audit logs immediately
 * Useful for cleanup or when component unmounts
 */
export function flushPendingAuditLogs(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  if (pendingLogs.length > 0) {
    persistBatch(pendingLogs);
  }
}
