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
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Visibility</h3>
        {!isComplete && (
          <Link
            href="/student/portfolio/profile/edit"
            className="text-xs font-medium text-brand-light hover:text-brand-light/90"
          >
            Edit
          </Link>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{visibilityIcons[currentVisibility]}</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-900 mb-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${visibilityColors[currentVisibility]}`}>
                {visibilityLabels[currentVisibility]}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              {currentVisibility === 'private' && 'Not visible to recruiters'}
              {currentVisibility === 'recruiters_only' && 'Visible to recruiters only'}
              {currentVisibility === 'public' && 'Publicly visible'}
            </p>
          </div>
        </div>

        {/* Compact Checklist */}
        <div className="pt-3 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Checklist</h4>
          <ul className="space-y-1.5">
            {checklistItems.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {item.completed ? (
                    <span className="text-green-600 text-sm">✓</span>
                  ) : (
                    <span className="text-gray-300 text-sm">○</span>
                  )}
                  <span className={`text-xs ${item.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </div>
                {!item.completed && (
                  <Link
                    href={item.fixLink}
                    className="text-xs text-brand-light hover:text-brand-light/90"
                  >
                    Fix
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {isComplete && (
          <div className="p-2.5 bg-green-50 border border-green-200 rounded text-xs text-green-800">
            ✨ Profile complete and discoverable!
          </div>
        )}
      </div>
    </section>
  );
}
