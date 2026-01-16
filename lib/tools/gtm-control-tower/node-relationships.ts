/**
 * GTM Control Tower - Node Relationships
 * 
 * Defines the relationships between nodes: inputs, outputs, and dependencies.
 */

import type { GTMSystemNode, GTMFailureType } from './types';

/**
 * Node relationship information
 */
export interface NodeRelationships {
  inputs: GTMSystemNode[];
  outputs: GTMSystemNode[];
  upstream: GTMSystemNode[]; // Same as inputs
  downstream: GTMSystemNode[]; // Same as outputs
  failureModes: GTMFailureType[];
}

/**
 * Failure modes that can occur at each node
 */
const NODE_FAILURE_MODES: Record<GTMSystemNode, GTMFailureType[]> = {
  CRM: ['missing_required_fields', 'duplicate_creation'],
  Enrichment: ['enrichment_timeout', 'missing_required_fields'],
  Routing: ['routing_conflict', 'silent_drop'],
  Outbound: ['silent_drop', 'missing_required_fields'],
  Reporting: ['reporting_lag', 'missing_required_fields'],
};

/**
 * Node relationships map
 */
export const NODE_RELATIONSHIPS: Record<GTMSystemNode, NodeRelationships> = {
  CRM: {
    inputs: [],
    outputs: ['Enrichment', 'Routing'],
    upstream: [],
    downstream: ['Enrichment', 'Routing'],
    failureModes: NODE_FAILURE_MODES.CRM,
  },
  Enrichment: {
    inputs: ['CRM'],
    outputs: ['Routing'],
    upstream: ['CRM'],
    downstream: ['Routing'],
    failureModes: NODE_FAILURE_MODES.Enrichment,
  },
  Routing: {
    inputs: ['CRM', 'Enrichment'],
    outputs: ['Outbound', 'Reporting'],
    upstream: ['CRM', 'Enrichment'],
    downstream: ['Outbound', 'Reporting'],
    failureModes: NODE_FAILURE_MODES.Routing,
  },
  Outbound: {
    inputs: ['Routing'],
    outputs: ['Reporting'],
    upstream: ['Routing'],
    downstream: ['Reporting'],
    failureModes: NODE_FAILURE_MODES.Outbound,
  },
  Reporting: {
    inputs: ['Routing', 'Outbound'],
    outputs: [],
    upstream: ['Routing', 'Outbound'],
    downstream: [],
    failureModes: NODE_FAILURE_MODES.Reporting,
  },
};

/**
 * Get relationships for a specific node
 */
export function getNodeRelationships(node: GTMSystemNode): NodeRelationships {
  return NODE_RELATIONSHIPS[node];
}

/**
 * Get failure modes for a specific node
 */
export function getNodeFailureModes(node: GTMSystemNode): GTMFailureType[] {
  return NODE_RELATIONSHIPS[node].failureModes;
}
