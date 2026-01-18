'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToolProficiencyBadge } from './ToolProficiencyBadge';
import { type ProficiencyLevel } from '@/lib/utils/tool-proficiency';

interface ToolProficiencyDisplayProps {
  toolId?: string;
  toolName: string;
  toolSlug?: string;
}

export function ToolProficiencyDisplay({ toolId, toolName, toolSlug }: ToolProficiencyDisplayProps) {
  const [proficiency, setProficiency] = useState<{ level: ProficiencyLevel; completedCoursesCount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProficiency = useCallback(async () => {
    if (!toolId && !toolSlug) {
      setLoading(false);
      return;
    }

    try {
      // Try to get tool ID from slug if needed
      let actualToolId = toolId;
      if (!actualToolId && toolSlug) {
        const response = await fetch(`/api/tools/by-slug?slug=${encodeURIComponent(toolSlug)}`);
        if (response.ok) {
          const data = await response.json();
          actualToolId = data.toolId;
        }
      }

      if (!actualToolId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/tools/${actualToolId}/proficiency`);
      if (response.ok) {
        const data = await response.json();
        setProficiency({
          level: data.level,
          completedCoursesCount: data.completedCoursesCount,
        });
      }
    } catch (error) {
      console.error('Error fetching proficiency:', error);
    } finally {
      setLoading(false);
    }
  }, [toolId, toolSlug]);

  useEffect(() => {
    fetchProficiency();
  }, [fetchProficiency]);

  if (loading) {
    return null;
  }

  if (!proficiency || proficiency.completedCoursesCount === 0) {
    return null;
  }

  return (
    <ToolProficiencyBadge
      toolName={toolName}
      level={proficiency.level}
      size="md"
    />
  );
}
