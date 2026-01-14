'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SkillsSectionProps {
  skills?: string[];
}

export function SkillsSection({ skills = [] }: SkillsSectionProps) {
  const [showAll, setShowAll] = useState(false);
  
  const SKILLS_TO_SHOW = 20;
  const displayedSkills = showAll ? skills : skills.slice(0, SKILLS_TO_SHOW);
  const remainingCount = skills.length - SKILLS_TO_SHOW;

  if (skills.length === 0) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
          <Link
            href="/student/portfolio/profile/edit"
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
            href="/student/portfolio/profile/edit"
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
          href="/student/portfolio/profile/edit"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Add skills
        </Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayedSkills.map((skill, idx) => (
          <span
            key={idx}
            className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            {skill}
          </span>
        ))}
        {remainingCount > 0 && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            +{remainingCount} more
          </button>
        )}
        {showAll && remainingCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Show less
          </button>
        )}
      </div>
    </section>
  );
}
