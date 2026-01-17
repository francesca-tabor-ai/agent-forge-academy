'use client';

import { useState, useMemo } from 'react';
import { generateAlerts, DEFAULT_ALERT_THRESHOLDS, type AlertThresholds } from '@/lib/tools/pricing-risk-lab/alertEngine';
import { compareSimulations, type SimulationInputs, type ComparisonResult } from '@/lib/tools/pricing-risk-lab/simEngine';
import {
  DEFAULT_MARKETS,
  DEFAULT_SEGMENTS,
  DEFAULT_CHANNELS,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_PRICING_SCENARIO,
} from '@/lib/tools/pricing-risk-lab/defaults';
import type {
  Alert,
  AlertSeverity,
  SimulationSettings,
} from '@/lib/tools/pricing-risk-lab/types';

/**
 * Alert context for attribution
 */
interface AlertContext {
  scenarioId?: string;
  experimentName?: string;
  market?: string;
  segment?: string;
}

/**
 * Format percentage for display
 */
function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0.00%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format currency for display
 */
function formatCurrency(value: number, currency: string = 'USD'): string {
  if (isNaN(value) || !isFinite(value)) return `$0.00`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
}

/**
 * Get severity badge styling
 */
function getSeverityBadgeClass(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get severity icon
 */
function getSeverityIcon(severity: AlertSeverity) {
  switch (severity) {
    case 'critical':
      return (
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'info':
      return (
        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
      );
  }
}

/**
 * AlertsPanel Component
 */
export function AlertsPanel() {
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_ALERT_THRESHOLDS);
  const [context, setContext] = useState<AlertContext>({
    scenarioId: 'scenario-001',
    experimentName: '',
  });

  // Create baseline and scenario inputs
  const baselineInputs: SimulationInputs = useMemo(() => {
    const market = DEFAULT_MARKETS[0];
    const segment = DEFAULT_SEGMENTS[0];
    const channel = DEFAULT_CHANNELS[0];
    const paymentMethod = DEFAULT_PAYMENT_METHODS[0];

    const settings: SimulationSettings = {
      riskTolerance: 'medium',
      approvalThreshold: 0.90,
      fraudStrictness: 0.5,
      timeHorizon: 30,
    };

    return {
      market,
      segment,
      channel,
      paymentMethod,
      pricingScenario: DEFAULT_PRICING_SCENARIO,
      settings,
      quantity: 1,
    };
  }, []);

  const scenarioInputs: SimulationInputs = useMemo(() => {
    const market = DEFAULT_MARKETS[0];
    const segment = DEFAULT_SEGMENTS[0];
    const channel = DEFAULT_CHANNELS[0];
    const paymentMethod = DEFAULT_PAYMENT_METHODS[0];

    // Scenario with higher risk settings to trigger alerts
    const settings: SimulationSettings = {
      riskTolerance: 'high',
      approvalThreshold: 0.80, // Lower threshold
      fraudStrictness: 0.3, // Lower strictness = more fraud
      timeHorizon: 30,
    };

    // Higher price scenario
    const pricingScenario = {
      ...DEFAULT_PRICING_SCENARIO,
      tiers: [
        {
          ...DEFAULT_PRICING_SCENARIO.tiers[0],
          price: DEFAULT_PRICING_SCENARIO.tiers[0].price * 1.15, // 15% higher
        },
      ],
    };

    return {
      market,
      segment,
      channel,
      paymentMethod,
      pricingScenario,
      settings,
      quantity: 1,
    };
  }, []);

  // Run comparison and generate alerts
  const comparison: ComparisonResult = useMemo(() => {
    return compareSimulations(baselineInputs, scenarioInputs);
  }, [baselineInputs, scenarioInputs]);

  const alerts: Alert[] = useMemo(() => {
    return generateAlerts(comparison, thresholds, context);
  }, [comparison, thresholds, context]);

  // Acknowledge alert
  const handleAcknowledge = (alertId: string) => {
    // In a real implementation, this would update the alert state
    // For now, we'll just show a message
    alert(`Alert ${alertId} acknowledged`);
  };

  // Filter alerts by severity
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');
  const infoAlerts = alerts.filter((a) => a.severity === 'info');

  return (
    <div className="space-y-6">
      {/* Threshold Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Approval Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={thresholds.minApprovalRate ? thresholds.minApprovalRate * 100 : ''}
              onChange={(e) => setThresholds((prev) => ({
                ...prev,
                minApprovalRate: e.target.value ? parseFloat(e.target.value) / 100 : undefined,
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Fraud Loss Lift (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={thresholds.maxFraudLossLift ? thresholds.maxFraudLossLift * 100 : ''}
              onChange={(e) => setThresholds((prev) => ({
                ...prev,
                maxFraudLossLift: e.target.value ? parseFloat(e.target.value) / 100 : undefined,
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max False Positive Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={thresholds.maxFpRate ? thresholds.maxFpRate * 100 : ''}
              onChange={(e) => setThresholds((prev) => ({
                ...prev,
                maxFpRate: e.target.value ? parseFloat(e.target.value) / 100 : undefined,
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Context Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Attribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scenario ID
            </label>
            <input
              type="text"
              value={context.scenarioId || ''}
              onChange={(e) => setContext((prev) => ({ ...prev, scenarioId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="scenario-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experiment Name (Optional)
            </label>
            <input
              type="text"
              value={context.experimentName || ''}
              onChange={(e) => setContext((prev) => ({ ...prev, experimentName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Q1 2024 Pricing Test"
            />
          </div>
        </div>
      </div>

      {/* Alerts Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          <div className="flex gap-2 text-sm">
            {criticalAlerts.length > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                {criticalAlerts.length} Critical
              </span>
            )}
            {warningAlerts.length > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                {warningAlerts.length} Warning
              </span>
            )}
            {infoAlerts.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {infoAlerts.length} Info
              </span>
            )}
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2">No alerts detected. All metrics are within acceptable thresholds.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getSeverityBadgeClass(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityBadgeClass(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {alert.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{alert.message}</h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>
                          <strong>Why triggered:</strong> {alert.triggeredBy}
                        </p>
                        <p>
                          <strong>Threshold:</strong> {typeof alert.threshold === 'number' && alert.threshold < 1 
                            ? formatPercentage(alert.threshold) 
                            : alert.threshold.toFixed(2)}
                        </p>
                        <p>
                          <strong>Observed:</strong> {typeof alert.observed === 'number' && alert.observed < 1 
                            ? formatPercentage(alert.observed) 
                            : alert.observed.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="ml-4 px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
