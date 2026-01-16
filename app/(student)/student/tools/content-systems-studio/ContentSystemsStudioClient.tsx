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
  const studio = useContentSystemsStudio();

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const activeRole = demoRole;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Systems Studio</h1>
        <p className="mt-2 text-gray-600">
          Template-driven content engine: schema + rules + workflow
        </p>
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
          showRoleSelector={true}
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
