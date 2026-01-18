'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { runSimulation, type SimulationInputs } from '@/lib/tools/pricing-risk-lab/simEngine';
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
} from '@/lib/tools/pricing-risk-lab/types';

/**
 * Snapshot of trade-off settings and results
 */
interface TradeoffSnapshot {
  id: string;
  timestamp: Date;
  riskTolerance: 'low' | 'medium' | 'high';
  approvalThreshold: number;
  fraudStrictness: number;
  result: SimulationResult;
}

/**
 * Trade-off settings state
 */
interface TradeoffSettings {
  riskTolerance: 'low' | 'medium' | 'high';
  approvalThreshold: number; // 0-1, displayed as 0-100
  fraudStrictness: number; // 0-1, displayed as low-high
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
 * Convert risk tolerance to numeric value for slider
 */
function riskToleranceToNumber(tolerance: 'low' | 'medium' | 'high'): number {
  return tolerance === 'low' ? 0 : tolerance === 'medium' ? 0.5 : 1;
}

/**
 * Convert numeric value to risk tolerance
 */
function numberToRiskTolerance(value: number): 'low' | 'medium' | 'high' {
  if (value < 0.33) return 'low';
  if (value < 0.67) return 'medium';
  return 'high';
}

/**
 * Convert fraud strictness to slider value (0-100)
 */
function fraudStrictnessToSlider(value: number): number {
  return value * 100;
}

/**
 * Convert slider value to fraud strictness (0-1)
 */
function sliderToFraudStrictness(value: number): number {
  return value / 100;
}

/**
 * Debounce hook
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * TradeoffVisualiser Component
 */
export function TradeoffVisualiser() {
  // Default settings
  const [settings, setSettings] = useState<TradeoffSettings>({
    riskTolerance: 'medium',
    approvalThreshold: 0.90,
    fraudStrictness: 0.5,
  });

  // Baseline settings (initial values)
  const baselineSettings = useMemo<TradeoffSettings>(() => ({
    riskTolerance: 'medium',
    approvalThreshold: 0.90,
    fraudStrictness: 0.5,
  }), []);

  // Current simulation result
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<SimulationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Snapshots
  const [snapshots, setSnapshots] = useState<TradeoffSnapshot[]>([]);

  // Debounce settings for simulation
  const debouncedSettings = useDebounce(settings, 300);

  // Create simulation inputs
  const createSimulationInputs = useCallback((settings: TradeoffSettings): SimulationInputs => {
    const market = DEFAULT_MARKETS[0]; // US
    const segment = DEFAULT_SEGMENTS[0]; // Enterprise
    const channel = DEFAULT_CHANNELS[0]; // Organic Search
    const paymentMethod = DEFAULT_PAYMENT_METHODS[0]; // Credit Card

    const simulationSettings: SimulationSettings = {
      riskTolerance: settings.riskTolerance,
      approvalThreshold: settings.approvalThreshold,
      fraudStrictness: settings.fraudStrictness,
      timeHorizon: 30,
    };

    return {
      market,
      segment,
      channel,
      paymentMethod,
      pricingScenario: DEFAULT_PRICING_SCENARIO,
      settings: simulationSettings,
      quantity: 1,
    };
  }, []);

  // Run simulation
  const runSimulationForSettings = useCallback((settings: TradeoffSettings): SimulationResult => {
    const inputs = createSimulationInputs(settings);
    return runSimulation(inputs);
  }, [createSimulationInputs]);

  // Calculate baseline result on mount
  useEffect(() => {
    const result = runSimulationForSettings(baselineSettings);
    setBaselineResult(result);
    setCurrentResult(result);
  }, [runSimulationForSettings, baselineSettings]);

  // Update current result when debounced settings change
  useEffect(() => {
    setIsCalculating(true);
    const result = runSimulationForSettings(debouncedSettings);
    setCurrentResult(result);
    setIsCalculating(false);
  }, [debouncedSettings, runSimulationForSettings]);

  // Handle slider changes
  const handleRiskToleranceChange = (value: number) => {
    setSettings((prev) => ({
      ...prev,
      riskTolerance: numberToRiskTolerance(value),
    }));
  };

  const handleApprovalThresholdChange = (value: number) => {
    setSettings((prev) => ({
      ...prev,
      approvalThreshold: value / 100, // Convert 0-100 to 0-1
    }));
  };

  const handleFraudStrictnessChange = (value: number) => {
    setSettings((prev) => ({
      ...prev,
      fraudStrictness: sliderToFraudStrictness(value), // Convert 0-100 to 0-1
    }));
  };

  // Save snapshot
  const handleSaveSnapshot = () => {
    if (!currentResult) return;

    const snapshot: TradeoffSnapshot = {
      id: `snapshot-${Date.now()}`,
      timestamp: new Date(),
      riskTolerance: settings.riskTolerance,
      approvalThreshold: settings.approvalThreshold,
      fraudStrictness: settings.fraudStrictness,
      result: currentResult,
    };

    setSnapshots((prev) => [snapshot, ...prev]);
  };

  // Delete snapshot
  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const selectedMarket = DEFAULT_MARKETS[0];
  const currency = selectedMarket.currency;

  return (
    <div className="space-y-6">
      {/* Sliders */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Trade-off Controls</h3>
        
        <div className="space-y-6">
          {/* Risk Tolerance Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Risk Tolerance
              </label>
              <span className="text-sm text-gray-600 capitalize">
                {settings.riskTolerance}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={riskToleranceToNumber(settings.riskTolerance)}
              onChange={(e) => handleRiskToleranceChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Approval Threshold Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Approval Threshold
              </label>
              <span className="text-sm text-gray-600">
                {formatPercentage(settings.approvalThreshold)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={settings.approvalThreshold * 100}
              onChange={(e) => handleApprovalThresholdChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Fraud Strictness Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Fraud Strictness
              </label>
              <span className="text-sm text-gray-600">
                {formatPercentage(settings.fraudStrictness)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={fraudStrictnessToSlider(settings.fraudStrictness)}
              onChange={(e) => handleFraudStrictnessChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Save Snapshot Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleSaveSnapshot}
            disabled={!currentResult || isCalculating}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? 'Calculating...' : 'Save Snapshot'}
          </button>
        </div>
      </div>

      {/* Triangle of Outcomes */}
      {currentResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversion Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Conversion</h4>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatPercentage(currentResult.conversionRate)}
            </div>
            {baselineResult && (
              <div className={`text-sm ${
                currentResult.conversionRate > baselineResult.conversionRate
                  ? 'text-green-600'
                  : currentResult.conversionRate < baselineResult.conversionRate
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {currentResult.conversionRate > baselineResult.conversionRate ? '↑' : currentResult.conversionRate < baselineResult.conversionRate ? '↓' : '→'} 
                {formatPercentage(Math.abs(currentResult.conversionRate - baselineResult.conversionRate))} vs baseline
              </div>
            )}
          </div>

          {/* Fraud Loss Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Fraud Loss</h4>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(currentResult.fraudLoss, currency)}
            </div>
            {baselineResult && (
              <div className={`text-sm ${
                currentResult.fraudLoss < baselineResult.fraudLoss
                  ? 'text-green-600'
                  : currentResult.fraudLoss > baselineResult.fraudLoss
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {currentResult.fraudLoss < baselineResult.fraudLoss ? '↓' : currentResult.fraudLoss > baselineResult.fraudLoss ? '↑' : '→'} 
                {formatCurrency(Math.abs(currentResult.fraudLoss - baselineResult.fraudLoss), currency)} vs baseline
              </div>
            )}
          </div>

          {/* Friction Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Friction</h4>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatPercentage(currentResult.frictionScore)}
            </div>
            {baselineResult && (
              <div className={`text-sm ${
                currentResult.frictionScore < baselineResult.frictionScore
                  ? 'text-green-600'
                  : currentResult.frictionScore > baselineResult.frictionScore
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {currentResult.frictionScore < baselineResult.frictionScore ? '↓' : currentResult.frictionScore > baselineResult.frictionScore ? '↑' : '→'} 
                {formatPercentage(Math.abs(currentResult.frictionScore - baselineResult.frictionScore))} vs baseline
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Metrics - Baseline vs Current */}
      {currentResult && baselineResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Baseline vs Current</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Revenue per User</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-lg text-gray-600">Baseline:</span>
                <span className="text-xl font-semibold text-gray-900">
                  {formatCurrency(baselineResult.rpu, currency)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg text-gray-600">Current:</span>
                <span className={`text-xl font-semibold ${
                  currentResult.rpu > baselineResult.rpu ? 'text-green-600' : 
                  currentResult.rpu < baselineResult.rpu ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatCurrency(currentResult.rpu, currency)}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Total Revenue</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-lg text-gray-600">Baseline:</span>
                <span className="text-xl font-semibold text-gray-900">
                  {formatCurrency(baselineResult.revenue, currency)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg text-gray-600">Current:</span>
                <span className={`text-xl font-semibold ${
                  currentResult.revenue > baselineResult.revenue ? 'text-green-600' : 
                  currentResult.revenue < baselineResult.revenue ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatCurrency(currentResult.revenue, currency)}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Approval Rate</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-lg text-gray-600">Baseline:</span>
                <span className="text-xl font-semibold text-gray-900">
                  {formatPercentage(baselineResult.approvalRate)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg text-gray-600">Current:</span>
                <span className={`text-xl font-semibold ${
                  currentResult.approvalRate > baselineResult.approvalRate ? 'text-green-600' : 
                  currentResult.approvalRate < baselineResult.approvalRate ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatPercentage(currentResult.approvalRate)}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">False Positive Rate</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-lg text-gray-600">Baseline:</span>
                <span className="text-xl font-semibold text-gray-900">
                  {formatPercentage(baselineResult.fpRate)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg text-gray-600">Current:</span>
                <span className={`text-xl font-semibold ${
                  currentResult.fpRate < baselineResult.fpRate ? 'text-green-600' : 
                  currentResult.fpRate > baselineResult.fpRate ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatPercentage(currentResult.fpRate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snapshots List */}
      {snapshots.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Snapshots</h3>
          <div className="space-y-4">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {snapshot.timestamp.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Risk: {snapshot.riskTolerance} | 
                      Approval: {formatPercentage(snapshot.approvalThreshold)} | 
                      Fraud: {formatPercentage(snapshot.fraudStrictness)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSnapshot(snapshot.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Conversion</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPercentage(snapshot.result.conversionRate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Fraud Loss</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(snapshot.result.fraudLoss, currency)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Friction</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPercentage(snapshot.result.frictionScore)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
