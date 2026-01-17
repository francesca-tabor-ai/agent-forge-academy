'use client';

import Link from 'next/link';

interface ProgressCardProps {
  enrollment?: {
    progress_percentage: number;
    enrolled_at: string;
  } | null;
  completedLessons: number;
  totalLessons: number;
  courseSlug: string;
  courseId?: string | null;
  nextLessonSlug?: string | null;
  firstLessonSlug?: string | null;
  isSticky?: boolean;
}

export function ProgressCard({
  enrollment,
  completedLessons,
  totalLessons,
  courseSlug,
  courseId,
  nextLessonSlug,
  firstLessonSlug,
  isSticky = false,
}: ProgressCardProps) {
  const progressPercentage = enrollment?.progress_percentage || 0;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${
        isSticky ? 'sticky top-8' : ''
      }`}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
      
      {enrollment ? (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {progressPercentage}% Complete
              </span>
              <span className="text-xs text-gray-500">
                {completedLessons} / {totalLessons} lessons
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-brand-light h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Time Spent & Remaining */}
          {totalLessons > 0 && (
            <div className="space-y-2 text-sm">
              {completedLessons > 0 && (
                <div className="flex items-center justify-between text-gray-600">
                  <span>Time spent</span>
                  <span className="font-medium">
                    {Math.round(completedLessons * 30 / 60) > 0 
                      ? `${Math.round(completedLessons * 30 / 60)}h`
                      : `${completedLessons * 30}m`
                    }
                  </span>
                </div>
              )}
              {completedLessons < totalLessons && (
                <div className="flex items-center justify-between text-gray-600">
                  <span>Est. remaining</span>
                  <span className="font-medium">
                    {Math.round((totalLessons - completedLessons) * 30 / 60) > 0
                      ? `${Math.round((totalLessons - completedLessons) * 30 / 60)}h`
                      : `${(totalLessons - completedLessons) * 30}m`
                    }
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Enrolled Date */}
          {enrollment.enrolled_at && (
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          )}

          {/* Primary CTA */}
          {totalLessons === 0 ? (
            <div className="px-4 py-2.5 bg-gray-50 text-gray-600 font-medium rounded-lg text-center text-sm sm:text-base border border-gray-200">
              No lessons available
            </div>
          ) : nextLessonSlug ? (
            <Link
              href={`/student/courses/${courseSlug}/lessons/${nextLessonSlug}`}
              className="block w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-center text-sm sm:text-base"
            >
              Continue Learning
            </Link>
          ) : completedLessons === totalLessons ? (
            <div className="px-4 py-2.5 bg-green-50 text-green-700 font-semibold rounded-lg text-center text-sm sm:text-base border border-green-200">
              Course Complete! 🎉
            </div>
          ) : (
            <Link
              href={`/student/courses/${courseSlug}/lessons/${firstLessonSlug || ''}`}
              className="block w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-center text-sm sm:text-base"
            >
              Start Course
            </Link>
          )}
        </div>
      ) : courseId ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Ready to start learning?</p>
            <p className="text-xs text-gray-500">
              {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'} available
            </p>
          </div>
          <form action={`/api/courses/enroll?course_id=${courseId}`} method="POST" className="w-full">
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm sm:text-base"
            >
              Enroll to Start
            </button>
          </form>
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          <p className="mb-2">Enroll to track your progress</p>
          <p className="text-xs text-gray-500">
            Track completion, see your stats, and pick up where you left off.
          </p>
        </div>
      )}
    </div>
  );
}
