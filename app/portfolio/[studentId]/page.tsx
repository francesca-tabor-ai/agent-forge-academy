import { createUserSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

interface PublicPortfolioPageProps {
  params: Promise<{ studentId: string }>;
}

export default async function PublicPortfolioPage({ params }: PublicPortfolioPageProps) {
  const { studentId } = await params;
  const supabase = await createUserSupabaseClient();

  // Get student profile by ID
  // RLS will enforce visibility rules
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id, visibility, bio, profile_id')
    .eq('id', studentId)
    .single();

  if (!studentProfile) {
    notFound();
  }

  // Only show if visibility allows
  if (studentProfile.visibility === 'private') {
    notFound();
  }

  // Get portfolio projects (RLS will filter by visibility)
  const { data: projects } = await supabase
    .from('portfolio_projects')
    .select('id, title, description, github_url, demo_url, visibility')
    .eq('student_profile_id', studentProfile.id)
    .in('visibility', ['public', 'recruiters_only'])
    .order('created_at', { ascending: false });

  return (
    <div className="public-portfolio-page">
      <h1>Student Portfolio</h1>
      {studentProfile.bio && <p>{studentProfile.bio}</p>}

      <div className="portfolio-projects">
        <h2>Projects</h2>
        {projects && projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                {project.description && <p>{project.description}</p>}
                <div className="project-links">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                  {project.demo_url && (
                    <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                      Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No public projects available.</p>
        )}
      </div>
    </div>
  );
}

