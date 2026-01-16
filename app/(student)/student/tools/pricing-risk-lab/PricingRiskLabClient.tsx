'use client';

import { useState } from 'react';
import { Simulator } from '@/components/tools/pricing-risk-lab/Simulator';
import { TradeoffVisualiser } from '@/components/tools/pricing-risk-lab/TradeoffVisualiser';
import { FraudDashboard } from '@/components/tools/pricing-risk-lab/FraudDashboard';
import { ABTestDesigner } from '@/components/tools/pricing-risk-lab/ABTestDesigner';

type TabId = 'simulator' | 'ab-test-designer' | 'fraud-dashboard' | 'trade-offs' | 'alerts';

interface Tab {
  id: TabId;
  label: string;
  title: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: 'simulator',
    label: 'Simulator',
    title: 'Pricing Simulator',
    description: 'Run pricing experiments and simulate different pricing strategies under various fraud and trust constraints. Test how pricing changes affect revenue, conversion rates, and risk metrics.',
  },
  {
    id: 'ab-test-designer',
    label: 'A/B Test Designer',
    title: 'A/B Test Designer',
    description: 'Design and configure A/B tests for pricing experiments. Set up test variants, define success metrics, and monitor experiment performance in real-time.',
  },
  {
    id: 'fraud-dashboard',
    label: 'Fraud Dashboard',
    title: 'Fraud Dashboard',
    description: 'Monitor fraud indicators and risk metrics across pricing experiments. Track suspicious patterns, fraud rates, and trust scores to ensure pricing strategies maintain security.',
  },
  {
    id: 'trade-offs',
    label: 'Trade-offs',
    title: 'Trade-offs Analysis',
    description: 'Analyze the trade-offs between pricing strategies, fraud risk, and trust metrics. Visualize how different pricing decisions impact revenue, security, and customer trust.',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    title: 'Alerts & Notifications',
    description: 'Configure alerts for critical pricing and fraud events. Get notified when experiments show anomalies, fraud thresholds are exceeded, or trust metrics drop below acceptable levels.',
  },
];

export function PricingRiskLabClient() {
  const [activeTab, setActiveTab] = useState<TabId>('simulator');

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  return (
    <div className="space-y-6">
      {/* Persistent Assumptions & Limitations Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">Assumptions & Limitations</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This is a simulation tool only. Results are for educational and planning purposes and should not be used for production pricing decisions. Real-world pricing strategies should be validated through proper testing and analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content Panel */}
      {activeTab === 'simulator' ? (
        <Simulator />
      ) : activeTab === 'trade-offs' ? (
        <TradeoffVisualiser />
      ) : activeTab === 'fraud-dashboard' ? (
        <FraudDashboard />
      ) : activeTab === 'ab-test-designer' ? (
        <ABTestDesigner />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentTab.title}
          </h2>
          <p className="text-gray-600">
            {currentTab.description}
          </p>
        </div>
      )}
    </div>
  );
}
