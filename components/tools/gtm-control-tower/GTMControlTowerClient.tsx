'use client';

import { useReducer, useCallback, useMemo } from 'react';
import { SystemMap } from './SystemMap';
import { EventSimulator, type SimulatedEvent } from './EventSimulator';
import { DataQualityMonitor } from './DataQualityMonitor';
import { TradeoffToggles, type TradeoffSettings } from './TradeoffToggles';
import { RefactorModeComparison } from './RefactorModeComparison';
import type { GTMSystemNode, GTMFailureType, GTMEvent, NodeConfiguration } from '@/lib/tools/gtm-control-tower';
import {
  simulateEvent,
  createEmptyRecords,
  type SimulationSettings,
  type SimulationResult,
} from '@/lib/tools/gtm-control-tower/simEngine';
import { DEFAULT_NODE_CONFIGS } from '@/lib/tools/gtm-control-tower/defaults';
import { getEarlyStageArchitecture, getScaledArchitecture } from '@/lib/tools/gtm-control-tower/architectures';
import { getNodeRelationships } from '@/lib/tools/gtm-control-tower/node-relationships';

/**
 * Node processing status
 */
type NodeProcessingStatus = 'idle' | 'processing' | 'failed';

/**
 * State for the GTM Control Tower
 */
interface GTMControlTowerState {
  nodeStatuses: Map<GTMSystemNode, NodeProcessingStatus>;
  activeFailures: Map<GTMSystemNode, Set<GTMFailureType>>;
  lastSimulationResult: SimulationResult | null;
  previousSimulationResult: SimulationResult | null;
  tradeoffSettings: TradeoffSettings;
  refactorMode: boolean;
  earlyStageResult: SimulationResult | null;
  scaledResult: SimulationResult | null;
  earlyStagePrevious: SimulationResult | null;
  scaledPrevious: SimulationResult | null;
}

/**
 * Actions for the GTM Control Tower reducer
 */
type GTMAction =
  | { type: 'SET_NODE_PROCESSING'; payload: { node: GTMSystemNode } }
  | { type: 'UPDATE_NODE_STATUS'; payload: { node: GTMSystemNode; status: NodeProcessingStatus } }
  | { type: 'ADD_FAILURE'; payload: { node: GTMSystemNode; failureType: GTMFailureType } }
  | { type: 'CLEAR_FAILURES'; payload: { node: GTMSystemNode } }
  | { type: 'UPDATE_FROM_SIMULATION'; payload: SimulationResult }
  | { type: 'UPDATE_FROM_REFACTOR_SIMULATION'; payload: { earlyStage: SimulationResult; scaled: SimulationResult } }
  | { type: 'UPDATE_TRADEOFF_SETTINGS'; payload: TradeoffSettings }
  | { type: 'TOGGLE_REFACTOR_MODE' }
  | { type: 'RESET_ALL' };

/**
 * Reducer for managing GTM Control Tower state
 */
function gtmReducer(
  state: GTMControlTowerState,
  action: GTMAction
): GTMControlTowerState {
  switch (action.type) {
    case 'SET_NODE_PROCESSING': {
      const newStatuses = new Map(state.nodeStatuses);
      newStatuses.set(action.payload.node, 'processing');
      return {
        ...state,
        nodeStatuses: newStatuses,
      };
    }
    case 'UPDATE_NODE_STATUS': {
      const newStatuses = new Map(state.nodeStatuses);
      newStatuses.set(action.payload.node, action.payload.status);
      return {
        ...state,
        nodeStatuses: newStatuses,
      };
    }
    case 'ADD_FAILURE': {
      const newFailures = new Map(state.activeFailures);
      const nodeFailures = new Set(newFailures.get(action.payload.node) || []);
      nodeFailures.add(action.payload.failureType);
      newFailures.set(action.payload.node, nodeFailures);
      return {
        ...state,
        activeFailures: newFailures,
      };
    }
    case 'CLEAR_FAILURES': {
      const newFailures = new Map(state.activeFailures);
      newFailures.delete(action.payload.node);
      return {
        ...state,
        activeFailures: newFailures,
      };
    }
    case 'UPDATE_FROM_SIMULATION': {
      const result = action.payload;
      const newStatuses = new Map(state.nodeStatuses);
      const newFailures = new Map(state.activeFailures);

      // Update node statuses from simulation result
      for (const update of result.nodeStatusUpdates) {
        newStatuses.set(update.node, update.status);
      }

      // Update active failures
      for (const failure of result.failures) {
        const nodeFailures = new Set(newFailures.get(failure.node) || []);
        nodeFailures.add(failure.type);
        newFailures.set(failure.node, nodeFailures);
      }

      // Clear failures for nodes that are now idle (successful processing)
      for (const update of result.nodeStatusUpdates) {
        if (update.status === 'idle') {
          // Clear failures for this node if it's now idle
          const relationships = getNodeRelationships(update.node);
          const nodeFailureSet = newFailures.get(update.node);
          if (nodeFailureSet) {
            // Only clear if there are no active failures in the result
            const hasActiveFailure = result.failures.some((f) => f.node === update.node);
            if (!hasActiveFailure) {
              newFailures.delete(update.node);
            }
          }
        }
      }

      return {
        ...state,
        nodeStatuses: newStatuses,
        activeFailures: newFailures,
        previousSimulationResult: state.lastSimulationResult,
        lastSimulationResult: result,
      };
    }
    case 'UPDATE_FROM_REFACTOR_SIMULATION': {
      // For refactor mode, we need to merge statuses from both results
      const newStatuses = new Map(state.nodeStatuses);
      const newFailures = new Map(state.activeFailures);

      // Update from early-stage result
      for (const update of action.payload.earlyStage.nodeStatusUpdates) {
        newStatuses.set(update.node, update.status);
      }
      for (const failure of action.payload.earlyStage.failures) {
        const nodeFailures = new Set(newFailures.get(failure.node) || []);
        nodeFailures.add(failure.type);
        newFailures.set(failure.node, nodeFailures);
      }

      // Update from scaled result (scaled takes precedence for status display)
      for (const update of action.payload.scaled.nodeStatusUpdates) {
        newStatuses.set(update.node, update.status);
      }
      for (const failure of action.payload.scaled.failures) {
        const nodeFailures = new Set(newFailures.get(failure.node) || []);
        nodeFailures.add(failure.type);
        newFailures.set(failure.node, nodeFailures);
      }

      return {
        ...state,
        nodeStatuses: newStatuses,
        activeFailures: newFailures,
        earlyStagePrevious: state.earlyStageResult,
        scaledPrevious: state.scaledResult,
        earlyStageResult: action.payload.earlyStage,
        scaledResult: action.payload.scaled,
      };
    }
    case 'UPDATE_TRADEOFF_SETTINGS': {
      return {
        ...state,
        tradeoffSettings: action.payload,
      };
    }
    case 'TOGGLE_REFACTOR_MODE': {
      return {
        ...state,
        refactorMode: !state.refactorMode,
      };
    }
    case 'RESET_ALL': {
      return {
        nodeStatuses: new Map(),
        activeFailures: new Map(),
        lastSimulationResult: null,
        previousSimulationResult: null,
        tradeoffSettings: {
          speedVsAccuracy: 50,
          costVsCoverage: 50,
          centralizedVsLocal: 50,
        },
        refactorMode: false,
        earlyStageResult: null,
        scaledResult: null,
        earlyStagePrevious: null,
        scaledPrevious: null,
      };
    }
    default:
      return state;
  }
}

/**
 * Initialize node statuses to idle
 */
function createInitialNodeStatuses(): Map<GTMSystemNode, NodeProcessingStatus> {
  const statuses = new Map<GTMSystemNode, NodeProcessingStatus>();
  const nodes: GTMSystemNode[] = ['CRM', 'Enrichment', 'Routing', 'Outbound', 'Reporting'];
  nodes.forEach((node) => statuses.set(node, 'idle'));
  return statuses;
}

/**
 * Apply trade-off settings to node configurations
 */
function applyTradeoffSettings(
  baseConfigs: NodeConfiguration[],
  tradeoffs: TradeoffSettings
): NodeConfiguration[] {
  return baseConfigs.map((config) => {
    let latency = config.baseLatency;
    let errorRate = config.errorRate;

    // Speed vs Accuracy: 0 = accuracy (higher latency, lower errors), 100 = speed (lower latency, higher errors)
    const speedFactor = (tradeoffs.speedVsAccuracy - 50) / 50; // -1 to 1
    if (config.node === 'Enrichment' || config.node === 'Routing') {
      // These nodes are most affected by speed/accuracy trade-off
      latency = Math.max(50, config.baseLatency - speedFactor * 200);
      errorRate = Math.max(0, Math.min(100, config.errorRate + speedFactor * 3));
    }

    // Cost vs Coverage: 0 = coverage (better enrichment), 100 = cost savings (worse enrichment)
    const costFactor = (tradeoffs.costVsCoverage - 50) / 50; // -1 to 1
    if (config.node === 'Enrichment') {
      // Higher cost savings = more missing fields (simulated by higher error rate for missing fields)
      errorRate = Math.max(0, Math.min(100, errorRate + costFactor * 2));
    }

    // Centralized vs Local: 0 = local (more complex), 100 = centralized (simpler)
    const centralizedFactor = (tradeoffs.centralizedVsLocal - 50) / 50; // -1 to 1
    if (config.node === 'Routing') {
      // Centralized = simpler = faster but potentially more errors
      latency = Math.max(50, latency - centralizedFactor * 100);
      errorRate = Math.max(0, Math.min(100, errorRate + centralizedFactor * 1.5));
    }

    return {
      ...config,
      baseLatency: Math.round(latency),
      errorRate: Math.max(0, Math.min(100, errorRate)),
    };
  });
}

/**
 * GTM Control Tower Client Component
 * Manages shared state between SystemMap and EventSimulator
 */
export function GTMControlTowerClient() {
  const [state, dispatch] = useReducer(gtmReducer, {
    nodeStatuses: createInitialNodeStatuses(),
    activeFailures: new Map(),
    lastSimulationResult: null,
    previousSimulationResult: null,
    tradeoffSettings: {
      speedVsAccuracy: 50,
      costVsCoverage: 50,
      centralizedVsLocal: 50,
    },
    refactorMode: false,
    earlyStageResult: null,
    scaledResult: null,
    earlyStagePrevious: null,
    scaledPrevious: null,
  });

  // Convert activeFailures Map to Set for SystemMap
  const activeFailureModes = useMemo(() => {
    const allFailures = new Set<GTMFailureType>();
    for (const failures of state.activeFailures.values()) {
      for (const failure of failures) {
        allFailures.add(failure);
      }
    }
    return allFailures;
  }, [state.activeFailures]);

  // Save tool run to database (graceful fallback on failure)
  const saveToolRun = useCallback(
    async (
      event: GTMEvent,
      settings: SimulationSettings,
      result: SimulationResult
    ) => {
      try {
        // Calculate metrics snapshot
        const metricsSnapshot = {
          totalActions: result.actions.length,
          totalFailures: result.failures.length,
          failedNodes: result.nodeStatusUpdates.filter((u) => u.status === 'failed').length,
          totalRecords: result.records.leads.size + result.records.accounts.size,
          silentDrops: result.failures.filter((f) => f.type === 'silent_drop').length,
        };

        const response = await fetch('/api/tools/runs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tool_id: 'gtm-control-tower',
            inputs: {
              event: {
                id: event.id,
                type: event.type,
                timestamp: event.timestamp.toISOString(),
                sourceNode: event.sourceNode,
                priority: event.priority,
              },
              settings: {
                nodes: settings.nodes.map((n) => ({
                  node: n.node,
                  baseLatency: n.baseLatency,
                  errorRate: n.errorRate,
                  enabled: n.enabled,
                })),
                seed: settings.seed,
              },
            },
            outputs: {
              actions: result.actions.map((a) => ({
                type: a.type,
                node: a.node,
                timestamp: a.timestamp.toISOString(),
              })),
              failures: result.failures.map((f) => ({
                type: f.type,
                node: f.node,
                severity: f.severity,
                message: f.message,
              })),
              metrics: metricsSnapshot,
            },
          }),
        });

        if (!response.ok) {
          console.warn('Failed to save tool run:', await response.text());
        }
      } catch (error) {
        // Graceful fallback - don't block UI if persistence fails
        console.warn('Error saving tool run (non-blocking):', error);
      }
    },
    []
  );

  // Handle event simulation
  const handleEventAdded = useCallback(
    async (simulatedEvent: SimulatedEvent) => {
      // Convert SimulatedEvent to GTMEvent
      const gtmEvent: GTMEvent = {
        id: simulatedEvent.id,
        type: simulatedEvent.type,
        timestamp: simulatedEvent.timestamp,
        sourceNode: 'CRM',
        priority: 'medium',
        payload: {},
        metadata: {
          leadId: `lead-${simulatedEvent.id}`,
        },
      };

      // Determine which nodes will process this event
      const processingPath: GTMSystemNode[] = ['CRM'];
      if (simulatedEvent.type === 'new_inbound_lead') {
        processingPath.push('Enrichment', 'Routing', 'Outbound', 'Reporting');
      } else if (simulatedEvent.type === 'funding_event' || simulatedEvent.type === 'intent_spike') {
        processingPath.push('Routing', 'Outbound', 'Reporting');
      } else {
        processingPath.push('Routing', 'Reporting');
      }

      // Mark nodes as processing
      for (const node of processingPath) {
        dispatch({ type: 'SET_NODE_PROCESSING', payload: { node } });
      }

      if (state.refactorMode) {
        // Run both architectures in parallel
        const earlyStageConfigs = getEarlyStageArchitecture();
        const scaledConfigs = getScaledArchitecture();

        const earlyStageSettings: SimulationSettings = {
          nodes: earlyStageConfigs,
          seed: Date.now(),
        };

        const scaledSettings: SimulationSettings = {
          nodes: scaledConfigs,
          seed: Date.now() + 1, // Different seed for variation
        };

        const records = createEmptyRecords();
        
        // Run both simulations in parallel
        const [earlyStageResult, scaledResult] = await Promise.all([
          simulateEvent(gtmEvent, earlyStageSettings, records),
          simulateEvent(gtmEvent, scaledSettings, records),
        ]);

        // Update state from both results
        dispatch({
          type: 'UPDATE_FROM_REFACTOR_SIMULATION',
          payload: {
            earlyStage: earlyStageResult,
            scaled: scaledResult,
          },
        });

        // Save runs (non-blocking, graceful fallback)
        await Promise.all([
          saveToolRun(gtmEvent, earlyStageSettings, earlyStageResult),
          saveToolRun(gtmEvent, scaledSettings, scaledResult),
        ]).catch(() => {
          // Already handled in saveToolRun, just prevent unhandled rejection
        });
      } else {
        // Normal mode - single simulation
        const adjustedConfigs = applyTradeoffSettings(DEFAULT_NODE_CONFIGS, state.tradeoffSettings);

        const settings: SimulationSettings = {
          nodes: adjustedConfigs,
          seed: Date.now(),
        };

        const records = createEmptyRecords();
        const result = await simulateEvent(gtmEvent, settings, records);

        // Update state from simulation result
        dispatch({ type: 'UPDATE_FROM_SIMULATION', payload: result });

        // Save run (non-blocking, graceful fallback)
        await saveToolRun(gtmEvent, settings, result).catch(() => {
          // Already handled in saveToolRun, just prevent unhandled rejection
        });
      }
    },
    [state.tradeoffSettings, state.refactorMode, saveToolRun]
  );

  return (
    <div className="space-y-6">
      {/* Refactor Mode Toggle */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">Refactor Mode</h3>
          <p className="text-xs text-gray-600 mt-1">
            Compare Early-Stage vs Scaled architectures side-by-side
          </p>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_REFACTOR_MODE' })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            state.refactorMode ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              state.refactorMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {state.refactorMode ? (
        /* Refactor Mode - Side-by-side Comparison */
        <div className="space-y-6">
          {/* Event Simulator - Always visible */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Simulator</h2>
            <EventSimulator onEventAdded={handleEventAdded} />
          </div>

          {/* Comparison View */}
          <RefactorModeComparison
            earlyStageResult={state.earlyStageResult}
            scaledResult={state.scaledResult}
            earlyStagePrevious={state.earlyStagePrevious}
            scaledPrevious={state.scaledPrevious}
          />
        </div>
      ) : (
        /* Normal Mode - Standard View */
        <div className="grid grid-cols-1 lg:grid-cols-[50%_50%] gap-6">
          {/* Left Column - System Map */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Map</h2>
            <SystemMap
              activeFailureModes={activeFailureModes}
              nodeStatuses={state.nodeStatuses}
            />
          </div>

          {/* Right Column - Stacked Panels */}
          <div className="space-y-6">
            {/* Event Simulator */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Simulator</h2>
              <EventSimulator onEventAdded={handleEventAdded} />
            </div>

            {/* Trade-off Toggles */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Trade-off Toggles</h2>
              <TradeoffToggles
                settings={state.tradeoffSettings}
                onChange={(settings) => {
                  dispatch({ type: 'UPDATE_TRADEOFF_SETTINGS', payload: settings });
                }}
              />
            </div>

            {/* Data Quality Monitor */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Quality Monitor</h2>
              <DataQualityMonitor
                simulationResult={state.lastSimulationResult}
                previousResult={state.previousSimulationResult}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
