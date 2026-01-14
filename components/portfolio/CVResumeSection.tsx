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
  isDefault?: boolean;
}

export function CVResumeSection({ studentProfileId, cvFileName, cvLastUpdated, cvVisibility, cvDownloadUrl, hasCV, isDefault = true }: CVResumeSectionProps) {
  const router = useRouter();
  const [showReplace, setShowReplace] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);

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

  const handleToggleDefault = async () => {
    setLoadingDefault(true);
    try {
      const response = await fetch('/api/portfolio/cv/default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfileId,
          isDefault: !isDefault,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update default CV');
      }

      router.refresh();
    } catch (error) {
      console.error('Error toggling default CV:', error);
      alert('Failed to update default CV');
    } finally {
      setLoadingDefault(false);
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
            className="btn-secondary text-sm w-full"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Featured Document Card */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white">
            {/* Document Icon and Info */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                  {cvFileName || 'CV.pdf'}
                </h4>
                {cvLastUpdated && (
                  <p className="text-xs text-gray-500 mb-2">
                    Uploaded {new Date(cvLastUpdated).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
                
                {/* Visibility Badge */}
                {cvVisibility && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${visibilityColors[cvVisibility]}`}>
                    {cvVisibility === 'private' && '🔒'}
                    {cvVisibility === 'recruiters_only' && '👔'}
                    {cvVisibility === 'public' && '🌐'}
                    <span className="ml-1">{visibilityLabels[cvVisibility]}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreview}
                  disabled={loadingPreview}
                  className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {loadingPreview ? 'Loading...' : 'Preview'}
                </button>
                <button
                  onClick={handleDownload}
                  className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => setShowReplace(true)}
                  className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Replace
                </button>
              </div>
            </div>
          </div>

          {/* Default CV Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={handleToggleDefault}
                  disabled={loadingDefault}
                  className="w-4 h-4 text-brand-light border-gray-300 rounded focus:ring-brand-light"
                />
                <span className="text-sm font-medium text-gray-700">Set as default CV</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Public profile preview uses this CV
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
