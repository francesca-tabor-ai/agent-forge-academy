'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Student {
  profileId: string;
  userId: string;
  studentProfileId: string;
  bio: string | null;
  headshotImageUrl: string | null;
  visibility: 'private' | 'recruiters_only' | 'public' | null;
  accessGrantedAt: string;
  accessExpiresAt: string | null;
}

interface RecruiterDashboardProps {
  students: Student[];
}

export function RecruiterDashboard({ students }: RecruiterDashboardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePreviewCV = async (studentId: string) => {
    setLoading(`preview-${studentId}`);
    setError(null);

    try {
      const response = await fetch(
        `/api/recruiter/cv/signed-url?studentId=${studentId}&kind=preview`
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to get CV preview URL');
      }

      const { url } = await response.json();
      
      // Open in new tab
      window.open(url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview CV');
      console.error('Error previewing CV:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleDownloadCV = async (studentId: string) => {
    setLoading(`download-${studentId}`);
    setError(null);

    try {
      // Redirect to download endpoint (it will redirect to signed URL)
      window.location.href = `/api/recruiter/cv/signed-url?studentId=${studentId}&kind=download`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download CV');
      console.error('Error downloading CV:', err);
    } finally {
      // Note: We don't clear loading here because we're redirecting
    }
  };

  if (students.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 mb-2">No students with CV access yet.</p>
        <p className="text-sm text-gray-500">
          Students will appear here once you have been granted access to their CVs.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {students.map((student) => {
          const isPreviewLoading = loading === `preview-${student.userId}`;
          const isDownloadLoading = loading === `download-${student.userId}`;
          const isLoading = isPreviewLoading || isDownloadLoading;

          return (
            <div
              key={student.studentProfileId}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {student.headshotImageUrl && (
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                        <Image
                          src={student.headshotImageUrl}
                          alt="Student headshot"
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-medium text-gray-900">Student Profile</h3>
                      {student.visibility && (
                        <span className="text-xs text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded">
                          {student.visibility.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {student.bio && (
                      <p className="text-sm text-gray-700 leading-relaxed mb-2">{student.bio}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      Access granted: {new Date(student.accessGrantedAt).toLocaleDateString()}
                      {student.accessExpiresAt && (
                        <span className="ml-2">
                          • Expires: {new Date(student.accessExpiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handlePreviewCV(student.userId)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPreviewLoading ? 'Loading...' : 'Preview CV'}
                </button>
                <button
                  onClick={() => handleDownloadCV(student.userId)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloadLoading ? 'Downloading...' : 'Download CV'}
                </button>
                <Link
                  href={`/portfolio/${student.studentProfileId}`}
                  className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View Portfolio →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
