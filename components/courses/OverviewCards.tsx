'use client';

import { useState } from 'react';

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
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Default to first available tab
    if (description) return 'description';
    if (outcome.length > 0) return 'outcome';
    if (build.length > 0) return 'build';
    if (bestFor.length > 0) return 'bestfor';
    return 'description';
  });

  // Build tabs array
  const tabs = [
    description && { id: 'description', label: 'Description' },
    outcome.length > 0 && { id: 'outcome', label: 'Outcome' },
    build.length > 0 && { id: 'build', label: "You'll Build" },
    bestFor.length > 0 && { id: 'bestfor', label: 'Best For' },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  if (tabs.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Tabs List */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-light text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        {activeTab === 'description' && description && (
          <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
            {description.split('\n').map((para, i) => 
              para.trim() ? (
                <p key={i} className={i > 0 ? 'mt-4' : ''}>{para.trim()}</p>
              ) : null
            )}
          </div>
        )}

        {activeTab === 'outcome' && outcome.length > 0 && (
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            {outcome.map((bullet, index) => (
              <li key={index} className="text-gray-700 leading-relaxed">
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'build' && build.length > 0 && (
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
            {build.map((bullet, index) => (
              <li key={index} className="text-gray-700 leading-relaxed">
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'bestfor' && bestFor.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
