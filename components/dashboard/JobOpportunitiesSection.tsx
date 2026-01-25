'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { JobOpportunity } from '@/lib/types/job-opportunity';

interface JobOpportunitiesSectionProps {
  studentProfileId: string | null;
}

interface SavedApplication {
  id: string;
  jobTitle: string;
  company: string;
  status: 'draft' | 'applied' | 'interview';
}

export function JobOpportunitiesSection({ studentProfileId }: JobOpportunitiesSectionProps) {
  const [recommendedJobs, setRecommendedJobs] = useState<JobOpportunity[]>([]);
  const [savedApplications, setSavedApplications] = useState<SavedApplication[]>([]);
  const [newOpportunitiesCount, setNewOpportunitiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<{ [key: string]: boolean }>({});
  const [generatedContent, setGeneratedContent] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState<{ type: 'cv' | 'cover-letter' | 'portfolio' | null; jobId: string | null }>({ type: null, jobId: null });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          // Try to read error message from response
          let errorMessage = 'Failed to fetch jobs';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        // Map API response (snake_case) to component format with computed fields
        const mappedJobs = (data.jobs || []).map((job: any) => ({
          ...job,
          // Ensure computed fields are used (from API)
          matching_score: job.matching_score ?? 0,
          status: job.status ?? 'new',
          skills_missing: job.skills_missing ?? [],
          // Legacy camelCase for backward compatibility
          matchingScore: job.matching_score,
          skillsMissing: job.skills_missing,
          isLocked: job.status === 'locked',
          isStretch: job.status === 'stretch',
        }));
        setRecommendedJobs(mappedJobs);
        
        // Count new jobs (status === 'new') - use computed status from API
        const newCount = mappedJobs.filter((job: JobOpportunity) => job.status === 'new').length;
        setNewOpportunitiesCount(newCount);
        
        // TODO: Fetch saved applications from database when job_applications table is created
        setSavedApplications([]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Don't show error in dashboard section - just log it
        // The main jobs page will handle errors with retry UI
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return { label: 'New', className: 'bg-green-100 text-green-700' };
      case 'unlocked':
        return { label: 'Unlocked', className: 'bg-blue-100 text-blue-700' };
      case 'recommended':
        return { label: 'Recommended', className: 'bg-purple-100 text-purple-700' };
      default:
        return null;
    }
  };

  const getMatchingColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'applied':
        return 'bg-blue-100 text-blue-700';
      case 'interview':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Limit to 5-7 recommended jobs
  const displayedJobs = recommendedJobs.slice(0, 7);

  const handleGenerateCV = async (jobId: string) => {
    if (!studentProfileId) {
      alert('Please log in to generate a CV');
      return;
    }

    setGenerating({ ...generating, [`cv-${jobId}`]: true });
    try {
      const response = await fetch('/api/jobs/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, useExistingCV: false }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate CV');
      }

      const data = await response.json();
      setGeneratedContent({ ...generatedContent, [`cv-${jobId}`]: data.content });
      setShowModal({ type: 'cv', jobId });
    } catch (error: any) {
      console.error('Error generating CV:', error);
      alert(`Failed to generate CV: ${error.message}`);
    } finally {
      setGenerating({ ...generating, [`cv-${jobId}`]: false });
    }
  };

  const handleGenerateCoverLetter = async (jobId: string) => {
    if (!studentProfileId) {
      alert('Please log in to generate a cover letter');
      return;
    }

    setGenerating({ ...generating, [`cover-${jobId}`]: true });
    try {
      const response = await fetch('/api/jobs/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate cover letter');
      }

      const data = await response.json();
      setGeneratedContent({ ...generatedContent, [`cover-${jobId}`]: data.content });
      setShowModal({ type: 'cover-letter', jobId });
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      alert(`Failed to generate cover letter: ${error.message}`);
    } finally {
      setGenerating({ ...generating, [`cover-${jobId}`]: false });
    }
  };

  const handleTailorPortfolio = async (jobId: string) => {
    if (!studentProfileId) {
      alert('Please log in to tailor your portfolio');
      return;
    }

    setGenerating({ ...generating, [`portfolio-${jobId}`]: true });
    try {
      const response = await fetch('/api/jobs/tailor-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to tailor portfolio');
      }

      const data = await response.json();
      if (data.recommendedProjectIds && data.recommendedProjectIds.length > 0) {
        // Redirect to portfolio page with recommended projects highlighted
        const projectIds = data.recommendedProjectIds.join(',');
        window.location.href = `/student/portfolio?highlight=${projectIds}&jobId=${jobId}`;
      } else {
        alert(data.explanation || 'No projects found to tailor. Consider adding projects that match the job requirements.');
      }
    } catch (error: any) {
      console.error('Error tailoring portfolio:', error);
      alert(`Failed to tailor portfolio: ${error.message}`);
    } finally {
      setGenerating({ ...generating, [`portfolio-${jobId}`]: false });
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Loading opportunities...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header - Only show new count badge, title removed to avoid duplication */}
      {newOpportunitiesCount > 0 && (
        <div className="flex justify-end">
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
            {newOpportunitiesCount} new since last login
          </span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Recommended Jobs */}
        {displayedJobs.length > 0 ? (
          <div className="space-y-4 mb-8">
            {displayedJobs.map((job) => {
              const statusBadge = getStatusBadge(job.status);
              const isLockedOrStretch = job.status === 'locked' || job.status === 'stretch';

              return (
                <Link
                  key={job.id}
                  href={`/student/jobs/${job.id}`}
                  className="block p-5 border border-gray-200 rounded-lg hover:border-brand-light transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-base font-semibold text-gray-900">{job.title}</h4>
                        {statusBadge && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusBadge.className}`}>
                            {statusBadge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{job.company}</p>

                      {/* Match Score (computed from API) */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`px-3 py-1 rounded-full ${getMatchingColor(job.matching_score ?? job.matchingScore ?? 0)}`}>
                          <span className="text-sm font-semibold">
                            {job.matching_score ?? job.matchingScore ?? 0}% Match
                          </span>
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Locked/Stretch Role Messaging (using computed skills_missing from API) */}
                      {isLockedOrStretch && (job.skills_missing ?? job.skillsMissing ?? []).length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs font-medium text-yellow-800 mb-1">
                            {job.status === 'locked' ? '🔒 One step away' : '🎯 Close match'}
                          </p>
                          <div className="space-y-1">
                            {(job.skills_missing ?? job.skillsMissing ?? []).map((skill, idx) => (
                              <p key={idx} className="text-xs text-yellow-700">
                                • Complete: {skill}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100" onClick={(e) => e.preventDefault()}>
                    <button 
                      className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateCV(job.id);
                      }}
                      disabled={generating[`cv-${job.id}`]}
                    >
                      {generating[`cv-${job.id}`] ? 'Generating...' : 'Generate CV'}
                    </button>
                    <button 
                      className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateCoverLetter(job.id);
                      }}
                      disabled={generating[`cover-${job.id}`]}
                    >
                      {generating[`cover-${job.id}`] ? 'Generating...' : 'Cover Letter'}
                    </button>
                    <button 
                      className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTailorPortfolio(job.id);
                      }}
                      disabled={generating[`portfolio-${job.id}`]}
                    >
                      {generating[`portfolio-${job.id}`] ? 'Tailoring...' : 'Tailor Portfolio'}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 mb-8">
            <p className="text-sm text-gray-500 mb-2">
              We&apos;ll recommend jobs once you complete a course or add a project.
            </p>
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
          </div>
        )}

        {/* Saved / Active Applications */}
        {savedApplications.length > 0 && (
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-4">Saved Applications</h3>
            <div className="space-y-3">
              {savedApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-brand-light transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{app.jobTitle}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getApplicationStatusColor(app.status)}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{app.company}</p>
                    </div>
                    <Link
                      href={`/student/jobs/${app.id}`}
                      className="ml-4 text-sm font-medium text-brand-light hover:text-brand-light/90 whitespace-nowrap"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Actions */}
        {displayedJobs.length > 0 && (
          <div className="pt-8 border-t border-gray-200 mt-8">
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Generate Custom CV
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                Generate Cover Letter
              </button>
              <Link
                href="/student/jobs"
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Browse All Jobs
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modal for displaying generated CV or Cover Letter */}
      {showModal.type && showModal.jobId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {showModal.type === 'cv' ? 'Generated CV' : 'Generated Cover Letter'}
                </h2>
                <button
                  onClick={() => setShowModal({ type: null, jobId: null })}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <textarea
                  value={generatedContent[`${showModal.type === 'cv' ? 'cv' : 'cover'}-${showModal.jobId}`] || ''}
                  onChange={(e) => {
                    setGeneratedContent({
                      ...generatedContent,
                      [`${showModal.type === 'cv' ? 'cv' : 'cover'}-${showModal.jobId}`]: e.target.value,
                    });
                  }}
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const content = generatedContent[`${showModal.type === 'cv' ? 'cv' : 'cover'}-${showModal.jobId}`] || '';
                    navigator.clipboard.writeText(content);
                    alert('Copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowModal({ type: null, jobId: null })}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
