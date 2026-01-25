'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Tool } from '@/lib/tools/registry';
import { ToolCard } from './ToolCard';
import { ToolsToLearnNext } from '@/components/offers/ToolsToLearnNext';
import { UnlockedOffersRecommendations } from '@/components/offers/UnlockedOffersRecommendations';

interface ToolsPageClientProps {
  tools: Tool[];
  studentProfileId: string;
}

export function ToolsPageClient({ tools, studentProfileId }: ToolsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filter values from URL params
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const tagFilter = useMemo(() => {
    return searchParams.get('tags')?.split(',').filter(Boolean) || [];
  }, [searchParams]);
  const courseFilter = useMemo(() => {
    return searchParams.get('courses')?.split(',').filter(Boolean) || [];
  }, [searchParams]);

  // Local state
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Get all unique tags and courses from tools
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tools.forEach(tool => {
      tool.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [tools]);

  const allCourses = useMemo(() => {
    const courseSet = new Set<string>();
    tools.forEach(tool => {
      tool.recommendedFor.forEach(course => courseSet.add(course));
    });
    return Array.from(courseSet).sort();
  }, [tools]);

  // Update URL params
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

  // Debounced search handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateURLParams({ search: searchInput || null });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchQuery]);

  // Filter tools
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower) ||
          tool.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && tool.status !== statusFilter) {
        return false;
      }

      // Tag filter (any selected tag must be present)
      if (tagFilter.length > 0) {
        const hasMatchingTag = tagFilter.some(tag => tool.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Course filter (any selected course must be in recommendedFor)
      if (courseFilter.length > 0) {
        const hasMatchingCourse = courseFilter.some(course =>
          tool.recommendedFor.includes(course)
        );
        if (!hasMatchingCourse) return false;
      }

      return true;
    });
  }, [tools, searchQuery, statusFilter, tagFilter, courseFilter]);

  const handleStatusChange = (value: string) => {
    updateURLParams({ status: value !== 'all' ? value : null });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = tagFilter.includes(tag)
      ? tagFilter.filter(t => t !== tag)
      : [...tagFilter, tag];
    updateURLParams({ tags: newTags.length > 0 ? newTags.join(',') : null });
  };

  const handleCourseToggle = (course: string) => {
    const newCourses = courseFilter.includes(course)
      ? courseFilter.filter(c => c !== course)
      : [...courseFilter, course];
    updateURLParams({ courses: newCourses.length > 0 ? newCourses.join(',') : null });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    router.push('/student/tools');
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== 'all' ||
    tagFilter.length > 0 ||
    courseFilter.length > 0;

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

      {/* Filters Card */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Card Header */}
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className="w-full px-6 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-2 rounded-t-lg"
          aria-expanded={isFiltersExpanded}
          aria-label={isFiltersExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {isFiltersExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {/* Card Content */}
        {isFiltersExpanded && (
          <div className="p-6 transition-all duration-200 ease-in-out">
            <div className="space-y-4">
              {/* Search */}
              <div>
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
                  placeholder="Search by tool name, description, or tags..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full h-10 px-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent bg-white appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="beta">Beta</option>
                  <option value="coming_soon">Coming Soon</option>
                </select>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 ${
                          tagFilter.includes(tag)
                            ? 'bg-brand-light text-white border-brand-light'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-brand-light hover:text-brand-light'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Courses Filter */}
              {allCourses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommended for Courses
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allCourses.map((course) => (
                      <button
                        key={course}
                        onClick={() => handleCourseToggle(course)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 ${
                          courseFilter.includes(course)
                            ? 'bg-brand-light text-white border-brand-light'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-brand-light hover:text-brand-light'
                        }`}
                      >
                        {course.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      {hasActiveFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{filteredTools.length}</span> of{' '}
              <span className="font-medium text-gray-900">{tools.length}</span> tool
              {tools.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Active Filters Summary */}
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
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20">
                  Status: {statusFilter === 'coming_soon' ? 'Coming Soon' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <button
                    onClick={() => updateURLParams({ status: null })}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                    aria-label="Remove status filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {tagFilter.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20"
                >
                  Tag: {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                    aria-label={`Remove ${tag} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {courseFilter.map((course) => (
                <span
                  key={course}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full border border-brand-light/20"
                >
                  Course: {course.replace(/-/g, ' ')}
                  <button
                    onClick={() => handleCourseToggle(course)}
                    className="hover:text-brand-light/70 text-base leading-none focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
                    aria-label={`Remove ${course} filter`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              onClick={handleResetFilters}
              className="h-10 px-3 text-xs font-medium text-gray-600 hover:text-gray-900 underline transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-light focus:ring-offset-1 rounded"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

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
