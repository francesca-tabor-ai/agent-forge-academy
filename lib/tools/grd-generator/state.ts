// State management for GRD Generator

import { GRDGeneratorState, PRDInput, GovernanceSignals, AIClassification, GRD } from './types';

export type GRDAction =
  | { type: 'SET_PRD_INPUT'; payload: PRDInput }
  | { type: 'SET_SIGNALS'; payload: GovernanceSignals }
  | { type: 'SET_CLASSIFICATION'; payload: AIClassification }
  | { type: 'SET_GRD'; payload: GRD }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STEP'; payload: 'upload' | 'review' | 'gaps' | 'export' }
  | { type: 'RESET' };

export const initialState: GRDGeneratorState = {
  prdInput: null,
  signals: null,
  classification: null,
  grd: null,
  isLoading: false,
  error: null,
  currentStep: 'upload',
};

export function grdReducer(
  state: GRDGeneratorState,
  action: GRDAction
): GRDGeneratorState {
  switch (action.type) {
    case 'SET_PRD_INPUT':
      return { ...state, prdInput: action.payload, error: null };
    
    case 'SET_SIGNALS':
      return { ...state, signals: action.payload };
    
    case 'SET_CLASSIFICATION':
      return { ...state, classification: action.payload };
    
    case 'SET_GRD':
      return { ...state, grd: action.payload, currentStep: 'review' };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}
