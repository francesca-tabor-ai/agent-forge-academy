/**
 * Pricing & Risk Lab - Custom Hook
 * 
 * Hook for managing Pricing & Risk Lab unified state using useReducer.
 * Includes optional Supabase persistence with graceful fallback.
 */

'use client';

import { useReducer, useMemo, useCallback, useEffect, useState } from 'react';
import {
  initialState,
  pricingRiskLabReducer,
  type PricingRiskLabState,
  type PricingRiskLabAction,
  type AuditLogEntry,
  type TradeoffSnapshot,
  type ScenarioConfig,
} from './state';
import type {
  Market,
  Segment,
  Channel,
  PaymentMethod,
  SimulationResult,
  ExperimentDraft,
  Alert,
  PricingScenario,
} from './types';

/**
 * Return type for the usePricingRiskLab hook
 */
export interface UsePricingRiskLabReturn {
  state: PricingRiskLabState;
  dispatch: React.Dispatch<PricingRiskLabAction>;
  
  // Convenience actions with audit logging
  setSelectedMarket: (market: Market) => void;
  setSelectedSegment: (segment: Segment) => void;
  setSelectedChannel: (channel: Channel) => void;
  setSelectedPaymentMethod: (paymentMethod: PaymentMethod) => void;
  setBaselineScenario: (scenario: ScenarioConfig) => void;
  setProposedScenario: (scenario: ScenarioConfig) => void;
  setTradeoffSettings: (settings: PricingRiskLabState['tradeoffSettings']) => void;
  setBaselineResult: (result: SimulationResult) => void;
  setProposedResult: (result: SimulationResult) => void;
  addExperimentDraft: (draft: ExperimentDraft) => void;
  updateExperimentDraft: (id: string, updates: Partial<ExperimentDraft>) => void;
  deleteExperimentDraft: (id: string) => void;
  addSnapshot: (snapshot: TradeoffSnapshot) => void;
  deleteSnapshot: (id: string) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (id: string) => void;
  addAuditEntry: (action: string, metadata?: Record<string, unknown>) => void;
  resetState: () => void;
  
  // Persistence functions (with graceful fallback)
  saveScenario: (name: string, data: PricingScenario) => Promise<string | null>;
  loadScenarios: () => Promise<void>;
  saveExperiment: (name: string, draft: ExperimentDraft) => Promise<string | null>;
  loadExperiments: () => Promise<void>;
  saveSnapshotToDB: (snapshot: TradeoffSnapshot, experimentId?: string) => Promise<string | null>;
  loadSnapshots: (experimentId?: string) => Promise<void>;
  persistAuditEvent: (entry: AuditLogEntry) => Promise<void>;
  isLoading: boolean;
  persistenceError: string | null;
}

/**
 * Custom hook for Pricing & Risk Lab state management
 */
export function usePricingRiskLab(): UsePricingRiskLabReturn {
  const [state, dispatch] = useReducer(pricingRiskLabReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  // Convenience action creators with audit logging
  const setSelectedMarket = useCallback((market: Market) => {
    dispatch({ type: 'SET_SELECTED_MARKET', payload: market });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'changed_market',
        metadata: { marketCode: market.code, currency: market.currency },
      },
    });
  }, []);

  const setSelectedSegment = useCallback((segment: Segment) => {
    dispatch({ type: 'SET_SELECTED_SEGMENT', payload: segment });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'changed_segment',
        metadata: { segmentName: segment.name, riskProfile: segment.riskProfile },
      },
    });
  }, []);

  const setSelectedChannel = useCallback((channel: Channel) => {
    dispatch({ type: 'SET_SELECTED_CHANNEL', payload: channel });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'changed_channel',
        metadata: { channelName: channel.name },
      },
    });
  }, []);

  const setSelectedPaymentMethod = useCallback((paymentMethod: PaymentMethod) => {
    dispatch({ type: 'SET_SELECTED_PAYMENT_METHOD', payload: paymentMethod });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'changed_payment_method',
        metadata: { paymentMethodName: paymentMethod.name },
      },
    });
  }, []);

  const setBaselineScenario = useCallback((scenario: ScenarioConfig) => {
    dispatch({ type: 'SET_BASELINE_SCENARIO', payload: scenario });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'set_baseline_scenario',
        metadata: { basePrice: scenario.basePrice, segment: scenario.segment },
      },
    });
  }, []);

  const setProposedScenario = useCallback((scenario: ScenarioConfig) => {
    dispatch({ type: 'SET_PROPOSED_SCENARIO', payload: scenario });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'set_proposed_scenario',
        metadata: { basePrice: scenario.basePrice, segment: scenario.segment },
      },
    });
  }, []);

  const setTradeoffSettings = useCallback((settings: PricingRiskLabState['tradeoffSettings']) => {
    dispatch({ type: 'SET_TRADEOFF_SETTINGS', payload: settings });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'changed_threshold',
        metadata: {
          riskTolerance: settings.riskTolerance,
          approvalThreshold: settings.approvalThreshold,
          fraudStrictness: settings.fraudStrictness,
        },
      },
    });
  }, []);

  const setBaselineResult = useCallback((result: SimulationResult) => {
    dispatch({ type: 'SET_BASELINE_RESULT', payload: result });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'ran_simulation',
        metadata: {
          simulationType: 'baseline',
          conversionRate: result.conversionRate,
          revenue: result.revenue,
          fraudLoss: result.fraudLoss,
        },
      },
    });
  }, []);

  const setProposedResult = useCallback((result: SimulationResult) => {
    dispatch({ type: 'SET_PROPOSED_RESULT', payload: result });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'ran_simulation',
        metadata: {
          simulationType: 'proposed',
          conversionRate: result.conversionRate,
          revenue: result.revenue,
          fraudLoss: result.fraudLoss,
        },
      },
    });
  }, []);

  const addExperimentDraft = useCallback((draft: ExperimentDraft) => {
    dispatch({ type: 'ADD_EXPERIMENT_DRAFT', payload: draft });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'created_experiment',
        metadata: { experimentId: draft.id, experimentName: draft.name },
      },
    });
  }, []);

  const updateExperimentDraft = useCallback((id: string, updates: Partial<ExperimentDraft>) => {
    dispatch({ type: 'UPDATE_EXPERIMENT_DRAFT', payload: { id, updates } });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'updated_experiment',
        metadata: { experimentId: id, updates },
      },
    });
  }, []);

  const deleteExperimentDraft = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EXPERIMENT_DRAFT', payload: id });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'deleted_experiment',
        metadata: { experimentId: id },
      },
    });
  }, []);

  const addSnapshot = useCallback((snapshot: TradeoffSnapshot) => {
    dispatch({ type: 'ADD_SNAPSHOT', payload: snapshot });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'saved_snapshot',
        metadata: { snapshotId: snapshot.id },
      },
    });
  }, []);

  const deleteSnapshot = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SNAPSHOT', payload: id });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'deleted_snapshot',
        metadata: { snapshotId: id },
      },
    });
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    dispatch({ type: 'ADD_ALERT', payload: alert });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'alert_triggered',
        metadata: { alertId: alert.id, alertType: alert.type, severity: alert.severity },
      },
    });
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: id });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'acknowledged_alert',
        metadata: { alertId: id },
      },
    });
  }, []);

  const addAuditEntry = useCallback((action: string, metadata?: Record<string, unknown>) => {
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: { action, metadata },
    });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        action: 'reset_state',
        metadata: {},
      },
    });
  }, []);

  // Persistence functions with graceful fallback
  const saveScenario = useCallback(async (name: string, data: PricingScenario): Promise<string | null> => {
    try {
      setIsLoading(true);
      setPersistenceError(null);
      const response = await fetch('/api/tools/pricing-risk-lab/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save scenario: ${response.statusText}`);
      }
      const { scenario } = await response.json();
      return scenario.id;
    } catch (error) {
      console.warn('Failed to save scenario (graceful fallback):', error);
      setPersistenceError(error instanceof Error ? error.message : 'Failed to save scenario');
      return null; // Graceful fallback: return null instead of throwing
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadScenarios = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setPersistenceError(null);
      const response = await fetch('/api/tools/pricing-risk-lab/scenarios');
      if (!response.ok) {
        throw new Error(`Failed to load scenarios: ${response.statusText}`);
      }
      const { scenarios } = await response.json();
      // Note: Scenarios are loaded but not automatically applied to state
      // Components can use this data as needed
    } catch (error) {
      console.warn('Failed to load scenarios (graceful fallback):', error);
      setPersistenceError(error instanceof Error ? error.message : 'Failed to load scenarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveExperiment = useCallback(async (name: string, draft: ExperimentDraft): Promise<string | null> => {
    try {
      setIsLoading(true);
      setPersistenceError(null);
      const response = await fetch('/api/tools/pricing-risk-lab/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, draft, status: draft.status || 'draft' }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save experiment: ${response.statusText}`);
      }
      const { experiment } = await response.json();
      return experiment.id;
    } catch (error) {
      console.warn('Failed to save experiment (graceful fallback):', error);
      setPersistenceError(error instanceof Error ? error.message : 'Failed to save experiment');
      return null; // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadExperiments = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setPersistenceError(null);
      const response = await fetch('/api/tools/pricing-risk-lab/experiments');
      if (!response.ok) {
        throw new Error(`Failed to load experiments: ${response.statusText}`);
      }
      const { experiments } = await response.json();
      // Load experiments into state
      experiments.forEach((exp: { draft: ExperimentDraft }) => {
        if (exp.draft) {
          dispatch({ type: 'ADD_EXPERIMENT_DRAFT', payload: exp.draft });
        }
      });
    } catch (error) {
      console.warn('Failed to load experiments (graceful fallback):', error);
      setPersistenceError(error instanceof Error ? error.message : 'Failed to load experiments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSnapshotToDB = useCallback(async (
    snapshot: TradeoffSnapshot,
    experimentId?: string
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      setPersistenceError(null);
      const response = await fetch('/api/tools/pricing-risk-lab/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experiment_id: experimentId,
          snapshot: {
            id: snapshot.id,
            timestamp: snapshot.timestamp.toISOString(),
            riskTolerance: snapshot.riskTolerance,
            approvalThreshold: snapshot.approvalThreshold,
            fraudStrictness: snapshot.fraudStrictness,
            result: snapshot.result,
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save snapshot: ${response.statusText}`);
      }
      const { snapshot: savedSnapshot } = await response.json();
      return savedSnapshot.id;
    } catch (error) {
      console.warn('Failed to save snapshot (graceful fallback):', error);
      setPersistenceError(error instanceof Error ? error.message : 'Failed to save snapshot');
      return null; // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSnapshots = useCallback(async (experimentId?: string): Promise<void> => {
    try {
      setIsLoading(true);
      setPersistenceError(null);
      const url = experimentId
        ? `/api/tools/pricing-risk-lab/snapshots?experiment_id=${experimentId}`
        : '/api/tools/pricing-risk-lab/snapshots';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load snapshots: ${response.statusText}`);
      }
      const { snapshots } = await response.json();
      // Load snapshots into state
      snapshots.forEach((snap: { snapshot: TradeoffSnapshot }) => {
        if (snap.snapshot) {
          const snapshot: TradeoffSnapshot = {
            ...snap.snapshot,
            timestamp: new Date(snap.snapshot.timestamp),
          };
          dispatch({ type: 'ADD_SNAPSHOT', payload: snapshot });
        }
      });
    } catch (error) {
      console.warn('Failed to load snapshots (graceful fallback):', error);
      setPersistenceError(error instanceof Error ? error.message : 'Failed to load snapshots');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistAuditEvent = useCallback(async (entry: AuditLogEntry): Promise<void> => {
    try {
      // Fire and forget - don't block UI
      await fetch('/api/tools/pricing-risk-lab/audit-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: {
            action: entry.action,
            metadata: entry.metadata,
            timestamp: entry.timestamp.toISOString(),
          },
        }),
      });
    } catch (error) {
      // Silent fail for audit events - don't show errors to user
      console.warn('Failed to persist audit event (silent fallback):', error);
    }
  }, []);

  // Auto-persist audit events (append-only)
  useEffect(() => {
    const lastEntry = state.auditLog[state.auditLog.length - 1];
    if (lastEntry) {
      persistAuditEvent(lastEntry).catch(() => {
        // Silent fail
      });
    }
  }, [state.auditLog, persistAuditEvent]);

  return {
    state,
    dispatch,
    setSelectedMarket,
    setSelectedSegment,
    setSelectedChannel,
    setSelectedPaymentMethod,
    setBaselineScenario,
    setProposedScenario,
    setTradeoffSettings,
    setBaselineResult,
    setProposedResult,
    addExperimentDraft,
    updateExperimentDraft,
    deleteExperimentDraft,
    addSnapshot,
    deleteSnapshot,
    addAlert,
    acknowledgeAlert,
    addAuditEntry,
    resetState,
    saveScenario,
    loadScenarios,
    saveExperiment,
    loadExperiments,
    saveSnapshotToDB,
    loadSnapshots,
    persistAuditEvent,
    isLoading,
    persistenceError,
  };
}
