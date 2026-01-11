'use client';

import { useState, useEffect } from 'react';

type ViewMode = 'list' | 'card';

interface ViewToggleProps {
  onChange: (mode: ViewMode) => void;
  defaultMode?: ViewMode;
}

export function ViewToggle({ onChange, defaultMode = 'list' }: ViewToggleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMode);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('portfolio-view-mode') as ViewMode;
    if (saved && (saved === 'list' || saved === 'card')) {
      setViewMode(saved);
      onChange(saved);
    } else {
      onChange(defaultMode);
    }
  }, []);

  const handleToggle = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('portfolio-view-mode', mode);
    onChange(mode);
  };

  return (
    <div className="flex items-center gap-1 border border-gray-300 rounded-md p-1 bg-white">
      <button
        type="button"
        onClick={() => handleToggle('list')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          viewMode === 'list'
            ? 'bg-brand-light text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
        aria-label="List view"
      >
        List
      </button>
      <button
        type="button"
        onClick={() => handleToggle('card')}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          viewMode === 'card'
            ? 'bg-brand-light text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
        aria-label="Card view"
      >
        Cards
      </button>
    </div>
  );
}
