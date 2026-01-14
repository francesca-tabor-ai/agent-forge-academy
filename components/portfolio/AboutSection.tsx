'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface AboutSectionProps {
  bio?: string | null;
}

export function AboutSection({ bio }: AboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const bioNeedsExpansion = bio && bio.length > 200;

  if (!bio) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">About</h2>
          <Link
            href="/student/portfolio/profile/edit"
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
            href="/student/portfolio/profile/edit"
            className="btn-secondary text-sm inline-block"
          >
            Add about section
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">About</h2>
        <Link
          href="/student/portfolio/profile/edit"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Edit
        </Link>
      </div>
      <div className={`prose prose-sm max-w-none transition-all duration-300 ${
        !isExpanded && bioNeedsExpansion ? 'line-clamp-4' : ''
      }`} style={!isExpanded && bioNeedsExpansion ? { WebkitLineClamp: 4 } : undefined}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-3 text-sm text-gray-700 leading-relaxed">{children}</p>,
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
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
        >
          {isExpanded ? 'Show less' : '...see more'}
        </button>
      )}
    </section>
  );
}
