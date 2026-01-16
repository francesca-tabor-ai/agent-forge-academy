'use client';

import { useState } from 'react';

/**
 * Trade-off settings
 */
export interface TradeoffSettings {
  speedVsAccuracy: number; // 0-100, 0 = accuracy, 100 = speed
  costVsCoverage: number; // 0-100, 0 = coverage, 100 = cost savings
  centralizedVsLocal: number; // 0-100, 0 = local, 100 = centralized
}

interface TradeoffTogglesProps {
  settings: TradeoffSettings;
  onChange: (settings: TradeoffSettings) => void;
}

/**
 * Slider component with tooltip
 */
interface SliderProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
}

function Slider({ label, leftLabel, rightLabel, value, onChange, tooltip }: SliderProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Info"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          {showTooltip && (
            <div className="absolute right-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
              {tooltip}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-600 w-20">{leftLabel}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <span className="text-xs text-gray-600 w-20 text-right">{rightLabel}</span>
      </div>
      <div className="flex justify-center">
        <span className="text-xs text-gray-500">{value}%</span>
      </div>
    </div>
  );
}

/**
 * Trade-off Toggles Component
 * Allows users to adjust simulation parameters via sliders
 */
export function TradeoffToggles({ settings, onChange }: TradeoffTogglesProps) {
  const handleSpeedChange = (value: number) => {
    onChange({
      ...settings,
      speedVsAccuracy: value,
    });
  };

  const handleCostChange = (value: number) => {
    onChange({
      ...settings,
      costVsCoverage: value,
    });
  };

  const handleCentralizedChange = (value: number) => {
    onChange({
      ...settings,
      centralizedVsLocal: value,
    });
  };

  return (
    <div className="space-y-6">
      <Slider
        label="Speed vs Accuracy"
        leftLabel="Accuracy"
        rightLabel="Speed"
        value={settings.speedVsAccuracy}
        onChange={handleSpeedChange}
        tooltip="Prioritizing speed reduces latency but increases error probability. Prioritizing accuracy increases latency but reduces errors."
      />

      <Slider
        label="Cost vs Coverage"
        leftLabel="Coverage"
        rightLabel="Cost Savings"
        value={settings.costVsCoverage}
        onChange={handleCostChange}
        tooltip="Reducing cost limits data enrichment coverage, leading to more missing fields. Higher coverage improves data quality but increases costs."
      />

      <Slider
        label="Centralized vs Local Logic"
        leftLabel="Local"
        rightLabel="Centralized"
        value={settings.centralizedVsLocal}
        onChange={handleCentralizedChange}
        tooltip="Centralized logic simplifies routing but may reduce flexibility. Local logic provides more control but increases complexity."
      />
    </div>
  );
}
