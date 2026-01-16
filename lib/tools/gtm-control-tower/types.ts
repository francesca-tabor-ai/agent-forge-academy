/**
 * GTM Control Tower - Type Definitions
 * 
 * Core types for the GTM Control Tower simulation system.
 * These types define nodes, events, and failure modes in the GTM system.
 */

/**
 * System nodes in the GTM pipeline
 */
export type GTMSystemNode = 
  | 'CRM'
  | 'Enrichment'
  | 'Routing'
  | 'Outbound'
  | 'Reporting';

/**
 * Event types that can occur in the GTM system
 */
export type GTMEventType =
  | 'new_inbound_lead'
  | 'funding_event'
  | 'intent_spike'
  | 'lead_reassigned'
  | 'duplicate_created'
  | 'field_update_delayed';

/**
 * Failure types that can occur in the GTM system
 */
export type GTMFailureType =
  | 'missing_required_fields'
  | 'enrichment_timeout'
  | 'routing_conflict'
  | 'duplicate_creation'
  | 'reporting_lag'
  | 'silent_drop';

/**
 * Status of a node in the system
 */
export type NodeStatus = 'healthy' | 'degraded' | 'failed' | 'unknown';

/**
 * Priority level for events
 */
export type EventPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Represents a node in the GTM system
 */
export interface GTMSystemNodeState {
  id: GTMSystemNode;
  status: NodeStatus;
  latency: number; // in milliseconds
  errorRate: number; // percentage (0-100)
  throughput: number; // events per second
  lastUpdated: Date;
}

/**
 * Represents an event in the GTM system
 */
export interface GTMEvent {
  id: string;
  type: GTMEventType;
  timestamp: Date;
  sourceNode: GTMSystemNode;
  targetNode?: GTMSystemNode;
  priority: EventPriority;
  payload?: Record<string, unknown>;
  metadata?: {
    leadId?: string;
    accountId?: string;
    userId?: string;
    [key: string]: unknown;
  };
}

/**
 * Represents a failure in the GTM system
 */
export interface GTMFailure {
  id: string;
  type: GTMFailureType;
  timestamp: Date;
  node: GTMSystemNode;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  eventId?: string; // Link to the event that caused the failure
  resolved: boolean;
  resolvedAt?: Date;
}

/**
 * Configuration for a node's behavior
 */
export interface NodeConfiguration {
  node: GTMSystemNode;
  baseLatency: number; // milliseconds
  errorRate: number; // percentage (0-100)
  maxThroughput: number; // events per second
  enabled: boolean;
}

/**
 * System-wide configuration
 */
export interface GTMControlTowerConfig {
  nodes: NodeConfiguration[];
  eventRate: number; // events per second
  failureRate: number; // percentage (0-100)
  simulationEnabled: boolean;
}

/**
 * State of the entire GTM system
 */
export interface GTMSystemState {
  nodes: Map<GTMSystemNode, GTMSystemNodeState>;
  events: GTMEvent[];
  failures: GTMFailure[];
  config: GTMControlTowerConfig;
  lastUpdated: Date;
}

/**
 * Trade-off configuration for system behavior
 */
export interface TradeOffConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  impact: {
    latency?: number; // milliseconds adjustment
    errorRate?: number; // percentage adjustment
    throughput?: number; // events per second adjustment
  };
}

/**
 * Data quality metric
 */
export interface DataQualityMetric {
  node: GTMSystemNode;
  metric: string;
  value: number;
  threshold: number;
  status: 'pass' | 'warning' | 'fail';
  lastChecked: Date;
}

/**
 * Data quality monitor state
 */
export interface DataQualityState {
  metrics: DataQualityMetric[];
  overallScore: number; // 0-100
  lastUpdated: Date;
}
