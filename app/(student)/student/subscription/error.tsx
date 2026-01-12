'use client';

/**
 * Error boundary for subscription page
 * 
 * Displays friendly error messages and provides retry functionality
 */

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SubscriptionError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Subscription page error:', error);
  }, [error]);

  return (
    <div className="space-y-8 authenticated-app">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your plan and billing</p>
      </div>

      {/* Error Message */}
      <div className="rounded-lg bg-red-50 border border-red-200 p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Unable to load subscription data
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                We encountered an error while loading your subscription information.
                This could be due to a temporary issue with our servers or your connection.
              </p>
              {error.message && (
                <p className="mt-2 font-mono text-xs bg-red-100 p-2 rounded">
                  {error.message}
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/student/dashboard"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/student/subscription"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Refresh Page
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Need help?
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          If this problem persists, please contact our support team.
        </p>
        <div className="flex gap-3">
          <Link
            href="mailto:support@example.com"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
          >
            Contact Support
          </Link>
          <span className="text-blue-300">•</span>
          <Link
            href="/help"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
          >
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
