'use client';

import { useEffect, useState } from 'react';

interface LessonProgressTrackerProps {
  courseId: string;
  lessonSlug: string;
  onProgressUpdate?: (status: 'started' | 'completed') => void;
}

export function LessonProgressTracker({
  courseId,
  lessonSlug,
  onProgressUpdate,
}: LessonProgressTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<'started' | 'completed' | null>(null);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Track lesson as started when component mounts
  useEffect(() => {
    const trackStarted = async () => {
      try {
        const response = await fetch('/api/progress/lesson', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId,
            lessonSlug,
            status: 'started',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentStatus(data.progress.status);
          onProgressUpdate?.(data.progress.status);
        }
      } catch (error) {
        console.error('Error tracking lesson progress:', error);
      }
    };

    trackStarted();
  }, [courseId, lessonSlug, onProgressUpdate]);

  const markAsCompleted = async () => {
    setIsMarkingComplete(true);
    try {
      const response = await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          lessonSlug,
          status: 'completed',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentStatus(data.progress.status);
        onProgressUpdate?.(data.progress.status);
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Don't render anything visible - this is a background tracker
  return (
    <>
      {currentStatus !== 'completed' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={markAsCompleted}
            disabled={isMarkingComplete}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMarkingComplete ? 'Marking...' : 'Mark as Completed'}
          </button>
        </div>
      )}
      {currentStatus === 'completed' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Lesson completed</span>
          </div>
        </div>
      )}
    </>
  );
}
