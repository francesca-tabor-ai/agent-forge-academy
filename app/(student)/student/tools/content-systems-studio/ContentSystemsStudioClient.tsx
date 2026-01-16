'use client';

import { useState } from 'react';
import { useContentSystemsStudio } from '@/lib/tools/content-systems-studio/useContentSystemsStudio';
import { ContentEditor } from '@/components/tools/content-systems-studio/ContentEditor';
import { RulesPanel } from '@/components/tools/content-systems-studio/RulesPanel';
import { WorkflowPanel } from '@/components/tools/content-systems-studio/WorkflowPanel';
import { VariationsPanel } from '@/components/tools/content-systems-studio/VariationsPanel';
import { ThroughputDashboard } from '@/components/tools/content-systems-studio/ThroughputDashboard';
import type { Role } from '@/lib/tools/content-systems-studio/types';

type TabId = 'editor' | 'rules' | 'workflow' | 'variations' | 'dashboard';

interface Tab {
  id: TabId;
  label: string;
  title: string;
  description: string[];
}

const TABS: Tab[] = [
  {
    id: 'editor',
    label: 'Editor',
    title: 'Content Editor',
    description: [
      'Visual template editor with schema definition',
      'Real-time preview of content variations',
      'Field validation and type checking',
    ],
  },
  {
    id: 'rules',
    label: 'Rules',
    title: 'Content Rules',
    description: [
      'Define conditional logic for content generation',
      'Rule-based content transformation',
      'A/B testing and personalization rules',
    ],
  },
  {
    id: 'workflow',
    label: 'Workflow',
    title: 'Content Workflow',
    description: [
      'Multi-stage content approval process',
      'Automated content publishing pipeline',
      'Version control and rollback capabilities',
    ],
  },
  {
    id: 'variations',
    label: 'Variations',
    title: 'Content Variations',
    description: [
      'Generate multiple content variations from templates',
      'Dynamic content personalization',
      'Performance tracking per variation',
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    title: 'Content Dashboard',
    description: [
      'Overview of all content systems and their status',
      'Analytics and performance metrics',
      'System health monitoring',
    ],
  },
];

interface ContentSystemsStudioClientProps {
  currentRole?: Role;
}

export function ContentSystemsStudioClient({ currentRole = 'student' }: ContentSystemsStudioClientProps = { currentRole: 'student' }) {
  const [activeTab, setActiveTab] = useState<TabId>('editor');
  const [demoRole, setDemoRole] = useState<Role>(currentRole);
  const [demoMode, setDemoMode] = useState(false);
  const studio = useContentSystemsStudio();

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const activeRole = demoMode ? demoRole : currentRole;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Systems Studio</h1>
            <p className="mt-2 text-gray-600">
              Template-driven content engine: schema + rules + workflow
            </p>
          </div>
          {/* Demo Mode Toggle */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Demo Mode</span>
            </label>
          </div>
        </div>
      </div>

      {/* Why Structure Matters Callout */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-blue-900">Why Structure Matters</h3>
            <p className="text-sm text-blue-800 mt-1">
              Structured content with explicit schemas, deterministic rules, and transparent workflows enables reliable automation, 
              consistent quality, and full traceability. Every decision is inspectable—no black-box behavior.
            </p>
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
      {activeTab === 'editor' ? (
        <ContentEditor studio={studio} currentRole={activeRole} />
      ) : activeTab === 'rules' ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentTab.title}
          </h2>
          <RulesPanel
            studio={studio}
            ruleResults={studio.state.ruleResults}
            onAcknowledgeWarnings={(codes) => {
              if (studio.selectedItem) {
                studio.ackWarnings(studio.selectedItem.id, codes);
              }
            }}
            showAcknowledgeCheckbox={true}
          />
        </div>
      ) : activeTab === 'workflow' ? (
        <WorkflowPanel
          studio={studio}
          currentRole={activeRole}
          onRoleChange={setDemoRole}
          showRoleSelector={demoMode}
        />
      ) : activeTab === 'variations' ? (
        <VariationsPanel studio={studio} currentRole={activeRole} />
      ) : activeTab === 'dashboard' ? (
        <ThroughputDashboard studio={studio} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentTab.title}
          </h2>
          <ul className="space-y-2">
            {currentTab.description.map((item, index) => (
              <li key={index} className="text-gray-600 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
