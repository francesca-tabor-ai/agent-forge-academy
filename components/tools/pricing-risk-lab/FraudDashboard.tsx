'use client';

import { useState, useMemo, useCallback } from 'react';
import { runSimulation, compareSimulations, type SimulationInputs } from '@/lib/tools/pricing-risk-lab/simEngine';
import {
  DEFAULT_MARKETS,
  DEFAULT_SEGMENTS,
  DEFAULT_CHANNELS,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_PRICING_SCENARIO,
} from '@/lib/tools/pricing-risk-lab/defaults';
import type {
  Market,
  Segment,
  PaymentMethod,
  SimulationSettings,
  SimulationResult,
  RiskScoreDistribution,
} from '@/lib/tools/pricing-risk-lab/types';

/**
 * Dashboard filters
 */
interface DashboardFilters {
  market: string; // Market code
  segment: string; // Segment name
  paymentMethod: string; // Payment method name
}

/**
 * Format number for display
 */
function formatNumber(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0.00';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
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
 * Create simulation inputs
 */
function createSimulationInputs(
  filters: DashboardFilters,
  isProposed: boolean = false
): SimulationInputs {
  const market = DEFAULT_MARKETS.find((m) => m.code === filters.market) || DEFAULT_MARKETS[0];
  const segment = DEFAULT_SEGMENTS.find((s) => s.name === filters.segment) || DEFAULT_SEGMENTS[0];
  const channel = DEFAULT_CHANNELS[0]; // Use default channel
  const paymentMethod = DEFAULT_PAYMENT_METHODS.find((p) => p.name === filters.paymentMethod) || DEFAULT_PAYMENT_METHODS[0];

  // Proposed scenario has slightly different settings to show differences
  const settings: SimulationSettings = {
    riskTolerance: isProposed ? 'high' : 'medium',
    approvalThreshold: isProposed ? 0.85 : 0.90, // Lower threshold = more approvals
    fraudStrictness: isProposed ? 0.7 : 0.5, // Higher strictness
    timeHorizon: 30,
  };

  // Proposed scenario has slightly higher price
  const pricingScenario = isProposed
    ? {
        ...DEFAULT_PRICING_SCENARIO,
        tiers: [
          {
            ...DEFAULT_PRICING_SCENARIO.tiers[0],
            price: DEFAULT_PRICING_SCENARIO.tiers[0].price * 1.1, // 10% higher
          },
        ],
      }
    : DEFAULT_PRICING_SCENARIO;

  return {
    market,
    segment,
    channel,
    paymentMethod,
    pricingScenario,
    settings,
    quantity: 1,
  };
}

/**
 * FraudDashboard Component
 */
export function FraudDashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({
    market: DEFAULT_MARKETS[0].code,
    segment: DEFAULT_SEGMENTS[0].name,
    paymentMethod: DEFAULT_PAYMENT_METHODS[0].name,
  });

  // Run simulations for baseline and proposed
  const baselineInputs = useMemo(
    () => createSimulationInputs(filters, false),
    [filters]
  );

  const proposedInputs = useMemo(
    () => createSimulationInputs(filters, true),
    [filters]
  );

  const baselineResult = useMemo(
    () => runSimulation(baselineInputs),
    [baselineInputs]
  );

  const proposedResult = useMemo(
    () => runSimulation(proposedInputs),
    [proposedInputs]
  );

  const comparison = useMemo(
    () => compareSimulations(baselineInputs, proposedInputs),
    [baselineInputs, proposedInputs]
  );

  const selectedMarket = DEFAULT_MARKETS.find((m) => m.code === filters.market) || DEFAULT_MARKETS[0];
  const currency = selectedMarket.currency;

  // Analyze revenue gains
  const revenueGainAnalysis = useMemo(() => {
    const revenueDiff = comparison.differences.revenue;
    const fraudExposureDiff = comparison.differences.fraudExposure;
    const fpRateDiff = comparison.differences.fpRate;
    const fnRateDiff = comparison.differences.fnRate;

    const hasRevenueGain = revenueDiff > 0;
    const hasHigherFraudExposure = fraudExposureDiff > 0;
    const hasHigherFPRate = fpRateDiff > 0;
    const hasHigherFNRate = fnRateDiff > 0;

    let message = '';
    let severity: 'success' | 'warning' | 'danger' = 'success';

    if (hasRevenueGain) {
      if (hasHigherFraudExposure || hasHigherFPRate) {
        message = `Revenue increased by ${formatCurrency(revenueDiff, currency)}, but this comes with higher fraud exposure (${formatCurrency(fraudExposureDiff, currency)}) and false positive rate (${formatPercentage(fpRateDiff)}). Consider tightening fraud controls.`;
        severity = 'warning';
      } else if (hasHigherFNRate) {
        message = `Revenue increased by ${formatCurrency(revenueDiff, currency)}, but false negative rate increased (${formatPercentage(fnRateDiff)}), indicating more fraudulent transactions are being approved.`;
        severity = 'danger';
      } else {
        message = `Revenue increased by ${formatCurrency(revenueDiff, currency)} with improved risk metrics. This is a healthy gain.`;
        severity = 'success';
      }
    } else {
      message = `Revenue decreased by ${formatCurrency(Math.abs(revenueDiff), currency)}. Review pricing and approval strategies.`;
      severity = 'warning';
    }

    return { message, severity };
  }, [comparison, currency]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Market
            </label>
            <select
              value={filters.market}
              onChange={(e) => setFilters((prev) => ({ ...prev, market: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DEFAULT_MARKETS.map((market) => (
                <option key={market.code} value={market.code}>
                  {market.code} ({market.currency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segment
            </label>
            <select
              value={filters.segment}
              onChange={(e) => setFilters((prev) => ({ ...prev, segment: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DEFAULT_SEGMENTS.map((segment) => (
                <option key={segment.name} value={segment.name}>
                  {segment.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {DEFAULT_PAYMENT_METHODS.map((method) => (
                <option key={method.name} value={method.name}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Revenue Gains Callout */}
      <div
        className={`border rounded-lg p-4 ${
          revenueGainAnalysis.severity === 'success'
            ? 'bg-green-50 border-green-200'
            : revenueGainAnalysis.severity === 'warning'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {revenueGainAnalysis.severity === 'success' ? (
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : revenueGainAnalysis.severity === 'warning' ? (
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${
              revenueGainAnalysis.severity === 'success'
                ? 'text-green-800'
                : revenueGainAnalysis.severity === 'warning'
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              Where Revenue Gains Come From
            </h3>
            <div className={`mt-2 text-sm ${
              revenueGainAnalysis.severity === 'success'
                ? 'text-green-700'
                : revenueGainAnalysis.severity === 'warning'
                ? 'text-yellow-700'
                : 'text-red-700'
            }`}>
              <p>{revenueGainAnalysis.message}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Score Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Score Distribution</h3>
        <div className="space-y-4">
          {baselineResult.riskScoreDistribution.map((baselineBucket, index) => {
            const proposedBucket = proposedResult.riskScoreDistribution[index];
            return (
              <div key={baselineBucket.range} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{baselineBucket.range}</span>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>Baseline: {formatPercentage(baselineBucket.percentage / 100)}</span>
                    <span>Proposed: {formatPercentage(proposedBucket.percentage / 100)}</span>
                  </div>
                </div>
                <div className="flex gap-2 h-6">
                  {/* Baseline bar */}
                  <div className="flex-1 bg-gray-100 rounded relative overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${baselineBucket.percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-700 font-medium">
                      {formatPercentage(baselineBucket.percentage / 100)}
                    </div>
                  </div>
                  {/* Proposed bar */}
                  <div className="flex-1 bg-gray-100 rounded relative overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded"
                      style={{ width: `${proposedBucket.percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-700 font-medium">
                      {formatPercentage(proposedBucket.percentage / 100)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Proposed</span>
          </div>
        </div>
      </div>

      {/* Approval vs Decline Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approval Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Rate</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Baseline</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPercentage(baselineResult.approvalRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full"
                  style={{ width: `${baselineResult.approvalRate * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Proposed</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPercentage(proposedResult.approvalRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-green-500 h-4 rounded-full"
                  style={{ width: `${proposedResult.approvalRate * 100}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className={`text-sm font-medium ${
                comparison.differences.approvalRate > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {comparison.differences.approvalRate > 0 ? '↑' : '↓'} 
                {formatPercentage(Math.abs(comparison.differences.approvalRate))} change
              </div>
            </div>
          </div>
        </div>

        {/* Decline Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Decline Rate</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Baseline</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPercentage(baselineResult.declineRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-red-500 h-4 rounded-full"
                  style={{ width: `${baselineResult.declineRate * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Proposed</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPercentage(proposedResult.declineRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-orange-500 h-4 rounded-full"
                  style={{ width: `${proposedResult.declineRate * 100}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className={`text-sm font-medium ${
                comparison.differences.declineRate < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {comparison.differences.declineRate < 0 ? '↓' : '↑'} 
                {formatPercentage(Math.abs(comparison.differences.declineRate))} change
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* False Positive and False Negative Rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* False Positive Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">False Positive Rate</h3>
          <p className="text-sm text-gray-600 mb-4">
            Legitimate transactions incorrectly declined
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Baseline</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPercentage(baselineResult.fpRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full"
                  style={{ width: `${baselineResult.fpRate * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Proposed</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPercentage(proposedResult.fpRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-600 h-3 rounded-full"
                  style={{ width: `${proposedResult.fpRate * 100}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className={`text-sm font-medium ${
                comparison.differences.fpRate < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {comparison.differences.fpRate < 0 ? '↓' : '↑'} 
                {formatPercentage(Math.abs(comparison.differences.fpRate))} change
              </div>
            </div>
          </div>
        </div>

        {/* False Negative Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">False Negative Rate</h3>
          <p className="text-sm text-gray-600 mb-4">
            Fraudulent transactions incorrectly approved
          </p>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Baseline</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPercentage(baselineResult.fnRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full"
                  style={{ width: `${baselineResult.fnRate * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Proposed</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPercentage(proposedResult.fnRate)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full"
                  style={{ width: `${proposedResult.fnRate * 100}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className={`text-sm font-medium ${
                comparison.differences.fnRate < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {comparison.differences.fnRate < 0 ? '↓' : '↑'} 
                {formatPercentage(Math.abs(comparison.differences.fnRate))} change
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Risk and Monetization Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk & Monetization Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(proposedResult.revenue, currency)}
            </div>
            <div className={`text-sm ${
              comparison.differences.revenue > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {comparison.differences.revenue > 0 ? '↑' : '↓'} 
              {formatCurrency(Math.abs(comparison.differences.revenue), currency)} vs baseline
            </div>
          </div>

          {/* Fraud Exposure */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Fraud Exposure</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(proposedResult.fraudExposure, currency)}
            </div>
            <div className={`text-sm ${
              comparison.differences.fraudExposure < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {comparison.differences.fraudExposure < 0 ? '↓' : '↑'} 
              {formatCurrency(Math.abs(comparison.differences.fraudExposure), currency)} vs baseline
            </div>
          </div>

          {/* Fraud Loss */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Fraud Loss</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(proposedResult.fraudLoss, currency)}
            </div>
            <div className={`text-sm ${
              comparison.differences.fraudLoss < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {comparison.differences.fraudLoss < 0 ? '↓' : '↑'} 
              {formatCurrency(Math.abs(comparison.differences.fraudLoss), currency)} vs baseline
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatPercentage(proposedResult.conversionRate)}
            </div>
            <div className={`text-sm ${
              comparison.differences.conversionRate > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {comparison.differences.conversionRate > 0 ? '↑' : '↓'} 
              {formatPercentage(Math.abs(comparison.differences.conversionRate))} vs baseline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
