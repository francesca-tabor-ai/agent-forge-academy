'use client';

import Link from 'next/link';

interface QuickActionsProps {
  courseSlug: string;
  courseId?: string | null;
  isEnrolled?: boolean;
}

export function QuickActions({ courseSlug, courseId, isEnrolled }: QuickActionsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {isEnrolled ? (
          <>
            <Link
              href={`/student/courses/${courseSlug}`}
              className="block w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              View Course Details
            </Link>
            <Link
              href="/student/questions"
              className="block w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              Ask Community
            </Link>
            <Link
              href="/student/portfolio"
              className="block w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              View Portfolio
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/student/courses"
              className="block w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              Browse Courses
            </Link>
            <Link
              href="/student/questions"
              className="block w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center"
            >
              Ask Community
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
