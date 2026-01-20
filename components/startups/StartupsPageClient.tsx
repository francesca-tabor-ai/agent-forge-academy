'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { StartupCard } from './StartupCard';

interface Founder {
  id: string;
  name: string;
  bio?: string;
}

interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  founder: Founder | null;
  vibeScore: number;
  revenueRange: string;
  technicalDifficulty: string | null;
  status: string;
  logoUrl?: string;
  websiteUrl?: string;
  launchYear?: number;
  pricingModel?: string;
  targetCustomer?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const revenueOptions = ['All', 'pre_revenue', '$1_10k', '$10_50k', '$50k_plus'];
const revenueDisplayMap: Record<string, string> = {
  'All': 'All',
  'pre_revenue': 'Pre-revenue',
  '$1_10k': '$1K-$10K MRR',
  '$10_50k': '$10K-$50K MRR',
  '$50k_plus': '$50K+ MRR',
};
const technicalDifficultyOptions = ['All', 'low', 'medium', 'high'];
const statusOptions = ['All', 'active', 'acquired', 'shut_down'];
const statusDisplayMap: Record<string, string> = {
  'All': 'All',
  'active': 'Active',
  'acquired': 'Acquired',
  'shut_down': 'Shut Down',
};

export function StartupsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [availableNiches, setAvailableNiches] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const searchQuery = searchParams.get('search') || '';
  const revenueFilter = searchParams.get('revenueRange') || 'All';
  const vibeScoreFilter = searchParams.get('vibeScore') || 'All';
  const technicalDifficultyFilter = searchParams.get('technicalDifficulty') || 'All';
  const statusFilter = searchParams.get('status') || 'All';
  const nicheFilter = searchParams.get('niche') || 'All';
  const sortBy = searchParams.get('sort') || 'newest';

  const fetchStartups = useCallback(async (page: number = 1, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (revenueFilter !== 'All') params.set('revenueRange', revenueFilter);
      if (vibeScoreFilter !== 'All') params.set('vibeScore', vibeScoreFilter);
      if (technicalDifficultyFilter !== 'All') params.set('technicalDifficulty', technicalDifficultyFilter);
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (nicheFilter !== 'All') params.set('niche', nicheFilter);
      if (sortBy) params.set('sort', sortBy);
      params.set('page', page.toString());
      params.set('limit', '12');

      const response = await fetch(`/api/startups?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch startups');
      }

      const data = await response.json();
      
      if (append) {
        setStartups(prev => [...prev, ...data.startups]);
      } else {
        setStartups(data.startups);
      }
      
      setPagination(data.pagination);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching startups:', err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, revenueFilter, vibeScoreFilter, technicalDifficultyFilter, statusFilter, nicheFilter, sortBy]);

  // Load available niches on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await fetch('/api/startups/filters');
        if (response.ok) {
          const data = await response.json();
          setAvailableNiches(data.niches || []);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadFilters();
  }, []);

  // Initial load and when filters change
  useEffect(() => {
    setStartups([]);
    fetchStartups(1, false);
  }, [fetchStartups]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && pagination) {
      fetchStartups(pagination.page + 1, true);
    }
  }, [fetchStartups, isLoadingMore, hasMore, pagination]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const updateURLParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'All') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/startups?${params.toString()}`);
  };

  // Debounced search handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateURLParams({ search: searchInput || null });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    updateURLParams({ [filterName]: value === 'All' ? null : value });
  };

  const handleSortChange = (value: string) => {
    updateURLParams({ sort: value === 'newest' ? null : value });
  };

  const handleResetFilters = () => {
    router.push('/startups');
  };

  const hasActiveFilters =
    searchQuery ||
    revenueFilter !== 'All' ||
    vibeScoreFilter !== 'All' ||
    technicalDifficultyFilter !== 'All' ||
    statusFilter !== 'All' ||
    nicheFilter !== 'All' ||
    sortBy !== 'newest';

  if (loading && startups.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading startups...</p>
        </div>
      </div>
    );
  }

  if (error && startups.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-2">Error loading startups</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchStartups(1, false)}
            className="h-10 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Title Block */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Startups</h1>
        <p className="text-base text-gray-600">
          Discover innovative startups and explore opportunities
        </p>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <div className="grid grid-cols-12 gap-4">
            {/* Row 1: Search (full width) */}
            <div className="col-span-12">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Search</label>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="h-10 px-3 text-xs text-gray-500 hover:text-gray-700 underline transition-colors focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                  >
                    Reset filters
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Search by startup name, founder, tagline, or keyword..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
              />
            </div>

            {/* Row 2: Filters */}
            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Revenue Range</label>
              <select
                value={revenueFilter}
                onChange={(e) => handleFilterChange('revenueRange', e.target.value)}
                className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                {revenueOptions.map((option) => (
                  <option key={option} value={option}>
                    {revenueDisplayMap[option]}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Vibe Score</label>
              <select
                value={vibeScoreFilter}
                onChange={(e) => handleFilterChange('vibeScore', e.target.value)}
                className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="All">All</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
                <option value="6">6+</option>
                <option value="7">7+</option>
                <option value="8">8+</option>
                <option value="9">9+</option>
                <option value="10">10</option>
              </select>
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Technical Difficulty</label>
              <select
                value={technicalDifficultyFilter}
                onChange={(e) => handleFilterChange('technicalDifficulty', e.target.value)}
                className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                {technicalDifficultyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-12 md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {statusDisplayMap[option]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Niche Filter */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Niche</label>
            <select
              value={nicheFilter}
              onChange={(e) => handleFilterChange('niche', e.target.value)}
              className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              <option value="All">All Niches</option>
              {availableNiches.map((niche) => (
                <option key={niche} value={niche}>
                  {niche}
                </option>
              ))}
            </select>
          </div>

          {/* Row 3: Sort */}
          <div className="col-span-12 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              <option value="newest">Newest First</option>
              <option value="highest-revenue">Highest Revenue</option>
              <option value="most-vibe-coded">Most Vibe-Coded</option>
              <option value="easiest-build">Easiest Build</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Results</h2>
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{startups.length}</span> of{' '}
            <span className="font-medium text-gray-900">{pagination?.total || 0}</span> startup
            {(pagination?.total || 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-300">
                  Search: &quot;{searchQuery}&quot;
                  <button
                    onClick={() => updateURLParams({ search: null })}
                    className="hover:text-gray-900 text-base leading-none focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 rounded"
                    aria-label="Remove search"
                  >
                    ×
                  </button>
                </span>
              )}
              {revenueFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20">
                  Revenue: {revenueDisplayMap[revenueFilter]}
                  <button
                    onClick={() => updateURLParams({ revenueRange: null })}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                    aria-label="Remove revenue filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {vibeScoreFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20">
                  Vibe: {vibeScoreFilter}+
                  <button
                    onClick={() => updateURLParams({ vibeScore: null })}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                    aria-label="Remove vibe score filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {technicalDifficultyFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20">
                  Difficulty: {technicalDifficultyFilter.charAt(0).toUpperCase() + technicalDifficultyFilter.slice(1)}
                  <button
                    onClick={() => updateURLParams({ technicalDifficulty: null })}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                    aria-label="Remove technical difficulty filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {statusFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20">
                  Status: {statusDisplayMap[statusFilter]}
                  <button
                    onClick={() => updateURLParams({ status: null })}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                    aria-label="Remove status filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {nicheFilter !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20">
                  Niche: {nicheFilter}
                  <button
                    onClick={() => updateURLParams({ niche: null })}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                    aria-label="Remove niche filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {sortBy !== 'newest' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20">
                  Sort: {sortBy === 'highest-revenue' ? 'Highest Revenue' : sortBy === 'most-vibe-coded' ? 'Most Vibe-Coded' : 'Easiest Build'}
                  <button
                    onClick={() => updateURLParams({ sort: null })}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                    aria-label="Reset sort"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={handleResetFilters}
              className="h-10 px-3 text-xs font-medium text-gray-600 hover:text-gray-900 underline transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Startups Grid */}
      {startups.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {startups.map((startup) => (
              <StartupCard key={startup.id} startup={startup} />
            ))}
          </div>

          {/* Load More / Infinite Scroll Indicator */}
          {hasMore && (
            <div className="text-center py-6">
              {isLoadingMore ? (
                <p className="text-gray-600">Loading more startups...</p>
              ) : (
                <button
                  onClick={loadMore}
                  className="h-10 px-6 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-2"
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg mb-2">No startups found</p>
          <p className="text-gray-500 text-sm mb-4">
            Try adjusting your filters or search query
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
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
