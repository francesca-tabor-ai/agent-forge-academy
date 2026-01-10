'use client';

import Link from 'next/link';

interface PortfolioAdvisorSectionProps {
  suggestions?: string[];
}

export function PortfolioAdvisorSection({ suggestions = [] }: PortfolioAdvisorSectionProps) {
  // Mock suggestions if none provided
  const displaySuggestions = suggestions.length > 0 
    ? suggestions 
    : [
        'Add metrics to your latest project',
        'Publishing one more project unlocks more roles',
        'Consider adding a demo URL to increase engagement',
      ];

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
          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-lg">💡</span>
            <p className="text-sm text-gray-700 flex-1">{suggestion}</p>
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
