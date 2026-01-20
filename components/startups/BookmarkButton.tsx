'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface BookmarkButtonProps {
  startupId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BookmarkButton({ startupId, className = '', size = 'md' }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Load initial bookmark status
  useEffect(() => {
    const loadBookmarkStatus = async () => {
      try {
        const response = await fetch(`/api/startups/${startupId}/bookmark-status`);
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.bookmarked);
        }
      } catch (err) {
        console.error('Failed to load bookmark status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarkStatus();
  }, [startupId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;

    setIsToggling(true);
    const newBookmarked = !isBookmarked;

    try {
      const method = newBookmarked ? 'POST' : 'DELETE';
      const response = await fetch(`/api/startups/${startupId}/bookmark`, {
        method,
      });

      if (response.ok) {
        setIsBookmarked(newBookmarked);
      } else {
        console.error('Failed to toggle bookmark');
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (isLoading) {
    return (
      <button
        className={`${sizeClasses[size]} flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50 ${className}`}
        disabled
        aria-label="Loading bookmark status"
      >
        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`
        ${sizeClasses[size]} 
        flex items-center justify-center 
        border rounded-lg 
        transition-all
        focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-2
        ${isBookmarked
          ? 'bg-yellow-50 border-yellow-300 text-yellow-600 hover:bg-yellow-100'
          : 'bg-white border-gray-300 text-gray-600 hover:border-brand-light hover:bg-gray-50'
        }
        ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark startup'}
      title={isBookmarked ? 'Bookmarked' : 'Bookmark for later'}
    >
      {isBookmarked ? (
        <BookmarkCheck className={iconSizes[size]} fill="currentColor" />
      ) : (
        <Bookmark className={iconSizes[size]} />
      )}
    </button>
  );
}
