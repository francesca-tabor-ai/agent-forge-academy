'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JobOpportunitiesSectionProps {
  studentProfileId: string | null;
}

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  matchingScore: number;
  skills: string[];
  isNew: boolean;
  unlockedByCourse?: string;
}

interface SavedApplication {
  id: string;
  jobTitle: string;
  company: string;
  status: 'draft' | 'applied' | 'interview';
  savedAt: string;
}

export function JobOpportunitiesSection({ studentProfileId }: JobOpportunitiesSectionProps) {
  const [recommendedJobs, setRecommendedJobs] = useState<JobOpportunity[]>([]);
  const [savedApplications, setSavedApplications] = useState<SavedApplication[]>([]);
  const [newOpportunitiesCount, setNewOpportunitiesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // For now, using mock data
    setTimeout(() => {
      setRecommendedJobs([
        {
          id: '1',
          title: 'Senior AI Engineer',
          company: 'Tech Corp',
          matchingScore: 85,
          skills: ['Multi-Agent Systems', 'RAG', 'LLM'],
          isNew: true,
        },
        {
          id: '2',
          title: 'AI Product Manager',
          company: 'StartupXYZ',
          matchingScore: 72,
          skills: ['Agentic Commerce', 'Product Strategy'],
          isNew: true,
          unlockedByCourse: 'agentic-commerce',
        },
        {
          id: '3',
          title: 'ML Engineer',
          company: 'DataCo',
          matchingScore: 68,
          skills: ['Recommender Systems', 'Python'],
          isNew: false,
        },
      ]);

      setSavedApplications([
        {
          id: '1',
          jobTitle: 'AI Engineer',
          company: 'Company A',
          status: 'applied',
          savedAt: '2024-01-15',
        },
        {
          id: '2',
          jobTitle: 'Product Manager',
          company: 'Company B',
          status: 'draft',
          savedAt: '2024-01-20',
        },
      ]);

      setNewOpportunitiesCount(2);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
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

  const getMatchingColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Job Opportunities</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-500">Loading opportunities...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Job Opportunities</h2>
        {newOpportunitiesCount > 0 && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
            {newOpportunitiesCount} new since last login
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Recommended Roles */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Recommended for You</h3>
          {recommendedJobs.length > 0 ? (
            <div className="space-y-4">
              {recommendedJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-brand-light transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{job.title}</h4>
                        {job.isNew && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            New
                          </span>
                        )}
                        {job.unlockedByCourse && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{job.company}</p>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-semibold ${getMatchingColor(job.matchingScore)}`}>
                          {job.matchingScore}% Match
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button className="text-xs font-medium text-brand-light hover:text-brand-light/90">
                      Generate CV →
                    </button>
                    <button className="text-xs font-medium text-brand-light hover:text-brand-light/90">
                      Cover Letter →
                    </button>
                    <button className="text-xs font-medium text-brand-light hover:text-brand-light/90">
                      Tailor Portfolio →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recommendations available. Complete courses to unlock opportunities.</p>
          )}
        </div>

        {/* Saved Applications */}
        {savedApplications.length > 0 && (
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-base font-medium text-gray-900 mb-4">Saved Applications</h3>
            <div className="space-y-3">
              {savedApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.jobTitle}</p>
                    <p className="text-xs text-gray-600">{app.company}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(app.status)}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                    <Link
                      href={`/student/jobs/${app.id}`}
                      className="text-xs font-medium text-brand-light hover:text-brand-light/90"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Generate Custom CV
            </button>
            <button className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Generate Cover Letter
            </button>
            <button className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Browse All Jobs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
