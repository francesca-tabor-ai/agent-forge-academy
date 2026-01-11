'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ExpandableDescriptionProps {
  content: string;
  maxLines?: number;
  className?: string;
}

export function ExpandableDescription({ content, maxLines = 2, className = '' }: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  // Determine if content is long enough to need expansion
  const needsExpansion = content.length > 150 || content.split('\n').length > maxLines;

  // Use proper Tailwind line-clamp classes
  const getLineClampClass = (lines: number) => {
    const clampMap: Record<number, string> = {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3',
      4: 'line-clamp-4',
      5: 'line-clamp-5',
      6: 'line-clamp-6',
    };
    return clampMap[lines] || 'line-clamp-2';
  };

  return (
    <div className={className}>
      <div
        className={`overflow-hidden transition-all duration-300 ${isExpanded ? '' : getLineClampClass(maxLines)}`}
      >
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 text-sm text-gray-600 leading-relaxed">{children}</p>,
              h1: ({ children }) => <h1 className="text-base font-bold mb-2 text-gray-900">{children}</h1>,
              h2: ({ children }) => <h2 className="text-sm font-semibold mb-2 text-gray-900">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xs font-semibold mb-1 text-gray-900">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">{children}</ol>,
              li: ({ children }) => <li className="text-sm text-gray-600">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              a: ({ href, children }) => (
                <a href={href} className="text-brand-light hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
      {needsExpansion && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-medium text-brand-light hover:text-brand-light/90 focus:outline-none transition-colors"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
