'use client';

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const PRIORITY_LABELS = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority',
};

const EFFORT_LABELS = {
  low: 'Low Effort',
  medium: 'Medium Effort',
  high: 'High Effort',
};

const EFFORT_COLORS = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
};

export function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  // Sort recommendations by priority
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Group by priority
  const byPriority = sortedRecommendations.reduce(
    (acc, rec) => {
      if (!acc[rec.priority]) {
        acc[rec.priority] = [];
      }
      acc[rec.priority].push(rec);
      return acc;
    },
    {} as Record<'high' | 'medium' | 'low', Recommendation[]>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Recommendations
      </h3>
      <p className="text-gray-600 mb-6">
        Prioritized recommendations to improve your GTM system. Focus on high-priority items first.
      </p>

      <div className="space-y-6">
        {(['high', 'medium', 'low'] as const).map((priority) => {
          const recs = byPriority[priority];
          if (!recs || recs.length === 0) return null;

          return (
            <div key={priority}>
              <h4 className={`text-sm font-medium mb-3 px-3 py-1 rounded-full inline-block border ${PRIORITY_COLORS[priority]}`}>
                {PRIORITY_LABELS[priority]} ({recs.length})
              </h4>
              <div className="mt-3 space-y-4">
                {recs.map((rec, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">{rec.title}</h5>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {rec.category}
                        </span>
                      </div>
                      <span className={`text-xs font-medium ${EFFORT_COLORS[rec.effort]}`}>
                        {EFFORT_LABELS[rec.effort]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <div className="text-xs text-gray-500">
                      <strong>Impact:</strong> {rec.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No recommendations generated. Try adjusting your inputs and generating again.
        </div>
      )}
    </div>
  );
}
