'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PortfolioAdvisorSectionProps {
  suggestions?: Array<{
    text: string;
    action?: {
      type: 'edit_project' | 'add_project' | 'add_demo_url' | 'add_metrics';
      projectId?: string;
    };
  }>;
  latestProjectId?: string;
}

export function PortfolioAdvisorSection({ suggestions = [], latestProjectId }: PortfolioAdvisorSectionProps) {
  const router = useRouter();

  // Default actionable suggestions
  const defaultSuggestions = [
    {
      text: 'Add metrics to your latest project',
      action: latestProjectId ? {
        type: 'edit_project' as const,
        projectId: latestProjectId,
      } : undefined,
    },
    {
      text: 'Publish one more project',
      action: {
        type: 'add_project' as const,
      },
    },
    {
      text: 'Add a demo URL',
      action: latestProjectId ? {
        type: 'add_demo_url' as const,
        projectId: latestProjectId,
      } : undefined,
    },
  ];

  const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  const handleAction = (action?: { type: string; projectId?: string }) => {
    if (!action) return;

    switch (action.type) {
      case 'edit_project':
        if (action.projectId) {
          router.push(`/student/portfolio/${action.projectId}/edit`);
        }
        break;
      case 'add_project':
        router.push('/student/portfolio/new');
        break;
      case 'add_demo_url':
        if (action.projectId) {
          router.push(`/student/portfolio/${action.projectId}/edit#demo_url`);
        }
        break;
      case 'add_metrics':
        if (action.projectId) {
          router.push(`/student/portfolio/${action.projectId}/edit#description`);
        }
        break;
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Portfolio Advisor</h2>
        <Link
          href="/student/ai-advisor"
          className="text-sm font-medium text-brand-light hover:text-brand-light/90"
        >
          Ask AI Advisor →
        </Link>
      </div>

      <div className="space-y-3">
        {displaySuggestions.map((suggestion, idx) => (
          <div key={idx} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-lg">💡</span>
              <p className="text-sm text-gray-700 flex-1">{suggestion.text}</p>
            </div>
            {suggestion.action && (
              <button
                onClick={() => handleAction(suggestion.action)}
                className="text-xs font-medium text-brand-light hover:text-brand-light/90 whitespace-nowrap"
              >
                Fix →
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          href="/student/ai-advisor"
          className="btn-secondary text-sm w-full text-center block"
        >
          Ask AI Advisor to review my portfolio
        </Link>
      </div>
    </section>
  );
}
