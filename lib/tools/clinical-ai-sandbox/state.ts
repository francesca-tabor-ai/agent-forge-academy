/**
 * Clinical AI Sandbox - State Management
 * 
 * Global state management using useReducer for the Clinical AI Sandbox.
 */

import type {
  ModuleId,
  BoundaryAction,
  EscalationPath,
  AuditLogEntry,
} from './types';
import { getDefaultModule } from './registry';

/**
 * State structure for the Clinical AI Sandbox
 */
export interface ClinicalSandboxState {
  activeModule: ModuleId;
  auditLog: AuditLogEntry[];
  boundarySelection: BoundaryAction | null;
  activeDocset: string | null;
  voiceMode: boolean;
}

/**
 * Initial state for the Clinical AI Sandbox
 */
export const initialState: ClinicalSandboxState = {
  activeModule: getDefaultModule().id,
  auditLog: [],
  boundarySelection: null,
  activeDocset: null,
  voiceMode: false,
};

/**
 * Action types for the reducer
 */
export type ClinicalSandboxAction =
  | {
      type: 'ADD_AUDIT_LOG_ENTRY';
      payload: Omit<AuditLogEntry, 'timestamp'> & { timestamp?: Date };
    }
  | {
      type: 'SET_ACTIVE_MODULE';
      payload: ModuleId;
    }
  | {
      type: 'SET_BOUNDARY_SELECTION';
      payload: BoundaryAction | null;
    }
  | {
      type: 'SET_ACTIVE_DOCSET';
      payload: string | null;
    }
  | {
      type: 'SET_VOICE_MODE';
      payload: boolean;
    };

/**
 * Reducer function for Clinical AI Sandbox state
 */
export function clinicalSandboxReducer(
  state: ClinicalSandboxState,
  action: ClinicalSandboxAction
): ClinicalSandboxState {
  switch (action.type) {
    case 'ADD_AUDIT_LOG_ENTRY': {
      const entry: AuditLogEntry = {
        ...action.payload,
        timestamp: action.payload.timestamp || new Date(),
      };
      return {
        ...state,
        auditLog: [...state.auditLog, entry],
      };
    }

    case 'SET_ACTIVE_MODULE': {
      return {
        ...state,
        activeModule: action.payload,
      };
    }

    case 'SET_BOUNDARY_SELECTION': {
      return {
        ...state,
        boundarySelection: action.payload,
      };
    }

    case 'SET_ACTIVE_DOCSET': {
      return {
        ...state,
        activeDocset: action.payload,
      };
    }

    case 'SET_VOICE_MODE': {
      return {
        ...state,
        voiceMode: action.payload,
      };
    }

    default: {
      return state;
    }
  }
}
