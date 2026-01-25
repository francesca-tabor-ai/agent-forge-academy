'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { runSimulation, getDefaultSettings } from '@/lib/tools/decision-tradeoff-simulator/simEngine';
import type { TradeoffSettings, SimulationResult, DecisionScenario, ScenarioSnapshot } from '@/lib/tools/decision-tradeoff-simulator/types';

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
 * Format currency for display
 */
function formatCurrency(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value * 1000); // Convert from thousands to actual dollars
}

/**
 * Format percentage for display
 */
function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value) || !isFinite(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
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
 * Slider component
 */
interface SliderProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
}

function Slider({ label, leftLabel, rightLabel, value, onChange, tooltip, min = 0, max = 100, step = 1 }: SliderProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {tooltip && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Info"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-600 w-24">{leftLabel}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <span className="text-xs text-gray-600 w-24 text-right">{rightLabel}</span>
      </div>
      <div className="flex justify-center">
        <span className="text-xs text-gray-500">{value}</span>
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  format?: 'number' | 'currency' | 'percentage' | 'score';
  higherIsBetter?: boolean;
}

function MetricCard({ label, value, unit, change, format = 'number', higherIsBetter = true }: MetricCardProps) {
  let displayValue: string;
  
  switch (format) {
    case 'currency':
      displayValue = typeof value === 'number' ? formatCurrency(value) : value;
      break;
    case 'percentage':
      displayValue = typeof value === 'number' ? formatPercentage(value) : value;
      break;
    case 'score':
      displayValue = typeof value === 'number' ? `${Math.round(value)}/100` : value;
      break;
    default:
      displayValue = typeof value === 'number' ? formatNumber(value, 1) : value;
      if (unit) displayValue += ` ${unit}`;
  }

  const changeColor = change !== undefined
    ? (higherIsBetter ? (change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600') : (change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : 'text-gray-600'))
    : '';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{displayValue}</div>
      {change !== undefined && (
        <div className={`text-xs ${changeColor}`}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/**
 * Decision Trade-off Simulator Client Component
 */
export function DecisionTradeoffSimulatorClient() {
  const [scenario, setScenario] = useState<DecisionScenario>('custom');
  const [settings, setSettings] = useState<TradeoffSettings>(getDefaultSettings('custom'));
  const [baselineSettings, setBaselineSettings] = useState<TradeoffSettings>(getDefaultSettings('custom'));
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<SimulationResult | null>(null);
  const [snapshots, setSnapshots] = useState<ScenarioSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [snapshotName, setSnapshotName] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Debounce settings for simulation
  const debouncedSettings = useDebounce(settings, 300);

  // Calculate baseline result when baselineSettings or scenario changes
  useEffect(() => {
    const result = runSimulation(baselineSettings, scenario);
    setBaselineResult(result);
  }, [baselineSettings, scenario]);

  // Initialize current result on mount
  useEffect(() => {
    if (!currentResult) {
      const result = runSimulation(baselineSettings, scenario);
      setCurrentResult(result);
    }
  }, []); // Only run on mount

  // Update current result when debounced settings change
  useEffect(() => {
    setIsCalculating(true);
    const result = runSimulation(debouncedSettings, scenario);
    setCurrentResult(result);
    setIsCalculating(false);
  }, [debouncedSettings, scenario]);

  // Handle scenario change
  const handleScenarioChange = (newScenario: DecisionScenario) => {
    setScenario(newScenario);
    const defaultSettings = getDefaultSettings(newScenario);
    setSettings(defaultSettings);
    setBaselineSettings(defaultSettings);
    // Update current result immediately with new baseline
    const result = runSimulation(defaultSettings, newScenario);
    setCurrentResult(result);
  };

  // Handle setting changes
  const updateSetting = useCallback((key: keyof TradeoffSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Normalize performance-cost-latency weights
  const normalizeWeights = useCallback(() => {
    const total = settings.performanceWeight + settings.costWeight + settings.latencyWeight;
    if (total > 0) {
      const factor = 100 / total;
      setSettings((prev) => ({
        ...prev,
        performanceWeight: prev.performanceWeight * factor,
        costWeight: prev.costWeight * factor,
        latencyWeight: prev.latencyWeight * factor,
      }));
    }
  }, [settings.performanceWeight, settings.costWeight, settings.latencyWeight]);

  // Save snapshot
  const handleSaveSnapshot = () => {
    if (!currentResult || !snapshotName.trim()) return;

    const snapshot: ScenarioSnapshot = {
      id: `snapshot-${Date.now()}`,
      name: snapshotName.trim(),
      timestamp: new Date(),
      scenario,
      settings: { ...settings },
      result: { ...currentResult },
    };

    setSnapshots((prev) => [snapshot, ...prev]);
    setSnapshotName('');
  };

  // Delete snapshot
  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
    if (selectedSnapshot === id) {
      setSelectedSnapshot(null);
    }
  };

  // Compare with selected snapshot
  const comparisonSnapshot = useMemo(() => {
    if (!selectedSnapshot) return null;
    return snapshots.find((s) => s.id === selectedSnapshot) || null;
  }, [selectedSnapshot, snapshots]);

  // Calculate differences for comparison
  const differences = useMemo(() => {
    if (!currentResult || !comparisonSnapshot) return null;

    const diff: { metric: keyof SimulationResult; difference: number; percentageChange: number }[] = [];
    
    (Object.keys(currentResult) as Array<keyof SimulationResult>).forEach((key) => {
      const current = currentResult[key] as number;
      const comparison = comparisonSnapshot.result[key] as number;
      const difference = current - comparison;
      const percentageChange = comparison !== 0 ? (difference / comparison) * 100 : 0;
      
      diff.push({ metric: key, difference, percentageChange });
    });

    return diff;
  }, [currentResult, comparisonSnapshot]);

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Decision Scenario</h3>
        <select
          value={scenario}
          onChange={(e) => handleScenarioChange(e.target.value as DecisionScenario)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="custom">Custom Scenario</option>
          <option value="ai-model-selection">AI Model Selection</option>
          <option value="architecture-design">Architecture Design</option>
          <option value="personalization-strategy">Personalization Strategy</option>
          <option value="decisioning-approach">Decisioning Approach</option>
          <option value="scalability-planning">Scalability Planning</option>
          <option value="cost-optimization">Cost Optimization</option>
        </select>
        <p className="text-sm text-gray-500 mt-2">
          {scenario === 'ai-model-selection' && 'Choose between different AI models balancing performance, cost, and latency.'}
          {scenario === 'architecture-design' && 'Design system architecture balancing various trade-offs.'}
          {scenario === 'personalization-strategy' && 'Plan personalization approach balancing user experience and privacy.'}
          {scenario === 'decisioning-approach' && 'Select decision-making approach: rules-based vs ML-driven.'}
          {scenario === 'scalability-planning' && 'Plan for scale balancing performance, cost, and operational complexity.'}
          {scenario === 'cost-optimization' && 'Optimize costs while maintaining acceptable performance and quality.'}
          {scenario === 'custom' && 'Create a custom scenario by adjusting all trade-off parameters.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Trade-off Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance-Cost-Latency Triangle */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance-Cost-Latency Triangle</h3>
            <div className="space-y-4">
              <Slider
                label="Performance Weight"
                leftLabel="Low"
                rightLabel="High"
                value={settings.performanceWeight}
                onChange={(value) => updateSetting('performanceWeight', value)}
                tooltip="Weight given to performance optimization. Higher values prioritize performance over cost and latency."
              />
              <Slider
                label="Cost Weight"
                leftLabel="Low"
                rightLabel="High"
                value={settings.costWeight}
                onChange={(value) => updateSetting('costWeight', value)}
                tooltip="Weight given to cost optimization. Higher values prioritize cost savings over performance and latency."
              />
              <Slider
                label="Latency Weight"
                leftLabel="Low"
                rightLabel="High"
                value={settings.latencyWeight}
                onChange={(value) => updateSetting('latencyWeight', value)}
                tooltip="Weight given to latency optimization. Higher values prioritize low latency over performance and cost."
              />
              <button
                onClick={normalizeWeights}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Normalize Weights (Total = 100)
              </button>
            </div>
          </div>

          {/* Other Trade-offs */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Trade-offs</h3>
            <div className="space-y-6">
              <Slider
                label="Speed vs Accuracy"
                leftLabel="Accuracy"
                rightLabel="Speed"
                value={settings.speedVsAccuracy}
                onChange={(value) => updateSetting('speedVsAccuracy', value)}
                tooltip="Prioritizing speed reduces latency but may increase error probability. Prioritizing accuracy increases reliability but may add latency."
              />

              <Slider
                label="Cost vs Coverage"
                leftLabel="Coverage"
                rightLabel="Cost Savings"
                value={settings.costVsCoverage}
                onChange={(value) => updateSetting('costVsCoverage', value)}
                tooltip="Reducing cost limits coverage and data enrichment. Higher coverage improves quality but increases costs."
              />

              <Slider
                label="Centralized vs Local Logic"
                leftLabel="Local"
                rightLabel="Centralized"
                value={settings.centralizedVsLocal}
                onChange={(value) => updateSetting('centralizedVsLocal', value)}
                tooltip="Centralized logic simplifies routing but may reduce flexibility. Local logic provides more control but increases complexity."
              />

              <Slider
                label="Real-time vs Batch"
                leftLabel="Batch"
                rightLabel="Real-time"
                value={settings.realtimeVsBatch}
                onChange={(value) => updateSetting('realtimeVsBatch', value)}
                tooltip="Real-time processing provides immediate results but is more expensive. Batch processing is cost-effective but adds latency."
              />

              <Slider
                label="Personalization vs Privacy"
                leftLabel="Privacy"
                rightLabel="Personalization"
                value={settings.personalizationVsPrivacy}
                onChange={(value) => updateSetting('personalizationVsPrivacy', value)}
                tooltip="More personalization improves user experience but requires more data. More privacy protects users but limits personalization."
              />

              <Slider
                label="Accuracy vs Diversity"
                leftLabel="Diversity"
                rightLabel="Accuracy"
                value={settings.accuracyVsDiversity}
                onChange={(value) => updateSetting('accuracyVsDiversity', value)}
                tooltip="Prioritizing accuracy improves relevance but may create filter bubbles. Prioritizing diversity improves discovery but may reduce relevance."
              />

              <Slider
                label="Short-term vs Long-term"
                leftLabel="Long-term"
                rightLabel="Short-term"
                value={settings.shorttermVsLongterm}
                onChange={(value) => updateSetting('shorttermVsLongterm', value)}
                tooltip="Short-term focus enables quick wins but may create technical debt. Long-term focus builds sustainable systems but takes longer."
              />

              <Slider
                label="Rules vs ML"
                leftLabel="Rules"
                rightLabel="ML"
                value={settings.rulesVsMl}
                onChange={(value) => updateSetting('rulesVsMl', value)}
                tooltip="Rules-based systems are predictable and explainable but limited. ML systems are powerful and adaptive but complex and less explainable."
              />

              <Slider
                label="Flexibility vs Consistency"
                leftLabel="Consistency"
                rightLabel="Flexibility"
                value={settings.flexibilityVsConsistency}
                onChange={(value) => updateSetting('flexibilityVsConsistency', value)}
                tooltip="Consistency improves reliability and maintainability but reduces adaptability. Flexibility enables rapid changes but increases complexity."
              />
            </div>
          </div>

          {/* Save Snapshot */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Scenario Snapshot</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="Enter snapshot name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSaveSnapshot}
                disabled={!currentResult || !snapshotName.trim() || isCalculating}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {/* Key Metrics */}
          {currentResult && (
            <>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                <div className="space-y-3">
                  <MetricCard
                    label="Overall Score"
                    value={currentResult.overallScore}
                    format="score"
                    change={baselineResult ? currentResult.overallScore - baselineResult.overallScore : undefined}
                  />
                  <MetricCard
                    label="Total Cost (Monthly)"
                    value={currentResult.totalCost}
                    format="currency"
                    change={baselineResult ? ((currentResult.totalCost - baselineResult.totalCost) / baselineResult.totalCost) * 100 : undefined}
                    higherIsBetter={false}
                  />
                  <MetricCard
                    label="Average Latency"
                    value={currentResult.averageLatency}
                    unit="ms"
                    change={baselineResult ? ((currentResult.averageLatency - baselineResult.averageLatency) / baselineResult.averageLatency) * 100 : undefined}
                    higherIsBetter={false}
                  />
                  <MetricCard
                    label="Performance Score"
                    value={currentResult.performanceScore}
                    format="score"
                    change={baselineResult ? currentResult.performanceScore - baselineResult.performanceScore : undefined}
                  />
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard label="Accuracy" value={currentResult.accuracyScore} format="score" />
                  <MetricCard label="Reliability" value={currentResult.reliabilityScore} format="score" />
                  <MetricCard label="Scalability" value={currentResult.scalabilityScore} format="score" />
                  <MetricCard label="User Satisfaction" value={currentResult.userSatisfaction} format="score" />
                </div>
              </div>

              {/* Operational Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Metrics</h3>
                <div className="space-y-3">
                  <MetricCard
                    label="Time to Market"
                    value={currentResult.timeToMarket}
                    unit="days"
                    change={baselineResult ? ((currentResult.timeToMarket - baselineResult.timeToMarket) / baselineResult.timeToMarket) * 100 : undefined}
                    higherIsBetter={false}
                  />
                  <MetricCard
                    label="Maintenance Complexity"
                    value={currentResult.maintenanceComplexity}
                    format="score"
                    change={baselineResult ? currentResult.maintenanceComplexity - baselineResult.maintenanceComplexity : undefined}
                    higherIsBetter={false}
                  />
                  <MetricCard
                    label="Risk Score"
                    value={currentResult.riskScore}
                    format="score"
                    change={baselineResult ? currentResult.riskScore - baselineResult.riskScore : undefined}
                    higherIsBetter={false}
                  />
                  <MetricCard
                    label="Cost Efficiency"
                    value={currentResult.costEfficiencyScore}
                    format="score"
                    change={baselineResult ? currentResult.costEfficiencyScore - baselineResult.costEfficiencyScore : undefined}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Snapshots */}
      {snapshots.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Snapshots</h3>
          <div className="space-y-3">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedSnapshot === snapshot.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSnapshot(selectedSnapshot === snapshot.id ? null : snapshot.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{snapshot.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {snapshot.timestamp.toLocaleString()} • {snapshot.scenario}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Overall: {Math.round(snapshot.result.overallScore)}/100 • 
                      Cost: {formatCurrency(snapshot.result.totalCost)} • 
                      Latency: {Math.round(snapshot.result.averageLatency)}ms
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSnapshot(snapshot.id);
                    }}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison View */}
      {comparisonSnapshot && currentResult && differences && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comparison: Current vs {comparisonSnapshot.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {differences.map((diff) => {
              const currentValue = currentResult[diff.metric] as number;
              const comparisonValue = comparisonSnapshot.result[diff.metric] as number;
              const isBetter = diff.difference > 0 ? 
                (diff.metric.includes('Score') || diff.metric === 'userSatisfaction' || diff.metric === 'costEfficiencyScore') :
                (diff.metric === 'totalCost' || diff.metric === 'averageLatency' || diff.metric === 'timeToMarket' || diff.metric === 'maintenanceComplexity' || diff.metric === 'riskScore');
              
              return (
                <div key={diff.metric} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">
                    {diff.metric.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-600">Current:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {diff.metric === 'totalCost' ? formatCurrency(currentValue) :
                       diff.metric.includes('Score') || diff.metric === 'userSatisfaction' ? `${Math.round(currentValue)}/100` :
                       diff.metric === 'averageLatency' ? `${Math.round(currentValue)}ms` :
                       diff.metric === 'timeToMarket' ? `${Math.round(currentValue)}d` :
                       formatNumber(currentValue, 1)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-sm text-gray-600">Snapshot:</span>
                    <span className="text-lg font-semibold text-gray-600">
                      {diff.metric === 'totalCost' ? formatCurrency(comparisonValue) :
                       diff.metric.includes('Score') || diff.metric === 'userSatisfaction' ? `${Math.round(comparisonValue)}/100` :
                       diff.metric === 'averageLatency' ? `${Math.round(comparisonValue)}ms` :
                       diff.metric === 'timeToMarket' ? `${Math.round(comparisonValue)}d` :
                       formatNumber(comparisonValue, 1)}
                    </span>
                  </div>
                  <div className={`text-xs mt-2 ${isBetter ? 'text-green-600' : 'text-red-600'}`}>
                    {diff.difference > 0 ? '↑' : diff.difference < 0 ? '↓' : '→'} {Math.abs(diff.percentageChange).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
