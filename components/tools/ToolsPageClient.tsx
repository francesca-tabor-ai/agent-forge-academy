'use client';

import type { Tool } from '@/lib/tools/registry';
import { ToolCard } from './ToolCard';
import { ToolsToLearnNext } from '@/components/offers/ToolsToLearnNext';
import { UnlockedOffersRecommendations } from '@/components/offers/UnlockedOffersRecommendations';

interface ToolsPageClientProps {
  tools: Tool[];
  studentProfileId: string;
}

export function ToolsPageClient({ tools, studentProfileId }: ToolsPageClientProps) {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tools</h1>
        <p className="text-gray-600 mt-2">
          Discover tools and resources to help you build and ship faster
        </p>
      </div>

      {/* Personalized Recommendations */}
      <ToolsToLearnNext />
      <UnlockedOffersRecommendations />

      {/* Tools Grid */}
      {tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No tools available at the moment.</p>
        </div>
      )}
    </div>
  );
}
