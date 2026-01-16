'use client';

import { useMemo } from 'react';
import type { SimulationResult, AutomationAction } from '@/lib/tools/gtm-control-tower/simEngine';
import type { GTMFailure } from '@/lib/tools/gtm-control-tower';

interface DataQualityMonitorProps {
  simulationResult: SimulationResult | null;
  previousResult: SimulationResult | null;
}

/**
 * Metric card component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  status?: 'good' | 'warning' | 'bad';
  subtitle?: string;
  deltaIsBad?: boolean; // If true, positive delta is bad; if false, negative delta is bad
}

function MetricCard({ title, value, delta, deltaLabel, status = 'good', subtitle, deltaIsBad = true }: MetricCardProps) {
  const statusColors = {
    good: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    bad: 'border-red-200 bg-red-50',
  };

  const getDeltaColor = () => {
    if (delta === undefined || delta === 0) return 'text-gray-600';
    if (deltaIsBad) {
      return delta > 0 ? 'text-red-600' : 'text-green-600';
    } else {
      return delta < 0 ? 'text-red-600' : 'text-green-600';
    }
  };

  const deltaColor = getDeltaColor();

  return (
    <div className={`p-4 border rounded-lg ${statusColors[status]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-xs font-medium text-gray-700 mb-1">{title}</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {delta !== undefined && delta !== 0 && (
              <span className={`text-sm font-medium ${deltaColor}`}>
                {delta > 0 ? '+' : ''}{delta}{deltaLabel || ''}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate data quality metrics from simulation results
 */
function calculateMetrics(
  current: SimulationResult | null,
  previous: SimulationResult | null
) {
  if (!current) {
    return {
      // Data Integrity
      duplicateRate: 0,
      fieldCompleteness: 100,
      duplicateRateDelta: 0,
      fieldCompletenessDelta: 0,
      
      // Freshness
      avgTimeToEnrichment: 0,
      staleRecords: 0,
      avgTimeToEnrichmentDelta: 0,
      staleRecordsDelta: 0,
      
      // System Reliability
      failedAutomations: 0,
      retryVolume: 0,
      failedAutomationsDelta: 0,
      retryVolumeDelta: 0,
    };
  }

  // Data Integrity Metrics
  const totalLeads = current.records.leads.size;
  const duplicateActions = current.actions.filter(
    (a) => a.type === 'duplicate_detected'
  ).length;
  // Also count duplicate_creation failures
  const duplicateFailures = current.failures.filter(
    (f) => f.type === 'duplicate_creation'
  ).length;
  const duplicateRate = totalLeads > 0 
    ? ((duplicateActions + duplicateFailures) / Math.max(totalLeads, 1)) * 100 
    : 0;

  // Calculate field completeness (check if leads have required fields)
  // Failures reduce completeness
  const missingFieldsFailures = current.failures.filter(
    (f) => f.type === 'missing_required_fields'
  ).length;
  let completeFields = 0;
  let totalFields = 0;
  for (const lead of current.records.leads.values()) {
    totalFields += 4; // email, name, company, status
    if (lead.email) completeFields++;
    if (lead.name) completeFields++;
    if (lead.company) completeFields++;
    if (lead.status) completeFields++;
  }
  // Reduce completeness based on missing field failures
  const completenessPenalty = missingFieldsFailures * 5; // Each failure reduces by 5%
  const fieldCompleteness = totalFields > 0 
    ? Math.max(0, (completeFields / totalFields) * 100 - completenessPenalty)
    : Math.max(0, 100 - completenessPenalty);

  // Freshness Metrics
  // Check for enrichment timeouts - these increase average time
  const enrichmentTimeouts = current.failures.filter(
    (f) => f.type === 'enrichment_timeout'
  ).length;
  let totalEnrichmentTime = 0;
  let enrichedCount = 0;
  for (const lead of current.records.leads.values()) {
    if (lead.enrichedAt && lead.status !== 'new') {
      // Estimate enrichment time (simplified - in real system would track actual timestamps)
      totalEnrichmentTime += 800; // Default enrichment latency
      enrichedCount++;
    }
  }
  // Add penalty for timeouts (each timeout adds 2000ms to average)
  const timeoutPenalty = enrichmentTimeouts * 2000;
  const avgTimeToEnrichment = enrichedCount > 0 
    ? (totalEnrichmentTime + timeoutPenalty) / Math.max(enrichedCount, 1)
    : timeoutPenalty;

  // Stale records (records that haven't been updated recently)
  // Also count records that failed to process (silent drops)
  const silentDrops = current.failures.filter(
    (f) => f.type === 'silent_drop'
  ).length;
  const now = Date.now();
  const staleThreshold = 5 * 60 * 1000; // 5 minutes
  let staleRecords = 0;
  for (const lead of current.records.leads.values()) {
    const lastUpdate = lead.reportedAt || lead.outboundAt || lead.routedAt || lead.enrichedAt;
    if (!lastUpdate || (now - lastUpdate.getTime()) > staleThreshold) {
      staleRecords++;
    }
  }
  // Add silent drops to stale records count
  staleRecords += silentDrops;

  // System Reliability Metrics
  const failedAutomations = current.failures.length;
  const retryVolume = current.failures.filter(
    (f) => f.type === 'enrichment_timeout' || f.type === 'reporting_lag'
  ).length;

  // Calculate deltas
  const previousDuplicateRate = previous
    ? (previous.actions.filter((a) => a.type === 'duplicate_detected').length / 
       Math.max(previous.records.leads.size, 1)) * 100
    : 0;
  const duplicateRateDelta = duplicateRate - previousDuplicateRate;

  let previousCompleteness = 100;
  if (previous) {
    let prevComplete = 0;
    let prevTotal = 0;
    for (const lead of previous.records.leads.values()) {
      prevTotal += 4;
      if (lead.email) prevComplete++;
      if (lead.name) prevComplete++;
      if (lead.company) prevComplete++;
      if (lead.status) prevComplete++;
    }
    previousCompleteness = prevTotal > 0 ? (prevComplete / prevTotal) * 100 : 100;
  }
  const fieldCompletenessDelta = fieldCompleteness - previousCompleteness;

  const previousFailedAutomations = previous ? previous.failures.length : 0;
  const failedAutomationsDelta = failedAutomations - previousFailedAutomations;

  const previousRetryVolume = previous
    ? previous.failures.filter(
        (f) => f.type === 'enrichment_timeout' || f.type === 'reporting_lag'
      ).length
    : 0;
  const retryVolumeDelta = retryVolume - previousRetryVolume;

  // Calculate previous freshness metrics
  let previousAvgTime = 0;
  let previousStale = 0;
  if (previous) {
    let prevTotalTime = 0;
    let prevEnrichedCount = 0;
    for (const lead of previous.records.leads.values()) {
      if (lead.enrichedAt && lead.status !== 'new') {
        prevTotalTime += 800;
        prevEnrichedCount++;
      }
      const lastUpdate = lead.reportedAt || lead.outboundAt || lead.routedAt || lead.enrichedAt;
      if (!lastUpdate || (now - lastUpdate.getTime()) > staleThreshold) {
        previousStale++;
      }
    }
    previousAvgTime = prevEnrichedCount > 0 ? prevTotalTime / prevEnrichedCount : 0;
  }
  const avgTimeToEnrichmentDelta = avgTimeToEnrichment - previousAvgTime;
  const staleRecordsDelta = staleRecords - previousStale;

  return {
    duplicateRate,
    fieldCompleteness,
    duplicateRateDelta,
    fieldCompletenessDelta,
    avgTimeToEnrichment,
    staleRecords,
    avgTimeToEnrichmentDelta,
    staleRecordsDelta,
    failedAutomations,
    retryVolume,
    failedAutomationsDelta,
    retryVolumeDelta,
  };
}

/**
 * Data Quality Monitor Component
 * Displays data quality metrics in 3 dashboard panels
 */
export function DataQualityMonitor({ simulationResult, previousResult }: DataQualityMonitorProps) {
  const metrics = useMemo(
    () => calculateMetrics(simulationResult, previousResult),
    [simulationResult, previousResult]
  );

  // Determine status for each metric
  const getDuplicateRateStatus = (rate: number): 'good' | 'warning' | 'bad' => {
    if (rate < 2) return 'good';
    if (rate < 5) return 'warning';
    return 'bad';
  };

  const getCompletenessStatus = (completeness: number): 'good' | 'warning' | 'bad' => {
    if (completeness >= 95) return 'good';
    if (completeness >= 85) return 'warning';
    return 'bad';
  };

  const getFreshnessStatus = (time: number): 'good' | 'warning' | 'bad' => {
    if (time < 1000) return 'good';
    if (time < 2000) return 'warning';
    return 'bad';
  };

  const getStaleStatus = (stale: number, total: number): 'good' | 'warning' | 'bad' => {
    const percentage = total > 0 ? (stale / total) * 100 : 0;
    if (percentage < 5) return 'good';
    if (percentage < 15) return 'warning';
    return 'bad';
  };

  const getReliabilityStatus = (failures: number): 'good' | 'warning' | 'bad' => {
    if (failures === 0) return 'good';
    if (failures < 3) return 'warning';
    return 'bad';
  };

  const totalLeads = simulationResult?.records.leads.size || 0;

  return (
    <div className="space-y-6">
      {/* Data Integrity Panel */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Integrity</h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Duplicate Rate"
            value={`${metrics.duplicateRate.toFixed(1)}%`}
            delta={metrics.duplicateRateDelta}
            deltaLabel="%"
            status={getDuplicateRateStatus(metrics.duplicateRate)}
            subtitle={`${simulationResult?.actions.filter((a) => a.type === 'duplicate_detected').length || 0} duplicates detected`}
          />
          <MetricCard
            title="Field Completeness"
            value={`${metrics.fieldCompleteness.toFixed(1)}%`}
            delta={metrics.fieldCompletenessDelta}
            deltaLabel="%"
            deltaIsBad={false}
            status={getCompletenessStatus(metrics.fieldCompleteness)}
            subtitle={`${totalLeads} total records`}
          />
        </div>
      </div>

      {/* Freshness Panel */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Freshness</h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Avg Time to Enrichment"
            value={`${(metrics.avgTimeToEnrichment / 1000).toFixed(1)}s`}
            delta={metrics.avgTimeToEnrichmentDelta}
            deltaLabel="ms"
            status={getFreshnessStatus(metrics.avgTimeToEnrichment)}
            subtitle="Average processing time"
          />
          <MetricCard
            title="Stale Records"
            value={metrics.staleRecords}
            delta={metrics.staleRecordsDelta}
            status={getStaleStatus(metrics.staleRecords, totalLeads)}
            subtitle={`${totalLeads > 0 ? ((metrics.staleRecords / totalLeads) * 100).toFixed(1) : 0}% of total`}
          />
        </div>
      </div>

      {/* System Reliability Panel */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">System Reliability</h3>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            title="Failed Automations"
            value={metrics.failedAutomations}
            delta={metrics.failedAutomationsDelta}
            status={getReliabilityStatus(metrics.failedAutomations)}
            subtitle={`${simulationResult?.failures.length || 0} total failures`}
          />
          <MetricCard
            title="Retry Volume"
            value={metrics.retryVolume}
            delta={metrics.retryVolumeDelta}
            status={getReliabilityStatus(metrics.retryVolume)}
            subtitle="Timeouts and lags"
          />
        </div>
      </div>
    </div>
  );
}
