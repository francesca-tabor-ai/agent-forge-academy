'use client';

import { useReducer, useCallback, useMemo } from 'react';
import { SystemMap } from './SystemMap';
import { EventSimulator, type SimulatedEvent } from './EventSimulator';
import { DataQualityMonitor } from './DataQualityMonitor';
import { TradeoffToggles, type TradeoffSettings } from './TradeoffToggles';
import type { GTMSystemNode, GTMFailureType, GTMEvent, NodeConfiguration } from '@/lib/tools/gtm-control-tower';
import {
  simulateEvent,
  createEmptyRecords,
  type SimulationSettings,
  type SimulationResult,
} from '@/lib/tools/gtm-control-tower/simEngine';
import { DEFAULT_NODE_CONFIGS } from '@/lib/tools/gtm-control-tower/defaults';
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
  | { type: 'UPDATE_TRADEOFF_SETTINGS'; payload: TradeoffSettings }
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
    case 'UPDATE_TRADEOFF_SETTINGS': {
      return {
        ...state,
        tradeoffSettings: action.payload,
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

      // Apply trade-off settings to node configurations
      const adjustedConfigs = applyTradeoffSettings(DEFAULT_NODE_CONFIGS, state.tradeoffSettings);

      // Run simulation
      const settings: SimulationSettings = {
        nodes: adjustedConfigs,
        seed: Date.now(), // Use timestamp for variation
      };

      const records = createEmptyRecords();
      const result = await simulateEvent(gtmEvent, settings, records);

      // Update state from simulation result
      dispatch({ type: 'UPDATE_FROM_SIMULATION', payload: result });
    },
    [state.tradeoffSettings]
  );

  return (
    <div className="space-y-6">
      {/* Two-column layout */}
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
    </div>
  );
}
