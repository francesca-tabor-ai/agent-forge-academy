'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PortfolioError({ error, reset }: ErrorProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log error for debugging with digest for tracking
    console.error('Portfolio page error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      name: error.name,
    });
    
    // If we have a digest, we can track this error
    if (error.digest) {
      // Log to console with error ID for support
      console.error(`[Portfolio Error] Error ID: ${error.digest}`);
    }
  }, [error]);

  const copyErrorId = async () => {
    if (error.digest) {
      try {
        await navigator.clipboard.writeText(error.digest);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy error ID:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
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
          <div className="w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              We encountered an error while loading your portfolio.
            </p>
            
            {/* Error ID with copy button */}
            {error.digest && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Error ID
                  </label>
                  <button
                    onClick={copyErrorId}
                    className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 bg-white border border-gray-300 rounded text-sm font-mono text-gray-800 break-all">
                  {error.digest}
                </div>
                <p className="mt-2 text-xs text-gray-500 text-left">
                  Please send this Error ID to support if the problem persists.
                </p>
              </div>
            )}
            
            {/* Show full error message in development only */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-xs text-left font-mono text-gray-800 break-words">
                <strong>Error:</strong> {error.message}
              </div>
            )}
            
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Retry
              </button>
              <button
                onClick={() => router.push('/student/dashboard')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
