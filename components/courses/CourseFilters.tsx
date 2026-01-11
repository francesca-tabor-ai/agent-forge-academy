'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseMetadata } from '@/lib/course-metadata';

type Course = {
  id: string | null;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  duration_weeks: number | null;
  difficulty_level: string | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  hasContent: boolean;
  metadata?: CourseMetadata;
};

interface CourseFiltersProps {
  courses: Array<Course>;
  onFilteredCoursesChange: (filtered: Array<Course>) => void;
}

const TRACKS = [
  'Vibe Engineering',
  'Agentic Systems',
  'AI Search & Viability',
  'Shopping & E-Commerce',
  'Media & Content Ops',
  'Trust & Regulation',
];

const DURATION_OPTIONS = [
  { value: '0-4h', label: '0–4 hours' },
  { value: '4-8h', label: '4–8 hours' },
  { value: '8-12h', label: '8–12 hours' },
  { value: 'weeks', label: 'Weeks' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'unspecified', label: 'Not specified' },
];

const BEST_FOR_OPTIONS = [
  'Engineer',
  'Tech Lead',
  'PM',
  'Founder',
  'Marketer',
  'Content Team',
  'Data Team',
  'Growth Team',
  'Sales Team',
  'CX Team',
];

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'shortest', label: 'Shortest → Longest' },
  { value: 'longest', label: 'Longest → Shortest' },
  { value: 'newest', label: 'Newest' },
  { value: 'track', label: 'Track A–Z' },
];

export function CourseFilters({ courses, onFilteredCoursesChange }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTracks, setSelectedTracks] = useState<string[]>(
    searchParams.get('tracks')?.split(',').filter(Boolean) || []
  );
  const [duration, setDuration] = useState(searchParams.get('duration') || '');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || '');
  const [selectedBestFor, setSelectedBestFor] = useState<string[]>(
    searchParams.get('bestFor')?.split(',').filter(Boolean) || []
  );
  const [sort, setSort] = useState(searchParams.get('sort') || 'recommended');
  const [isExpanded, setIsExpanded] = useState(false);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedTracks.length > 0) params.set('tracks', selectedTracks.join(','));
    if (duration) params.set('duration', duration);
    if (difficulty) params.set('difficulty', difficulty);
    if (selectedBestFor.length > 0) params.set('bestFor', selectedBestFor.join(','));
    if (sort && sort !== 'recommended') params.set('sort', sort);

    // Update URL without navigation
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);

    // Save to localStorage
    localStorage.setItem('courseFilters', JSON.stringify({
      search,
      selectedTracks,
      duration,
      difficulty,
      selectedBestFor,
      sort,
    }));
  }, [search, selectedTracks, duration, difficulty, selectedBestFor, sort]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('courseFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSearch(parsed.search || '');
        setSelectedTracks(parsed.selectedTracks || []);
        setDuration(parsed.duration || '');
        setDifficulty(parsed.difficulty || '');
        setSelectedBestFor(parsed.selectedBestFor || []);
        setSort(parsed.sort || 'recommended');
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((course) => {
        const title = course.metadata?.title || course.title || '';
        const track = course.metadata?.category || '';
        const bestFor = course.metadata?.bestFor || '';
        return (
          title.toLowerCase().includes(searchLower) ||
          track.toLowerCase().includes(searchLower) ||
          bestFor.toLowerCase().includes(searchLower)
        );
      });
    }

    // Track filter
    if (selectedTracks.length > 0) {
      filtered = filtered.filter((course) => {
        const track = course.metadata?.category || '';
        return selectedTracks.includes(track);
      });
    }

    // Duration filter
    if (duration) {
      filtered = filtered.filter((course) => {
        const time = course.metadata?.time || '';
        if (duration === '0-4h') {
          return time.includes('0–4') || time.includes('2–4') || time.includes('3–5');
        } else if (duration === '4-8h') {
          return time.includes('4–8') || time.includes('4–6') || time.includes('4–10');
        } else if (duration === '8-12h') {
          return time.includes('8–12') || time.includes('6–12');
        } else if (duration === 'weeks') {
          return time.includes('week') || time.includes('Week');
        }
        return true;
      });
    }

    // Difficulty filter
    if (difficulty) {
      filtered = filtered.filter((course) => {
        if (difficulty === 'unspecified') {
          return !course.difficulty_level;
        }
        return course.difficulty_level?.toLowerCase() === difficulty.toLowerCase();
      });
    }

    // Best For filter
    if (selectedBestFor.length > 0) {
      filtered = filtered.filter((course) => {
        const bestFor = course.metadata?.bestFor || '';
        return selectedBestFor.some((bf) => bestFor.toLowerCase().includes(bf.toLowerCase()));
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sort === 'shortest') {
        const timeA = a.metadata?.time || '';
        const timeB = b.metadata?.time || '';
        // Extract numeric values for comparison
        const numA = extractTimeValue(timeA);
        const numB = extractTimeValue(timeB);
        return numA - numB;
      } else if (sort === 'longest') {
        const timeA = a.metadata?.time || '';
        const timeB = b.metadata?.time || '';
        const numA = extractTimeValue(timeA);
        const numB = extractTimeValue(timeB);
        return numB - numA;
      } else if (sort === 'newest') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      } else if (sort === 'track') {
        const trackA = a.metadata?.category || '';
        const trackB = b.metadata?.category || '';
        return trackA.localeCompare(trackB);
      }
      // Recommended (default) - keep original order
      return 0;
    });

    return filtered;
  }, [courses, search, selectedTracks, duration, difficulty, selectedBestFor, sort]);

  // Notify parent of filtered courses
  useEffect(() => {
    onFilteredCoursesChange(filteredCourses);
  }, [filteredCourses, onFilteredCoursesChange]);

  const toggleTrack = (track: string) => {
    setSelectedTracks((prev) =>
      prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]
    );
  };

  const toggleBestFor = (bestFor: string) => {
    setSelectedBestFor((prev) =>
      prev.includes(bestFor) ? prev.filter((b) => b !== bestFor) : [...prev, bestFor]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTracks([]);
    setDuration('');
    setDifficulty('');
    setSelectedBestFor([]);
    setSort('recommended');
  };

  const hasActiveFilters =
    search || selectedTracks.length > 0 || duration || difficulty || selectedBestFor.length > 0;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search courses by title, track, or 'Best For'..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
          />
        </div>

        {/* Expandable Filters */}
        <div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>Filters & Sort</span>
            <span>{isExpanded ? '▲' : '▼'}</span>
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
              {/* Tracks (Multi-select) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Track</label>
                <div className="flex flex-wrap gap-2">
                  {TRACKS.map((track) => (
                    <button
                      key={track}
                      type="button"
                      onClick={() => toggleTrack(track)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedTracks.includes(track)
                          ? 'bg-brand-light text-white border-brand-light'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {track}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration (Single-select) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDuration(duration === option.value ? '' : option.value)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        duration === option.value
                          ? 'bg-brand-light text-white border-brand-light'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty (Single-select) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficulty(difficulty === option.value ? '' : option.value)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        difficulty === option.value
                          ? 'bg-brand-light text-white border-brand-light'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Best For (Multi-select) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Best For</label>
                <div className="flex flex-wrap gap-2">
                  {BEST_FOR_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleBestFor(option)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedBestFor.includes(option)
                          ? 'bg-brand-light text-white border-brand-light'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </div>
    </div>
  );
}

// Helper function to extract numeric time value for sorting
function extractTimeValue(timeStr: string): number {
  // Extract hours or weeks
  const hoursMatch = timeStr.match(/(\d+)[–-](\d+)\s*hours?/i);
  if (hoursMatch) {
    return parseInt(hoursMatch[2] || hoursMatch[1], 10);
  }
  const singleHourMatch = timeStr.match(/(\d+)\s*hours?/i);
  if (singleHourMatch) {
    return parseInt(singleHourMatch[1], 10);
  }
  const weeksMatch = timeStr.match(/(\d+)\s*weeks?/i);
  if (weeksMatch) {
    return parseInt(weeksMatch[1], 10) * 40; // Convert weeks to approximate hours
  }
  return 0;
}
