/**
 * GTM Control Tower - Architecture Configurations
 * 
 * Defines different architecture patterns for comparison in Refactor Mode.
 */

import type { NodeConfiguration } from './types';
import { DEFAULT_NODE_LATENCIES, DEFAULT_NODE_ERROR_RATES, DEFAULT_NODE_THROUGHPUT } from './defaults';

/**
 * Early-Stage Architecture
 * Characteristics: higher coupling, fewer retries, more silent drops
 */
export function getEarlyStageArchitecture(): NodeConfiguration[] {
  return [
    {
      node: 'CRM',
      baseLatency: DEFAULT_NODE_LATENCIES.CRM,
      errorRate: DEFAULT_NODE_ERROR_RATES.CRM + 1.0, // Higher error rate
      maxThroughput: DEFAULT_NODE_THROUGHPUT.CRM,
      enabled: true,
    },
    {
      node: 'Enrichment',
      baseLatency: DEFAULT_NODE_LATENCIES.Enrichment - 100, // Faster but less reliable
      errorRate: DEFAULT_NODE_ERROR_RATES.Enrichment + 2.0, // Higher error rate
      maxThroughput: DEFAULT_NODE_THROUGHPUT.Enrichment,
      enabled: true,
    },
    {
      node: 'Routing',
      baseLatency: DEFAULT_NODE_LATENCIES.Routing - 50, // Faster
      errorRate: DEFAULT_NODE_ERROR_RATES.Routing + 1.5, // Higher error rate, more silent drops
      maxThroughput: DEFAULT_NODE_THROUGHPUT.Routing,
      enabled: true,
    },
    {
      node: 'Outbound',
      baseLatency: DEFAULT_NODE_LATENCIES.Outbound,
      errorRate: DEFAULT_NODE_ERROR_RATES.Outbound + 1.0, // Higher error rate
      maxThroughput: DEFAULT_NODE_THROUGHPUT.Outbound,
      enabled: true,
    },
    {
      node: 'Reporting',
      baseLatency: DEFAULT_NODE_LATENCIES.Reporting,
      errorRate: DEFAULT_NODE_ERROR_RATES.Reporting + 2.0, // Higher error rate, more reporting lag
      maxThroughput: DEFAULT_NODE_THROUGHPUT.Reporting,
      enabled: true,
    },
  ];
}

/**
 * Scaled Architecture
 * Characteristics: idempotent, observable, retries enabled, fewer silent drops
 */
export function getScaledArchitecture(): NodeConfiguration[] {
  return [
    {
      node: 'CRM',
      baseLatency: DEFAULT_NODE_LATENCIES.CRM + 50, // Slightly slower for idempotency checks
      errorRate: DEFAULT_NODE_ERROR_RATES.CRM - 0.5, // Lower error rate
      maxThroughput: DEFAULT_NODE_THROUGHPUT.CRM,
      enabled: true,
    },
    {
      node: 'Enrichment',
      baseLatency: DEFAULT_NODE_LATENCIES.Enrichment + 200, // Slower but more reliable with retries
      errorRate: DEFAULT_NODE_ERROR_RATES.Enrichment - 2.0, // Lower error rate (retries help)
      maxThroughput: DEFAULT_NODE_THROUGHPUT.Enrichment,
      enabled: true,
    },
    {
      node: 'Routing',
      baseLatency: DEFAULT_NODE_LATENCIES.Routing + 100, // Slower for better observability
      errorRate: DEFAULT_NODE_ERROR_RATES.Routing - 1.0, // Lower error rate, fewer silent drops
      maxThroughput: DEFAULT_NODE_THROUGHPUT.Routing,
      enabled: true,
    },
    {
      node: 'Outbound',
      baseLatency: DEFAULT_NODE_LATENCIES.Outbound + 50, // Slightly slower for idempotency
      errorRate: DEFAULT_NODE_ERROR_RATES.Outbound - 1.0, // Lower error rate
      maxThroughput: DEFAULT_NODE_THROUGHPUT.Outbound,
      enabled: true,
    },
    {
      node: 'Reporting',
      baseLatency: DEFAULT_NODE_LATENCIES.Reporting + 100, // Slower for better observability
      errorRate: DEFAULT_NODE_ERROR_RATES.Reporting - 1.5, // Lower error rate, fewer reporting lags
      maxThroughput: DEFAULT_NODE_THROUGHPUT.Reporting,
      enabled: true,
    },
  ];
}
