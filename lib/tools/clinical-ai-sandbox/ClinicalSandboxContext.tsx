'use client';

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import {
  clinicalSandboxReducer,
  initialState,
  type ClinicalSandboxState,
  type ClinicalSandboxAction,
} from './state';

/**
 * Context for Clinical AI Sandbox state
 */
interface ClinicalSandboxContextValue {
  state: ClinicalSandboxState;
  dispatch: React.Dispatch<ClinicalSandboxAction>;
}

const ClinicalSandboxContext = createContext<ClinicalSandboxContextValue | null>(null);

/**
 * Provider component for Clinical AI Sandbox state
 */
export function ClinicalSandboxProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(clinicalSandboxReducer, initialState);

  return (
    <ClinicalSandboxContext.Provider value={{ state, dispatch }}>
      {children}
    </ClinicalSandboxContext.Provider>
  );
}

/**
 * Hook to access Clinical AI Sandbox context
 * Throws an error if used outside of ClinicalSandboxProvider
 */
export function useClinicalSandboxContext() {
  const context = useContext(ClinicalSandboxContext);
  if (!context) {
    throw new Error(
      'useClinicalSandboxContext must be used within a ClinicalSandboxProvider'
    );
  }
  return context;
}
