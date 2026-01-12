'use client';

import { useEffect, useState } from 'react';

interface LessonCompletionButtonProps {
  lessonId: string; // lesson slug
}

export function LessonCompletionButton({ lessonId }: LessonCompletionButtonProps) {
  const [completed, setCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Fetch completion status on page load
  useEffect(() => {
    const fetchCompletionStatus = async () => {
      try {
        const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/complete`);
        
        if (response.ok) {
          const data = await response.json();
          setCompleted(data.completed || false);
        }
      } catch (error) {
        console.error('Error fetching lesson completion status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompletionStatus();
  }, [lessonId]);

  const handleMarkAsCompleted = async () => {
    setIsMarkingComplete(true);
    try {
      const response = await fetch(`/api/lessons/${encodeURIComponent(lessonId)}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompleted(data.completed || false);
      } else {
        console.error('Failed to mark lesson as completed');
      }
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed text-sm font-medium"
        >
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <button
        onClick={handleMarkAsCompleted}
        disabled={completed || isMarkingComplete}
        className={
          completed
            ? 'px-4 py-2 bg-green-600 text-white rounded-lg cursor-default text-sm font-medium'
            : 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
        }
      >
        {completed ? 'Completed ✓' : isMarkingComplete ? 'Marking...' : 'Mark as Completed'}
      </button>
    </div>
  );
}
