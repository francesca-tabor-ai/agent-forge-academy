'use client';

import { useEffect } from 'react';
import { trackToolView } from '@/lib/utils/tool-analytics';

interface ToolViewTrackerProps {
  toolId?: string;
  toolName: string;
  toolSlug?: string;
}

export function ToolViewTracker({ toolId, toolName, toolSlug }: ToolViewTrackerProps) {
  useEffect(() => {
    // Try to get tool ID from slug if not provided
    const fetchAndTrack = async () => {
      let actualToolId = toolId;
      
      if (!actualToolId && toolSlug) {
        try {
          const response = await fetch(`/api/tools/by-slug?slug=${encodeURIComponent(toolSlug)}`);
          if (response.ok) {
            const data = await response.json();
            actualToolId = data.toolId;
          }
        } catch (error) {
          console.error('Error fetching tool ID:', error);
        }
      }

      if (actualToolId) {
        await trackToolView(actualToolId, {
          tool_name: toolName,
          tool_slug: toolSlug,
          timestamp: new Date().toISOString(),
        });
      }
    };

    fetchAndTrack();
  }, [toolId, toolName, toolSlug]);

  return null; // This component doesn't render anything
}
