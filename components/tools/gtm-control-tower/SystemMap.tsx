'use client';

import { useState } from 'react';
import type { GTMSystemNode, GTMFailureType } from '@/lib/tools/gtm-control-tower';
import { getNodeRelationships } from '@/lib/tools/gtm-control-tower/node-relationships';

type NodeProcessingStatus = 'idle' | 'processing' | 'failed';

interface SystemMapProps {
  activeFailureModes?: Set<GTMFailureType>;
  nodeStatuses?: Map<GTMSystemNode, NodeProcessingStatus>;
  onNodeClick?: (node: GTMSystemNode) => void;
}

interface NodeDetailPanelProps {
  node: GTMSystemNode | null;
  activeFailureModes?: Set<GTMFailureType>;
  nodeStatus?: NodeProcessingStatus;
  onClose: () => void;
}

/**
 * Node Detail Panel - Shows detailed information about a selected node
 */
function NodeDetailPanel({ node, activeFailureModes, nodeStatus, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  const relationships = getNodeRelationships(node);

  // Status badge color
  const getStatusColor = (status?: NodeProcessingStatus) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'idle':
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getStatusLabel = (status?: NodeProcessingStatus) => {
    switch (status) {
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'idle':
      default:
        return 'Idle';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{node}</h2>
            {nodeStatus && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(nodeStatus)}`}
              >
                {getStatusLabel(nodeStatus)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {/* Inputs */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Inputs</h3>
          {relationships.inputs.length > 0 ? (
            <div className="space-y-1">
              {relationships.inputs.map((input) => (
                <div
                  key={input}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700"
                >
                  {input}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No inputs (entry point)</p>
          )}
        </div>

        {/* Outputs */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Outputs</h3>
          {relationships.outputs.length > 0 ? (
            <div className="space-y-1">
              {relationships.outputs.map((output) => (
                <div
                  key={output}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-700"
                >
                  {output}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No outputs (end point)</p>
          )}
        </div>

        {/* Dependencies */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Dependencies</h3>
          <div className="space-y-3">
            {/* Upstream */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">Upstream</h4>
              {relationships.upstream.length > 0 ? (
                <div className="space-y-1">
                  {relationships.upstream.map((dep) => (
                    <div
                      key={dep}
                      className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700"
                    >
                      {dep}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">None</p>
              )}
            </div>
            {/* Downstream */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">Downstream</h4>
              {relationships.downstream.length > 0 ? (
                <div className="space-y-1">
                  {relationships.downstream.map((dep) => (
                    <div
                      key={dep}
                      className="px-3 py-1.5 bg-green-50 border border-green-200 rounded text-xs text-green-700"
                    >
                      {dep}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">None</p>
              )}
            </div>
          </div>
        </div>

        {/* Failure Modes */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Failure Modes</h3>
          {relationships.failureModes.length > 0 ? (
            <div className="space-y-1">
              {relationships.failureModes.map((failureMode) => {
                const isActive = activeFailureModes?.has(failureMode) || false;
                return (
                  <div
                    key={failureMode}
                    className={`px-3 py-2 rounded text-sm border ${
                      isActive
                        ? 'bg-red-50 border-red-300 text-red-800 font-medium'
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{failureMode.replace(/_/g, ' ')}</span>
                      {isActive && (
                        <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No failure modes defined</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * System Map Component - Interactive visualization of GTM system nodes
 */
export function SystemMap({ activeFailureModes, nodeStatuses, onNodeClick }: SystemMapProps) {
  const [selectedNode, setSelectedNode] = useState<GTMSystemNode | null>(null);

  const nodes: GTMSystemNode[] = ['CRM', 'Enrichment', 'Routing', 'Outbound', 'Reporting'];

  // Get status styling for a node
  const getNodeStatusStyle = (node: GTMSystemNode) => {
    const status = nodeStatuses?.get(node) || 'idle';
    const relationships = getNodeRelationships(node);
    const hasActiveFailures = relationships.failureModes.some(
      (fm) => activeFailureModes?.has(fm)
    );

    if (status === 'processing') {
      return 'border-yellow-400 bg-yellow-50';
    }
    if (status === 'failed' || hasActiveFailures) {
      return 'border-red-400 bg-red-50';
    }
    return 'border-gray-200 hover:border-gray-300';
  };

  // Get status indicator for a node
  const getStatusIndicator = (node: GTMSystemNode) => {
    const status = nodeStatuses?.get(node) || 'idle';
    switch (status) {
      case 'processing':
        return (
          <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full animate-pulse">
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded-full">
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const handleNodeClick = (node: GTMSystemNode) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  return (
    <div className="relative">
      {/* Node Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node) => {
          const relationships = getNodeRelationships(node);
          const hasActiveFailures = relationships.failureModes.some(
            (fm) => activeFailureModes?.has(fm)
          );
          const status = nodeStatuses?.get(node) || 'idle';

          return (
            <button
              key={node}
              onClick={() => handleNodeClick(node)}
              className={`p-4 bg-white border-2 rounded-lg text-left transition-all hover:shadow-md ${
                selectedNode === node
                  ? 'border-blue-500 bg-blue-50'
                  : getNodeStatusStyle(node)
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{node}</h3>
                <div className="flex items-center gap-2">
                  {getStatusIndicator(node)}
                  {hasActiveFailures && !getStatusIndicator(node) && (
                    <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded-full">
                      Issues
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{status}</span>
                </div>
                <div>
                  <span className="font-medium">Inputs:</span>{' '}
                  {relationships.inputs.length > 0
                    ? relationships.inputs.join(', ')
                    : 'None'}
                </div>
                <div>
                  <span className="font-medium">Outputs:</span>{' '}
                  {relationships.outputs.length > 0
                    ? relationships.outputs.join(', ')
                    : 'None'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Node Detail Panel */}
      {selectedNode && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
            onClick={handleClosePanel}
          />
          {/* Panel */}
          <NodeDetailPanel
            node={selectedNode}
            activeFailureModes={activeFailureModes}
            nodeStatus={nodeStatuses?.get(selectedNode)}
            onClose={handleClosePanel}
          />
        </>
      )}
    </div>
  );
}
