'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { MatchExplanationModal } from './MatchExplanationModal';
import { ApplyWithAIModal } from './ApplyWithAIModal';
import type { JobOpportunity, NormalizedJobOpportunity } from '@/lib/types/job-opportunity';
import { normalizeJobOpportunity } from '@/lib/types/job-opportunity';

interface JobOpportunitiesPageProps {
  studentProfileId: string | null;
}

type SortOption = 'best-match' | 'newest' | 'least-missing' | 'company-az';
type RoleType = 'engineer' | 'architect' | 'pm' | 'content' | 'other' | 'all';

export function JobOpportunitiesPage({ studentProfileId }: JobOpportunitiesPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(null);
  const [showMatchExplanation, setShowMatchExplanation] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyJob, setApplyJob] = useState<NormalizedJobOpportunity | null>(null);

  // Filter and sort state from URL params
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status')?.split(',') || [];
  const matchMin = parseInt(searchParams.get('matchMin') || '60');
  const matchMax = parseInt(searchParams.get('matchMax') || '100');
  const roleTypeFilter = (searchParams.get('roleType') || 'all') as RoleType;
  const skillFilter = searchParams.get('skills')?.split(',') || [];
  const sortBy = (searchParams.get('sort') || 'best-match') as SortOption;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

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
    updateURLParams({ search: value || null });
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status];
    updateURLParams({ status: newStatus.length > 0 ? newStatus.join(',') : null });
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

  if (loading) {
    return (
      <div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Control Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 mb-8 shadow-sm">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter (using computed statuses from API) */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              {['new', 'recommended', 'unlocked', 'locked', 'stretch'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    statusFilter.includes(status)
                      ? 'bg-brand-light text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Match % Range */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Match:</span>
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
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-light"
                />
                <span className="text-xs text-gray-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={matchMax}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 100));
                    handleMatchRangeChange(matchMin, val);
                  }}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-light"
                />
                <span className="text-xs text-gray-600">%</span>
              </div>
            </div>

            {/* Skills Filter */}
            {allSkills.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Skills:</span>
                {skillFilter.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {skillFilter.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-brand-light/10 text-brand-light text-xs font-medium rounded-full"
                      >
                        {skill}
                        <button
                          onClick={() => {
                            const newSkills = skillFilter.filter(s => s !== skill);
                            updateURLParams({ skills: newSkills.length > 0 ? newSkills.join(',') : null });
                          }}
                          className="hover:text-brand-light/70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !skillFilter.includes(e.target.value)) {
                      updateURLParams({ skills: [...skillFilter, e.target.value].join(',') });
                      e.target.value = '';
                    }
                  }}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
                >
                  <option value="">Add skill...</option>
                  {allSkills.filter(skill => !skillFilter.includes(skill)).map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              >
                <option value="best-match">Best Match</option>
                <option value="newest">Newest</option>
                <option value="least-missing">Least Missing Skills</option>
                <option value="company-az">Company A-Z</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredAndSortedJobs.length} of {jobs.length} jobs
          </div>
        </div>
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
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery || statusFilter.length > 0 || skillFilter.length > 0
              ? 'No jobs match your filters. Try adjusting your search criteria.'
              : "We'll recommend jobs once you complete a course or add a project."}
          </p>
          {!searchQuery && statusFilter.length === 0 && skillFilter.length === 0 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Link
                href="/student/courses"
                className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
              >
                Browse Courses
              </Link>
              <Link
                href="/student/portfolio"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Add a Project
              </Link>
            </div>
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
