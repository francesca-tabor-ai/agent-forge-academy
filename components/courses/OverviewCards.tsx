'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';
import { normalizeBestFor } from '@/lib/utils';

interface OverviewCardsProps {
  description?: string | null;
  outcome?: string[];
  build?: string[];
  bestFor?: string[];
}

/**
 * Normalize text into paragraphs
 * Collapses single newlines, keeps double newlines as paragraph breaks
 * Prevents "word soup" where each word appears on its own line
 */
function normalizeParagraphs(text: string): string[] {
  // Split by double newlines (paragraph breaks)
  const paragraphs = text.split(/\n\s*\n/);
  
  return paragraphs
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .map(para => {
      // Within each paragraph, collapse single newlines into spaces
      return para.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    });
}

export function OverviewCards({
  description,
  outcome = [],
  build = [],
  bestFor = [],
}: OverviewCardsProps) {
  // Normalize bestFor to ensure it's always an array (defensive programming)
  // This prevents crashes if bestFor is passed as a string or other type
  const normalizedBestFor = normalizeBestFor(bestFor);
  
  // Determine default tab
  const defaultValue = description 
    ? 'description' 
    : outcome.length > 0 
    ? 'outcome' 
    : build.length > 0 
    ? 'build' 
    : normalizedBestFor.length > 0 
    ? 'bestfor' 
    : 'description';

  const [activeTab, setActiveTab] = useState(defaultValue);

  // Build tabs array
  const tabs = [
    description && { id: 'description', label: 'Description' },
    outcome.length > 0 && { id: 'outcome', label: 'Outcome' },
    build.length > 0 && { id: 'build', label: "You'll Build" },
    normalizedBestFor.length > 0 && { id: 'bestfor', label: 'Best For' },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  if (tabs.length === 0) return null;

  // Normalize description paragraphs
  const descriptionParagraphs = description ? normalizeParagraphs(description) : [];

  return (
    <Tabs defaultValue={defaultValue} value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className="flex flex-wrap gap-2 mb-4 bg-transparent p-0 h-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-brand-light text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
        <TabsContent value="description" className="mt-0">
          {descriptionParagraphs.length > 0 && (
            <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-4">
              {descriptionParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outcome" className="mt-0">
          {outcome.length > 0 && (
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              {outcome.map((bullet, index) => (
                <li key={index} className="text-gray-700 leading-relaxed">
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="build" className="mt-0">
          {build.length > 0 && (
            <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base">
              {build.map((bullet, index) => (
                <li key={index} className="text-gray-700 leading-relaxed">
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="bestfor" className="mt-0">
          {normalizedBestFor.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {normalizedBestFor.map((item, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1.5 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}
