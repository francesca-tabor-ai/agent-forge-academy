'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
}

interface ProjectsUsingToolProps {
  toolName: string;
  studentProfileId: string;
}

export function ProjectsUsingTool({ toolName, studentProfileId }: ProjectsUsingToolProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // First, try to find the tool by name
      const { data: tool } = await supabase
        .from('tools')
        .select('id')
        .ilike('name', toolName)
        .single();

      if (!tool) {
        setLoading(false);
        return;
      }

      // Get projects using this tool
      const { data: projectTools } = await supabase
        .from('project_tools')
        .select(`
          project_id,
          portfolio_projects:project_id (
            id,
            title,
            description,
            github_url,
            demo_url
          )
        `)
        .eq('tool_id', tool.id);

      if (projectTools) {
        const projectsList = projectTools
          .map((pt: any) => pt.portfolio_projects)
          .filter(Boolean)
          .filter((p: any) => p !== null);

        // Filter to only show projects owned by this student
        const { data: studentProjects } = await supabase
          .from('portfolio_projects')
          .select('id')
          .eq('student_profile_id', studentProfileId);

        const studentProjectIds = new Set((studentProjects || []).map(p => p.id));
        const filteredProjects = projectsList.filter((p: any) => studentProjectIds.has(p.id));

        setProjects(filteredProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [toolName, studentProfileId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Projects Using This Tool</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Projects Using This Tool</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/student/portfolio/${project.id}/edit`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-brand-light hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
            )}
            <div className="mt-2 text-sm text-brand-light">View project →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
