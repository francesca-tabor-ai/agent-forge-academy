'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExpandableDescription } from './ExpandableDescription';

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  visibility: 'private' | 'recruiters_only' | 'public';
  status?: 'draft' | 'complete' | 'published';
  techStack?: string[];
  outcome?: string | null;
  coverImageUrl?: string | null;
  viewMode?: 'list' | 'card';
  featured?: boolean;
  onFeaturedUpdate?: () => void;
}

export function ProjectCard({
  id,
  title,
  description,
  github_url,
  demo_url,
  visibility,
  status,
  techStack = [],
  outcome,
  coverImageUrl,
  viewMode = 'list',
  featured = false,
  onFeaturedUpdate,
}: ProjectCardProps) {
  const [loading, setLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(featured);

  const handleToggleFeatured = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const response = await fetch('/api/portfolio/projects/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          featured: !isFeatured,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update featured status');
      }

      setIsFeatured(!isFeatured);
      if (onFeaturedUpdate) {
        onFeaturedUpdate();
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert(error instanceof Error ? error.message : 'Failed to update featured status');
    } finally {
      setLoading(false);
    }
  };
  const visibilityLabels: Record<string, string> = {
    private: 'Private',
    recruiters_only: 'Recruiters Only',
    public: 'Public',
  };

  const visibilityIcons: Record<string, string> = {
    private: '🔒',
    recruiters_only: '👔',
    public: '🌐',
  };

  const visibilityColors: Record<string, string> = {
    private: 'bg-gray-100 text-gray-700',
    recruiters_only: 'bg-blue-100 text-blue-700',
    public: 'bg-green-100 text-green-700',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    complete: 'Complete',
    published: 'Published',
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-700',
    complete: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700',
  };

  // Determine status from description length if not provided
  const displayStatus = status || (description && description.length > 50 ? 'complete' : 'draft');

  // Gallery images (currently not passed as prop, so default to empty array)
  const galleryImages: string[] = [];

  if (viewMode === 'card') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors flex flex-col shadow-sm">
        {/* Cover Image */}
        {coverImageUrl ? (
          <div className="w-full h-40 overflow-hidden bg-gray-100">
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <span className="text-4xl text-gray-300">📁</span>
          </div>
        )}
        
        <div className="p-4 flex-1 flex flex-col">
          {/* Title and Pills */}
          <div className="mb-2">
            <div className="flex items-start gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-900 flex-1">{title}</h3>
              {isFeatured && (
                <span className="text-yellow-500 text-sm flex-shrink-0" title="Featured project">
                  ⭐
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {displayStatus && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[displayStatus]}`}>
                  {statusLabels[displayStatus]}
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${visibilityColors[visibility]}`}>
                {visibilityIcons[visibility]} {visibilityLabels[visibility]}
              </span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed flex-1">
              {description.split('\n')[0].substring(0, 150)}
              {description.split('\n')[0].length > 150 ? '...' : ''}
            </p>
          )}

          {/* Links and Actions */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                {github_url && (
                  <a
                    href={github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    GitHub
                  </a>
                )}
                {demo_url && (
                  <a
                    href={demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Demo
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleFeatured}
                  disabled={loading}
                  className={`p-1.5 rounded transition-colors ${
                    isFeatured
                      ? 'text-yellow-600 hover:bg-yellow-50'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  } disabled:opacity-50`}
                  title={isFeatured ? 'Unfeature project' : 'Feature project'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
                <Link
                  href={`/student/portfolio/${id}/edit`}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                  title="Edit project"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title and Pills Row */}
          <div className="flex items-start gap-3 mb-2 flex-wrap">
            <h3 className="text-base font-semibold text-gray-900 flex-shrink-0">{title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {isFeatured && (
                <span className="text-yellow-500 text-sm" title="Featured project">
                  ⭐
                </span>
              )}
              {displayStatus && (
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColors[displayStatus]}`}>
                  {statusLabels[displayStatus]}
                </span>
              )}
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${visibilityColors[visibility]}`}>
                {visibilityIcons[visibility]} {visibilityLabels[visibility]}
              </span>
            </div>
          </div>

          {/* Description Snippet (2 lines) */}
          {description && (
            <div className="mb-3">
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                {description.split('\n')[0].substring(0, 200)}
                {description.split('\n')[0].length > 200 ? '...' : ''}
              </p>
            </div>
          )}

          {/* Links Row */}
          <div className="flex items-center gap-4 text-sm">
            {github_url && (
              <a
                href={github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </a>
            )}
            {demo_url && (
              <a
                href={demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Actions - Subtle icon buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleToggleFeatured}
            disabled={loading}
            className={`p-1.5 rounded transition-colors ${
              isFeatured
                ? 'text-yellow-600 hover:bg-yellow-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            } disabled:opacity-50`}
            title={isFeatured ? 'Unfeature project' : 'Feature project'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
          <Link
            href={`/student/portfolio/${id}/edit`}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Edit project"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
