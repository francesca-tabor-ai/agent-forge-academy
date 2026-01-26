'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CourseMetadata } from '@/lib/course-metadata';
import { INDUSTRIES } from '@/lib/utils/industries';
import { normalizeBestFor } from '@/lib/utils';

type Course = {
  id: string | null;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl?: string | null; // camelCase (preferred)
  thumbnail_url?: string | null; // snake_case (for backward compatibility with DB queries)
  imageUrl?: string | null;
  duration_weeks: number | null;
  difficulty_level: string | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
  hasContent: boolean;
  industries: string[];
  category?: string;
  metadata?: CourseMetadata;
};

interface CourseFiltersProps {
  courses: Array<Course>;
  onFilteredCoursesChange: (filtered: Array<Course>) => void;
}

const TRACKS = [
  'Vibe Engineering',
  'Agentic Systems',
  'AI Search & Visibility',
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
  'Engineers',
  'Product Managers',
  'Data Scientists',
  'Marketers',
  'Founders',
  'E-Commerce Operators',
  'Content Teams',
  'Growth Teams',
  'Sales Teams',
  'ML Engineers',
  'AI Engineers',
  'Operations Teams',
  'RevOps',
  'Analysts',
  'Creative Teams',
];

const SORT_OPTIONS = [
  { value: 'track', label: 'Track A–Z' },
  { value: 'course', label: 'Course Name A–Z' },
  { value: 'recommended', label: 'Recommended' },
  { value: 'shortest', label: 'Shortest → Longest' },
  { value: 'longest', label: 'Longest → Shortest' },
  { value: 'newest', label: 'Newest' },
];

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

// Helper function to check if a course matches a "Best For" option
function courseMatchesBestForOption(
  normalizedBestFor: string[],
  track: string | undefined,
  option: string
): boolean {
  const bestForStr = normalizedBestFor.join(' ').toLowerCase();
  const optionLower = option.toLowerCase();
  
  // Direct match
  if (bestForStr.includes(optionLower) || optionLower.includes(bestForStr)) {
    return true;
  }
  
  // Special matching rules for each option
  const matchRules: Record<string, string[]> = {
    'Engineers': ['engineer', 'developer', 'tech lead', 'architect'],
    'Product Managers': ['product manager', 'pm'],
    'Data Scientists': ['data scientist', 'data analyst'],
    'Marketers': ['marketer', 'marketing', 'cmo', 'marketing director'],
    'Founders': ['founder', 'founders'],
    'E-Commerce Operators': ['e-commerce', 'ecommerce', 'amazon seller', 'e-commerce operator'],
    'Content Teams': ['content', 'content team', 'content strategist'],
    'Growth Teams': ['growth', 'growth team', 'growth ops'],
    'Sales Teams': ['sales', 'sales team', 'sales leader'],
    'ML Engineers': ['ml engineer', 'machine learning'],
    'AI Engineers': ['ai engineer', 'artificial intelligence'],
    'Operations Teams': ['operations', 'ops', 'operations manager'],
    'RevOps': ['revops', 'revenue operations', 'rev ops'],
    'Analysts': ['analyst', 'data analyst', 'business analyst'],
    'Creative Teams': ['creative', 'creative team', 'designer'],
  };
  
  const keywords = matchRules[option] || [optionLower];
  return keywords.some(keyword => bestForStr.includes(keyword)) || 
         (option === 'Creative Teams' && track === 'Creative AI');
}

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
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    searchParams.get('industries')?.split(',').filter(Boolean) || []
  );
  // Default sort to 'track' so courses are organized by track, not grouped by industry
  const [sort, setSort] = useState<'track' | 'course' | 'recommended' | 'shortest' | 'longest' | 'newest'>(
    (searchParams.get('sort') as any) || 'track'
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedTracks.length > 0) params.set('tracks', selectedTracks.join(','));
    if (duration) params.set('duration', duration);
    if (difficulty) params.set('difficulty', difficulty);
    if (selectedBestFor.length > 0) params.set('bestFor', selectedBestFor.join(','));
    if (selectedIndustries.length > 0) params.set('industries', selectedIndustries.join(','));
    if (sort && sort !== 'track') params.set('sort', sort);

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
      selectedIndustries,
      sort,
    }));
  }, [search, selectedTracks, duration, difficulty, selectedBestFor, selectedIndustries, sort]);

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
        setSelectedIndustries(parsed.selectedIndustries || []);
        setSort(parsed.sort || 'track');
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
        const normalizedBestFor = normalizeBestFor(course.metadata?.bestFor);
        const bestForStr = normalizedBestFor.join(' ');
        return (
          title.toLowerCase().includes(searchLower) ||
          track.toLowerCase().includes(searchLower) ||
          bestForStr.toLowerCase().includes(searchLower)
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
        // Normalize the course's bestFor field to an array
        const normalizedBestFor = normalizeBestFor(course.metadata?.bestFor);
        const track = course.metadata?.category || '';
        
        // Check if any selected "Best For" option matches the course
        return selectedBestFor.some((selectedBf) => {
          return courseMatchesBestForOption(normalizedBestFor, track, selectedBf);
        });
      });
    }

    // Industry filter
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter((course) => {
        const courseIndustries = course.industries || course.metadata?.industries || [];
        return courseIndustries.some((industry) => selectedIndustries.includes(industry));
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
        const trackCompare = trackA.localeCompare(trackB);
        // If tracks are the same, sort by course name A-Z
        if (trackCompare !== 0) return trackCompare;
        const titleA = a.metadata?.title || a.title || '';
        const titleB = b.metadata?.title || b.title || '';
        return titleA.localeCompare(titleB);
      } else if (sort === 'course') {
        const titleA = a.metadata?.title || a.title || '';
        const titleB = b.metadata?.title || b.title || '';
        return titleA.localeCompare(titleB);
      }
      // Recommended (default) - keep original order
      return 0;
    });

    return filtered;
  }, [courses, search, selectedTracks, duration, difficulty, selectedBestFor, selectedIndustries, sort]);

  // Notify parent of filtered courses
  useEffect(() => {
    onFilteredCoursesChange(filteredCourses);
  }, [filteredCourses, onFilteredCoursesChange]);

  // Compute available filters based on courses
  const availableFilters = useMemo(() => {
    const availableTracks = new Set<string>();
    const availableBestFor = new Set<string>();
    const availableIndustries = new Set<string>();
    const availableDurations = new Set<string>();
    const availableDifficulties = new Set<string>();

    courses.forEach((course) => {
      // Tracks
      const track = course.metadata?.category || course.category;
      if (track) {
        availableTracks.add(track);
      }

      // Best For - check which of the fixed options match this course
      const rawBestFor = course.metadata?.bestFor;
      const normalizedBestFor = normalizeBestFor(rawBestFor);
      
      BEST_FOR_OPTIONS.forEach((option) => {
        if (courseMatchesBestForOption(normalizedBestFor, track, option)) {
          availableBestFor.add(option);
        }
      });

      // Industries
      const courseIndustries = course.industries || course.metadata?.industries || [];
      courseIndustries.forEach((industry) => {
        if (industry) availableIndustries.add(industry);
      });

      // Duration
      const time = course.metadata?.time || '';
      if (time) {
        if (time.includes('0–4') || time.includes('2–4') || time.includes('3–5')) {
          availableDurations.add('0-4h');
        }
        if (time.includes('4–8') || time.includes('4–6') || time.includes('4–10')) {
          availableDurations.add('4-8h');
        }
        if (time.includes('8–12') || time.includes('6–12')) {
          availableDurations.add('8-12h');
        }
        if (time.includes('week') || time.includes('Week')) {
          availableDurations.add('weeks');
        }
      }

      // Difficulty
      if (course.difficulty_level) {
        availableDifficulties.add(course.difficulty_level.toLowerCase());
      } else {
        availableDifficulties.add('unspecified');
      }
    });

    return {
      tracks: Array.from(availableTracks).sort(),
      bestFor: Array.from(availableBestFor).sort(),
      industries: Array.from(availableIndustries).sort(),
      durations: Array.from(availableDurations),
      difficulties: Array.from(availableDifficulties),
    };
  }, [courses]);

  // Clean up selected filters that are no longer available
  useEffect(() => {
    // Clean up tracks
    if (selectedTracks.length > 0) {
      const validTracks = selectedTracks.filter((track) => availableFilters.tracks.includes(track));
      if (validTracks.length !== selectedTracks.length) {
        setSelectedTracks(validTracks);
      }
    }

    // Clean up bestFor
    if (selectedBestFor.length > 0) {
      const validBestFor = selectedBestFor.filter((bf) => availableFilters.bestFor.includes(bf));
      if (validBestFor.length !== selectedBestFor.length) {
        setSelectedBestFor(validBestFor);
      }
    }

    // Clean up industries
    if (selectedIndustries.length > 0) {
      const validIndustries = selectedIndustries.filter((industry) => availableFilters.industries.includes(industry));
      if (validIndustries.length !== selectedIndustries.length) {
        setSelectedIndustries(validIndustries);
      }
    }

    // Clean up duration
    if (duration && !availableFilters.durations.includes(duration)) {
      setDuration('');
    }

    // Clean up difficulty
    if (difficulty) {
      const difficultyLower = difficulty.toLowerCase();
      if (!availableFilters.difficulties.includes(difficultyLower)) {
        setDifficulty('');
      }
    }
  }, [availableFilters, selectedTracks, selectedBestFor, selectedIndustries, duration, difficulty]);

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

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTracks([]);
    setDuration('');
    setDifficulty('');
    setSelectedBestFor([]);
    setSelectedIndustries([]);
    setSort('track');
  };

  const hasActiveFilters =
    search || selectedTracks.length > 0 || duration || difficulty || selectedBestFor.length > 0 || selectedIndustries.length > 0;

  // Calculate total active filter count
  const activeFilterCount = 
    (search ? 1 : 0) +
    selectedTracks.length +
    (duration ? 1 : 0) +
    (difficulty ? 1 : 0) +
    selectedBestFor.length +
    selectedIndustries.length +
    (sort !== 'track' ? 1 : 0);

  // Build array of active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void }> = [];

    // Search
    if (search) {
      chips.push({
        label: `Search: "${search}"`,
        onRemove: () => setSearch(''),
      });
    }

    // Tracks
    selectedTracks.forEach((track) => {
      chips.push({
        label: `Track: ${track}`,
        onRemove: () => setSelectedTracks((prev) => prev.filter((t) => t !== track)),
      });
    });

    // Duration
    if (duration) {
      const durationLabel = DURATION_OPTIONS.find((opt) => opt.value === duration)?.label || duration;
      chips.push({
        label: `Duration: ${durationLabel}`,
        onRemove: () => setDuration(''),
      });
    }

    // Difficulty
    if (difficulty) {
      const difficultyLabel = DIFFICULTY_OPTIONS.find((opt) => opt.value === difficulty)?.label || difficulty;
      chips.push({
        label: `Difficulty: ${difficultyLabel}`,
        onRemove: () => setDifficulty(''),
      });
    }

    // Best For
    selectedBestFor.forEach((bestFor) => {
      chips.push({
        label: `Best For: ${bestFor}`,
        onRemove: () => setSelectedBestFor((prev) => prev.filter((b) => b !== bestFor)),
      });
    });

    // Industries
    selectedIndustries.forEach((industry) => {
      chips.push({
        label: `Industry: ${industry}`,
        onRemove: () => setSelectedIndustries((prev) => prev.filter((i) => i !== industry)),
      });
    });

    // Sort
    if (sort !== 'track') {
      const sortLabel = SORT_OPTIONS.find((opt) => opt.value === sort)?.label || sort;
      chips.push({
        label: `Sort: ${sortLabel}`,
        onRemove: () => setSort('track'),
      });
    }

    return chips;
  }, [search, selectedTracks, duration, difficulty, selectedBestFor, selectedIndustries, sort]);

  return (
    <div className="space-y-4">
      {/* Search Bar and Sort - Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search courses by title, track, or 'Best For'..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
          />
        </div>
        <div className="flex-shrink-0">
          <label htmlFor="sort-select" className="sr-only">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'track' | 'course' | 'recommended' | 'shortest' | 'longest' | 'newest')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilterChips.map((chip, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="hover:text-brand-light/70 text-base leading-none focus:outline-none transition-colors ml-0.5"
                aria-label={`Remove ${chip.label}`}
                type="button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filters Header with Count and Clear All */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          <span>{isExpanded ? '▲' : '▼'}</span>
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expandable Filters */}
      <div>
        {isExpanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
              {/* Tracks (Multi-select) */}
              {availableFilters.tracks.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Track</label>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.tracks.map((track) => (
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
              )}

              {/* Duration (Single-select) */}
              {availableFilters.durations.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_OPTIONS.filter((option) => availableFilters.durations.includes(option.value)).map((option) => (
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
              )}

              {/* Difficulty (Single-select) */}
              {availableFilters.difficulties.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_OPTIONS.filter((option) => availableFilters.difficulties.includes(option.value)).map((option) => (
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
              )}

              {/* Best For (Multi-select) */}
              {availableFilters.bestFor.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Best For</label>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.bestFor.map((option) => (
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
              )}

              {/* Industry (Multi-select) */}
              {availableFilters.industries.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Industry</label>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.industries.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => toggleIndustry(industry)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedIndustries.includes(industry)
                            ? 'bg-brand-light text-white border-brand-light'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredCourses.length} of {courses.length} courses
      </div>
    </div>
  );
}
