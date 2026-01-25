'use client';

import { useState } from 'react';
import { ContentSystemsStudioClient } from '@/app/(student)/student/tools/content-systems-studio/ContentSystemsStudioClient';
import { SystemArchitectureDesigner } from './SystemArchitectureDesigner';
import { ContentSystemTemplates } from './ContentSystemTemplates';
import { IntegrationGuide } from './IntegrationGuide';

type ViewMode = 'design' | 'studio' | 'templates' | 'integrations';

interface ContentSystemBuilderClientProps {
  toolId?: string;
  studentProfileId?: string;
}

export function ContentSystemBuilderClient({
  toolId = 'content-system-builder',
  studentProfileId,
}: ContentSystemBuilderClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('design');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* View Mode Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setViewMode('design')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                viewMode === 'design'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            System Design
          </button>
          <button
            onClick={() => setViewMode('templates')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                viewMode === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Templates
          </button>
          <button
            onClick={() => setViewMode('studio')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                viewMode === 'studio'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Content Studio
          </button>
          <button
            onClick={() => setViewMode('integrations')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                viewMode === 'integrations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Integrations
          </button>
        </nav>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'design' && (
        <SystemArchitectureDesigner
          onSystemSelect={setSelectedSystem}
          selectedSystem={selectedSystem}
        />
      )}

      {viewMode === 'templates' && (
        <ContentSystemTemplates
          onTemplateSelect={(templateId) => {
            setSelectedSystem(templateId);
            setViewMode('studio');
          }}
        />
      )}

      {viewMode === 'studio' && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Content Studio:</strong> Manage your content items, schemas, workflows, and variations.
              {selectedSystem && (
                <span className="ml-2">Working with system: <strong>{selectedSystem}</strong></span>
              )}
            </p>
          </div>
          <ContentSystemsStudioClient />
        </div>
      )}

      {viewMode === 'integrations' && (
        <IntegrationGuide selectedSystem={selectedSystem} />
      )}
    </div>
  );
}
