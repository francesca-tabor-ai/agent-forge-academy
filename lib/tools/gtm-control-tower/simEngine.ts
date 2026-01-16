/**
 * GTM Control Tower - Simulation Engine
 * 
 * Asynchronous event processing engine that simulates GTM system behavior.
 * Processes events through the pipeline with configurable latency and error rates.
 * Uses deterministic randomness for consistent results.
 */

import type {
  GTMSystemNode,
  GTMEventType,
  GTMFailureType,
  NodeConfiguration,
  GTMEvent,
  GTMFailure,
} from './types';
import { getNodeRelationships } from './node-relationships';

/**
 * Mock record types for simulation
 */
export interface LeadRecord {
  id: string;
  email: string;
  name?: string;
  company?: string;
  status: 'new' | 'enriched' | 'routed' | 'outbound' | 'reported';
  enrichedAt?: Date;
  routedAt?: Date;
  outboundAt?: Date;
  reportedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface AccountRecord {
  id: string;
  name: string;
  domain?: string;
  enrichedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Records state for the simulation
 */
export interface SimulationRecords {
  leads: Map<string, LeadRecord>;
  accounts: Map<string, AccountRecord>;
}

/**
 * Automation action that occurred during processing
 */
export interface AutomationAction {
  id: string;
  type: 'enriched' | 'routed' | 'outbound_triggered' | 'reported' | 'duplicate_detected';
  node: GTMSystemNode;
  timestamp: Date;
  recordId?: string;
  details?: Record<string, unknown>;
}

/**
 * Node processing status
 */
export type NodeProcessingStatus = 'idle' | 'processing' | 'failed';

/**
 * Per-node status update
 */
export interface NodeStatusUpdate {
  node: GTMSystemNode;
  status: NodeProcessingStatus;
  timestamp: Date;
  latency?: number;
  errorRate?: number;
}

/**
 * Simulation settings
 */
export interface SimulationSettings {
  nodes: NodeConfiguration[];
  seed?: number; // Optional seed for deterministic randomness
}

/**
 * Simulation result
 */
export interface SimulationResult {
  records: SimulationRecords;
  actions: AutomationAction[];
  failures: GTMFailure[];
  nodeStatusUpdates: NodeStatusUpdate[];
}

/**
 * Deterministic random number generator (seeded)
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate a random number between 0 and 1
   */
  random(): number {
    // Linear congruential generator
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Generate a random integer between min (inclusive) and max (exclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min)) + min;
  }

  /**
   * Check if a random event occurs based on probability (0-1)
   */
  shouldOccur(probability: number): boolean {
    return this.random() < probability;
  }
}

/**
 * Generate a deterministic seed from event and settings
 */
function generateSeed(event: GTMEvent, settings: SimulationSettings): number {
  const eventHash = event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const typeHash = event.type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const timestampHash = event.timestamp.getTime() % 1000000;
  const settingsHash = settings.nodes.reduce((acc, node) => acc + node.baseLatency + node.errorRate, 0);
  
  return (eventHash + typeHash + timestampHash + settingsHash + (settings.seed || 0)) % 2147483647;
}

/**
 * Process an event through a specific node
 */
async function processNode(
  node: GTMSystemNode,
  event: GTMEvent,
  records: SimulationRecords,
  nodeConfig: NodeConfiguration,
  random: SeededRandom,
  eventId: string
): Promise<{
  success: boolean;
  failure?: GTMFailure;
  action?: AutomationAction;
  updatedRecords: SimulationRecords;
}> {
  const relationships = getNodeRelationships(node);
  const updatedRecords = {
    leads: new Map(records.leads),
    accounts: new Map(records.accounts),
  };

  // Apply latency
  await new Promise((resolve) => setTimeout(resolve, nodeConfig.baseLatency));

  // Check if node is enabled
  if (!nodeConfig.enabled) {
    return {
      success: false,
      failure: {
        id: `failure-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: 'silent_drop' as GTMFailureType,
        timestamp: new Date(),
        node,
        severity: 'medium',
        message: `Node ${node} is disabled`,
        eventId,
        resolved: false,
      },
      updatedRecords,
    };
  }

  // Check for errors based on error rate
  if (random.shouldOccur(nodeConfig.errorRate / 100)) {
    // Select a failure mode for this node
    const failureModes = relationships.failureModes;
    const failureType = failureModes[random.randomInt(0, failureModes.length)];

    const failure: GTMFailure = {
      id: `failure-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      type: failureType,
      timestamp: new Date(),
      node,
      severity: failureType === 'silent_drop' ? 'high' : 'medium',
      message: `Failure in ${node}: ${failureType}`,
      eventId,
      resolved: false,
    };

    return {
      success: false,
      failure,
      updatedRecords,
    };
  }

  // Process successfully
  let action: AutomationAction | undefined;

  switch (node) {
    case 'CRM': {
      // Create or update lead record
      const leadId = event.metadata?.leadId as string || `lead-${Date.now()}`;
      const existingLead = updatedRecords.leads.get(leadId);
      
      if (existingLead) {
        // Update existing lead
        updatedRecords.leads.set(leadId, {
          ...existingLead,
          metadata: { ...existingLead.metadata, ...event.metadata },
        });
      } else {
        // Create new lead
        updatedRecords.leads.set(leadId, {
          id: leadId,
          email: (event.payload?.email as string) || `lead${leadId}@example.com`,
          name: (event.payload?.name as string) || undefined,
          company: (event.payload?.company as string) || undefined,
          status: 'new',
          metadata: event.metadata,
        });
      }
      break;
    }

    case 'Enrichment': {
      // Enrich lead data
      const leadId = event.metadata?.leadId as string;
      if (leadId) {
        const lead = updatedRecords.leads.get(leadId);
        if (lead) {
          updatedRecords.leads.set(leadId, {
            ...lead,
            status: 'enriched',
            enrichedAt: new Date(),
            company: lead.company || `Company ${leadId}`,
            metadata: { ...lead.metadata, enriched: true },
          });

          action = {
            id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            type: 'enriched',
            node: 'Enrichment',
            timestamp: new Date(),
            recordId: leadId,
            details: { source: 'enrichment_service' },
          };
        }
      }
      break;
    }

    case 'Routing': {
      // Route lead to appropriate destination
      const leadId = event.metadata?.leadId as string;
      if (leadId) {
        const lead = updatedRecords.leads.get(leadId);
        if (lead) {
          updatedRecords.leads.set(leadId, {
            ...lead,
            status: 'routed',
            routedAt: new Date(),
            metadata: { ...lead.metadata, routed: true },
          });

          action = {
            id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            type: 'routed',
            node: 'Routing',
            timestamp: new Date(),
            recordId: leadId,
            details: { destination: 'outbound' },
          };
        }
      }
      break;
    }

    case 'Outbound': {
      // Trigger outbound action
      const leadId = event.metadata?.leadId as string;
      if (leadId) {
        const lead = updatedRecords.leads.get(leadId);
        if (lead) {
          updatedRecords.leads.set(leadId, {
            ...lead,
            status: 'outbound',
            outboundAt: new Date(),
            metadata: { ...lead.metadata, outbound: true },
          });

          action = {
            id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            type: 'outbound_triggered',
            node: 'Outbound',
            timestamp: new Date(),
            recordId: leadId,
            details: { channel: 'email' },
          };
        }
      }
      break;
    }

    case 'Reporting': {
      // Report event/record
      const leadId = event.metadata?.leadId as string;
      if (leadId) {
        const lead = updatedRecords.leads.get(leadId);
        if (lead) {
          updatedRecords.leads.set(leadId, {
            ...lead,
            status: 'reported',
            reportedAt: new Date(),
            metadata: { ...lead.metadata, reported: true },
          });

          action = {
            id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            type: 'reported',
            node: 'Reporting',
            timestamp: new Date(),
            recordId: leadId,
            details: { reportType: 'event' },
          };
        }
      }
      break;
    }
  }

  return {
    success: true,
    action,
    updatedRecords,
  };
}

/**
 * Main simulation engine function
 * Processes an event through the GTM pipeline
 */
export async function simulateEvent(
  event: GTMEvent,
  settings: SimulationSettings,
  currentRecords: SimulationRecords
): Promise<SimulationResult> {
  // Generate deterministic seed
  const seed = generateSeed(event, settings);
  const random = new SeededRandom(seed);

  const result: SimulationResult = {
    records: {
      leads: new Map(currentRecords.leads),
      accounts: new Map(currentRecords.accounts),
    },
    actions: [],
    failures: [],
    nodeStatusUpdates: [],
  };

  // Determine processing path based on event type
  const processingPath: GTMSystemNode[] = ['CRM'];
  
  if (event.type === 'new_inbound_lead') {
    processingPath.push('Enrichment', 'Routing', 'Outbound', 'Reporting');
  } else if (event.type === 'funding_event' || event.type === 'intent_spike') {
    processingPath.push('Routing', 'Outbound', 'Reporting');
  } else {
    processingPath.push('Routing', 'Reporting');
  }

  // Process through each node in the path
  for (const node of processingPath) {
    const nodeConfig = settings.nodes.find((n) => n.node === node);
    if (!nodeConfig) {
      continue;
    }

    // Update node status to processing
    result.nodeStatusUpdates.push({
      node,
      status: 'processing',
      timestamp: new Date(),
      latency: nodeConfig.baseLatency,
      errorRate: nodeConfig.errorRate,
    });

    // Process the node
    const nodeResult = await processNode(
      node,
      event,
      result.records,
      nodeConfig,
      random,
      event.id
    );

    // Update records
    result.records = nodeResult.updatedRecords;

    // Handle result
    if (!nodeResult.success && nodeResult.failure) {
      result.failures.push(nodeResult.failure);
      result.nodeStatusUpdates.push({
        node,
        status: 'failed',
        timestamp: new Date(),
        latency: nodeConfig.baseLatency,
        errorRate: nodeConfig.errorRate,
      });
      // Stop processing on failure (unless it's a silent drop)
      if (nodeResult.failure.type !== 'silent_drop') {
        break;
      }
    } else {
      if (nodeResult.action) {
        result.actions.push(nodeResult.action);
      }
      result.nodeStatusUpdates.push({
        node,
        status: 'idle',
        timestamp: new Date(),
        latency: nodeConfig.baseLatency,
        errorRate: nodeConfig.errorRate,
      });
    }
  }

  return result;
}

/**
 * Helper function to create initial empty records
 */
export function createEmptyRecords(): SimulationRecords {
  return {
    leads: new Map(),
    accounts: new Map(),
  };
}
