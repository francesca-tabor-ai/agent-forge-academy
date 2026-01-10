import Link from 'next/link';

interface PortfolioSectionProps {
  portfolioData: {
    profile: {
      id: string;
      visibility: 'private' | 'recruiters_only' | 'public';
      bio: string | null;
    } | null;
    projects: Array<{
      id: string;
      title: string;
      description: string | null;
      visibility: 'private' | 'recruiters_only' | 'public';
      created_at: string;
    }>;
  } | null;
}

export function PortfolioSection({ portfolioData }: PortfolioSectionProps) {
  if (!portfolioData) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Portfolio</h2>
          <Link
            href="/student/portfolio"
            className="text-sm font-medium text-brand-light hover:text-brand-light/90"
          >
            Get Started →
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Start building your professional portfolio</p>
          <Link
            href="/student/portfolio/new"
            className="btn-primary inline-block"
          >
            Create Your First Project →
          </Link>
        </div>
      </section>
    );
  }

  const { profile, projects } = portfolioData;

  // Calculate portfolio completion percentage
  // Consider: bio, at least 3 projects, at least 1 public project
  let completionScore = 0;
  const maxScore = 100;
  
  if (profile && profile.bio) completionScore += 25;
  if (projects.length >= 1) completionScore += 25;
  if (projects.length >= 3) completionScore += 25;
  if (projects.some(p => p.visibility === 'public' || p.visibility === 'recruiters_only')) {
    completionScore += 25;
  }

  const projectsInProgress = projects.filter(p => {
    // Consider projects without description or demo/github as "in progress"
    return !p.description;
  });

  const visibilityLabels: Record<string, string> = {
    private: 'Private',
    recruiters_only: 'Recruiters Only',
    public: 'Public',
  };

  const visibilityColors: Record<string, string> = {
    private: 'bg-gray-100 text-gray-700',
    recruiters_only: 'bg-blue-100 text-blue-700',
    public: 'bg-green-100 text-green-700',
  };

  // Determine missing sections
  const missingSections = [];
  if (!profile?.bio) missingSections.push('Bio');
  if (projects.length < 3) missingSections.push(`${3 - projects.length} more project${3 - projects.length > 1 ? 's' : ''}`);
  if (!projects.some(p => p.visibility === 'public' || p.visibility === 'recruiters_only')) {
    missingSections.push('Public visibility');
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Portfolio</h2>
        <Link
          href="/student/portfolio"
          className="text-sm font-medium text-brand-light hover:text-brand-light/90"
        >
          View Full Portfolio →
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Portfolio Completion */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium text-gray-900">Portfolio Completion</h3>
            <span className="text-sm font-semibold text-gray-700">{completionScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-brand-light h-3 rounded-full transition-all"
              style={{ width: `${completionScore}%` }}
            />
          </div>
          {completionScore < 100 && (
            <p className="text-xs text-gray-500 mt-2">
              Complete your portfolio to increase visibility to recruiters
            </p>
          )}
        </div>

        {/* Visibility Status */}
        {profile && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Profile Visibility</p>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${visibilityColors[profile.visibility]}`}>
                  {visibilityLabels[profile.visibility]}
                </span>
              </div>
              <Link
                href="/student/portfolio/settings"
                className="text-sm font-medium text-brand-light hover:text-brand-light/90"
              >
                Change →
              </Link>
            </div>
          </div>
        )}

        {/* Projects in Progress */}
        {projectsInProgress.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Projects in Progress</h4>
            <div className="space-y-2">
              {projectsInProgress.slice(0, 3).map((project) => (
                <Link
                  key={project.id}
                  href={`/student/portfolio/${project.id}/edit`}
                  className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{project.title}</span>
                    <span className="text-xs text-gray-500">Complete →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/student/portfolio/new"
            className="flex items-center justify-center px-4 py-3 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
          >
            + Add Project
          </Link>
          
          {projects.length > 0 && (
            <Link
              href="/student/portfolio"
              className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Publish Project
            </Link>
          )}

          {missingSections.length > 0 && (
            <Link
              href="/student/portfolio"
              className="flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Improve Missing Sections
            </Link>
          )}
        </div>

        {/* Missing Sections Alert */}
        {missingSections.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs font-medium text-yellow-800 mb-1">Missing Sections</p>
            <p className="text-sm text-yellow-700">
              Add: {missingSections.join(', ')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
