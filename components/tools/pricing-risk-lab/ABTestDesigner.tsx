'use client';

import { useState, useMemo } from 'react';
import { runSimulation, compareSimulations, type SimulationInputs, type ComparisonResult } from '@/lib/tools/pricing-risk-lab/simEngine';
import {
  DEFAULT_MARKETS,
  DEFAULT_SEGMENTS,
  DEFAULT_CHANNELS,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_PRICING_SCENARIO,
} from '@/lib/tools/pricing-risk-lab/defaults';
import type {
  SimulationSettings,
  SimulationResult,
  ExperimentStatus,
} from '@/lib/tools/pricing-risk-lab/types';

/**
 * Extended guardrails for A/B test
 */
interface ExtendedGuardrails {
  maxFraudLift?: number; // Maximum acceptable fraud rate increase (0-1)
  minApprovalRate?: number; // Minimum acceptable approval rate (0-1)
  maxFpRate?: number; // Maximum acceptable false positive rate (0-1)
  maxFrictionScore?: number; // Maximum acceptable friction score (0-1)
}

/**
 * Experiment draft form state
 */
interface ExperimentDraftForm {
  name: string;
  owner: string;
  hypothesis: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  guardrails: ExtendedGuardrails;
  status: ExperimentStatus;
}

/**
 * Available metrics for selection
 */
const AVAILABLE_METRICS = [
  'conversionRate',
  'revenue',
  'rpu',
  'approvalRate',
  'fraudLoss',
  'fraudExposure',
  'fpRate',
  'fnRate',
  'frictionScore',
];

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
 * Create baseline simulation inputs
 */
function createBaselineInputs(): SimulationInputs {
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
}

/**
 * Create proposed simulation inputs (slightly different for comparison)
 */
function createProposedInputs(): SimulationInputs {
  const market = DEFAULT_MARKETS[0];
  const segment = DEFAULT_SEGMENTS[0];
  const channel = DEFAULT_CHANNELS[0];
  const paymentMethod = DEFAULT_PAYMENT_METHODS[0];

  const settings: SimulationSettings = {
    riskTolerance: 'high',
    approvalThreshold: 0.85, // Lower threshold = more approvals
    fraudStrictness: 0.7, // Higher strictness
    timeHorizon: 30,
  };

  // Proposed scenario has slightly higher price
  const pricingScenario = {
    ...DEFAULT_PRICING_SCENARIO,
    tiers: [
      {
        ...DEFAULT_PRICING_SCENARIO.tiers[0],
        price: DEFAULT_PRICING_SCENARIO.tiers[0].price * 1.1, // 10% higher
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
}

/**
 * ABTestDesigner Component
 */
export function ABTestDesigner() {
  const [form, setForm] = useState<ExperimentDraftForm>({
    name: '',
    owner: '',
    hypothesis: '',
    primaryMetric: 'revenue',
    secondaryMetrics: [],
    guardrails: {},
    status: 'draft',
  });

  const [expectedOutcomes, setExpectedOutcomes] = useState<{
    baseline: SimulationResult;
    proposed: SimulationResult;
    comparison: ComparisonResult;
  } | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);

  // Check if approval is allowed
  const canApprove = useMemo(() => {
    // Hypothesis must be filled
    if (!form.hypothesis.trim()) return false;

    // At least 2 guardrails must be defined
    const guardrailCount = Object.values(form.guardrails).filter(
      (value) => value !== undefined && value !== null
    ).length;
    if (guardrailCount < 2) return false;

    // Risk metrics must be visible (expected outcomes must exist)
    if (!expectedOutcomes) return false;

    return true;
  }, [form, expectedOutcomes]);

  // Handle form field changes
  const updateForm = (field: keyof ExperimentDraftForm, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateGuardrail = (field: keyof ExtendedGuardrails, value: number | undefined) => {
    setForm((prev) => ({
      ...prev,
      guardrails: { ...prev.guardrails, [field]: value },
    }));
  };

  const toggleSecondaryMetric = (metric: string) => {
    setForm((prev) => {
      const index = prev.secondaryMetrics.indexOf(metric);
      if (index > -1) {
        return {
          ...prev,
          secondaryMetrics: prev.secondaryMetrics.filter((m) => m !== metric),
        };
      } else {
        return {
          ...prev,
          secondaryMetrics: [...prev.secondaryMetrics, metric],
        };
      }
    });
  };

  // Simulate expected outcome
  const handleSimulate = () => {
    setIsSimulating(true);
    
    const baselineInputs = createBaselineInputs();
    const proposedInputs = createProposedInputs();
    
    const baselineResult = runSimulation(baselineInputs);
    const proposedResult = runSimulation(proposedInputs);
    const comparison = compareSimulations(baselineInputs, proposedInputs);
    
    setExpectedOutcomes({
      baseline: baselineResult,
      proposed: proposedResult,
      comparison,
    });
    
    setIsSimulating(false);
  };

  // Mark as approved
  const handleApprove = () => {
    if (!canApprove) return;
    setForm((prev) => ({ ...prev, status: 'running' }));
    alert('Experiment approved and marked as running!');
  };

  // Export config
  const handleExport = () => {
    const exportData = {
      experiment: {
        name: form.name || 'Untitled Experiment',
        owner: form.owner || 'Unknown',
        hypothesis: form.hypothesis,
        status: form.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      metrics: {
        primary: form.primaryMetric,
        secondary: form.secondaryMetrics,
      },
      guardrails: form.guardrails,
      expectedOutcomes: expectedOutcomes
        ? {
            baseline: {
              conversionRate: expectedOutcomes.baseline.conversionRate,
              revenue: expectedOutcomes.baseline.revenue,
              approvalRate: expectedOutcomes.baseline.approvalRate,
              fraudLoss: expectedOutcomes.baseline.fraudLoss,
              fpRate: expectedOutcomes.baseline.fpRate,
              fnRate: expectedOutcomes.baseline.fnRate,
              frictionScore: expectedOutcomes.baseline.frictionScore,
            },
            proposed: {
              conversionRate: expectedOutcomes.proposed.conversionRate,
              revenue: expectedOutcomes.proposed.revenue,
              approvalRate: expectedOutcomes.proposed.approvalRate,
              fraudLoss: expectedOutcomes.proposed.fraudLoss,
              fpRate: expectedOutcomes.proposed.fpRate,
              fnRate: expectedOutcomes.proposed.fnRate,
              frictionScore: expectedOutcomes.proposed.frictionScore,
            },
            differences: {
              revenue: expectedOutcomes.comparison.differences.revenue,
              fraudLoss: expectedOutcomes.comparison.differences.fraudLoss,
              approvalRate: expectedOutcomes.comparison.differences.approvalRate,
              fpRate: expectedOutcomes.comparison.differences.fpRate,
              fnRate: expectedOutcomes.comparison.differences.fnRate,
              frictionScore: expectedOutcomes.comparison.differences.frictionScore,
            },
          }
        : null,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-${form.name || 'untitled'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedMarket = DEFAULT_MARKETS[0];
  const currency = selectedMarket.currency;

  return (
    <div className="space-y-6">
      {/* Experiment Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiment Details</h3>
        
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Experiment Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Q1 2024 Pricing Test"
            />
          </div>

          {/* Owner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner
            </label>
            <input
              type="text"
              value={form.owner}
              onChange={(e) => updateForm('owner', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name or team"
            />
          </div>

          {/* Hypothesis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hypothesis <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.hypothesis}
              onChange={(e) => updateForm('hypothesis', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What are you testing? e.g., Increasing price by 10% will increase revenue by 15% without significantly impacting conversion rate."
            />
          </div>

          {/* Primary Metric */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Metric
            </label>
            <select
              value={form.primaryMetric}
              onChange={(e) => updateForm('primaryMetric', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {AVAILABLE_METRICS.map((metric) => (
                <option key={metric} value={metric}>
                  {metric}
                </option>
              ))}
            </select>
          </div>

          {/* Secondary Metrics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Metrics
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AVAILABLE_METRICS.filter((m) => m !== form.primaryMetric).map((metric) => (
                <label key={metric} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.secondaryMetrics.includes(metric)}
                    onChange={() => toggleSecondaryMetric(metric)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{metric}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Guardrails */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guardrails</h3>
        <p className="text-sm text-gray-600 mb-4">
          Define safety limits for your experiment. At least 2 guardrails must be set to approve.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Max Fraud Lift */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Fraud Lift (percentage increase)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.guardrails.maxFraudLift ? form.guardrails.maxFraudLift * 100 : ''}
              onChange={(e) => updateGuardrail('maxFraudLift', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 5 for 5%"
            />
          </div>

          {/* Min Approval Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Approval Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={form.guardrails.minApprovalRate ? form.guardrails.minApprovalRate * 100 : ''}
              onChange={(e) => updateGuardrail('minApprovalRate', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 85 for 85%"
            />
          </div>

          {/* Max FP Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max False Positive Rate (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={form.guardrails.maxFpRate ? form.guardrails.maxFpRate * 100 : ''}
              onChange={(e) => updateGuardrail('maxFpRate', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 10 for 10%"
            />
          </div>

          {/* Max Friction Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Friction Score (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={form.guardrails.maxFrictionScore ? form.guardrails.maxFrictionScore * 100 : ''}
              onChange={(e) => updateGuardrail('maxFrictionScore', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 15 for 15%"
            />
          </div>
        </div>

        {/* Guardrail count indicator */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Guardrails defined: {Object.values(form.guardrails).filter((v) => v !== undefined && v !== null).length} / 4
            {Object.values(form.guardrails).filter((v) => v !== undefined && v !== null).length < 2 && (
              <span className="text-red-600 ml-2">(At least 2 required for approval)</span>
            )}
          </div>
        </div>
      </div>

      {/* Simulate Expected Outcome */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Expected Outcomes</h3>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? 'Simulating...' : 'Simulate Expected Outcome'}
          </button>
        </div>

        {expectedOutcomes && (
          <div className="space-y-4">
            {/* Key Metrics Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Revenue</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(expectedOutcomes.proposed.revenue, currency)}
                </div>
                <div className={`text-sm ${
                  expectedOutcomes.comparison.differences.revenue > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {expectedOutcomes.comparison.differences.revenue > 0 ? '↑' : '↓'} 
                  {formatCurrency(Math.abs(expectedOutcomes.comparison.differences.revenue), currency)} vs baseline
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Fraud Loss</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(expectedOutcomes.proposed.fraudLoss, currency)}
                </div>
                <div className={`text-sm ${
                  expectedOutcomes.comparison.differences.fraudLoss < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {expectedOutcomes.comparison.differences.fraudLoss < 0 ? '↓' : '↑'} 
                  {formatCurrency(Math.abs(expectedOutcomes.comparison.differences.fraudLoss), currency)} vs baseline
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Approval Rate</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatPercentage(expectedOutcomes.proposed.approvalRate)}
                </div>
                <div className={`text-sm ${
                  expectedOutcomes.comparison.differences.approvalRate > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {expectedOutcomes.comparison.differences.approvalRate > 0 ? '↑' : '↓'} 
                  {formatPercentage(Math.abs(expectedOutcomes.comparison.differences.approvalRate))} vs baseline
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">False Positive Rate</div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {formatPercentage(expectedOutcomes.proposed.fpRate)}
                </div>
                <div className={`text-sm ${
                  expectedOutcomes.comparison.differences.fpRate < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {expectedOutcomes.comparison.differences.fpRate < 0 ? '↓' : '↑'} 
                  {formatPercentage(Math.abs(expectedOutcomes.comparison.differences.fpRate))} vs baseline
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">False Negative Rate</div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {formatPercentage(expectedOutcomes.proposed.fnRate)}
                </div>
                <div className={`text-sm ${
                  expectedOutcomes.comparison.differences.fnRate < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {expectedOutcomes.comparison.differences.fnRate < 0 ? '↓' : '↑'} 
                  {formatPercentage(Math.abs(expectedOutcomes.comparison.differences.fnRate))} vs baseline
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Friction Score</div>
                <div className="text-xl font-bold text-gray-900 mb-1">
                  {formatPercentage(expectedOutcomes.proposed.frictionScore)}
                </div>
                <div className={`text-sm ${
                  expectedOutcomes.comparison.differences.frictionScore < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {expectedOutcomes.comparison.differences.frictionScore < 0 ? '↓' : '↑'} 
                  {formatPercentage(Math.abs(expectedOutcomes.comparison.differences.frictionScore))} vs baseline
                </div>
              </div>
            </div>
          </div>
        )}

        {!expectedOutcomes && (
          <p className="text-sm text-gray-500 italic">
            Click &quot;Simulate Expected Outcome&quot; to see projected results.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions</h3>
            {!canApprove && (
              <div className="text-sm text-gray-600">
                <p>To approve this experiment, you need:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {!form.hypothesis.trim() && <li>Fill in the hypothesis</li>}
                  {Object.values(form.guardrails).filter((v) => v !== undefined && v !== null).length < 2 && (
                    <li>Define at least 2 guardrails</li>
                  )}
                  {!expectedOutcomes && <li>Run simulation to see risk metrics</li>}
                </ul>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Export Config
            </button>
            <button
              onClick={handleApprove}
              disabled={!canApprove}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Approved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
