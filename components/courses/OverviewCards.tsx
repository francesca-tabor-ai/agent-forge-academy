'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface OverviewCardsProps {
  description?: string | null;
  outcome?: string[];
  build?: string[];
  bestFor?: string[];
}

export function OverviewCards({
  description,
  outcome = [],
  build = [],
  bestFor = [],
}: OverviewCardsProps) {
  const [expandedOutcome, setExpandedOutcome] = useState(false);
  const [expandedBuild, setExpandedBuild] = useState(false);

  const MAX_VISIBLE_OUTCOME = 5;
  const MAX_VISIBLE_BUILD = 6;

  const visibleOutcome = expandedOutcome ? outcome : outcome.slice(0, MAX_VISIBLE_OUTCOME);
  const visibleBuild = expandedBuild ? build : build.slice(0, MAX_VISIBLE_BUILD);
  const hasMoreOutcome = outcome.length > MAX_VISIBLE_OUTCOME;
  const hasMoreBuild = build.length > MAX_VISIBLE_BUILD;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Description Card */}
      {description && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Description
          </h3>
          <p className="text-base text-gray-700 leading-relaxed">{description}</p>
        </div>
      )}

      {/* Outcome Card */}
      {outcome.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Outcome
          </h3>
          <ul className="space-y-2.5">
            {visibleOutcome.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-brand-light mt-1.5 flex-shrink-0">•</span>
                <span className="text-base text-gray-700 leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
          {hasMoreOutcome && (
            <button
              onClick={() => setExpandedOutcome(!expandedOutcome)}
              className="mt-3 flex items-center gap-1 text-sm text-brand-light hover:text-brand-light/80 font-medium transition-colors"
            >
              {expandedOutcome ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show {outcome.length - MAX_VISIBLE_OUTCOME} more
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* You'll Build Card */}
      {build.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            You'll Build
          </h3>
          <ul className="space-y-2.5">
            {visibleBuild.map((bullet, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-brand-light mt-1.5 flex-shrink-0">•</span>
                <span className="text-base text-gray-700 leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
          {hasMoreBuild && (
            <button
              onClick={() => setExpandedBuild(!expandedBuild)}
              className="mt-3 flex items-center gap-1 text-sm text-brand-light hover:text-brand-light/80 font-medium transition-colors"
            >
              {expandedBuild ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show {build.length - MAX_VISIBLE_BUILD} more
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Best For Card */}
      {bestFor.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Best For
          </h3>
          <div className="flex flex-wrap gap-2">
            {bestFor.map((item, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1.5 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
