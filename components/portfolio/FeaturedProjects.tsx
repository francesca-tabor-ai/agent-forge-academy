'use client';

import Link from 'next/link';
import Image from 'next/image';

interface FeaturedProject {
  id: string;
  title: string;
  description?: string | null;
  github_url?: string | null;
  demo_url?: string | null;
  cover_image_url?: string | null;
}

interface FeaturedProjectsProps {
  projects: FeaturedProject[];
  studentProfileId: string;
}

export function FeaturedProjects({ projects, studentProfileId }: FeaturedProjectsProps) {

  if (projects.length === 0) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Featured</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⭐</div>
          <p className="text-sm text-gray-600 mb-2 font-medium">No featured projects yet</p>
          <p className="text-xs text-gray-500 mb-4">
            Pin 2-4 of your best projects to showcase them prominently
          </p>
          <Link
            href="/student/portfolio"
            className="btn-secondary text-sm inline-block"
          >
            Choose featured projects
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Featured</h2>
        <Link
          href="/student/portfolio"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Manage
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.map((project) => {
          // Get first line of description
          const firstLine = project.description
            ? project.description.split('\n')[0].substring(0, 100) + (project.description.split('\n')[0].length > 100 ? '...' : '')
            : '';

          return (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors group"
            >
              {/* Cover Image */}
              {project.cover_image_url ? (
                <div className="w-full h-32 overflow-hidden bg-gray-100">
                  <Image
                    src={project.cover_image_url}
                    alt={project.title}
                    width={300}
                    height={128}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-3xl text-gray-400">📁</span>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-1">
                  {project.title}
                </h3>
                
                {firstLine && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {firstLine}
                  </p>
                )}

                {/* Links */}
                <div className="flex items-center gap-3 text-xs">
                  {project.github_url && (
                    <a
                      href={project.github_url}
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
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
