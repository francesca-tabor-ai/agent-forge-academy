'use client';

import { useReducer, useState } from 'react';
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
  Channel,
  PaymentMethod,
  PricingScenario,
  SimulationSettings,
  SimulationResult,
  ComparisonResult,
} from '@/lib/tools/pricing-risk-lab/types';

/**
 * Scenario configuration for the form
 */
interface ScenarioConfig {
  basePrice: number;
  discountPercentage: number;
  marketOverride?: string; // Market code for override
  marketOverrideAdjustment?: number; // Percentage adjustment
  segment: string; // Segment name
  market: string; // Market code
  channel: string; // Channel name
  paymentMethod: string; // Payment method name
  riskTolerance: 'low' | 'medium' | 'high';
  approvalThreshold: number;
  fraudStrictness: number;
  timeHorizon: number;
}

/**
 * Simulator state
 */
interface SimulatorState {
  baselineConfig: ScenarioConfig | null;
  proposedConfig: ScenarioConfig | null;
  baselineResult: SimulationResult | null;
  proposedResult: SimulationResult | null;
  comparison: ComparisonResult | null;
  isRunning: boolean;
}

/**
 * Simulator actions
 */
type SimulatorAction =
  | { type: 'SET_BASELINE_CONFIG'; payload: ScenarioConfig }
  | { type: 'SET_PROPOSED_CONFIG'; payload: ScenarioConfig }
  | { type: 'SET_BASELINE_RESULT'; payload: SimulationResult }
  | { type: 'SET_PROPOSED_RESULT'; payload: SimulationResult }
  | { type: 'SET_COMPARISON'; payload: ComparisonResult }
  | { type: 'SET_RUNNING'; payload: boolean }
  | { type: 'RESET' };

/**
 * Reducer for simulator state
 */
function simulatorReducer(
  state: SimulatorState,
  action: SimulatorAction
): SimulatorState {
  switch (action.type) {
    case 'SET_BASELINE_CONFIG':
      return { ...state, baselineConfig: action.payload };
    case 'SET_PROPOSED_CONFIG':
      return { ...state, proposedConfig: action.payload };
    case 'SET_BASELINE_RESULT':
      return { ...state, baselineResult: action.payload };
    case 'SET_PROPOSED_RESULT':
      return { ...state, proposedResult: action.payload };
    case 'SET_COMPARISON':
      return { ...state, comparison: action.payload };
    case 'SET_RUNNING':
      return { ...state, isRunning: action.payload };
    case 'RESET':
      return {
        baselineConfig: null,
        proposedConfig: null,
        baselineResult: null,
        proposedResult: null,
        comparison: null,
        isRunning: false,
      };
    default:
      return state;
  }
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
 * Create pricing scenario from config
 */
function createPricingScenario(config: ScenarioConfig): PricingScenario {
  const discounts = config.discountPercentage > 0
    ? [{
        type: 'percentage' as const,
        value: config.discountPercentage,
        minPurchase: 0,
      }]
    : [];

  const regionalOverrides = config.marketOverride && config.marketOverrideAdjustment
    ? [{
        marketCode: config.marketOverride,
        priceAdjustment: config.marketOverrideAdjustment,
      }]
    : [];

  return {
    id: `scenario-${Date.now()}`,
    name: 'Custom Scenario',
    tiers: [{
      name: 'Custom',
      price: config.basePrice,
      minQuantity: 1,
    }],
    discounts,
    regionalOverrides,
  };
}

/**
 * Create simulation inputs from config
 */
function createSimulationInputs(
  config: ScenarioConfig,
  baselinePrice?: number
): SimulationInputs {
  const market = DEFAULT_MARKETS.find((m) => m.code === config.market) || DEFAULT_MARKETS[0];
  const segment = DEFAULT_SEGMENTS.find((s) => s.name === config.segment) || DEFAULT_SEGMENTS[0];
  const channel = DEFAULT_CHANNELS.find((c) => c.name === config.channel) || DEFAULT_CHANNELS[0];
  const paymentMethod = DEFAULT_PAYMENT_METHODS.find((p) => p.name === config.paymentMethod) || DEFAULT_PAYMENT_METHODS[0];
  
  const pricingScenario = createPricingScenario(config);
  
  const settings: SimulationSettings = {
    riskTolerance: config.riskTolerance,
    approvalThreshold: config.approvalThreshold,
    fraudStrictness: config.fraudStrictness,
    timeHorizon: config.timeHorizon,
  };

  return {
    market,
    segment,
    channel,
    paymentMethod,
    pricingScenario,
    settings,
    baselinePrice,
    quantity: 1,
  };
}

/**
 * Default scenario config
 */
const DEFAULT_CONFIG: ScenarioConfig = {
  basePrice: 79.00,
  discountPercentage: 0,
  segment: DEFAULT_SEGMENTS[0].name,
  market: DEFAULT_MARKETS[0].code,
  channel: DEFAULT_CHANNELS[0].name,
  paymentMethod: DEFAULT_PAYMENT_METHODS[0].name,
  riskTolerance: 'medium',
  approvalThreshold: 0.90,
  fraudStrictness: 0.5,
  timeHorizon: 30,
};

/**
 * Simulator Component
 */
export function Simulator() {
  const [state, dispatch] = useReducer(simulatorReducer, {
    baselineConfig: null,
    proposedConfig: null,
    baselineResult: null,
    proposedResult: null,
    comparison: null,
    isRunning: false,
  });

  const [baselineForm, setBaselineForm] = useState<ScenarioConfig>(DEFAULT_CONFIG);
  const [proposedForm, setProposedForm] = useState<ScenarioConfig>({
    ...DEFAULT_CONFIG,
    basePrice: 99.00, // Slightly different default for proposed
  });

  const handleRunSimulation = () => {
    dispatch({ type: 'SET_RUNNING', payload: true });

    // Run baseline simulation
    const baselineInputs = createSimulationInputs(baselineForm);
    const baselineResult = runSimulation(baselineInputs);
    
    // Run proposed simulation
    const proposedInputs = createSimulationInputs(
      proposedForm,
      baselineForm.basePrice // Use baseline price for comparison
    );
    const proposedResult = runSimulation(proposedInputs);

    // Compare results
    const comparison = compareSimulations(baselineInputs, proposedInputs);

    // Update state
    dispatch({ type: 'SET_BASELINE_CONFIG', payload: baselineForm });
    dispatch({ type: 'SET_PROPOSED_CONFIG', payload: proposedForm });
    dispatch({ type: 'SET_BASELINE_RESULT', payload: baselineResult });
    dispatch({ type: 'SET_PROPOSED_RESULT', payload: proposedResult });
    dispatch({ type: 'SET_COMPARISON', payload: comparison });
    dispatch({ type: 'SET_RUNNING', payload: false });
  };

  const updateBaselineForm = (field: keyof ScenarioConfig, value: unknown) => {
    setBaselineForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateProposedForm = (field: keyof ScenarioConfig, value: unknown) => {
    setProposedForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectedMarket = DEFAULT_MARKETS.find((m) => m.code === baselineForm.market) || DEFAULT_MARKETS[0];

  return (
    <div className="space-y-6">
      {/* Scenario Builder Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baseline Scenario Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Baseline Scenario</h3>
          <ScenarioForm
            config={baselineForm}
            onChange={updateBaselineForm}
            markets={DEFAULT_MARKETS}
            segments={DEFAULT_SEGMENTS}
            channels={DEFAULT_CHANNELS}
            paymentMethods={DEFAULT_PAYMENT_METHODS}
          />
        </div>

        {/* Proposed Scenario Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposed Scenario</h3>
          <ScenarioForm
            config={proposedForm}
            onChange={updateProposedForm}
            markets={DEFAULT_MARKETS}
            segments={DEFAULT_SEGMENTS}
            channels={DEFAULT_CHANNELS}
            paymentMethods={DEFAULT_PAYMENT_METHODS}
          />
        </div>
      </div>

      {/* Run Simulation Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRunSimulation}
          disabled={state.isRunning}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state.isRunning ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </div>

      {/* Side-by-Side Comparison */}
      {state.comparison && state.baselineResult && state.proposedResult && (
        <ComparisonView
          comparison={state.comparison}
          baselineResult={state.baselineResult}
          proposedResult={state.proposedResult}
          currency={selectedMarket.currency}
        />
      )}
    </div>
  );
}

/**
 * Scenario Form Component
 */
interface ScenarioFormProps {
  config: ScenarioConfig;
  onChange: (field: keyof ScenarioConfig, value: unknown) => void;
  markets: Market[];
  segments: Segment[];
  channels: Channel[];
  paymentMethods: PaymentMethod[];
}

function ScenarioForm({
  config,
  onChange,
  markets,
  segments,
  channels,
  paymentMethods,
}: ScenarioFormProps) {
  return (
    <div className="space-y-4">
      {/* Base Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Base Subscription Tier Price
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={config.basePrice}
          onChange={(e) => onChange('basePrice', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Discount Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Promotion/Discount (%)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={config.discountPercentage}
          onChange={(e) => onChange('discountPercentage', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Market Override */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Market Override (Optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={config.marketOverride || ''}
            onChange={(e) => onChange('marketOverride', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            {markets.map((market) => (
              <option key={market.code} value={market.code}>
                {market.code}
              </option>
            ))}
          </select>
          {config.marketOverride && (
            <input
              type="number"
              step="0.1"
              value={config.marketOverrideAdjustment || 0}
              onChange={(e) => onChange('marketOverrideAdjustment', parseFloat(e.target.value) || 0)}
              placeholder="% adjustment"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
      </div>

      {/* Segment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Segment
        </label>
        <select
          value={config.segment}
          onChange={(e) => onChange('segment', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {segments.map((segment) => (
            <option key={segment.name} value={segment.name}>
              {segment.name}
            </option>
          ))}
        </select>
      </div>

      {/* Market */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Market
        </label>
        <select
          value={config.market}
          onChange={(e) => onChange('market', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {markets.map((market) => (
            <option key={market.code} value={market.code}>
              {market.code} ({market.currency})
            </option>
          ))}
        </select>
      </div>

      {/* Channel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Channel
        </label>
        <select
          value={config.channel}
          onChange={(e) => onChange('channel', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {channels.map((channel) => (
            <option key={channel.name} value={channel.name}>
              {channel.name}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Method
        </label>
        <select
          value={config.paymentMethod}
          onChange={(e) => onChange('paymentMethod', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {paymentMethods.map((method) => (
            <option key={method.name} value={method.name}>
              {method.name}
            </option>
          ))}
        </select>
      </div>

      {/* Simulation Settings */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Simulation Settings</h4>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Tolerance
            </label>
            <select
              value={config.riskTolerance}
              onChange={(e) => onChange('riskTolerance', e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Threshold ({formatPercentage(config.approvalThreshold)})
            </label>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={config.approvalThreshold}
              onChange={(e) => onChange('approvalThreshold', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fraud Strictness ({formatPercentage(config.fraudStrictness)})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.fraudStrictness}
              onChange={(e) => onChange('fraudStrictness', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Comparison View Component
 */
interface ComparisonViewProps {
  comparison: ComparisonResult;
  baselineResult: SimulationResult;
  proposedResult: SimulationResult;
  currency: string;
}

function ComparisonView({
  comparison,
  baselineResult,
  proposedResult,
  currency,
}: ComparisonViewProps) {
  const metrics = [
    {
      label: 'Conversion Rate',
      baseline: baselineResult.conversionRate,
      proposed: proposedResult.conversionRate,
      difference: comparison.differences.conversionRate,
      format: formatPercentage,
    },
    {
      label: 'Revenue per User',
      baseline: baselineResult.rpu,
      proposed: proposedResult.rpu,
      difference: comparison.differences.rpu,
      format: (v: number) => formatCurrency(v, currency),
    },
    {
      label: 'Total Revenue',
      baseline: baselineResult.revenue,
      proposed: proposedResult.revenue,
      difference: comparison.differences.revenue,
      format: (v: number) => formatCurrency(v, currency),
    },
    {
      label: 'Approval Rate',
      baseline: baselineResult.approvalRate,
      proposed: proposedResult.approvalRate,
      difference: comparison.differences.approvalRate,
      format: formatPercentage,
    },
    {
      label: 'Fraud Loss',
      baseline: baselineResult.fraudLoss,
      proposed: proposedResult.fraudLoss,
      difference: comparison.differences.fraudLoss,
      format: (v: number) => formatCurrency(v, currency),
    },
    {
      label: 'Friction Score',
      baseline: baselineResult.frictionScore,
      proposed: proposedResult.frictionScore,
      difference: comparison.differences.frictionScore,
      format: formatPercentage,
    },
    {
      label: 'False Positive Rate',
      baseline: baselineResult.fpRate,
      proposed: proposedResult.fpRate,
      difference: comparison.differences.fpRate,
      format: formatPercentage,
    },
    {
      label: 'False Negative Rate',
      baseline: baselineResult.fnRate,
      proposed: proposedResult.fnRate,
      difference: comparison.differences.fnRate,
      format: formatPercentage,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Side-by-Side Comparison</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Metric</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">Baseline</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">Proposed</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">Difference</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => {
              const isPositive = metric.difference > 0;
              const isNegative = metric.difference < 0;
              
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{metric.label}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{metric.format(metric.baseline)}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{metric.format(metric.proposed)}</td>
                  <td className={`py-3 px-4 text-right font-medium ${
                    isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {isPositive ? '+' : ''}{metric.format(metric.difference)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
