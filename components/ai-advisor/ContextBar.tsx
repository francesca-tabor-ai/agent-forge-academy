'use client';

import { ActiveContext } from './AIAdvisor';

interface ContextBarProps {
  activeContext: ActiveContext;
  onChangeContext: () => void;
}

export function ContextBar({ activeContext, onChangeContext }: ContextBarProps) {
  const contextItems = [
    {
      label: 'Active Course',
      value: activeContext.course?.title || 'None',
      icon: '📚',
    },
    {
      label: 'Active Project',
      value: activeContext.project?.title || 'None',
      icon: '💼',
    },
    {
      label: 'Active Job / Application',
      value: activeContext.job ? `${activeContext.job.title} at ${activeContext.job.company}` : 'None',
      icon: '🎯',
    },
    {
      label: 'Active Startup',
      value: activeContext.startup?.name || 'None',
      icon: '🚀',
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4" data-testid="context-bar">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Current Context</h3>
        <button
          data-testid="change-context-button"
          onClick={onChangeContext}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Change context
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {contextItems.map((item, index) => (
          <div key={index} className="flex items-start gap-2" data-testid={`context-item-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <span className="text-lg">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
              <p className="text-sm font-medium text-gray-900 truncate" data-testid={`context-value-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
