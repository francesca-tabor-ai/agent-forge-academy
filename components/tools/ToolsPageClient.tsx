'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Tool } from '@/lib/tools/registry';
import { ToolCard } from './ToolCard';
import { ToolsToLearnNext } from '@/components/offers/ToolsToLearnNext';
import { UnlockedOffersRecommendations } from '@/components/offers/UnlockedOffersRecommendations';
import { INDUSTRIES } from '@/lib/utils/industries';

interface ToolsPageClientProps {
  tools: Tool[];
  studentProfileId: string;
}

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
  'E-Commerce',
  'RevOps',
  'B2B Sales',
  'DevOps',
  'Creative',
];

const SORT_OPTIONS = [
  { value: 'track', label: 'Track A–Z' },
  { value: 'tool', label: 'Tool Name A–Z' },
  { value: 'recommended', label: 'Recommended' },
  { value: 'shortest', label: 'Shortest → Longest' },
  { value: 'longest', label: 'Longest → Shortest' },
  { value: 'newest', label: 'Newest' },
];

// Helper function to extract numeric time value for sorting
function extractTimeValue(timeStr: string): number {
  if (!timeStr) return 0;
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

export function ToolsPageClient({ tools, studentProfileId }: ToolsPageClientProps) {
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
  const [sort, setSort] = useState<'track' | 'tool' | 'recommended' | 'shortest' | 'longest' | 'newest'>(
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
  }, [search, selectedTracks, duration, difficulty, selectedBestFor, selectedIndustries, sort]);

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = [...tools];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((tool) => {
        const name = tool.name || '';
        const description = tool.description || '';
        const category = tool.category || '';
        const bestForStr = tool.bestFor?.join(' ') || '';
        return (
          name.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          category.toLowerCase().includes(searchLower) ||
          bestForStr.toLowerCase().includes(searchLower) ||
          tool.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });
    }

    // Track filter
    if (selectedTracks.length > 0) {
      filtered = filtered.filter((tool) => {
        const track = tool.category || '';
        return selectedTracks.includes(track);
      });
    }

    // Duration filter
    if (duration) {
      filtered = filtered.filter((tool) => {
        const toolDuration = tool.duration || '';
        if (duration === '0-4h') {
          return toolDuration.includes('0–4') || toolDuration.includes('2–4') || toolDuration.includes('3–5');
        } else if (duration === '4-8h') {
          return toolDuration.includes('4–8') || toolDuration.includes('4–6') || toolDuration.includes('4–10');
        } else if (duration === '8-12h') {
          return toolDuration.includes('8–12') || toolDuration.includes('6–12');
        } else if (duration === 'weeks') {
          return toolDuration.includes('week') || toolDuration.includes('Week');
        }
        return true;
      });
    }

    // Difficulty filter
    if (difficulty) {
      filtered = filtered.filter((tool) => {
        if (difficulty === 'unspecified') {
          return !tool.difficultyLevel;
        }
        return tool.difficultyLevel?.toLowerCase() === difficulty.toLowerCase();
      });
    }

    // Best For filter
    if (selectedBestFor.length > 0) {
      filtered = filtered.filter((tool) => {
        const toolBestFor = tool.bestFor || [];
        return selectedBestFor.some((bf) => 
          toolBestFor.some(tbf => tbf.toLowerCase().includes(bf.toLowerCase()))
        );
      });
    }

    // Industry filter
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter((tool) => {
        const toolIndustries = tool.industries || [];
        return toolIndustries.some((industry) => selectedIndustries.includes(industry));
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sort === 'shortest') {
        const durationA = a.duration || '';
        const durationB = b.duration || '';
        const numA = extractTimeValue(durationA);
        const numB = extractTimeValue(durationB);
        return numA - numB;
      } else if (sort === 'longest') {
        const durationA = a.duration || '';
        const durationB = b.duration || '';
        const numA = extractTimeValue(durationA);
        const numB = extractTimeValue(durationB);
        return numB - numA;
      } else if (sort === 'newest') {
        // Tools don't have created_at in the registry, so we'll skip this for now
        return 0;
      } else if (sort === 'track') {
        const trackA = a.category || '';
        const trackB = b.category || '';
        const trackCompare = trackA.localeCompare(trackB);
        if (trackCompare !== 0) return trackCompare;
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      } else if (sort === 'tool') {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      }
      // Recommended (default) - keep original order
      return 0;
    });

    return filtered;
  }, [tools, search, selectedTracks, duration, difficulty, selectedBestFor, selectedIndustries, sort]);

  // Compute available filters based on tools
  const availableFilters = useMemo(() => {
    const availableTracks = new Set<string>();
    const availableBestFor = new Set<string>();
    const availableIndustries = new Set<string>();
    const availableDurations = new Set<string>();
    const availableDifficulties = new Set<string>();

    tools.forEach((tool) => {
      // Tracks
      const track = tool.category;
      if (track) {
        availableTracks.add(track);
      }

      // Best For
      const toolBestFor = tool.bestFor || [];
      toolBestFor.forEach((bf) => {
        if (bf) availableBestFor.add(bf);
      });

      // Industries
      const toolIndustries = tool.industries || [];
      toolIndustries.forEach((industry) => {
        if (industry) availableIndustries.add(industry);
      });

      // Duration
      const toolDuration = tool.duration || '';
      if (toolDuration) {
        if (toolDuration.includes('0–4') || toolDuration.includes('2–4') || toolDuration.includes('3–5')) {
          availableDurations.add('0-4h');
        }
        if (toolDuration.includes('4–8') || toolDuration.includes('4–6') || toolDuration.includes('4–10')) {
          availableDurations.add('4-8h');
        }
        if (toolDuration.includes('8–12') || toolDuration.includes('6–12')) {
          availableDurations.add('8-12h');
        }
        if (toolDuration.includes('week') || toolDuration.includes('Week')) {
          availableDurations.add('weeks');
        }
      }

      // Difficulty
      if (tool.difficultyLevel) {
        availableDifficulties.add(tool.difficultyLevel.toLowerCase());
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
  }, [tools]);

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
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tools</h1>
        <p className="text-gray-600 mt-2">
          Discover tools and resources to help you build and ship faster
        </p>
      </div>

      {/* Personalized Recommendations */}
      <ToolsToLearnNext />
      <UnlockedOffersRecommendations />

      {/* Filters Section */}
      <div className="space-y-4">
        {/* Search Bar and Sort - Top Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tools by name, track, or 'Best For'..."
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
              onChange={(e) => setSort(e.target.value as 'track' | 'tool' | 'recommended' | 'shortest' | 'longest' | 'newest')}
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
          Showing {filteredTools.length} of {tools.length} tool{tools.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg mb-2">No tools found</p>
          <p className="text-gray-500 text-sm mb-4">
            Try adjusting your filters or search query
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="h-10 px-4 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
