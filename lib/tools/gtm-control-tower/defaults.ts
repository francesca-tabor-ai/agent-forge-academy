/**
 * GTM Control Tower - Default Settings
 * 
 * Default configurations for latency, error rates, and other system parameters.
 */

import type {
  GTMSystemNode,
  NodeConfiguration,
  GTMControlTowerConfig,
  TradeOffConfig,
  DataQualityMetric,
} from './types';

/**
 * Default latency values for each node (in milliseconds)
 */
export const DEFAULT_NODE_LATENCIES: Record<GTMSystemNode, number> = {
  CRM: 150,
  Enrichment: 800,
  Routing: 200,
  Outbound: 300,
  Reporting: 500,
};

/**
 * Default error rates for each node (percentage, 0-100)
 */
export const DEFAULT_NODE_ERROR_RATES: Record<GTMSystemNode, number> = {
  CRM: 2.0,
  Enrichment: 5.0,
  Routing: 1.5,
  Outbound: 3.0,
  Reporting: 4.0,
};

/**
 * Default maximum throughput for each node (events per second)
 */
export const DEFAULT_NODE_THROUGHPUT: Record<GTMSystemNode, number> = {
  CRM: 100,
  Enrichment: 50,
  Routing: 200,
  Outbound: 150,
  Reporting: 80,
};

/**
 * Default node configurations
 */
export const DEFAULT_NODE_CONFIGS: NodeConfiguration[] = [
  {
    node: 'CRM',
    baseLatency: DEFAULT_NODE_LATENCIES.CRM,
    errorRate: DEFAULT_NODE_ERROR_RATES.CRM,
    maxThroughput: DEFAULT_NODE_THROUGHPUT.CRM,
    enabled: true,
  },
  {
    node: 'Enrichment',
    baseLatency: DEFAULT_NODE_LATENCIES.Enrichment,
    errorRate: DEFAULT_NODE_ERROR_RATES.Enrichment,
    maxThroughput: DEFAULT_NODE_THROUGHPUT.Enrichment,
    enabled: true,
  },
  {
    node: 'Routing',
    baseLatency: DEFAULT_NODE_LATENCIES.Routing,
    errorRate: DEFAULT_NODE_ERROR_RATES.Routing,
    maxThroughput: DEFAULT_NODE_THROUGHPUT.Routing,
    enabled: true,
  },
  {
    node: 'Outbound',
    baseLatency: DEFAULT_NODE_LATENCIES.Outbound,
    errorRate: DEFAULT_NODE_ERROR_RATES.Outbound,
    maxThroughput: DEFAULT_NODE_THROUGHPUT.Outbound,
    enabled: true,
  },
  {
    node: 'Reporting',
    baseLatency: DEFAULT_NODE_LATENCIES.Reporting,
    errorRate: DEFAULT_NODE_ERROR_RATES.Reporting,
    maxThroughput: DEFAULT_NODE_THROUGHPUT.Reporting,
    enabled: true,
  },
];

/**
 * Default system-wide configuration
 */
export const DEFAULT_GTM_CONFIG: GTMControlTowerConfig = {
  nodes: DEFAULT_NODE_CONFIGS,
  eventRate: 10, // 10 events per second
  failureRate: 2.0, // 2% failure rate
  simulationEnabled: false,
};

/**
 * Default trade-off configurations
 */
export const DEFAULT_TRADE_OFF_CONFIGS: TradeOffConfig[] = [
  {
    id: 'prioritize-speed',
    name: 'Prioritize Speed',
    description: 'Reduce latency at the cost of higher error rates',
    enabled: false,
    impact: {
      latency: -100, // Reduce latency by 100ms
      errorRate: 2.0, // Increase error rate by 2%
    },
  },
  {
    id: 'prioritize-accuracy',
    name: 'Prioritize Accuracy',
    description: 'Reduce error rates at the cost of higher latency',
    enabled: false,
    impact: {
      latency: 200, // Increase latency by 200ms
      errorRate: -1.5, // Reduce error rate by 1.5%
    },
  },
  {
    id: 'aggressive-enrichment',
    name: 'Aggressive Enrichment',
    description: 'Enable more enrichment sources, increasing latency but improving data quality',
    enabled: false,
    impact: {
      latency: 300, // Increase latency by 300ms (mainly in Enrichment node)
      errorRate: -0.5, // Slight reduction in error rate
    },
  },
  {
    id: 'fast-routing',
    name: 'Fast Routing',
    description: 'Use simplified routing logic for faster processing',
    enabled: false,
    impact: {
      latency: -150, // Reduce latency by 150ms
      errorRate: 1.0, // Increase error rate by 1%
    },
  },
];

/**
 * Default data quality thresholds
 */
export const DEFAULT_DATA_QUALITY_THRESHOLDS: Record<string, number> = {
  completeness: 95.0, // 95% of required fields must be present
  accuracy: 98.0, // 98% accuracy rate
  timeliness: 1000, // Data should be updated within 1000ms
  consistency: 99.0, // 99% consistency across nodes
};

/**
 * Default data quality metrics for each node
 */
export const DEFAULT_DATA_QUALITY_METRICS: Omit<DataQualityMetric, 'value' | 'lastChecked'>[] = [
  {
    node: 'CRM',
    metric: 'completeness',
    threshold: DEFAULT_DATA_QUALITY_THRESHOLDS.completeness,
    status: 'pass',
  },
  {
    node: 'CRM',
    metric: 'timeliness',
    threshold: DEFAULT_DATA_QUALITY_THRESHOLDS.timeliness,
    status: 'pass',
  },
  {
    node: 'Enrichment',
    metric: 'completeness',
    threshold: DEFAULT_DATA_QUALITY_THRESHOLDS.completeness,
    status: 'pass',
  },
  {
    node: 'Enrichment',
    metric: 'accuracy',
    threshold: DEFAULT_DATA_QUALITY_THRESHOLDS.accuracy,
    status: 'pass',
  },
  {
    node: 'Routing',
    metric: 'consistency',
    threshold: DEFAULT_DATA_QUALITY_THRESHOLDS.consistency,
    status: 'pass',
  },
  {
    node: 'Outbound',
    metric: 'completeness',
    threshold: DEFAULT_DATA_QUALITY_THRESHOLDS.completeness,
    status: 'pass',
  },
  {
    node: 'Outbound',
    metric: 'timeliness',
    threshold: DEFAULT_DATA_QUALITY_THRESHOLDS.timeliness,
    status: 'pass',
  },
  {
    node: 'Reporting',
    metric: 'timeliness',
    threshold: DEFAULT_DATA_QUALITY_THRESHOLDS.timeliness * 2, // Reporting can be slower
    status: 'pass',
  },
];

/**
 * Event type frequencies (relative weights for random event generation)
 */
export const EVENT_TYPE_WEIGHTS: Record<string, number> = {
  new_inbound_lead: 40, // Most common
  funding_event: 5,
  intent_spike: 10,
  lead_reassigned: 15,
  duplicate_created: 10,
  field_update_delayed: 20,
};

/**
 * Failure type frequencies (relative weights for random failure generation)
 */
export const FAILURE_TYPE_WEIGHTS: Record<string, number> = {
  missing_required_fields: 25,
  enrichment_timeout: 20,
  routing_conflict: 15,
  duplicate_creation: 15,
  reporting_lag: 15,
  silent_drop: 10,
};
