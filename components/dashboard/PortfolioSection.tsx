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

  // Determine missing sections with specific recommendations
  const missingSections = [];
  if (!hasBio) missingSections.push('Add a professional bio (50+ characters)');
  if (projects.length < 1) missingSections.push('Create your first project');
  if (projects.length < 3) missingSections.push(`Add ${3 - projects.length} more project${3 - projects.length > 1 ? 's' : ''} (aim for 3+)`);
  if (!hasVisibleProjects) missingSections.push('Make at least 1 project visible to recruiters');

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
      </div>
    </section>
  );
}
