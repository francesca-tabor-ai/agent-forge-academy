/**
 * Content Systems Studio - Persistence Layer
 * 
 * Handles loading and saving to Supabase with graceful fallback to local state.
 */

import type {
  ContentItem,
  AuditEvent,
} from './types';

/**
 * Load content items from Supabase
 */
export async function loadContentItems(): Promise<ContentItem[]> {
  try {
    const response = await fetch('/api/tools/content-systems-studio/items');
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Auth issues - return empty array, will use local state
        return [];
      }
      throw new Error(`Failed to load content items: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.warn('Failed to load content items from Supabase, using local state:', error);
    return []; // Graceful fallback - return empty array, will use local state
  }
}

/**
 * Save content item to Supabase
 */
export async function saveContentItem(item: ContentItem): Promise<ContentItem | null> {
  try {
    const response = await fetch('/api/tools/content-systems-studio/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaId: item.schemaId,
        schemaVersion: '1.0.0',
        locale: item.locale,
        fields: item.fields,
        status: item.status,
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Auth issues - return null, will use local state
        return null;
      }
      throw new Error(`Failed to save content item: ${response.statusText}`);
    }

    const data = await response.json();
    return data.item || null;
  } catch (error) {
    console.warn('Failed to save content item to Supabase, using local state:', error);
    return null; // Graceful fallback - return null, will use local state
  }
}

/**
 * Update content item in Supabase
 */
export async function updateContentItem(item: ContentItem): Promise<ContentItem | null> {
  try {
    const response = await fetch(`/api/tools/content-systems-studio/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: item.fields,
        status: item.status,
        locale: item.locale,
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Auth issues - return null, will use local state
        return null;
      }
      if (response.status === 404) {
        // Item doesn't exist in DB, try creating it
        return saveContentItem(item);
      }
      throw new Error(`Failed to update content item: ${response.statusText}`);
    }

    const data = await response.json();
    return data.item || null;
  } catch (error) {
    console.warn('Failed to update content item in Supabase, using local state:', error);
    return null; // Graceful fallback - return null, will use local state
  }
}

/**
 * Load audit events from Supabase
 */
export async function loadAuditEvents(contentItemId?: string): Promise<AuditEvent[]> {
  try {
    const url = contentItemId
      ? `/api/tools/content-systems-studio/audit-events?content_item_id=${contentItemId}`
      : '/api/tools/content-systems-studio/audit-events';
    
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Auth issues - return empty array, will use local state
        return [];
      }
      throw new Error(`Failed to load audit events: ${response.statusText}`);
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.warn('Failed to load audit events from Supabase, using local state:', error);
    return []; // Graceful fallback - return empty array, will use local state
  }
}

/**
 * Append audit event to Supabase (append-only)
 */
export async function appendAuditEvent(
  contentItemId: string,
  event: Omit<AuditEvent, 'timestamp'>
): Promise<AuditEvent | null> {
  try {
    const response = await fetch('/api/tools/content-systems-studio/audit-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentItemId,
        event: {
          ...event,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Auth issues - return null, will use local state
        return null;
      }
      throw new Error(`Failed to append audit event: ${response.statusText}`);
    }

    const data = await response.json();
    return data.event || null;
  } catch (error) {
    console.warn('Failed to append audit event to Supabase, using local state:', error);
    return null; // Graceful fallback - return null, will use local state
  }
}

/**
 * Check if persistence is available (Supabase is accessible)
 */
export async function isPersistenceAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/tools/content-systems-studio/items', {
      method: 'HEAD', // Just check if endpoint is available
    });
    return response.ok || response.status === 401; // 401 means endpoint exists, just needs auth
  } catch {
    return false;
  }
}
