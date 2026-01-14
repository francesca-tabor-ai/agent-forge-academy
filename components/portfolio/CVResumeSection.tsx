'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CVUpload } from './CVUpload';

interface CVResumeSectionProps {
  studentProfileId: string;
  cvFileName?: string | null;
  cvLastUpdated?: string | null;
  cvVisibility?: 'private' | 'recruiters_only' | 'public' | null;
  cvDownloadUrl?: string | null;
  hasCV: boolean;
}

export function CVResumeSection({ studentProfileId, cvFileName, cvLastUpdated, cvVisibility, cvDownloadUrl, hasCV }: CVResumeSectionProps) {
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
    // If we have a direct download URL (signed URL for private or public URL), use it
    if (cvDownloadUrl) {
      const a = document.createElement('a');
      a.href = cvDownloadUrl;
      a.download = cvFileName || 'CV.pdf';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Fallback to API endpoint if no direct URL available
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
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">CV & Resume</h3>
        </div>
        <div className="text-center py-4">
          <div className="text-3xl mb-3">📄</div>
          <p className="text-xs text-gray-600 mb-3">
            Upload your CV to increase visibility
          </p>
          <CVUpload
            onUploadSuccess={() => router.refresh()}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">CV & Resume</h3>
        {!showReplace && (
          <button
            onClick={() => setShowReplace(true)}
            className="text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            Replace
          </button>
        )}
      </div>

      {showReplace ? (
        <div className="space-y-4">
          <CVUpload
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
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-xl">📄</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{cvFileName || 'CV.pdf'}</p>
              {cvLastUpdated && (
                <p className="text-xs text-gray-500">
                  {new Date(cvLastUpdated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
            {cvVisibility && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${visibilityColors[cvVisibility]}`}>
                {visibilityLabels[cvVisibility]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePreview}
              disabled={loadingPreview}
              className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingPreview ? 'Loading...' : 'Preview'}
            </button>
            <button
              onClick={handleDownload}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Download
            </button>
            <button
              onClick={() => setShowReplace(true)}
              className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5"
            >
              Replace
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
