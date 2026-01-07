import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function PortfolioPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  // Get student profile
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id, visibility, bio')
    .eq('profile_id', profile.id)
    .single();

  // Get portfolio projects
  const { data: projects } = await supabase
    .from('portfolio_projects')
    .select('id, title, description, github_url, demo_url, visibility, created_at')
    .eq('student_profile_id', studentProfile?.id)
    .order('created_at', { ascending: false });

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <h1>My Portfolio</h1>
        <Link href="/student/portfolio/new" className="btn-primary">
          Add New Project
        </Link>
      </div>

      {studentProfile && (
        <div className="portfolio-profile">
          <h2>Profile Settings</h2>
          <p>Visibility: {studentProfile.visibility}</p>
          {studentProfile.bio && <p>{studentProfile.bio}</p>}
          <Link href="/student/portfolio/settings">Edit Profile</Link>
        </div>
      )}

      <div className="portfolio-projects">
        <h2>Projects</h2>
        {projects && projects.length > 0 ? (
          <div className="projects-grid">
            {projects.map((project: typeof projects[0]) => (
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
                <p>Visibility: {project.visibility}</p>
                <Link href={`/student/portfolio/${project.id}/edit`}>Edit</Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No projects yet. Create your first project!</p>
        )}
      </div>
    </div>
  );
}

