'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

interface CoursePaywallProps {
  courseTitle: string;
  courseSlug: string;
  segments: Array<{
    type: 'track' | 'industry' | 'role';
    key: string;
    displayName: string;
  }>;
}

export function CoursePaywall({ courseTitle, courseSlug, segments }: CoursePaywallProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-full p-4">
              <Lock className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4 font-playfair">
            Unlock {courseTitle}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            This course requires a subscription. Choose a subscription plan that includes this course.
          </p>

          {/* Segment Options */}
          {segments.length > 0 ? (
            <div className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">
                Unlock with subscription:
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {segments.slice(0, 3).map((segment) => (
                  <Link
                    key={`${segment.type}-${segment.key}`}
                    href={`/landing/${segment.type}/${segment.key}`}
                    className="block p-6 border-2 border-gray-200 rounded-lg hover:border-brand-yellow hover:shadow-md transition-all card-interactive"
                  >
                    <div className="text-left">
                      <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                        {segment.type === 'track' ? 'Track' : segment.type === 'industry' ? 'Industry' : 'Role'}
                      </div>
                      <h3 className="text-xl font-bold text-brand-dark mb-2 font-playfair">
                        {segment.displayName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Includes this course and more
                      </p>
                      <div className="text-brand-yellow font-semibold">
                        View Subscription →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-gray-600">
                No subscription plans available for this course at the moment.
              </p>
            </div>
          )}

          {/* Alternative Actions */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Already have a subscription? Make sure you&apos;re logged in with the correct account.
            </p>
            <Link
              href="/student/courses"
              className="text-brand-light hover:text-brand-dark font-medium"
            >
              ← Back to Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
