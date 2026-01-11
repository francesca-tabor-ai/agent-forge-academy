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

  // Checklist items with fix actions
  const checklistItems = [
    {
      label: 'Bio present',
      completed: hasBio,
      fixLink: '/student/portfolio/profile/edit',
      fixAction: 'Add bio',
    },
    {
      label: 'CV uploaded',
      completed: hasCV,
      fixLink: '/student/portfolio#cv-section',
      fixAction: 'Upload CV',
    },
    {
      label: '≥1 Public project',
      completed: visibleProjectCount >= 1,
      fixLink: '/student/portfolio/new',
      fixAction: 'Add project',
    },
  ];

  const missingItems = checklistItems.filter(item => !item.completed);
  const isComplete = missingItems.length === 0 && currentVisibility !== 'private';

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Recruiter Visibility</h2>
        {!isComplete && (
          <Link
            href="/student/portfolio/profile/edit"
            className="btn-primary text-sm"
          >
            Make me discoverable
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

        {/* Checklist */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Discoverability Checklist</h3>
          <ul className="space-y-2">
            {checklistItems.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.completed ? (
                    <span className="text-green-600 text-lg">✓</span>
                  ) : (
                    <span className="text-gray-400 text-lg">○</span>
                  )}
                  <span className={`text-sm ${item.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
                {!item.completed && (
                  <Link
                    href={item.fixLink}
                    className="text-xs font-medium text-brand-light hover:text-brand-light/90"
                  >
                    {item.fixAction} →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isComplete && (
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
