'use client';

import { useState, useEffect } from 'react';
import { ToolProficiencyBadge } from '../offers/ToolProficiencyBadge';
import { type ProficiencyLevel } from '@/lib/utils/tool-proficiency';
import Link from 'next/link';

interface ToolProficiency {
  toolId: string;
  toolName: string;
  toolSlug: string;
  level: ProficiencyLevel;
  completedCoursesCount: number;
}

interface ProfileToolProficienciesProps {
  studentProfileId: string;
}

export function ProfileToolProficiencies({ studentProfileId }: ProfileToolProficienciesProps) {
  const [proficiencies, setProficiencies] = useState<ToolProficiency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProficiencies();
  }, [studentProfileId]);

  const fetchProficiencies = async () => {
    try {
      const response = await fetch(`/api/profile/${studentProfileId}/tool-proficiencies`);
      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      setProficiencies(data.proficiencies || []);
    } catch (error) {
      console.error('Error fetching tool proficiencies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tool Proficiencies</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (proficiencies.length === 0) {
    return null;
  }

  // Sort by level (advanced first) then by name
  const sortedProficiencies = [...proficiencies].sort((a, b) => {
    const levelOrder = { advanced: 3, intermediate: 2, beginner: 1 };
    const levelDiff = levelOrder[b.level] - levelOrder[a.level];
    if (levelDiff !== 0) return levelDiff;
    return a.toolName.localeCompare(b.toolName);
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tool Proficiencies</h2>
      <p className="text-sm text-gray-600 mb-4">
        Based on courses you've completed
      </p>
      <div className="flex flex-wrap gap-3">
        {sortedProficiencies.map((proficiency) => (
          <Link
            key={proficiency.toolId}
            href={`/student/tools/${proficiency.toolSlug}`}
            className="hover:opacity-80 transition-opacity"
          >
            <ToolProficiencyBadge
              toolName={proficiency.toolName}
              level={proficiency.level}
              size="md"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
