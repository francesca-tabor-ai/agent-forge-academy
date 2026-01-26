'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { Tool } from '@/lib/tools/registry';

interface ToolCardProps {
  tool: Tool;
}

const statusConfig: Record<Tool['status'], { label: string; className: string }> = {
  active: {
    label: 'Live',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  beta: {
    label: 'Beta',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  coming_soon: {
    label: 'Coming Soon',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  deprecated: {
    label: 'Deprecated',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
};

export function ToolCard({ tool }: ToolCardProps) {
  const statusBadge = statusConfig[tool.status];
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Check if description needs truncation by comparing scrollHeight with clientHeight
    const checkTruncation = () => {
      if (descriptionRef.current) {
        const element = descriptionRef.current;
        // Element always has line-clamp-3 initially, so we can check if content is truncated
        const fullHeight = element.scrollHeight;
        
        // Temporarily remove line-clamp to get actual full height
        element.classList.remove('line-clamp-3');
        const actualFullHeight = element.scrollHeight;
        element.classList.add('line-clamp-3');
        
        setNeedsTruncation(actualFullHeight > fullHeight);
      }
    };

    // Wait for element to be rendered
    const timeoutId = setTimeout(checkTruncation, 0);
    
    return () => clearTimeout(timeoutId);
  }, [tool.description]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-light card-interactive flex flex-col h-full">
      {/* Header with Status Badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
          {tool.name}
        </h3>
        {statusBadge && (
          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="mb-4 flex-grow">
        <p
          ref={descriptionRef}
          className={`text-sm text-gray-600 ${!isExpanded ? 'line-clamp-3' : ''}`}
        >
          {tool.description}
        </p>
        {needsTruncation && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-2 text-sm font-medium text-brand-light hover:text-brand-light/80 transition-colors"
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Tags/Chips */}
      {tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
            >
              {tag}
            </span>
          ))}
          {tool.tags.length > 3 && (
            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
              +{tool.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        {tool.status === 'coming_soon' ? (
          <div className="relative group">
            <Link
              href={tool.href}
              className="w-full block text-center px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Preview
            </Link>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              This tool is coming soon. Preview available.
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        ) : tool.status === 'beta' ? (
          <Link
            href={tool.href}
            className="w-full block text-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Beta
          </Link>
        ) : tool.status === 'deprecated' ? (
          <button
            disabled
            className="w-full text-center px-4 py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed"
          >
            Deprecated
          </button>
        ) : (
          <Link
            href={tool.href}
            className="w-full block text-center px-4 py-2.5 bg-brand-light text-white text-sm font-medium rounded-lg hover:bg-brand-light/90 transition-colors"
          >
            Open tool
          </Link>
        )}
      </div>
    </div>
  );
}
