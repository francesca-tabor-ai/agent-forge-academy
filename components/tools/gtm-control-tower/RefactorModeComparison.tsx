'use client';

import type { SimulationResult } from '@/lib/tools/gtm-control-tower/simEngine';
import type { GTMSystemNode, GTMFailure } from '@/lib/tools/gtm-control-tower';
import { SystemMap } from './SystemMap';
import { DataQualityMonitor } from './DataQualityMonitor';

interface RefactorModeComparisonProps {
  earlyStageResult: SimulationResult | null;
  scaledResult: SimulationResult | null;
  earlyStagePrevious: SimulationResult | null;
  scaledPrevious: SimulationResult | null;
}

type NodeProcessingStatus = 'idle' | 'processing' | 'failed';

/**
 * Get node status from simulation result
 */
function getNodeStatusFromResult(
  result: SimulationResult | null,
  node: GTMSystemNode
): NodeProcessingStatus {
  if (!result) return 'idle';
  const update = result.nodeStatusUpdates.find((u) => u.node === node);
  return update?.status || 'idle';
}

/**
 * Compare two values and return difference annotation
 */
function compareValues(
  early: number,
  scaled: number,
  label: string,
  lowerIsBetter: boolean = false
): { diff: number; annotation: string } {
  const diff = scaled - early;
  const percentDiff = early !== 0 ? ((diff / early) * 100).toFixed(1) : '0.0';
  
  let annotation = '';
  if (Math.abs(diff) < 0.01) {
    annotation = 'No difference';
  } else if (lowerIsBetter) {
    annotation = diff < 0 
      ? `Scaled is ${Math.abs(percentDiff)}% better (lower ${label})`
      : `Early-stage is ${Math.abs(percentDiff)}% better (lower ${label})`;
  } else {
    annotation = diff > 0 
      ? `Scaled is ${Math.abs(percentDiff)}% better (higher ${label})`
      : `Early-stage is ${Math.abs(percentDiff)}% better (higher ${label})`;
  }
  
  return { diff, annotation };
}

/**
 * Architecture Comparison Panel
 */
function ArchitecturePanel({
  title,
  result,
  previousResult,
  isEarlyStage,
}: {
  title: string;
  result: SimulationResult | null;
  previousResult: SimulationResult | null;
  isEarlyStage: boolean;
}) {
  // Get node statuses from result
  const nodeStatuses = new Map<GTMSystemNode, NodeProcessingStatus>();
  const nodes: GTMSystemNode[] = ['CRM', 'Enrichment', 'Routing', 'Outbound', 'Reporting'];
  nodes.forEach((node) => {
    nodeStatuses.set(node, getNodeStatusFromResult(result, node));
  });

  // Get active failures
  const activeFailureModes = new Set(
    result?.failures.map((f) => f.type) || []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded ${
          isEarlyStage 
            ? 'bg-orange-100 text-orange-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {isEarlyStage ? 'Early-Stage' : 'Scaled'}
        </span>
      </div>

      {/* System Map */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">System Map</h4>
        <SystemMap
          activeFailureModes={activeFailureModes}
          nodeStatuses={nodeStatuses}
        />
      </div>

      {/* Data Quality Monitor */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Quality</h4>
        <DataQualityMonitor
          simulationResult={result}
          previousResult={previousResult}
        />
      </div>

      {/* Failures List */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Failures ({result?.failures.length || 0})
        </h4>
        {result && result.failures.length > 0 ? (
          <div className="space-y-2">
            {result.failures.map((failure) => (
              <div
                key={failure.id}
                className="p-2 bg-red-50 border border-red-200 rounded text-sm"
              >
                <div className="font-medium text-red-900">{failure.node}</div>
                <div className="text-red-700">{failure.type.replace(/_/g, ' ')}</div>
                <div className="text-xs text-red-600 mt-1">{failure.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No failures</p>
        )}
      </div>
    </div>
  );
}

/**
 * Comparison Summary Panel
 */
function ComparisonSummary({
  earlyStageResult,
  scaledResult,
}: {
  earlyStageResult: SimulationResult | null;
  scaledResult: SimulationResult | null;
}) {
  if (!earlyStageResult || !scaledResult) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Run an event to see comparison results.
        </p>
      </div>
    );
  }

  // Compare failures
  const earlyFailures = earlyStageResult.failures.length;
  const scaledFailures = scaledResult.failures.length;
  const failureDiff = compareValues(earlyFailures, scaledFailures, 'failures', true);

  // Compare actions
  const earlyActions = earlyStageResult.actions.length;
  const scaledActions = scaledResult.actions.length;
  const actionDiff = compareValues(earlyActions, scaledActions, 'actions', false);

  // Compare records
  const earlyLeads = earlyStageResult.records.leads.size;
  const scaledLeads = scaledResult.records.leads.size;
  const leadDiff = compareValues(earlyLeads, scaledLeads, 'leads', false);

  // Compare node statuses
  const earlyFailedNodes = earlyStageResult.nodeStatusUpdates.filter(
    (u) => u.status === 'failed'
  ).length;
  const scaledFailedNodes = scaledResult.nodeStatusUpdates.filter(
    (u) => u.status === 'failed'
  ).length;
  const nodeDiff = compareValues(earlyFailedNodes, scaledFailedNodes, 'failed nodes', true);

  // Compare silent drops
  const earlySilentDrops = earlyStageResult.failures.filter(
    (f) => f.type === 'silent_drop'
  ).length;
  const scaledSilentDrops = scaledResult.failures.filter(
    (f) => f.type === 'silent_drop'
  ).length;
  const silentDropDiff = compareValues(earlySilentDrops, scaledSilentDrops, 'silent drops', true);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <h4 className="text-sm font-semibold text-blue-900 mb-3">Key Differences</h4>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-start justify-between gap-4">
          <span className="text-blue-800 font-medium">Failures:</span>
          <span className="text-blue-900 text-right">
            Early: {earlyFailures} | Scaled: {scaledFailures}
            <br />
            <span className="text-xs italic">{failureDiff.annotation}</span>
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-blue-800 font-medium">Silent Drops:</span>
          <span className="text-blue-900 text-right">
            Early: {earlySilentDrops} | Scaled: {scaledSilentDrops}
            <br />
            <span className="text-xs italic">{silentDropDiff.annotation}</span>
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-blue-800 font-medium">Automation Actions:</span>
          <span className="text-blue-900 text-right">
            Early: {earlyActions} | Scaled: {scaledActions}
            <br />
            <span className="text-xs italic">{actionDiff.annotation}</span>
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-blue-800 font-medium">Records Created:</span>
          <span className="text-blue-900 text-right">
            Early: {earlyLeads} | Scaled: {scaledLeads}
            <br />
            <span className="text-xs italic">{leadDiff.annotation}</span>
          </span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-blue-800 font-medium">Failed Nodes:</span>
          <span className="text-blue-900 text-right">
            Early: {earlyFailedNodes} | Scaled: {scaledFailedNodes}
            <br />
            <span className="text-xs italic">{nodeDiff.annotation}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Refactor Mode Comparison Component
 * Shows side-by-side comparison of Early-Stage vs Scaled architectures
 */
export function RefactorModeComparison({
  earlyStageResult,
  scaledResult,
  earlyStagePrevious,
  scaledPrevious,
}: RefactorModeComparisonProps) {
  return (
    <div className="space-y-6">
      {/* Comparison Summary */}
      <ComparisonSummary
        earlyStageResult={earlyStageResult}
        scaledResult={scaledResult}
      />

      {/* Side-by-side Architecture Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Early-Stage Architecture */}
        <ArchitecturePanel
          title="Early-Stage Architecture"
          result={earlyStageResult}
          previousResult={earlyStagePrevious}
          isEarlyStage={true}
        />

        {/* Scaled Architecture */}
        <ArchitecturePanel
          title="Scaled Architecture"
          result={scaledResult}
          previousResult={scaledPrevious}
          isEarlyStage={false}
        />
      </div>
    </div>
  );
}
