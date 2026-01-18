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
  // Mobile: collapsed by default, desktop: expanded (handled via CSS)
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [expandedOutcome, setExpandedOutcome] = useState(false);
  const [expandedBuild, setExpandedBuild] = useState(false);
  const [expandedBestFor, setExpandedBestFor] = useState(false);

  const MAX_VISIBLE_OUTCOME = 5;
  const MAX_VISIBLE_BUILD = 6;

  const visibleOutcome = expandedOutcome ? outcome : outcome.slice(0, MAX_VISIBLE_OUTCOME);
  const visibleBuild = expandedBuild ? build : build.slice(0, MAX_VISIBLE_BUILD);
  const hasMoreOutcome = outcome.length > MAX_VISIBLE_OUTCOME;
  const hasMoreBuild = build.length > MAX_VISIBLE_BUILD;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Description Card */}
      {description && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedDescription(!expandedDescription)}
            className="w-full md:pointer-events-none flex items-center justify-between p-6 text-left"
            aria-expanded={expandedDescription}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Description
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform md:hidden ${
                expandedDescription ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`px-6 pb-6 transition-all md:block ${
              expandedDescription ? 'block' : 'hidden md:block'
            }`}
          >
            <p className="text-base text-gray-700 leading-relaxed max-w-prose">{description}</p>
          </div>
        </div>
      )}

      {/* Outcome Card */}
      {outcome.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedOutcome(!expandedOutcome)}
            className="w-full md:pointer-events-none flex items-center justify-between p-6 text-left"
            aria-expanded={expandedOutcome}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Outcome
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform md:hidden ${
                expandedOutcome ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`px-6 pb-6 transition-all md:block ${
              expandedOutcome ? 'block' : 'hidden md:block'
            }`}
          >
            <ul className="space-y-2.5 max-w-prose">
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
        </div>
      )}

      {/* You'll Build Card */}
      {build.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedBuild(!expandedBuild)}
            className="w-full md:pointer-events-none flex items-center justify-between p-6 text-left"
            aria-expanded={expandedBuild}
          >
            <h3 className="text-base font-semibold text-gray-900">
              You&apos;ll Build
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform md:hidden ${
                expandedBuild ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`px-6 pb-6 transition-all md:block ${
              expandedBuild ? 'block' : 'hidden md:block'
            }`}
          >
            <ul className="space-y-2.5 max-w-prose">
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
        </div>
      )}

      {/* Best For Card */}
      {bestFor.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedBestFor(!expandedBestFor)}
            className="w-full md:pointer-events-none flex items-center justify-between p-6 text-left"
            aria-expanded={expandedBestFor}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Best For
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform md:hidden ${
                expandedBestFor ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div
            className={`px-6 pb-6 transition-all md:block ${
              expandedBestFor ? 'block' : 'hidden md:block'
            }`}
          >
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
        </div>
      )}
    </div>
  );
}
