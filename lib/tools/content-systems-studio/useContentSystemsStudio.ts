/**
 * Content Systems Studio - Custom Hook
 * 
 * Hook for managing Content Systems Studio state using useReducer.
 */

'use client';

import { useReducer, useMemo } from 'react';
import type { Role } from './types';
import {
  initialState,
  contentSystemsStudioReducer,
  type ContentSystemsStudioState,
  type ContentSystemsStudioAction,
} from './state';

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
