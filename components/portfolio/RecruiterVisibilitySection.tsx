'use client';

import Link from 'next/link';

interface RecruiterVisibilitySectionProps {
  currentVisibility: 'private' | 'recruiters_only' | 'public';
  hasBio: boolean;
  hasCV: boolean;
  projectCount: number;
  visibleProjectCount: number;
}

export function RecruiterVisibilitySection({
  currentVisibility,
  hasBio,
  hasCV,
  projectCount,
  visibleProjectCount,
}: RecruiterVisibilitySectionProps) {
  const visibilityLabels: Record<string, string> = {
    private: 'Private',
    recruiters_only: 'Recruiters Only',
    public: 'Public',
  };

  const visibilityIcons: Record<string, string> = {
    private: '🔒',
    recruiters_only: '👔',
    public: '🌐',
  };

  const visibilityColors: Record<string, string> = {
    private: 'bg-gray-100 text-gray-700',
    recruiters_only: 'bg-blue-100 text-blue-700',
    public: 'bg-green-100 text-green-700',
  };

  const missingItems: string[] = [];
  if (!hasBio) missingItems.push('Bio');
  if (!hasCV) missingItems.push('CV');
  if (projectCount < 2) missingItems.push(`${2 - projectCount} more project${2 - projectCount > 1 ? 's' : ''}`);
  if (visibleProjectCount === 0) missingItems.push('At least 1 visible project');

  const recruiterCanSee: string[] = [];
  if (currentVisibility !== 'private') {
    recruiterCanSee.push('Your profile');
    if (hasBio) recruiterCanSee.push('Your bio');
    if (hasCV) recruiterCanSee.push('Your CV');
    if (visibleProjectCount > 0) recruiterCanSee.push(`${visibleProjectCount} project${visibleProjectCount > 1 ? 's' : ''}`);
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recruiter Visibility</h2>
        {missingItems.length > 0 && (
          <Link
            href="/student/portfolio"
            className="text-sm font-medium text-brand-light hover:text-brand-light/90"
          >
            Improve Visibility →
          </Link>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{visibilityIcons[currentVisibility]}</span>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Current visibility: <span className={`px-3 py-1 text-xs font-medium rounded-full ${visibilityColors[currentVisibility]}`}>
                {visibilityLabels[currentVisibility]}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {currentVisibility === 'private' && 'Your profile is not visible to recruiters'}
              {currentVisibility === 'recruiters_only' && 'Only verified recruiters can see your profile'}
              {currentVisibility === 'public' && 'Your profile is publicly visible'}
            </p>
          </div>
        </div>

        {currentVisibility !== 'private' && recruiterCanSee.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">What recruiters can see:</h3>
            <ul className="space-y-1">
              {recruiterCanSee.map((item, idx) => (
                <li key={idx} className="text-sm text-blue-700 flex items-center gap-2">
                  <span className="text-blue-500">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {missingItems.length > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">What's missing to be discoverable:</h3>
            <ul className="space-y-1">
              {missingItems.map((item, idx) => (
                <li key={idx} className="text-sm text-yellow-700 flex items-center gap-2">
                  <span className="text-yellow-600">○</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {missingItems.length === 0 && currentVisibility !== 'private' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✨ Your profile is complete and discoverable by recruiters!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
