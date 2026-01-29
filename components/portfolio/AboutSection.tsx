'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { cleanBio, getBioPreview } from '@/lib/portfolio/cleanBio';

interface AboutSectionProps {
  bio?: string | null;
}

export function AboutSection({ bio }: AboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Clean and format the bio
  const cleanedBio = useMemo(() => {
    if (!bio) return null;
    return cleanBio(bio);
  }, [bio]);

  // Get preview (2-4 lines)
  const previewBio = useMemo(() => {
    if (!cleanedBio) return null;
    return getBioPreview(cleanedBio, 3);
  }, [cleanedBio]);

  // Check if bio needs expansion
  const needsExpansion = cleanedBio && previewBio && cleanedBio.length > previewBio.length;

  if (!bio || !cleanedBio) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">About</h2>
          <Link
            href="/student/profile/edit"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Add section
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-gray-600 mb-4">
            Share your professional story and what makes you unique.
          </p>
          <Link
            href="/student/profile/edit"
            className="btn-secondary text-sm inline-block"
          >
            Add about section
          </Link>
        </div>
      </section>
    );
  }

  // Check if bio is in bullet format
  const isBulletFormat = cleanedBio.includes('•') || cleanedBio.split('\n').some(line => /^[-•*]\s/.test(line));

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">About</h2>
        <Link
          href="/student/profile/edit"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Edit
        </Link>
      </div>
      
      <div className="text-sm text-gray-700 leading-relaxed">
        {(() => {
          const bioText = ((isExpanded ? cleanedBio : previewBio) ?? '');
          
          return isBulletFormat ? (
            // Bullet format
            <ul className="space-y-2 list-none">
              {bioText
                .split('\n')
                .filter(line => line.trim().length > 0)
                .map((line, index) => {
                  // Remove bullet markers if present
                  const cleanLine = line.replace(/^[-•*]\s+/, '').trim();
                  return (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1.5 flex-shrink-0">•</span>
                      <span>{cleanLine}</span>
                    </li>
                  );
                })}
            </ul>
          ) : (
            // Paragraph format
            <div className="space-y-3">
              {bioText
                .split('\n\n')
                .filter(para => para.trim().length > 0)
                .map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph.trim()}
                  </p>
                ))}
            </div>
          );
        })()}
      </div>

      {needsExpansion && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
        >
          {isExpanded ? 'Show less' : 'See more'}
        </button>
      )}
    </section>
  );
}
