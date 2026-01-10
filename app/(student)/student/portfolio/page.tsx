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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Portfolio</h1>
        <Link
          href="/student/portfolio/new"
          className="btn-primary text-sm"
        >
          Add Project
        </Link>
      </div>

      {studentProfile && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Profile Visibility</h2>
            <Link
              href="/student/portfolio/settings"
              className="text-sm font-medium text-brand-light hover:text-brand-light/90"
            >
              Edit →
            </Link>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Current visibility: <span className="font-medium text-gray-900 capitalize">{studentProfile.visibility.replace('_', ' ')}</span>
            </p>
            {studentProfile.bio && (
              <p className="text-sm text-gray-700 mt-3">{studentProfile.bio}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Projects</h2>
        {projects && projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project: typeof projects[0]) => (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 mb-2">{project.title}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="capitalize">{project.visibility.replace('_', ' ')}</span>
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-gray-700"
                        >
                          GitHub →
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
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
                    href={`/student/portfolio/${project.id}/edit`}
                    className="ml-4 text-sm font-medium text-brand-light hover:text-brand-light/90"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-4">No projects yet.</p>
            <Link
              href="/student/portfolio/new"
              className="text-sm font-medium text-brand-light hover:text-brand-light/90"
            >
              Create your first project →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

