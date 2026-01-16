'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ToolLogo } from './ToolLogo';
import { type ToolRecommendation } from '@/lib/utils/tool-recommendations';

export function ToolsToLearnNext() {
  const [recommendations, setRecommendations] = useState<ToolRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/tools/recommendations');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tools You Should Learn Next</h2>
        <p className="text-sm text-gray-500">Loading recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tools You Should Learn Next</h2>
      <p className="text-sm text-gray-600 mb-4">
        Based on your enrolled courses, skills, and projects
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Link
            key={rec.toolId}
            href={`/student/tools/${rec.toolSlug}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-brand-light hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <ToolLogo
                toolName={rec.toolName}
                logoUrl={rec.logo_url}
                size={40}
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{rec.toolName}</h3>
                {rec.category && (
                  <span className="text-xs text-gray-500">{rec.category}</span>
                )}
              </div>
            </div>
            {rec.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{rec.description}</p>
            )}
            <p className="text-xs text-brand-light font-medium">{rec.reason}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
