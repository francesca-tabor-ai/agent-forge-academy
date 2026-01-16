/**
 * Pricing & Risk Lab - State Management
 * 
 * Unified state management using useReducer for the Pricing & Risk Lab tool.
 * Includes audit log for governance by design.
 */

import type {
  Market,
  Segment,
  Channel,
  PaymentMethod,
  SimulationResult,
  SimulationSettings,
  ExperimentDraft,
  Alert,
  PricingScenario,
} from './types';
import {
  DEFAULT_MARKETS,
  DEFAULT_SEGMENTS,
  DEFAULT_CHANNELS,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_PRICING_SCENARIO,
} from './defaults';

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string; // e.g., 'ran_simulation', 'changed_threshold', 'approved_experiment', 'exported_config'
  metadata?: Record<string, unknown>; // Additional context about the action
}

/**
 * Trade-off snapshot
 */
export interface TradeoffSnapshot {
  id: string;
  timestamp: Date;
  riskTolerance: 'low' | 'medium' | 'high';
  approvalThreshold: number;
  fraudStrictness: number;
  result: SimulationResult;
}

/**
 * Scenario configuration
 */
export interface ScenarioConfig {
  basePrice: number;
  discountPercentage: number;
  marketOverride?: string;
  marketOverrideAdjustment?: number;
  segment: string;
  market: string;
  channel: string;
  paymentMethod: string;
  riskTolerance: 'low' | 'medium' | 'high';
  approvalThreshold: number;
  fraudStrictness: number;
  timeHorizon: number;
}

/**
 * Unified state structure for Pricing & Risk Lab
 */
export interface PricingRiskLabState {
  // Selected filters
  selectedMarket: Market | null;
  selectedSegment: Segment | null;
  selectedChannel: Channel | null;
  selectedPaymentMethod: PaymentMethod | null;

  // Scenarios
  baselineScenario: ScenarioConfig | null;
  proposedScenario: ScenarioConfig | null;

  // Settings sliders
  tradeoffSettings: {
    riskTolerance: 'low' | 'medium' | 'high';
    approvalThreshold: number;
    fraudStrictness: number;
  };

  // Simulation results
  baselineResult: SimulationResult | null;
  proposedResult: SimulationResult | null;

  // Experiment drafts
  experimentDrafts: ExperimentDraft[];

  // Snapshots
  snapshots: TradeoffSnapshot[];

  // Alerts
  alerts: Alert[];

  // Audit log (append-only)
  auditLog: AuditLogEntry[];
}

/**
 * Initial state
 */
export const initialState: PricingRiskLabState = {
  selectedMarket: DEFAULT_MARKETS[0],
  selectedSegment: DEFAULT_SEGMENTS[0],
  selectedChannel: DEFAULT_CHANNELS[0],
  selectedPaymentMethod: DEFAULT_PAYMENT_METHODS[0],
  baselineScenario: null,
  proposedScenario: null,
  tradeoffSettings: {
    riskTolerance: 'medium',
    approvalThreshold: 0.90,
    fraudStrictness: 0.5,
  },
  baselineResult: null,
  proposedResult: null,
  experimentDrafts: [],
  snapshots: [],
  alerts: [],
  auditLog: [],
};

/**
 * Action types for the reducer
 */
export type PricingRiskLabAction =
  | { type: 'SET_SELECTED_MARKET'; payload: Market }
  | { type: 'SET_SELECTED_SEGMENT'; payload: Segment }
  | { type: 'SET_SELECTED_CHANNEL'; payload: Channel }
  | { type: 'SET_SELECTED_PAYMENT_METHOD'; payload: PaymentMethod }
  | { type: 'SET_BASELINE_SCENARIO'; payload: ScenarioConfig }
  | { type: 'SET_PROPOSED_SCENARIO'; payload: ScenarioConfig }
  | { type: 'SET_TRADEOFF_SETTINGS'; payload: PricingRiskLabState['tradeoffSettings'] }
  | { type: 'SET_BASELINE_RESULT'; payload: SimulationResult }
  | { type: 'SET_PROPOSED_RESULT'; payload: SimulationResult }
  | { type: 'ADD_EXPERIMENT_DRAFT'; payload: ExperimentDraft }
  | { type: 'UPDATE_EXPERIMENT_DRAFT'; payload: { id: string; updates: Partial<ExperimentDraft> } }
  | { type: 'DELETE_EXPERIMENT_DRAFT'; payload: string }
  | { type: 'ADD_SNAPSHOT'; payload: TradeoffSnapshot }
  | { type: 'DELETE_SNAPSHOT'; payload: string }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'ADD_AUDIT_ENTRY'; payload: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: Date } }
  | { type: 'RESET_STATE' };

/**
 * Generate unique ID
 */
function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Reducer function for Pricing & Risk Lab state
 */
export function pricingRiskLabReducer(
  state: PricingRiskLabState,
  action: PricingRiskLabAction
): PricingRiskLabState {
  switch (action.type) {
    case 'SET_SELECTED_MARKET': {
      return {
        ...state,
        selectedMarket: action.payload,
      };
    }

    case 'SET_SELECTED_SEGMENT': {
      return {
        ...state,
        selectedSegment: action.payload,
      };
    }

    case 'SET_SELECTED_CHANNEL': {
      return {
        ...state,
        selectedChannel: action.payload,
      };
    }

    case 'SET_SELECTED_PAYMENT_METHOD': {
      return {
        ...state,
        selectedPaymentMethod: action.payload,
      };
    }

    case 'SET_BASELINE_SCENARIO': {
      return {
        ...state,
        baselineScenario: action.payload,
      };
    }

    case 'SET_PROPOSED_SCENARIO': {
      return {
        ...state,
        proposedScenario: action.payload,
      };
    }

    case 'SET_TRADEOFF_SETTINGS': {
      return {
        ...state,
        tradeoffSettings: action.payload,
      };
    }

    case 'SET_BASELINE_RESULT': {
      return {
        ...state,
        baselineResult: action.payload,
      };
    }

    case 'SET_PROPOSED_RESULT': {
      return {
        ...state,
        proposedResult: action.payload,
      };
    }

    case 'ADD_EXPERIMENT_DRAFT': {
      return {
        ...state,
        experimentDrafts: [...state.experimentDrafts, action.payload],
      };
    }

    case 'UPDATE_EXPERIMENT_DRAFT': {
      return {
        ...state,
        experimentDrafts: state.experimentDrafts.map((draft) =>
          draft.id === action.payload.id
            ? { ...draft, ...action.payload.updates, updatedAt: new Date() }
            : draft
        ),
      };
    }

    case 'DELETE_EXPERIMENT_DRAFT': {
      return {
        ...state,
        experimentDrafts: state.experimentDrafts.filter((draft) => draft.id !== action.payload),
      };
    }

    case 'ADD_SNAPSHOT': {
      return {
        ...state,
        snapshots: [action.payload, ...state.snapshots],
      };
    }

    case 'DELETE_SNAPSHOT': {
      return {
        ...state,
        snapshots: state.snapshots.filter((snapshot) => snapshot.id !== action.payload),
      };
    }

    case 'ADD_ALERT': {
      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
      };
    }

    case 'ACKNOWLEDGE_ALERT': {
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload
            ? { ...alert, acknowledged: true, acknowledgedAt: new Date() }
            : alert
        ),
      };
    }

    case 'ADD_AUDIT_ENTRY': {
      const entry: AuditLogEntry = {
        id: generateId('audit'),
        timestamp: action.payload.timestamp || new Date(),
        action: action.payload.action,
        metadata: action.payload.metadata,
      };
      // Append-only: never mutate existing entries
      return {
        ...state,
        auditLog: [...state.auditLog, entry],
      };
    }

    case 'RESET_STATE': {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
