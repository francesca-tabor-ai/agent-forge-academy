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
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Advisor Tips</h3>
        <Link
          href="/student/ai-advisor"
          className="text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          More →
        </Link>
      </div>

      <div className="space-y-2">
        {displaySuggestions.map((suggestion, idx) => (
          <div key={idx} className="flex items-start justify-between gap-2 p-2.5 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <div className="flex items-start gap-2 flex-1">
              <span className="text-sm">💡</span>
              <p className="text-xs text-gray-700 flex-1">{suggestion.text}</p>
            </div>
            {suggestion.action && (
              <button
                onClick={() => handleAction(suggestion.action)}
                className="text-xs text-brand-light hover:text-brand-light/90 whitespace-nowrap"
              >
                Fix
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <Link
          href="/student/ai-advisor"
          className="btn-secondary text-xs w-full text-center block py-2"
        >
          Ask AI Advisor
        </Link>
      </div>
    </section>
  );
}
