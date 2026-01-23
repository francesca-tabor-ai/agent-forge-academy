'use client';

import Link from 'next/link';

interface MobileStickyCTAProps {
  isEnrolled: boolean;
  progressPercentage?: number;
  courseSlug: string;
  courseId?: string | null;
  nextLessonSlug?: string | null;
  firstLessonSlug?: string | null;
  nextLessonTitle?: string | null;
}

export function MobileStickyCTA({
  isEnrolled,
  progressPercentage,
  courseSlug,
  courseId,
  nextLessonSlug,
  firstLessonSlug,
  nextLessonTitle,
}: MobileStickyCTAProps) {
  if (!isEnrolled && !courseId) {
    return null;
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-background/90 backdrop-blur shadow-lg z-40 safe-area-inset-bottom">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEnrolled && nextLessonTitle && (
            <div className="text-xs sm:text-sm text-gray-600 truncate">
              Next up: <span className="font-medium text-gray-900">{nextLessonTitle}</span>
            </div>
          )}
          {isEnrolled && progressPercentage !== undefined && !nextLessonTitle && (
            <div className="text-xs sm:text-sm text-gray-600">
              {progressPercentage}% Complete
            </div>
          )}
          {!isEnrolled && (
            <div className="text-xs sm:text-sm text-gray-600">
              Ready to start?
            </div>
          )}
        </div>
        {isEnrolled ? (
          <Link
            href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug || firstLessonSlug || ''}`}
            className="flex-shrink-0 px-6 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap"
          >
            Continue →
          </Link>
        ) : (
          <form action={`/api/courses/enroll?course_id=${courseId}`} method="POST" className="flex-shrink-0">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm whitespace-nowrap"
            >
              Enroll →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
