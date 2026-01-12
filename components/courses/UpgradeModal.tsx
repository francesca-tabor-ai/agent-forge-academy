'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  currentTier: 'essential' | null;
}

/**
 * Upgrade Modal Component
 * 
 * Displays when Essential tier users try to access locked courses.
 * Prompts them to upgrade to Professional Access.
 */
export function UpgradeModal({
  isOpen,
  onClose,
  courseTitle,
  currentTier,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Navigate to subscription page
    window.location.href = '/student/subscription';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 z-10 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-brand-light/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-brand-light"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
          Unlock {courseTitle}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          This course requires <strong>Professional Access</strong>. Upgrade your
          subscription to access this course and unlock all courses on the platform.
        </p>

        {/* Benefits List */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-900 mb-3">
            With Professional Access you get:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Access to all courses on the platform</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Unlimited course enrollments</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Priority support and updates</span>
            </li>
          </ul>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-1">Professional Access</p>
          <p className="text-3xl font-bold text-gray-900">
            £79<span className="text-lg font-normal text-gray-600">/month</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgrade}
            className="w-full bg-brand-light text-white py-3 px-4 rounded-lg font-medium hover:bg-brand-light/90 hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-200 ease-out"
          >
            Upgrade to Professional Access
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-200 ease-out"
          >
            Maybe Later
          </button>
        </div>

        {/* Link to subscription page */}
        <p className="text-xs text-gray-500 text-center mt-4">
          <Link
            href="/student/subscription"
            className="text-brand-light hover:underline"
          >
            View all subscription plans
          </Link>
        </p>
      </div>
    </div>
  );
}
