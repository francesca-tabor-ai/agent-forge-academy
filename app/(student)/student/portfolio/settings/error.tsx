'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PortfolioSettingsError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log error for debugging
    console.error('Portfolio settings page error:', error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-red-600">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              We encountered an error while loading portfolio settings.
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs text-left font-mono text-gray-800">
                <strong>Error:</strong> {error.message}
                {error.digest && (
                  <div className="mt-1">
                    <strong>Digest:</strong> {error.digest}
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Try again
              </button>
              <button
                onClick={() => router.push('/student/portfolio')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Back to Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
