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
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Portfolio</h2>
            <p className="text-sm text-gray-600 mt-1">Your public professional identity</p>
          </div>
          <Link
            href="/student/portfolio"
            className="text-sm font-medium text-brand-light hover:text-brand-light/90"
          >
            Get Started →
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Build Your Professional Portfolio</h3>
            <p className="text-gray-600 mb-4">
              Showcase your projects and skills to recruiters and potential employers.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              A complete portfolio increases your visibility and helps you stand out in the job market.
            </p>
            <Link
              href="/student/portfolio/new"
              className="btn-primary inline-block"
            >
              Create Your First Project →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const { profile, projects } = portfolioData;

  // Calculate detailed portfolio completion percentage
  // Scoring breakdown:
  // - Bio (25 points): Professional bio written
  // - Projects (25 points): At least 1 project
  // - Quality (25 points): At least 3 projects
  // - Visibility (25 points): At least 1 public/recruiter-visible project
  let completionScore = 0;
  const maxScore = 100;
  const completionBreakdown: { label: string; completed: boolean; points: number }[] = [];
  
  const hasBio = profile && profile.bio && profile.bio.length > 50;
  if (hasBio) {
    completionScore += 25;
    completionBreakdown.push({ label: 'Professional Bio', completed: true, points: 25 });
  } else {
    completionBreakdown.push({ label: 'Professional Bio', completed: false, points: 25 });
  }

  const hasProjects = projects.length >= 1;
  if (hasProjects) {
    completionScore += 25;
    completionBreakdown.push({ label: 'At least 1 project', completed: true, points: 25 });
  } else {
    completionBreakdown.push({ label: 'At least 1 project', completed: false, points: 25 });
  }

  const hasQualityProjects = projects.length >= 3;
  if (hasQualityProjects) {
    completionScore += 25;
    completionBreakdown.push({ label: '3+ quality projects', completed: true, points: 25 });
  } else {
    completionBreakdown.push({ label: '3+ quality projects', completed: false, points: 25 });
  }

  const hasVisibleProjects = projects.some(p => p.visibility === 'public' || p.visibility === 'recruiters_only');
  if (hasVisibleProjects) {
    completionScore += 25;
    completionBreakdown.push({ label: 'Public visibility', completed: true, points: 25 });
  } else {
    completionBreakdown.push({ label: 'Public visibility', completed: false, points: 25 });
  }

  // Analyze projects
  const projectsInProgress = projects.filter(p => {
    // Consider projects without description as "in progress"
    return !p.description || p.description.length < 50;
  });

  const completedProjects = projects.filter(p => {
    return p.description && p.description.length >= 50;
  });

  const publicProjects = projects.filter(p => p.visibility === 'public');
  const recruiterVisibleProjects = projects.filter(p => p.visibility === 'recruiters_only');
  const privateProjects = projects.filter(p => p.visibility === 'private');

  // Calculate project quality score (based on description length, visibility)
  const averageProjectQuality = projects.length > 0
    ? Math.round(
        projects.reduce((sum, p) => {
          let score = 0;
          if (p.description && p.description.length >= 50) score += 50;
          if (p.description && p.description.length >= 200) score += 30;
          if (p.visibility !== 'private') score += 20;
          return sum + score;
        }, 0) / projects.length
      )
    : 0;

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

  const visibilityIcons: Record<string, string> = {
    private: '🔒',
    recruiters_only: '👔',
    public: '🌐',
  };

  // Determine missing sections with specific recommendations
  const missingSections = [];
  if (!hasBio) missingSections.push('Add a professional bio (50+ characters)');
  if (projects.length < 1) missingSections.push('Create your first project');
  if (projects.length < 3) missingSections.push(`Add ${3 - projects.length} more project${3 - projects.length > 1 ? 's' : ''} (aim for 3+)`);
  if (!hasVisibleProjects) missingSections.push('Make at least 1 project visible to recruiters');

  // Mock recruiter views (would come from database)
  const recruiterViews = profile && profile.visibility !== 'private' ? Math.floor(Math.random() * 20) + 5 : 0;
  const profileViews = profile && profile.visibility === 'public' ? Math.floor(Math.random() * 50) + 10 : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Portfolio</h2>
          <p className="text-sm text-gray-600 mt-1">Your public professional identity</p>
        </div>
        <Link
          href="/student/portfolio"
          className="text-sm font-medium text-brand-light hover:text-brand-light/90"
        >
          View Full Portfolio →
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Portfolio Completion with Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-medium text-gray-900">Portfolio Completion</h3>
              <p className="text-xs text-gray-500 mt-1">
                Complete your portfolio to maximize visibility to recruiters
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{completionScore}%</span>
              <p className="text-xs text-gray-500">Complete</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-brand-light h-4 rounded-full transition-all"
              style={{ width: `${completionScore}%` }}
            />
          </div>

          {/* Completion Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {completionBreakdown.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  item.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={item.completed ? 'text-green-600' : 'text-gray-400'}>
                    {item.completed ? '✓' : '○'}
                  </span>
                  <span className={`text-xs font-medium ${item.completed ? 'text-green-800' : 'text-gray-600'}`}>
                    {item.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{item.points} points</p>
              </div>
            ))}
          </div>

          {completionScore < 100 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-medium text-yellow-800 mb-1">💡 Quick Wins</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                {missingSections.slice(0, 2).map((section, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{section}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Visibility Status with Statistics */}
        {profile && (
          <div className="pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-1">Profile Visibility</h3>
                <p className="text-xs text-gray-500">
                  Control who can see your portfolio
                </p>
              </div>
              <Link
                href="/student/portfolio/settings"
                className="text-sm font-medium text-brand-light hover:text-brand-light/90"
              >
                Change Settings →
              </Link>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{visibilityIcons[profile.visibility]}</span>
              <span className={`px-4 py-2 text-sm font-medium rounded-full ${visibilityColors[profile.visibility]}`}>
                {visibilityLabels[profile.visibility]}
              </span>
            </div>

            {/* Visibility Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">Profile Views</p>
                <p className="text-lg font-semibold text-gray-900">{profileViews}</p>
                <p className="text-xs text-gray-400">All time</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Recruiter Views</p>
                <p className="text-lg font-semibold text-gray-900">{recruiterViews}</p>
                <p className="text-xs text-gray-400">This month</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Project Quality</p>
                <p className="text-lg font-semibold text-gray-900">{averageProjectQuality}%</p>
                <p className="text-xs text-gray-400">Average score</p>
              </div>
            </div>
          </div>
        )}

        {/* Projects Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-gray-900">Projects Overview</h3>
            <Link
              href="/student/portfolio"
              className="text-xs font-medium text-brand-light hover:text-brand-light/90"
            >
              View All →
            </Link>
          </div>

          {/* Project Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Total Projects</p>
              <p className="text-xl font-bold text-blue-900">{projects.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 mb-1">Completed</p>
              <p className="text-xl font-bold text-green-900">{completedProjects.length}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-600 mb-1">In Progress</p>
              <p className="text-xl font-bold text-yellow-900">{projectsInProgress.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Public</p>
              <p className="text-xl font-bold text-purple-900">{publicProjects.length}</p>
            </div>
          </div>

          {/* Projects in Progress */}
          {projectsInProgress.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Projects Needing Attention</h4>
              <div className="space-y-2">
                {projectsInProgress.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/student/portfolio/${project.id}/edit`}
                    className="block p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{project.title}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${visibilityColors[project.visibility]}`}>
                            {visibilityLabels[project.visibility]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          {project.description 
                            ? `Description too short (${project.description.length} chars)` 
                            : 'Missing description'}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-brand-light">Complete →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Completed Projects */}
          {completedProjects.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Projects</h4>
              <div className="space-y-2">
                {completedProjects.slice(0, 3).map((project) => (
                  <Link
                    key={project.id}
                    href={`/student/portfolio/${project.id}/edit`}
                    className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-green-600">✓</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{project.title}</p>
                          <p className="text-xs text-gray-500">
                            {visibilityLabels[project.visibility]} • {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">Edit →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Visibility Breakdown */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Visibility Breakdown</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl mb-1">{visibilityIcons.private}</p>
              <p className="text-sm font-semibold text-gray-900">{privateProjects.length}</p>
              <p className="text-xs text-gray-500">Private</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl mb-1">{visibilityIcons.recruiters_only}</p>
              <p className="text-sm font-semibold text-blue-900">{recruiterVisibleProjects.length}</p>
              <p className="text-xs text-blue-600">Recruiters</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <p className="text-2xl mb-1">{visibilityIcons.public}</p>
              <p className="text-sm font-semibold text-green-900">{publicProjects.length}</p>
              <p className="text-xs text-green-600">Public</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link
              href="/student/portfolio/new"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
            >
              <span>+</span>
              <span>Add Project</span>
            </Link>
            
            {projects.length > 0 && (
              <Link
                href="/student/portfolio"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <span>📤</span>
                <span>Publish Project</span>
              </Link>
            )}

            {missingSections.length > 0 && (
              <Link
                href="/student/portfolio"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <span>✨</span>
                <span>Improve Portfolio</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
