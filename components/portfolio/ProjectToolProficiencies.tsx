'use client';

import { useState, useEffect } from 'react';
import { ToolProficiencyBadge } from '../offers/ToolProficiencyBadge';
import { type ProficiencyLevel } from '@/lib/utils/tool-proficiency';

interface Tool {
  id: string;
  name: string;
}

interface ToolProficiency {
  toolId: string;
  toolName: string;
  level: ProficiencyLevel;
}

interface ProjectToolProficienciesProps {
  projectId: string;
  maxDisplay?: number;
}

export function ProjectToolProficiencies({ projectId, maxDisplay = 3 }: ProjectToolProficienciesProps) {
  const [proficiencies, setProficiencies] = useState<ToolProficiency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProficiencies();
  }, [projectId]);

  const fetchProficiencies = async () => {
    try {
      // Get tools for this project
      const toolsResponse = await fetch(`/api/portfolio/projects/${projectId}/tools`);
      if (!toolsResponse.ok) {
        setLoading(false);
        return;
      }

      const toolsData = await toolsResponse.json();
      const tools: Tool[] = toolsData.tools || [];

      if (tools.length === 0) {
        setLoading(false);
        return;
      }

      // Get proficiency for each tool
      const proficiencyPromises = tools.map(async (tool) => {
        try {
          const response = await fetch(`/api/tools/${tool.id}/proficiency`);
          if (response.ok) {
            const data = await response.json();
            if (data.completedCoursesCount > 0) {
              return {
                toolId: tool.id,
                toolName: tool.name,
                level: data.level,
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching proficiency for ${tool.name}:`, error);
        }
        return null;
      });

      const results = await Promise.all(proficiencyPromises);
      const validProficiencies = results.filter((p): p is ToolProficiency => p !== null);

      setProficiencies(validProficiencies);
    } catch (error) {
      console.error('Error fetching tool proficiencies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || proficiencies.length === 0) {
    return null;
  }

  const displayProficiencies = proficiencies.slice(0, maxDisplay);

  return (
    <div className="flex flex-wrap gap-2">
      {displayProficiencies.map((proficiency) => (
        <ToolProficiencyBadge
          key={proficiency.toolId}
          toolName={proficiency.toolName}
          level={proficiency.level}
          size="sm"
        />
      ))}
      {proficiencies.length > maxDisplay && (
        <span className="text-xs text-gray-500 self-center">
          +{proficiencies.length - maxDisplay} more
        </span>
      )}
    </div>
  );
}
