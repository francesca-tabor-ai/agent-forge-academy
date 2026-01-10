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
  location: string;
  matchingScore: number;
  skills: string[];
  skillsMatched: string[];
  skillsMissing: string[];
  salaryRange?: { min: number; max: number; currency: string };
  isNew: boolean;
  postedDate: string;
  unlockedByCourse?: string;
  applicationDeadline?: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote: boolean;
}

interface SavedApplication {
  id: string;
  jobTitle: string;
  company: string;
  status: 'draft' | 'applied' | 'interview' | 'rejected' | 'offer';
  savedAt: string;
  appliedAt?: string;
  matchingScore: number;
  nextAction?: string;
}

export function JobOpportunitiesSection({ studentProfileId }: JobOpportunitiesSectionProps) {
  const [recommendedJobs, setRecommendedJobs] = useState<JobOpportunity[]>([]);
  const [savedApplications, setSavedApplications] = useState<SavedApplication[]>([]);
  const [newOpportunitiesCount, setNewOpportunitiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'recommended' | 'saved' | 'tools'>('recommended');

  useEffect(() => {
    // TODO: Replace with actual API call
    // For now, using mock data
    setTimeout(() => {
      setRecommendedJobs([
        {
          id: '1',
          title: 'Senior AI Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          matchingScore: 85,
          skills: ['Multi-Agent Systems', 'RAG', 'LLM', 'Python', 'LangChain'],
          skillsMatched: ['Multi-Agent Systems', 'RAG', 'LLM', 'Python'],
          skillsMissing: ['LangChain'],
          salaryRange: { min: 150000, max: 200000, currency: 'USD' },
          isNew: true,
          postedDate: '2024-01-20',
          jobType: 'full-time',
          remote: true,
        },
        {
          id: '2',
          title: 'AI Product Manager',
          company: 'StartupXYZ',
          location: 'Remote',
          matchingScore: 72,
          skills: ['Agentic Commerce', 'Product Strategy', 'AI/ML'],
          skillsMatched: ['Agentic Commerce', 'Product Strategy'],
          skillsMissing: ['AI/ML'],
          salaryRange: { min: 120000, max: 160000, currency: 'USD' },
          isNew: true,
          postedDate: '2024-01-19',
          unlockedByCourse: 'agentic-commerce',
          jobType: 'full-time',
          remote: true,
          applicationDeadline: '2024-02-15',
        },
        {
          id: '3',
          title: 'ML Engineer',
          company: 'DataCo',
          location: 'New York, NY',
          matchingScore: 68,
          skills: ['Recommender Systems', 'Python', 'TensorFlow'],
          skillsMatched: ['Recommender Systems', 'Python'],
          skillsMissing: ['TensorFlow'],
          salaryRange: { min: 130000, max: 180000, currency: 'USD' },
          isNew: false,
          postedDate: '2024-01-15',
          jobType: 'full-time',
          remote: false,
        },
      ]);

      setSavedApplications([
        {
          id: '1',
          jobTitle: 'AI Engineer',
          company: 'Company A',
          status: 'applied',
          savedAt: '2024-01-15',
          appliedAt: '2024-01-16',
          matchingScore: 82,
          nextAction: 'Follow up in 1 week',
        },
        {
          id: '2',
          jobTitle: 'Product Manager',
          company: 'Company B',
          status: 'draft',
          savedAt: '2024-01-20',
          matchingScore: 75,
          nextAction: 'Complete application',
        },
        {
          id: '3',
          jobTitle: 'Senior ML Engineer',
          company: 'Company C',
          status: 'interview',
          savedAt: '2024-01-10',
          appliedAt: '2024-01-12',
          matchingScore: 88,
          nextAction: 'Prepare for technical interview',
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
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'offer':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return '📝';
      case 'applied':
        return '📤';
      case 'interview':
        return '🤝';
      case 'rejected':
        return '❌';
      case 'offer':
        return '🎉';
      default:
        return '📋';
    }
  };

  const getMatchingColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatSalary = (range?: { min: number; max: number; currency: string }) => {
    if (!range) return null;
    return `$${range.min.toLocaleString()} - $${range.max.toLocaleString()} ${range.currency}`;
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
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
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Job Opportunities</h2>
          <p className="text-sm text-gray-600 mt-1">Mission control for getting hired</p>
        </div>
        {newOpportunitiesCount > 0 && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
            {newOpportunitiesCount} new since last login
          </span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setSelectedTab('recommended')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'recommended'
                  ? 'border-brand-light text-brand-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recommended ({recommendedJobs.length})
            </button>
            <button
              onClick={() => setSelectedTab('saved')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'saved'
                  ? 'border-brand-light text-brand-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Saved Applications ({savedApplications.length})
            </button>
            <button
              onClick={() => setSelectedTab('tools')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                selectedTab === 'tools'
                  ? 'border-brand-light text-brand-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tools
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Recommended Jobs Tab */}
          {selectedTab === 'recommended' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Recommended for You</h3>
                {recommendedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-5 border border-gray-200 rounded-lg hover:border-brand-light transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-base font-semibold text-gray-900">{job.title}</h4>
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
                            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                              <span className="font-medium">{job.company}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                              {job.remote && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600">🌐 Remote</span>
                                </>
                              )}
                            </div>
                            
                            {/* Matching Score and Skills */}
                            <div className="flex items-center gap-4 mb-3">
                              <div className={`px-3 py-1 rounded-full ${getMatchingColor(job.matchingScore)}`}>
                                <span className="text-sm font-semibold">
                                  {job.matchingScore}% Match
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                Posted {getDaysAgo(job.postedDate)}
                              </span>
                              {job.applicationDeadline && (
                                <span className="text-xs text-orange-600">
                                  Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Skills Analysis */}
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-700">Skills Match:</span>
                                <span className="text-xs text-green-600">
                                  {job.skillsMatched.length}/{job.skills.length} matched
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {job.skillsMatched.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                                  >
                                    ✓ {skill}
                                  </span>
                                ))}
                                {job.skillsMissing.map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded"
                                  >
                                    ○ {skill}
                                  </span>
                                ))}
                              </div>
                              {job.skillsMissing.length > 0 && (
                                <p className="text-xs text-yellow-600">
                                  💡 Complete courses to learn: {job.skillsMissing.join(', ')}
                                </p>
                              )}
                            </div>

                            {/* Salary and Job Type */}
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              {job.salaryRange && (
                                <span className="font-medium text-gray-900">
                                  💰 {formatSalary(job.salaryRange)}
                                </span>
                              )}
                              <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                          <button className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium">
                            Save Job
                          </button>
                          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                            Generate CV
                          </button>
                          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                            Cover Letter
                          </button>
                          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                            Tailor Portfolio
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500 mb-4">No recommendations available.</p>
                    <p className="text-xs text-gray-400 mb-6">
                      Complete courses to unlock more opportunities and improve your matching score.
                    </p>
                    <Link
                      href="/student/courses"
                      className="text-sm font-medium text-brand-light hover:text-brand-light/90"
                    >
                      Browse Courses →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Saved Applications Tab */}
          {selectedTab === 'saved' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Your Applications</h3>
                {savedApplications.length > 0 ? (
                  <div className="space-y-4">
                    {savedApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-brand-light transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getStatusIcon(app.status)}</span>
                              <h4 className="text-base font-semibold text-gray-900">{app.jobTitle}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(app.status)}`}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{app.company}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Match: {app.matchingScore}%</span>
                              <span>•</span>
                              <span>Saved {getDaysAgo(app.savedAt)}</span>
                              {app.appliedAt && (
                                <>
                                  <span>•</span>
                                  <span>Applied {getDaysAgo(app.appliedAt)}</span>
                                </>
                              )}
                            </div>
                            {app.nextAction && (
                              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                                <p className="text-xs font-medium text-blue-800 mb-1">Next Action</p>
                                <p className="text-sm text-blue-700">{app.nextAction}</p>
                              </div>
                            )}
                          </div>
                          <Link
                            href={`/student/jobs/${app.id}`}
                            className="ml-4 text-sm font-medium text-brand-light hover:text-brand-light/90 whitespace-nowrap"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No saved applications yet.</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Save jobs you're interested in to track your applications.
                    </p>
                  </div>
                )}
              </div>

              {/* Application Statistics */}
              {savedApplications.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Application Stats</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{savedApplications.length}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-900">
                        {savedApplications.filter(a => a.status === 'applied').length}
                      </p>
                      <p className="text-xs text-blue-600">Applied</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-900">
                        {savedApplications.filter(a => a.status === 'interview').length}
                      </p>
                      <p className="text-xs text-green-600">Interviews</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-900">
                        {savedApplications.filter(a => a.status === 'offer').length}
                      </p>
                      <p className="text-xs text-purple-600">Offers</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(
                          savedApplications.reduce((sum, a) => sum + a.matchingScore, 0) /
                          savedApplications.length
                        )}%
                      </p>
                      <p className="text-xs text-gray-500">Avg Match</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tools Tab */}
          {selectedTab === 'tools' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-4">Career Tools</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Use AI-powered tools to streamline your job application process
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 border border-gray-200 rounded-lg hover:border-brand-light transition-colors">
                    <div className="text-3xl mb-3">📄</div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Generate Custom CV</h4>
                    <p className="text-xs text-gray-600 mb-4">
                      Create a tailored CV for each job application based on the job description and your skills.
                    </p>
                    <button className="w-full px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium">
                      Generate CV →
                    </button>
                  </div>

                  <div className="p-5 border border-gray-200 rounded-lg hover:border-brand-light transition-colors">
                    <div className="text-3xl mb-3">✉️</div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Generate Cover Letter</h4>
                    <p className="text-xs text-gray-600 mb-4">
                      Write compelling cover letters that highlight your relevant experience and skills.
                    </p>
                    <button className="w-full px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium">
                      Generate Letter →
                    </button>
                  </div>

                  <div className="p-5 border border-gray-200 rounded-lg hover:border-brand-light transition-colors">
                    <div className="text-3xl mb-3">🎯</div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Tailor Portfolio</h4>
                    <p className="text-xs text-gray-600 mb-4">
                      Get recommendations on which projects to highlight for specific job applications.
                    </p>
                    <button className="w-full px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium">
                      Tailor Portfolio →
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-left">
                    📊 View Application Analytics
                  </button>
                  <button className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-left">
                    🔍 Browse All Job Listings
                  </button>
                  <button className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-left">
                    📈 Track Application Progress
                  </button>
                  <button className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-left">
                    🎓 Skills Gap Analysis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
