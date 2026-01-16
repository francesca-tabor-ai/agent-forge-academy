'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ToolLogo } from './ToolLogo';
import { Lock } from 'lucide-react';
import { type UnlockedOfferRecommendation } from '@/lib/utils/tool-recommendations';

export function UnlockedOffersRecommendations() {
  const [recommendations, setRecommendations] = useState<UnlockedOfferRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/tools/unlocked-offers');
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching unlocked offers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Offers Unlocked If You Complete Courses</h2>
        <p className="text-sm text-gray-500">Loading recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Offers Unlocked If You Complete Courses</h2>
      <p className="text-sm text-gray-600 mb-4">
        Complete these courses to unlock exclusive tool offers
      </p>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.offerId}
            className="p-4 border border-amber-200 rounded-lg bg-amber-50 hover:border-amber-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <ToolLogo
                toolName={rec.toolName}
                logoUrl={null}
                size={48}
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{rec.offerTitle}</h3>
                    <p className="text-sm text-gray-600">{rec.toolName}</p>
                  </div>
                  {rec.valueDisplay && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded whitespace-nowrap">
                      {rec.valueDisplay}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-700 mb-3">
                  <Lock className="w-4 h-4" />
                  <span>{rec.reason}</span>
                </div>
                <Link
                  href={`/student/courses/${rec.requiredCourseSlug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Go to Course →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
