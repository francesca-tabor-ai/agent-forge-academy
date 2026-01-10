'use client';

import Link from 'next/link';

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
}: ProjectCardProps) {
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900">{title}</h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${visibilityColors[visibility]}`}>
              {visibilityIcons[visibility]}
            </span>
            {displayStatus && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[displayStatus]}`}>
                {statusLabels[displayStatus]}
              </span>
            )}
          </div>

          {outcome && (
            <p className="text-sm text-gray-700 mb-2 font-medium">{outcome}</p>
          )}

          {description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
          )}

          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border border-gray-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="capitalize">{visibilityLabels[visibility]}</span>
            {github_url && (
              <a
                href={github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700"
              >
                GitHub →
              </a>
            )}
            {demo_url && (
              <a
                href={demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700"
              >
                Demo →
              </a>
            )}
          </div>
        </div>
        <Link
          href={`/student/portfolio/${id}/edit`}
          className="ml-4 text-sm font-medium text-brand-light hover:text-brand-light/90"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}
