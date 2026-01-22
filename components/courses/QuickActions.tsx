'use client';

import Link from 'next/link';
import { BookOpen, MessageCircle, Briefcase } from 'lucide-react';

interface QuickActionsProps {
  courseSlug: string;
  courseId?: string | null;
  isEnrolled?: boolean;
  variant?: 'sidebar' | 'mobile';
}

export function QuickActions({ courseSlug, courseId, isEnrolled, variant = 'sidebar' }: QuickActionsProps) {
  if (variant === 'mobile') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg md:hidden">
        <div className="flex items-center justify-around px-4 py-3 safe-area-inset-bottom">
          {isEnrolled ? (
            <>
              <Link
                href={`/student/courses/${courseSlug}`}
                className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 hover:text-brand-light transition-colors min-h-[44px] justify-center touch-manipulation"
                aria-label="View Course Details"
              >
                <BookOpen className="w-5 h-5" />
                <span>Course</span>
              </Link>
              <Link
                href="/student/questions"
                className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 hover:text-brand-light transition-colors min-h-[44px] justify-center touch-manipulation"
                aria-label="Ask Community"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Community</span>
              </Link>
              <Link
                href="/student/portfolio"
                className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 hover:text-brand-light transition-colors min-h-[44px] justify-center touch-manipulation"
                aria-label="View Portfolio"
              >
                <Briefcase className="w-5 h-5" />
                <span>Portfolio</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/student/courses"
                className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 hover:text-brand-light transition-colors min-h-[44px] justify-center touch-manipulation"
                aria-label="Browse Courses"
              >
                <BookOpen className="w-5 h-5" />
                <span>Browse</span>
              </Link>
              <Link
                href="/student/questions"
                className="flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 hover:text-brand-light transition-colors min-h-[44px] justify-center touch-manipulation"
                aria-label="Ask Community"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Community</span>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid gap-3 sm:grid-cols-2">
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
              className="block w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-center sm:col-span-2"
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
