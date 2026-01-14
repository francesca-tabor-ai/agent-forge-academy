'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProjectCard } from './ProjectCard';

interface Project {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
  visibility: 'private' | 'recruiters_only' | 'public';
  cover_image_url?: string | null;
  images?: string[] | null;
}

interface ProjectsViewProps {
  projects: Project[];
}

export function ProjectsView({ projects }: ProjectsViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  // Load view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('portfolioViewMode');
    if (saved === 'list' || saved === 'card') {
      setViewMode(saved);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewModeChange = (mode: 'list' | 'card') => {
    setViewMode(mode);
    localStorage.setItem('portfolioViewMode', mode);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">💼</div>
        <p className="text-gray-600 mb-2 font-medium">No experience yet</p>
        <p className="text-sm text-gray-500 mb-6">
          Showcase your projects and work experience
        </p>
        <Link
          href="/student/portfolio/new"
          className="btn-secondary text-sm inline-block"
        >
          Add experience
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('card')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'card'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cards
            </button>
          </div>
          <Link
            href="/student/portfolio/new"
            className="btn-secondary text-sm"
          >
            + Add
          </Link>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              github_url={project.github_url}
              demo_url={project.demo_url}
              visibility={project.visibility}
              coverImageUrl={project.cover_image_url || null}
              viewMode="card"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              github_url={project.github_url}
              demo_url={project.demo_url}
              visibility={project.visibility}
              coverImageUrl={project.cover_image_url || null}
              viewMode="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}
