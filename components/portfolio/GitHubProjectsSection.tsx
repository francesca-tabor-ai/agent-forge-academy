'use client';

import Link from 'next/link';

interface GitHubProject {
  id: string;
  title: string;
  description?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  visibility: 'private' | 'recruiters_only' | 'public';
  source?: string | null;
}

interface GitHubProjectsSectionProps {
  projects: GitHubProject[];
  hasGitHubUrl: boolean;
  studentProfileId: string;
}

export function GitHubProjectsSection({ 
  projects, 
  hasGitHubUrl,
  studentProfileId 
}: GitHubProjectsSectionProps) {
  const githubProjects = projects.filter(p => p.source === 'github' || p.github_url);
  const hasProjects = githubProjects.length > 0;

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
        {hasProjects && (
          <Link
            href="/student/portfolio"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Manage
          </Link>
        )}
      </div>

      {!hasProjects ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-sm text-gray-600 mb-2 font-medium">No GitHub projects found yet</p>
          <p className="text-xs text-gray-500 mb-4">
            {hasGitHubUrl 
              ? "We couldn't find public repos to display. Make sure at least one repo is public."
              : "Add a public project or connect GitHub to display your work here."}
          </p>
          {hasGitHubUrl ? (
            <Link
              href="/student/portfolio"
              className="btn-secondary text-sm inline-block"
            >
              Refresh GitHub
            </Link>
          ) : (
            <Link
              href="/student/profile/edit"
              className="btn-secondary text-sm inline-block"
            >
              Connect GitHub
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {githubProjects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        GitHub
                      </a>
                    )}
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Demo
                      </a>
                    )}
                  </div>
                </div>
                <Link
                  href={`/student/portfolio/${project.id}`}
                  className="text-xs text-gray-600 hover:text-gray-900 flex-shrink-0"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
