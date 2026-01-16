/**
 * Content Systems Studio - Custom Hook
 * 
 * Hook for managing Content Systems Studio state using useReducer.
 */

'use client';

import { useReducer, useMemo, useEffect, useState } from 'react';
import type { Role } from './types';
import {
  initialState,
  contentSystemsStudioReducer,
  type ContentSystemsStudioState,
  type ContentSystemsStudioAction,
} from './state';
import { runRules as executeRules } from './rulesEngine';
import { getSchemaById } from './schemaRegistry';
import {
  loadContentItems,
  loadAuditEvents,
  saveContentItem,
  updateContentItem,
  appendAuditEvent,
  isPersistenceAvailable,
} from './persistence';

/**
 * Return type for the useContentSystemsStudio hook
 */
export interface UseContentSystemsStudioReturn {
  state: ContentSystemsStudioState;
  dispatch: React.Dispatch<ContentSystemsStudioAction>;
  // Convenience getters
  selectedItem: ContentSystemsStudioState['contentItems'][number] | null;
  selectedSchema: ContentSystemsStudioState['schemas'][number] | null;
  // Convenience actions
  selectItem: (itemId: string | null) => void;
  createItem: (
    item: Omit<ContentSystemsStudioState['contentItems'][number], 'id' | 'createdAt' | 'updatedAt'>,
    actorRole: Role
  ) => void;
  updateField: (itemId: string, fieldId: string, value: unknown, actorRole: Role) => void;
  validateItem: (itemId: string, errors: ContentSystemsStudioState['validationErrors']) => void;
  runRules: (itemId: string, results: ContentSystemsStudioState['ruleResults']) => void;
  ackWarnings: (itemId: string, warningCodes: string[]) => void;
  transitionState: (
    itemId: string,
    fromState: ContentSystemsStudioState['contentItems'][number]['status'],
    toState: ContentSystemsStudioState['contentItems'][number]['status'],
    actorRole: Role,
    comment?: string
  ) => void;
  addComment: (itemId: string, comment: string, actorRole: Role) => void;
  generateVariants: (
    sourceItemId: string,
    variants: Omit<ContentSystemsStudioState['contentItems'][number], 'id' | 'createdAt' | 'updatedAt'>[],
    actorRole: Role
  ) => void;
  addAuditEvent: (event: Omit<ContentSystemsStudioState['auditLog'][number], 'timestamp'>) => void;
}

/**
 * Custom hook for Content Systems Studio state management
 */
export function useContentSystemsStudio(): UseContentSystemsStudioReturn {
  const [state, dispatch] = useReducer(contentSystemsStudioReducer, initialState);
  const [persistenceEnabled, setPersistenceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const available = await isPersistenceAvailable();
        if (!available || !mounted) return;

        setPersistenceEnabled(true);
        setIsLoading(true);

        // Load content items
        const items = await loadContentItems();
        if (!mounted) return;

        // Load audit events for all items
        const allAuditEvents: ContentSystemsStudioState['auditLog'] = [];
        for (const item of items) {
          const events = await loadAuditEvents(item.id);
          allAuditEvents.push(...events);
        }

        if (!mounted) return;

        // Update state with loaded data
        if (items.length > 0 || allAuditEvents.length > 0) {
          dispatch({
            type: 'LOAD_FROM_PERSISTENCE',
            payload: {
              items,
              auditEvents: allAuditEvents,
            },
          });
        }
      } catch (error) {
        console.warn('Failed to load from Supabase, using local state:', error);
        // Graceful fallback - continue with local state
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // Save to Supabase when items change (debounced)
  useEffect(() => {
    if (!persistenceEnabled || isLoading) return;

    const timeoutId = setTimeout(async () => {
      // Save each item that has been modified
      for (const item of state.contentItems) {
        try {
          // Check if item exists in DB by trying to update it
          const updated = await updateContentItem(item);
          if (!updated) {
            // Item doesn't exist, create it
            await saveContentItem(item);
          }
        } catch (error) {
          console.warn(`Failed to persist item ${item.id}:`, error);
          // Graceful fallback - continue with local state
        }
      }
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [state.contentItems, persistenceEnabled, isLoading]);

  // Save audit events to Supabase when they're added
  useEffect(() => {
    if (!persistenceEnabled || isLoading) return;

    const newEvents = state.auditLog.filter((event) => {
      // Only save events that haven't been persisted yet
      // We can check this by looking at metadata or tracking persisted events
      return true; // For now, save all events (could be optimized)
    });

    for (const event of newEvents) {
      const itemId = event.metadata?.itemId as string | undefined;
      if (itemId) {
        appendAuditEvent(itemId, {
          actorRole: event.actorRole,
          action: event.action,
          fromState: event.fromState,
          toState: event.toState,
          metadata: event.metadata,
        }).catch((error) => {
          console.warn('Failed to persist audit event:', error);
          // Graceful fallback - continue with local state
        });
      }
    }
  }, [state.auditLog, persistenceEnabled, isLoading]);

  // Memoized convenience getters
  const selectedItem = useMemo(() => {
    if (!state.selectedItemId) {
      return null;
    }
    return state.contentItems.find((item) => item.id === state.selectedItemId) || null;
  }, [state.selectedItemId, state.contentItems]);

  const selectedSchema = useMemo(() => {
    if (!selectedItem) {
      return null;
    }
    return state.schemas.find((schema) => schema.id === selectedItem.schemaId) || null;
  }, [selectedItem, state.schemas]);

  // Convenience action creators
  const selectItem = (itemId: string | null) => {
    dispatch({ type: 'SELECT_ITEM', payload: itemId });
  };

  const createItem = (
    item: Omit<ContentSystemsStudioState['contentItems'][number], 'id' | 'createdAt' | 'updatedAt'>,
    actorRole: Role
  ) => {
    dispatch({ type: 'CREATE_ITEM', payload: { item, actorRole } });
  };

  const updateField = (itemId: string, fieldId: string, value: unknown, actorRole: Role) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { itemId, fieldId, value: value as ContentSystemsStudioState['contentItems'][number]['fields'][string], actorRole },
    });
  };

  const validateItem = (
    itemId: string,
    errors: ContentSystemsStudioState['validationErrors']
  ) => {
    dispatch({ type: 'VALIDATE_ITEM', payload: { itemId, errors } });
  };

  const runRules = (
    itemId: string,
    results: ContentSystemsStudioState['ruleResults']
  ) => {
    dispatch({ type: 'RUN_RULES', payload: { itemId, results } });
  };

  const ackWarnings = (itemId: string, warningCodes: string[]) => {
    dispatch({ type: 'ACK_WARNINGS', payload: { itemId, warningCodes } });
  };

  const transitionState = (
    itemId: string,
    fromState: ContentSystemsStudioState['contentItems'][number]['status'],
    toState: ContentSystemsStudioState['contentItems'][number]['status'],
    actorRole: Role,
    comment?: string
  ) => {
    // Run rules before allowing transition
    const item = state.contentItems.find((i) => i.id === itemId);
    if (item) {
      const schema = getSchemaById(item.schemaId);
      if (schema) {
        const ruleResults = executeRules(item, schema);
        runRules(itemId, ruleResults);

        // Check for blocking rules - prevent transition if any exist
        const blockingRules = ruleResults.filter((r) => r.status === 'block');
        if (blockingRules.length > 0) {
          // Don't transition if there are blocking rules
          return;
        }
      }
    }

    dispatch({
      type: 'TRANSITION_STATE',
      payload: { itemId, fromState, toState, actorRole, comment },
    });
  };

  const addComment = (itemId: string, comment: string, actorRole: Role) => {
    dispatch({ type: 'ADD_COMMENT', payload: { itemId, comment, actorRole } });
  };

  const generateVariants = (
    sourceItemId: string,
    variants: Omit<ContentSystemsStudioState['contentItems'][number], 'id' | 'createdAt' | 'updatedAt'>[],
    actorRole: Role
  ) => {
    dispatch({ type: 'GENERATE_VARIANTS', payload: { sourceItemId, variants, actorRole } });
  };

  const addAuditEvent = (event: Omit<ContentSystemsStudioState['auditLog'][number], 'timestamp'>) => {
    dispatch({ type: 'ADD_AUDIT_EVENT', payload: event });
  };

  return {
    state,
    dispatch,
    selectedItem,
    selectedSchema,
    selectItem,
    createItem,
    updateField,
    validateItem,
    runRules,
    ackWarnings,
    transitionState,
    addComment,
    generateVariants,
    addAuditEvent,
  };
}
