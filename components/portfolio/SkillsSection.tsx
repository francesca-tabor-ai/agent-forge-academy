'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { normalizeSkillAI } from '@/lib/utils/skill-normalization';

interface Skill {
  name: string;
  isTopSkill?: boolean;
  order?: number;
}

interface SkillsSectionProps {
  skills?: string[] | Skill[];
  studentProfileId?: string;
  onUpdate?: () => void;
}

// Normalize skills to Skill[] format
function normalizeSkills(skills: string[] | Skill[] | undefined): Skill[] {
  if (!skills || skills.length === 0) return [];
  
  // If it's already Skill[], return as is
  if (typeof skills[0] === 'object' && 'name' in skills[0]) {
    return skills as Skill[];
  }
  
  // If it's string[], convert to Skill[]
  return (skills as string[]).map((name, index) => ({
    name,
    isTopSkill: false,
    order: index,
  }));
}

export function SkillsSection({ skills = [], studentProfileId, onUpdate }: SkillsSectionProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  
  const normalizedSkills = normalizeSkills(skills);
  
  // Sort by order, then separate top skills
  const sortedSkills = [...normalizedSkills].sort((a, b) => (a.order || 0) - (b.order || 0));
  const topSkills = sortedSkills.filter(s => s.isTopSkill).slice(0, 5);
  const otherSkills = sortedSkills.filter(s => !s.isTopSkill);
  
  // Calculate how many other skills to show
  const otherSkillsToShow = expanded 
    ? otherSkills.length
    : Math.max(0, 10 - topSkills.length);
  
  const displayedOtherSkills = otherSkills.slice(0, otherSkillsToShow);
  const remainingCount = otherSkills.length - displayedOtherSkills.length;

  const handleMoveUp = async (skillName: string) => {
    if (!studentProfileId) return;
    
    setLoading(skillName);
    try {
      const currentIndex = sortedSkills.findIndex(s => s.name === skillName);
      if (currentIndex <= 0) return;
      
      const newSkills = [...sortedSkills];
      [newSkills[currentIndex - 1], newSkills[currentIndex]] = [newSkills[currentIndex], newSkills[currentIndex - 1]];
      
      // Update orders
      newSkills.forEach((skill, idx) => {
        skill.order = idx;
      });
      
      const response = await fetch('/api/portfolio/skills/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfileId,
          skills: newSkills,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder skills');
      }
      
      if (onUpdate) {
        onUpdate();
      } else {
        // Fallback: refresh page data
        router.refresh();
      }
    } catch (error) {
      console.error('Error moving skill up:', error);
      alert('Failed to reorder skill');
    } finally {
      setLoading(null);
    }
  };

  const handleMoveDown = async (skillName: string) => {
    if (!studentProfileId) return;
    
    setLoading(skillName);
    try {
      const currentIndex = sortedSkills.findIndex(s => s.name === skillName);
      if (currentIndex < 0 || currentIndex >= sortedSkills.length - 1) return;
      
      const newSkills = [...sortedSkills];
      [newSkills[currentIndex], newSkills[currentIndex + 1]] = [newSkills[currentIndex + 1], newSkills[currentIndex]];
      
      // Update orders
      newSkills.forEach((skill, idx) => {
        skill.order = idx;
      });
      
      const response = await fetch('/api/portfolio/skills/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfileId,
          skills: newSkills,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reorder skills');
      }
      
      if (onUpdate) {
        onUpdate();
      } else {
        // Fallback: refresh page data
        router.refresh();
      }
    } catch (error) {
      console.error('Error moving skill down:', error);
      alert('Failed to reorder skill');
    } finally {
      setLoading(null);
    }
  };

  const handleToggleTopSkill = async (skillName: string) => {
    if (!studentProfileId) return;
    
    setLoading(skillName);
    try {
      const skill = sortedSkills.find(s => s.name === skillName);
      if (!skill) return;
      
      const currentTopCount = topSkills.length;
      const willBeTop = !skill.isTopSkill;
      
      // Limit to 5 top skills
      if (willBeTop && currentTopCount >= 5) {
        alert('You can mark up to 5 skills as top skills. Please unmark another top skill first.');
        setLoading(null);
        return;
      }
      
      const newSkills = sortedSkills.map(s => 
        s.name === skillName 
          ? { ...s, isTopSkill: !s.isTopSkill }
          : s
      );
      
      const response = await fetch('/api/portfolio/skills/top', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfileId,
          skillName,
          isTopSkill: willBeTop,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update top skill');
      }
      
      if (onUpdate) {
        onUpdate();
      } else {
        // Fallback: refresh page data
        router.refresh();
      }
    } catch (error) {
      console.error('Error toggling top skill:', error);
      alert('Failed to update top skill');
    } finally {
      setLoading(null);
    }
  };

  if (normalizedSkills.length === 0) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
          <Link
            href="/student/profile/edit"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Add skills
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-600 mb-4">
            Showcase your technical and professional skills.
          </p>
          <Link
            href="/student/profile/edit"
            className="btn-secondary text-sm inline-block"
          >
            Add skills
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
        <Link
          href="/student/profile/edit"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Add skills
        </Link>
      </div>
      
      {/* Top Skills Section */}
      {topSkills.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Top skills</h3>
          <ul className="space-y-2">
            {topSkills.map((skill, index) => (
              <li
                key={skill.name}
                className="flex items-center justify-between group hover:bg-gray-50 rounded px-2 py-1.5 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-gray-600 font-medium">{normalizeSkillAI(skill.name)}</span>
                  {studentProfileId && (
                    <button
                      onClick={() => handleToggleTopSkill(skill.name)}
                      disabled={loading === skill.name}
                      className="text-xs text-yellow-600 hover:text-yellow-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      title="Remove from top skills"
                    >
                      ⭐
                    </button>
                  )}
                </div>
                {studentProfileId && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleMoveUp(skill.name)}
                      disabled={loading === skill.name || index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleMoveDown(skill.name)}
                      disabled={loading === skill.name || index === topSkills.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All Skills Section */}
      {otherSkills.length > 0 && (
        <div>
          {topSkills.length > 0 && (
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {expanded ? 'All skills' : 'Other skills'}
            </h3>
          )}
          <ul className="space-y-2">
            {displayedOtherSkills.map((skill, index) => {
                const globalIndex = otherSkills.findIndex(s => s.name === skill.name);
                return (
                  <li
                    key={skill.name}
                    className="flex items-center justify-between group hover:bg-gray-50 rounded px-2 py-1.5 -mx-2 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm text-gray-700">{normalizeSkillAI(skill.name)}</span>
                      {studentProfileId && (
                        <button
                          onClick={() => handleToggleTopSkill(skill.name)}
                          disabled={loading === skill.name || topSkills.length >= 5}
                          className="text-xs text-gray-400 hover:text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                          title="Mark as top skill"
                        >
                          ⭐
                        </button>
                      )}
                    </div>
                    {studentProfileId && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveUp(skill.name)}
                          disabled={loading === skill.name || globalIndex === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveDown(skill.name)}
                          disabled={loading === skill.name || globalIndex >= otherSkills.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {/* Expand/Collapse */}
      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          {expanded ? `Show less` : `+${remainingCount} more skills`}
        </button>
      )}
    </section>
  );
}
