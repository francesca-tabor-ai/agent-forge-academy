'use client';

import Link from 'next/link';

interface ProfileOverviewProps {
  headline?: string | null;
  bio?: string | null;
  primaryRoles?: string[];
  coreSkills?: string[];
}

export function ProfileOverview({ headline, bio, primaryRoles = [], coreSkills = [] }: ProfileOverviewProps) {
  const hasData = headline || bio || primaryRoles.length > 0 || coreSkills.length > 0;

  if (!hasData) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Profile Overview</h2>
          <p className="text-sm text-gray-600 mb-6">
            Add your professional headline, bio, and skills to help recruiters understand your expertise.
          </p>
          <Link
            href="/student/portfolio/profile/edit"
            className="btn-primary text-sm inline-block"
          >
            Add Profile Details
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Profile Overview</h2>
        <Link
          href="/student/portfolio/profile/edit"
          className="text-sm font-medium text-brand-light hover:text-brand-light/90"
        >
          Edit →
        </Link>
      </div>

      <div className="space-y-4">
        {headline && (
          <div>
            <h3 className="text-base font-semibold text-gray-900">{headline}</h3>
          </div>
        )}

        {bio && (
          <div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{bio}</p>
          </div>
        )}

        {primaryRoles.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Primary Roles</h4>
            <div className="flex flex-wrap gap-2">
              {primaryRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {coreSkills.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Core Skills</h4>
            <div className="flex flex-wrap gap-2">
              {coreSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full border border-gray-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
