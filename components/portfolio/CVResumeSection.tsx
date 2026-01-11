'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CVUpload } from './CVUpload';

interface CVResumeSectionProps {
  studentProfileId: string;
  cvFileName?: string | null;
  cvLastUpdated?: string | null;
  cvVisibility?: 'private' | 'recruiters_only' | 'public' | null;
  hasCV: boolean;
}

export function CVResumeSection({ studentProfileId, cvFileName, cvLastUpdated, cvVisibility, hasCV }: CVResumeSectionProps) {
  const router = useRouter();
  const [showReplace, setShowReplace] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

  const handlePreview = async () => {
    setLoadingPreview(true);
    try {
      const response = await fetch(`/api/portfolio/cv/preview?studentProfileId=${studentProfileId}`);
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      } else {
        alert('Failed to preview CV');
      }
    } catch (err) {
      alert('Failed to preview CV');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/portfolio/cv/download?studentProfileId=${studentProfileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = cvFileName || 'CV.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download CV');
      }
    } catch (err) {
      alert('Failed to download CV');
    }
  };

  if (!hasCV) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">CV & Resume</h2>
        </div>
        <div className="text-center py-6">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-sm text-gray-600 mb-2 font-medium">No CV uploaded</p>
          <p className="text-xs text-gray-500 mb-6">
            Profiles with a CV get more recruiter outreach.
          </p>
          <div className="flex flex-col items-center gap-3">
            <CVUpload
              studentProfileId={studentProfileId}
              onUploadSuccess={() => router.refresh()}
            />
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
        {!showReplace && (
          <button
            onClick={() => setShowReplace(true)}
            className="text-sm font-medium text-brand-light hover:text-brand-light/90"
          >
            Replace →
          </button>
        )}
      </div>

      {showReplace ? (
        <div className="space-y-4">
          <CVUpload
            studentProfileId={studentProfileId}
            onUploadSuccess={() => {
              setShowReplace(false);
              router.refresh();
            }}
          />
          <button
            onClick={() => setShowReplace(false)}
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{cvFileName || 'CV.pdf'}</p>
                  {cvLastUpdated && (
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(cvLastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {cvVisibility && (
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mt-2 ${visibilityColors[cvVisibility]}`}>
                  {visibilityLabels[cvVisibility]}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
            <button
              onClick={handlePreview}
              disabled={loadingPreview}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPreview ? 'Loading...' : 'Preview'}
            </button>
            <button
              onClick={handleDownload}
              className="btn-secondary text-sm"
            >
              Download
            </button>
            <button
              onClick={() => setShowReplace(true)}
              className="btn-secondary text-sm"
            >
              Replace
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
