/**
 * Pricing & Risk Lab - Custom Hook
 * 
 * Hook for managing Pricing & Risk Lab unified state using useReducer.
 */

'use client';

import { useReducer, useMemo, useCallback } from 'react';
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
}

/**
 * Custom hook for Pricing & Risk Lab state management
 */
export function usePricingRiskLab(): UsePricingRiskLabReturn {
  const [state, dispatch] = useReducer(pricingRiskLabReducer, initialState);

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
  };
}
