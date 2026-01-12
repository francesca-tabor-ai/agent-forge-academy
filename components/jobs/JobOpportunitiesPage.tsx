'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { MatchExplanationModal } from './MatchExplanationModal';
import { ApplyWithAIModal } from './ApplyWithAIModal';
import type { JobOpportunity, NormalizedJobOpportunity } from '@/lib/types/job-opportunity';
import { normalizeJobOpportunity } from '@/lib/types/job-opportunity';

// Searchable Skill Selector Component (Combobox)
function SearchableSkillSelector({
  allSkills,
  selectedSkills,
  onToggleSkill,
  onRemoveSkill,
}: {
  allSkills: string[];
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredSkills = useMemo(() => {
    if (!searchQuery) return allSkills.filter(skill => !selectedSkills.includes(skill));
    const query = searchQuery.toLowerCase();
    return allSkills.filter(
      skill => !selectedSkills.includes(skill) && skill.toLowerCase().includes(query)
    );
  }, [allSkills, selectedSkills, searchQuery]);

  // Reset highlighted index when filtered skills change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredSkills.length, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < filteredSkills.length - 1 ? prev + 1 : 0;
          // Scroll into view
          setTimeout(() => {
            itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          }, 0);
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredSkills.length - 1;
          setTimeout(() => {
            itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          }, 0);
          return next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSkills.length) {
          onToggleSkill(filteredSkills[highlightedIndex]);
          setSearchQuery('');
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSelectSkill = (skill: string) => {
    onToggleSkill(skill);
    setSearchQuery('');
    setHighlightedIndex(-1);
    // Keep dropdown open for multiple selections
    inputRef.current?.focus();
  };

  if (allSkills.length === 0) return null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex flex-col gap-2">
        {/* Selected Skills Chips */}
        {selectedSkills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20"
              >
                {skill}
                <button
                  onClick={() => onRemoveSkill(skill)}
                  className="hover:text-brand-light/70 text-base leading-none focus:outline-none transition-colors"
                  aria-label={`Remove ${skill}`}
                  tabIndex={-1}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        
        {/* Combobox Input */}
        <div className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={selectedSkills.length > 0 ? `Add more skills... (${selectedSkills.length} selected)` : 'Type to search skills...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent pr-10"
            />
            <button
              type="button"
              onClick={() => {
                setIsOpen(!isOpen);
                if (!isOpen) {
                  inputRef.current?.focus();
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={isOpen ? 'Close dropdown' : 'Open dropdown'}
              tabIndex={-1}
            >
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Dropdown List */}
          {isOpen && (
            <div
              ref={listRef}
              className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
              role="listbox"
            >
              {filteredSkills.length > 0 ? (
                <div className="py-1">
                  {filteredSkills.map((skill, index) => (
                    <button
                      key={skill}
                      ref={(el) => (itemRefs.current[index] = el)}
                      type="button"
                      onClick={() => handleSelectSkill(skill)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                        highlightedIndex === index
                          ? 'bg-brand-light/10 text-brand-light'
                          : 'hover:bg-gray-50 text-gray-900'
                      } focus:outline-none focus:bg-brand-light/10`}
                      role="option"
                      aria-selected={highlightedIndex === index}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  {searchQuery ? 'No skills found' : 'Start typing to search skills...'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface JobOpportunitiesPageProps {
  studentProfileId: string | null;
}

type SortOption = 'best-match' | 'newest' | 'least-missing' | 'company-az';
type RoleType = 'engineer' | 'architect' | 'pm' | 'content' | 'other' | 'all';

/**
 * Retry fetch with exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 2,
  retryDelay = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Only retry on 5xx errors or network failures
      if (response.ok || (response.status < 500 && response.status >= 400)) {
        return response;
      }
      
      // For 5xx errors, throw to trigger retry
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry on network errors that aren't 5xx
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // Network error - retry with backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // For other errors, check if it's a 5xx
      if (error.message?.includes('Server error')) {
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Don't retry for other errors
      break;
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries');
}

export function JobOpportunitiesPage({ studentProfileId }: JobOpportunitiesPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [showMatchExplanation, setShowMatchExplanation] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyJob, setApplyJob] = useState<NormalizedJobOpportunity | null>(null);
  const [profileIncomplete, setProfileIncomplete] = useState<{ reason: string; missingFields: string[] } | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Filter and sort state from URL params
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status')?.split(',') || [];
  const matchMin = parseInt(searchParams.get('matchMin') || '60');
  const matchMax = parseInt(searchParams.get('matchMax') || '100');
  const roleTypeFilter = (searchParams.get('roleType') || 'all') as RoleType;
  const skillFilter = searchParams.get('skills')?.split(',') || [];
  const sortBy = (searchParams.get('sort') || 'best-match') as SortOption;

  const fetchJobs = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithRetry('/api/jobs', {
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      // Check if response indicates an error (even if status is 200)
      if (!response.ok || (data && data.ok === false)) {
        // Try to read error message from response
        let errorMessage = 'Failed to fetch jobs';
        let retryable = response.status >= 500;
        let requestId: string | undefined;
        
        if (data && typeof data === 'object') {
          // New error format with error.code and error.message
          if (data.error) {
            if (typeof data.error === 'object' && data.error.message) {
              errorMessage = data.error.message;
            } else if (typeof data.error === 'string') {
              errorMessage = data.error;
            }
            
            // Add error code if available
            if (typeof data.error === 'object' && data.error.code) {
              errorMessage = `${data.error.code}: ${errorMessage}`;
            }
          }
          
          // Add details if available
          if (data.details) {
            if (Array.isArray(data.details)) {
              errorMessage += `: ${data.details.join(', ')}`;
            } else {
              errorMessage += `: ${data.details}`;
            }
          }
          
          // Extract requestId for logging
          if (data.requestId) {
            requestId = data.requestId;
            console.error(`[Jobs API Error] Request ID: ${requestId}`);
          }
        }
        
        // Determine if error is retryable
        if (response.status >= 500 || response.status === 429) {
          retryable = true;
        } else if (response.status === 401 || response.status === 403) {
          retryable = false;
          errorMessage = 'Authentication error. Please refresh the page.';
        } else if (response.status === 400) {
          retryable = false;
        }
        
        // Include requestId in error message if available
        const errorWithRequestId = requestId 
          ? new Error(`${errorMessage} (Error ID: ${requestId})`)
          : new Error(errorMessage);
        (errorWithRequestId as any).requestId = requestId;
        throw errorWithRequestId;
      }
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      // Check for ok: false even with 200 status
      if (data.ok === false) {
        const errorMessage = data.error?.message || 'Failed to fetch jobs';
        const requestId = data.requestId;
        const errorWithRequestId = requestId 
          ? new Error(`${errorMessage} (Error ID: ${requestId})`)
          : new Error(errorMessage);
        (errorWithRequestId as any).requestId = requestId;
        throw errorWithRequestId;
      }
      
      // Handle empty state with reason (e.g., PROFILE_INCOMPLETE)
      if (data.reason === 'PROFILE_INCOMPLETE') {
        // This is a healthy empty state - no error, just no jobs yet
        setJobs([]);
        setError(null);
        setRetryCount(0);
        setProfileIncomplete({
          reason: data.reason,
          missingFields: data.missingFields || [],
        });
        return;
      }
      
      // Clear profile incomplete state if we got jobs
      setProfileIncomplete(null);
      
      // Map API response (snake_case) to component format
      // API returns computed matching_score, status, skills_missing
      const mappedJobs = (data.jobs || []).map((job: any) => ({
        ...job,
        // Ensure computed fields are used (from API)
        matching_score: job.matching_score ?? 0,
        status: job.status ?? 'new',
        skills_missing: job.skills_missing ?? [],
        // Legacy camelCase for backward compatibility
        matchingScore: job.matching_score,
        skillsMissing: job.skills_missing,
      }));
      
      setJobs(mappedJobs);
      setError(null);
      setRetryCount(0);
    } catch (error: any) {
      // Don't set error if request was aborted
      if (error.name === 'AbortError') {
        return;
      }
      
      console.error('Error fetching jobs:', error);
      
      const isNetworkError = error.message?.includes('Failed to fetch') || 
                            error.message?.includes('NetworkError') ||
                            error.name === 'TypeError' ||
                            error.message?.includes('network');
      const isServerError = error.message?.includes('Server error') || 
                           error.message?.includes('500') ||
                           error.message?.includes('Internal server error') ||
                           error.message?.includes('SERVER_ERROR');
      
      // Extract requestId from error if available
      const requestId = (error as any).requestId;
      let errorMessage = error.message || 'Failed to fetch jobs. Please check your connection and try again.';
      
      // Ensure requestId is shown in the error message
      if (requestId && !errorMessage.includes(requestId)) {
        errorMessage = `${errorMessage} (Error ID: ${requestId})`;
      }
      
      setError({
        message: errorMessage,
        retryable: isNetworkError || isServerError,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    fetchJobs(controller.signal);
    
    return () => {
      controller.abort();
    };
  }, [fetchJobs]);

  // Debounced search - refetch when search query changes (but debounced)
  useEffect(() => {
    // Clear previous debounce timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    // Only debounce if search query changed (not on initial mount)
    if (searchQuery !== '') {
      searchDebounceRef.current = setTimeout(() => {
        // Search is handled client-side, no need to refetch
        // But we could trigger a refetch if needed
      }, 300);
    }
    
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchJobs(controller.signal);
  }, [fetchJobs]);

  // Get all unique skills from jobs for filter
  const allSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    jobs.forEach(job => {
      job.skills.forEach(skill => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, [jobs]);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        job =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.skills.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(job => job.status && statusFilter.includes(job.status));
    }

    // Match score filter (use computed matching_score from API)
    filtered = filtered.filter(
      job => (job.matching_score ?? job.matchingScore ?? 0) >= matchMin && 
             (job.matching_score ?? job.matchingScore ?? 0) <= matchMax
    );

    // Role type filter (simplified - would need jobType field in API)
    if (roleTypeFilter !== 'all') {
      // This would need to match against job.jobType if available
      // For now, we'll skip this filter if jobType is not available
    }

    // Skills filter
    if (skillFilter.length > 0) {
      filtered = filtered.filter(job =>
        skillFilter.some(skill => job.skills.includes(skill))
      );
    }

    // Sort (use computed fields from API)
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'best-match':
          return (b.matching_score ?? b.matchingScore ?? 0) - (a.matching_score ?? a.matchingScore ?? 0);
        case 'newest':
          // Would need created_at field - for now use match score
          return (b.matching_score ?? b.matchingScore ?? 0) - (a.matching_score ?? a.matchingScore ?? 0);
        case 'least-missing':
          const aMissing = (a.skills_missing ?? a.skillsMissing ?? []).length;
          const bMissing = (b.skills_missing ?? b.skillsMissing ?? []).length;
          return aMissing - bMissing;
        case 'company-az':
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, searchQuery, statusFilter, matchMin, matchMax, roleTypeFilter, skillFilter, sortBy]);

  const updateURLParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    // Debounce search input updates
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      updateURLParams({ search: value || null });
    }, 300);
  };

  const handleStatusToggle = (status: string) => {
    // Single-select: if clicking the same status, clear it; otherwise, replace with new status
    const newStatus = statusFilter.includes(status) ? [] : [status];
    updateURLParams({ status: newStatus.length > 0 ? newStatus.join(',') : null });
  };

  const handleResetFilters = () => {
    updateURLParams({
      search: null,
      status: null,
      matchMin: null,
      matchMax: null,
      skills: null,
      sort: null,
    });
  };

  const handleMatchRangeChange = (min: number, max: number) => {
    updateURLParams({
      matchMin: min !== 60 ? min.toString() : null,
      matchMax: max !== 100 ? max.toString() : null,
    });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = skillFilter.includes(skill)
      ? skillFilter.filter(s => s !== skill)
      : [...skillFilter, skill];
    updateURLParams({ skills: newSkills.length > 0 ? newSkills.join(',') : null });
  };

  const handleSortChange = (sort: SortOption) => {
    updateURLParams({ sort: sort !== 'best-match' ? sort : null });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return { label: 'New', className: 'bg-green-100 text-green-700' };
      case 'unlocked':
        return { label: 'Unlocked', className: 'bg-blue-100 text-blue-700' };
      case 'recommended':
        return { label: 'Recommended', className: 'bg-purple-100 text-purple-700' };
      case 'locked':
        return { label: 'Locked', className: 'bg-gray-100 text-gray-700' };
      case 'stretch':
        return { label: 'Stretch', className: 'bg-yellow-100 text-yellow-700' };
      default:
        return null;
    }
  };

  const getMatchingColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 65) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getMatchingBadgeSize = (score: number) => {
    if (score >= 80) return 'text-lg font-bold';
    if (score >= 65) return 'text-base font-semibold';
    return 'text-sm font-medium';
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-white border border-red-200 rounded-lg p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-red-600">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We couldn't load jobs right now
              </h3>
              <p className="text-sm text-gray-600 mb-2">{error.message}</p>
              {error.message.includes('Error ID:') && (
                <p className="text-xs text-gray-500 mb-4">
                  If this problem persists, please contact support with the Error ID above.
                </p>
              )}
              {!error.message.includes('Error ID:') && (
                <p className="text-xs text-gray-500 mb-4">
                  Please check your connection and try again.
                </p>
              )}
              {error.retryable && (
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
      {/* Title Block */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Job Opportunities</h1>
        <p className="text-base text-gray-600">
          Roles matched to your skills, projects, and progress
        </p>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <div className="grid grid-cols-12 gap-4">
            {/* Row 1: Search + Status */}
            {/* Search */}
            <div className="col-span-12 md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="col-span-12 md:col-span-7">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                {(statusFilter.length > 0 || searchQuery || skillFilter.length > 0 || matchMin !== 60 || matchMax !== 100) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors"
                  >
                    Reset filters
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['new', 'recommended', 'unlocked', 'locked', 'stretch'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusToggle(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                      statusFilter.includes(status)
                        ? 'bg-brand-light text-white shadow-sm border border-brand-light'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Sort + Match Range + Skills */}
            {/* Sort */}
            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white"
              >
                <option value="best-match">Best Match</option>
                <option value="newest">Newest</option>
                <option value="least-missing">Least Missing Skills</option>
                <option value="company-az">Company A-Z</option>
              </select>
            </div>

            {/* Match Score Range */}
            <div className="col-span-12 md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Match range (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={matchMin}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                    handleMatchRangeChange(val, matchMax);
                  }}
                  className="w-20 h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent text-center"
                />
                <span className="text-sm text-gray-400">to</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={matchMax}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 100));
                    handleMatchRangeChange(matchMin, val);
                  }}
                  className="w-20 h-10 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent text-center"
                />
              </div>
            </div>

            {/* Skills Filter */}
            {allSkills.length > 0 && (
              <div className="col-span-12 md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <SearchableSkillSelector
                  allSkills={allSkills}
                  selectedSkills={skillFilter}
                  onToggleSkill={handleSkillToggle}
                  onRemoveSkill={(skill) => {
                    const newSkills = skillFilter.filter(s => s !== skill);
                    updateURLParams({ skills: newSkills.length > 0 ? newSkills.join(',') : null });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Results</h2>
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredAndSortedJobs.length}</span> of{' '}
            <span className="text-gray-600">{jobs.length}</span> jobs
          </p>
        </div>
        
        {/* Active Filters Summary */}
        {(searchQuery || statusFilter.length > 0 || skillFilter.length > 0 || matchMin !== 60 || matchMax !== 100) && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-300">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => updateURLParams({ search: null })}
                    className="hover:text-gray-900 text-base leading-none focus:outline-none"
                    aria-label="Remove search"
                  >
                    ×
                  </button>
                </span>
              )}
              {statusFilter.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20">
                  Status: {statusFilter[0].charAt(0).toUpperCase() + statusFilter[0].slice(1)}
                  <button
                    onClick={() => updateURLParams({ status: null })}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none"
                    aria-label="Remove status filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {skillFilter.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20">
                  {skillFilter.length} skill{skillFilter.length > 1 ? 's' : ''}
                  <button
                    onClick={() => updateURLParams({ skills: null })}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none"
                    aria-label="Remove skills filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {(matchMin !== 60 || matchMax !== 100) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-300">
                  Match: {matchMin}%–{matchMax}%
                  <button
                    onClick={() => updateURLParams({ matchMin: null, matchMax: null })}
                    className="hover:text-gray-900 text-base leading-none focus:outline-none"
                    aria-label="Remove match range filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 underline transition-colors whitespace-nowrap"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Job Cards */}
      {filteredAndSortedJobs.length > 0 ? (
        <div className="space-y-4 mb-8">
          {filteredAndSortedJobs.map((job) => {
            const statusBadge = getStatusBadge(job.status);
            const displayedSkills = job.skills.slice(0, 3);
            const remainingSkills = job.skills.length - 3;

            return (
              <div
                key={job.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-light transition-colors"
              >
                {/* Card Content */}
                <div className="space-y-4">
                  {/* Row 1: Role Title + Company */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>

                  {/* Row 2: Match % + Status Badge */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowMatchExplanation(true);
                      }}
                      className={`px-4 py-2 rounded-lg border ${getMatchingColor(job.matching_score ?? job.matchingScore ?? 0)} ${getMatchingBadgeSize(job.matching_score ?? job.matchingScore ?? 0)} hover:opacity-90 transition-opacity cursor-pointer`}
                    >
                      {job.matching_score ?? job.matchingScore ?? 0}% Match
                    </button>
                    {statusBadge && (
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadge.className}`}>
                        {statusBadge.label}
                        {job.status === 'unlocked' && (
                          <span
                            className="ml-1 cursor-help"
                            title="Unlocked because your skills/projects match this role"
                          >
                            ℹ️
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Skill Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {displayedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {remainingSkills > 0 && (
                      <span className="px-2.5 py-1 text-gray-500 text-xs">
                        +{remainingSkills} more
                      </span>
                    )}
                  </div>

                  {/* Row 4: Primary CTA */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        // Normalize job to ensure matchingScore is always a number
                        setApplyJob(normalizeJobOpportunity(job));
                        setShowApplyModal(true);
                      }}
                      className="px-6 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors font-medium"
                    >
                      Apply with AI
                    </button>
                    <Link
                      href={`/student/jobs/${job.id}`}
                      className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center mb-8">
          {profileIncomplete ? (
            <>
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                To unlock matched roles, complete your profile
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Add skills and at least one project to your portfolio to start seeing job matches tailored to your experience.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/student/profile"
                  className="btn-primary text-sm font-medium"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/student/portfolio"
                  className="btn-secondary text-sm font-medium"
                >
                  Add a Project
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No jobs to show yet
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || statusFilter.length > 0 || skillFilter.length > 0 || matchMin !== 60 || matchMax !== 100
                  ? 'No jobs match your filters. Try adjusting your search criteria.'
                  : "We'll recommend jobs once you complete a course or add a project."}
              </p>
              {!searchQuery && statusFilter.length === 0 && skillFilter.length === 0 && matchMin === 60 && matchMax === 100 && (
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/student/courses"
                    className="btn-primary text-sm font-medium"
                  >
                    Browse Courses
                  </Link>
                  <Link
                    href="/student/portfolio"
                    className="btn-secondary text-sm font-medium"
                  >
                    Add a Project
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Unified Bottom CTA */}
      {filteredAndSortedJobs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center mt-8">
          <button
            onClick={() => {
              setApplyJob(null);
              setShowApplyModal(true);
            }}
            className="px-6 py-3 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors font-medium"
          >
            Prepare My Application Pack
          </button>
        </div>
      )}

      {/* Match Explanation Modal */}
      {showMatchExplanation && selectedJob && (
        <MatchExplanationModal
          job={selectedJob}
          studentProfileId={studentProfileId}
          onClose={() => {
            setShowMatchExplanation(false);
            setSelectedJob(null);
          }}
        />
      )}

      {/* Apply with AI Modal */}
      {showApplyModal && (
        <ApplyWithAIModal
          job={applyJob}
          studentProfileId={studentProfileId}
          onClose={() => {
            setShowApplyModal(false);
            setApplyJob(null);
          }}
        />
      )}
    </div>
  );
}
