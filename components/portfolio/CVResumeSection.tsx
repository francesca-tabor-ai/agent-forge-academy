'use client';

import Link from 'next/link';

interface CVResumeSectionProps {
  cvFileName?: string | null;
  cvLastUpdated?: string | null;
  cvVisibility?: 'private' | 'recruiters_only' | 'public' | null;
  hasCV: boolean;
}

export function CVResumeSection({ cvFileName, cvLastUpdated, cvVisibility, hasCV }: CVResumeSectionProps) {
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

  if (!hasCV) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">CV & Resume</h2>
        </div>
        <div className="text-center py-6">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-sm text-gray-600 mb-6">No CV uploaded</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="btn-primary text-sm"
              onClick={() => {
                // TODO: Implement CV upload
                alert('CV upload coming soon');
              }}
            >
              Upload CV
            </button>
            <button
              className="btn-secondary text-sm"
              onClick={() => {
                // TODO: Implement CV generation from portfolio
                alert('CV generation coming soon');
              }}
            >
              Generate CV from Portfolio
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">CV & Resume</h2>
        <div className="flex items-center gap-3">
          <button
            className="text-sm font-medium text-brand-light hover:text-brand-light/90"
            onClick={() => {
              // TODO: Implement CV edit/regenerate
              alert('CV edit coming soon');
            }}
          >
            Edit / Regenerate
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{cvFileName || 'CV.pdf'}</p>
                {cvLastUpdated && (
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(cvLastUpdated).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {cvVisibility && (
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${visibilityColors[cvVisibility]}`}>
                {visibilityLabels[cvVisibility]}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
          <button
            className="btn-secondary text-sm"
            onClick={() => {
              // TODO: Implement CV download
              alert('CV download coming soon');
            }}
          >
            Download
          </button>
          <button
            className="btn-secondary text-sm"
            onClick={() => {
              // TODO: Implement set as primary
              alert('Set as primary coming soon');
            }}
          >
            Set as Primary
          </button>
        </div>
      </div>
    </section>
  );
}
