'use client';

import { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { ViewToggle } from './ViewToggle';

interface Project {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
  visibility: 'private' | 'recruiters_only' | 'public';
  cover_image_url?: string | null;
  images?: string[] | null;
  created_at?: string;
}

interface ProjectsListProps {
  projects: Project[];
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ViewToggle onChange={setViewMode} defaultMode={viewMode} />
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const techStack: string[] = [];
            const outcome = null;

            return (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                github_url={project.github_url}
                demo_url={project.demo_url}
                visibility={project.visibility}
                techStack={techStack}
                outcome={outcome}
                coverImageUrl={project.cover_image_url || null}
                viewMode="card"
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const techStack: string[] = [];
            const outcome = null;

            return (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                github_url={project.github_url}
                demo_url={project.demo_url}
                visibility={project.visibility}
                techStack={techStack}
                outcome={outcome}
                coverImageUrl={project.cover_image_url || null}
                viewMode="list"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
