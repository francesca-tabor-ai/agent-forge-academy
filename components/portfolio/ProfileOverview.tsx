'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

interface ProfileOverviewProps {
  fullName?: string | null;
  headline?: string | null;
  bio?: string | null;
  primaryRoles?: string[];
  coreSkills?: string[];
  headshotImageUrl?: string | null;
}

export function ProfileOverview({ fullName, headline, bio, primaryRoles = [], coreSkills = [], headshotImageUrl }: ProfileOverviewProps) {
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  
  const hasData = headline || bio || primaryRoles.length > 0 || coreSkills.length > 0 || headshotImageUrl;
  
  // Calculate completion status
  const missingFields: string[] = [];
  if (!headline || headline.trim().length < 5) missingFields.push('Professional headline');
  if (!bio || bio.trim().length < 50) missingFields.push('Bio (recommended)');
  if (coreSkills.length < 3) missingFields.push('At least 3 skills (recommended)');

  // Skills display logic: show top 10, then "+X more"
  const SKILLS_TO_SHOW = 10;
  const displayedSkills = showAllSkills ? coreSkills : coreSkills.slice(0, SKILLS_TO_SHOW);
  const remainingSkillsCount = coreSkills.length - SKILLS_TO_SHOW;

  // Check if bio needs expansion (roughly 3-4 lines = ~200-300 chars)
  const bioNeedsExpansion = bio && bio.length > 200;

  if (!hasData) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Profile Overview</h2>
          <p className="text-sm text-gray-600 mb-6">
            Add your professional headline, bio, and skills to help recruiters understand your expertise.
          </p>
          <Link
            href="/student/portfolio/profile/edit"
            className="btn-primary text-sm inline-block"
          >
            Add Profile Details
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Profile Overview</h2>
        <Link
          href="/student/portfolio/profile/edit"
          className="text-sm font-medium text-brand-light hover:text-brand-light/90"
        >
          Edit →
        </Link>
      </div>

      <div className="space-y-4">
        {/* Headshot and Name/Headline */}
        <div className="flex items-start gap-4">
          {headshotImageUrl && (
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                <Image
                  src={headshotImageUrl}
                  alt="Profile headshot"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          <div className="flex-1">
            {fullName && (
              <h3 className="text-2xl font-semibold text-gray-900 mb-1">{fullName}</h3>
            )}
            {headline && (
              <p className={`text-lg text-gray-700 ${fullName ? '' : 'font-semibold'}`}>{headline}</p>
            )}
          </div>
        </div>

        {bio && (
          <div>
            <div className={`prose prose-sm max-w-none transition-all duration-300 ${
              !isBioExpanded && bioNeedsExpansion ? 'line-clamp-4' : ''
            }`} style={!isBioExpanded && bioNeedsExpansion ? { WebkitLineClamp: 4 } : undefined}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 text-sm text-gray-700 leading-relaxed">{children}</p>,
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2 text-gray-900">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-semibold mb-2 text-gray-900">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-xs font-semibold mb-1 text-gray-900">{children}</h3>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">{children}</ol>,
                  li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  a: ({ href, children }) => (
                    <a href={href} className="text-brand-light hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  // Code blocks - dark theme
                  pre: ({ children, ...props }: any) => (
                    <pre {...props} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm">
                      {children}
                    </pre>
                  ),
                  code: ({ children, className, ...props }: any) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code {...props} className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      );
                    }
                    // Code block (inside pre)
                    return (
                      <code {...props} className={`${className || ''} bg-transparent text-gray-100`}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {bio}
              </ReactMarkdown>
            </div>
            {bioNeedsExpansion && (
              <button
                type="button"
                onClick={() => setIsBioExpanded(!isBioExpanded)}
                className="mt-2 text-xs font-medium text-brand-light hover:text-brand-light/90 focus:outline-none transition-colors"
              >
                {isBioExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {primaryRoles.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Primary Roles</h4>
            <div className="flex flex-wrap gap-2">
              {primaryRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {coreSkills.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {displayedSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200"
                >
                  {skill}
                </span>
              ))}
              {remainingSkillsCount > 0 && !showAllSkills && (
                <button
                  type="button"
                  onClick={() => setShowAllSkills(true)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                >
                  +{remainingSkillsCount} more
                </button>
              )}
              {showAllSkills && remainingSkillsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAllSkills(false)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                >
                  Show less
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
