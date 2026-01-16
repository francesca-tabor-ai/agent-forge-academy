/**
 * Clinical AI Sandbox - Custom Hook
 * 
 * Hook for accessing and modifying Clinical AI Sandbox state.
 */

import { useCallback } from 'react';
import { useClinicalSandboxContext } from './ClinicalSandboxContext';
import type {
  ModuleId,
  BoundaryAction,
  EscalationPath,
  AuditLogEntry,
} from './types';

/**
 * Hook for accessing and modifying Clinical AI Sandbox state
 */
export function useClinicalSandbox() {
  const { state, dispatch } = useClinicalSandboxContext();

  /**
   * Add an audit log entry
   */
  const addAuditLogEntry = useCallback(
    (entry: Omit<AuditLogEntry, 'timestamp'> & { timestamp?: Date }) => {
      dispatch({
        type: 'ADD_AUDIT_LOG_ENTRY',
        payload: entry,
      });
    },
    [dispatch]
  );

  /**
   * Set the active module
   */
  const setActiveModule = useCallback(
    (moduleId: ModuleId) => {
      dispatch({
        type: 'SET_ACTIVE_MODULE',
        payload: moduleId,
      });
    },
    [dispatch]
  );

  /**
   * Set the boundary selection
   */
  const setBoundarySelection = useCallback(
    (selection: BoundaryAction | null) => {
      dispatch({
        type: 'SET_BOUNDARY_SELECTION',
        payload: selection,
      });
    },
    [dispatch]
  );

  /**
   * Set the active docset
   */
  const setActiveDocset = useCallback(
    (docset: string | null) => {
      dispatch({
        type: 'SET_ACTIVE_DOCSET',
        payload: docset,
      });
    },
    [dispatch]
  );

  /**
   * Set voice mode (on/off)
   */
  const setVoiceMode = useCallback(
    (enabled: boolean) => {
      dispatch({
        type: 'SET_VOICE_MODE',
        payload: enabled,
      });
    },
    [dispatch]
  );

  return {
    // State
    state,
    activeModule: state.activeModule,
    auditLog: state.auditLog,
    boundarySelection: state.boundarySelection,
    activeDocset: state.activeDocset,
    voiceMode: state.voiceMode,

    // Actions
    addAuditLogEntry,
    setActiveModule,
    setBoundarySelection,
    setActiveDocset,
    setVoiceMode,
  };
}
