'use client';

import Link from 'next/link';

interface MobileStickyCTAProps {
  isEnrolled: boolean;
  progressPercentage?: number;
  courseSlug: string;
  courseId?: string | null;
  nextLessonSlug?: string | null;
  firstLessonSlug?: string | null;
}

export function MobileStickyCTA({
  isEnrolled,
  progressPercentage,
  courseSlug,
  courseId,
  nextLessonSlug,
  firstLessonSlug,
}: MobileStickyCTAProps) {
  if (!isEnrolled && !courseId) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {isEnrolled && progressPercentage !== undefined && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">
                {progressPercentage}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-brand-light h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
        {isEnrolled ? (
          <Link
            href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug || firstLessonSlug || ''}`}
            className="flex-shrink-0 px-6 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap"
          >
            Continue
          </Link>
        ) : (
          <form action={`/api/courses/enroll?course_id=${courseId}`} method="POST" className="flex-shrink-0">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap"
            >
              Enroll
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
