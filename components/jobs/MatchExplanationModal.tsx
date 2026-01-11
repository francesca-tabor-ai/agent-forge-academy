'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  matchingScore: number;
  status?: 'new' | 'unlocked' | 'recommended' | 'locked' | 'stretch';
  skills: string[];
  skillsMissing?: string[];
}

interface MatchExplanationModalProps {
  job: JobOpportunity;
  studentProfileId: string | null;
  onClose: () => void;
}

interface MatchExplanation {
  matchedSkills: string[];
  missingSkills: string[];
  contributingProjects: Array<{ id: string; title: string; url: string }>;
  suggestedCourses: Array<{ slug: string; title: string }>;
  impactEstimates: {
    addProject?: string;
    completeCourse?: { course: string; impact: string };
  };
}

export function MatchExplanationModal({
  job,
  studentProfileId,
  onClose,
}: MatchExplanationModalProps) {
  const [explanation, setExplanation] = useState<MatchExplanation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch match explanation data
    const fetchExplanation = async () => {
      try {
        // TODO: Replace with actual API call when backend is ready
        // For now, generate mock data based on job data
        const mockExplanation: MatchExplanation = {
          matchedSkills: job.skills.slice(0, Math.ceil(job.skills.length * 0.7)),
          missingSkills: job.skillsMissing || [],
          contributingProjects: [
            { id: '1', title: 'E-commerce Platform', url: '/student/portfolio' },
            { id: '2', title: 'AI Chatbot', url: '/student/portfolio' },
          ],
          suggestedCourses: [
            { slug: 'agentic-rag', title: 'Agentic RAG Systems' },
            { slug: 'ai-recommender-systems', title: 'AI Recommender Systems' },
          ],
          impactEstimates: {
            addProject: '+5%',
            completeCourse: {
              course: 'Agentic RAG Systems',
              impact: '+8%',
            },
          },
        };
        setExplanation(mockExplanation);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching match explanation:', error);
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [job]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Why {job.matchingScore}% Match?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading explanation...</p>
          ) : explanation ? (
            <>
              {/* Matched Skills */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-600">✅</span> Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {explanation.matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {explanation.missingSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-yellow-600">⚠️</span> Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {explanation.missingSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-lg border border-yellow-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contributing Projects */}
              {explanation.contributingProjects.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-blue-600">📁</span> Portfolio Projects Contributing to Match
                  </h3>
                  <ul className="space-y-2">
                    {explanation.contributingProjects.map((project) => (
                      <li key={project.id}>
                        <Link
                          href={project.url}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {project.title} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Courses */}
              {explanation.suggestedCourses.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-purple-600">📚</span> Suggested Courses to Improve Match
                  </h3>
                  <ul className="space-y-2">
                    {explanation.suggestedCourses.map((course) => (
                      <li key={course.slug}>
                        <Link
                          href={`/student/courses/${course.slug}`}
                          className="text-sm text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          {course.title} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Impact Estimates */}
              {explanation.impactEstimates && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Estimated Impact
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {explanation.impactEstimates.addProject && (
                      <li>
                        Add 1 public project → <strong>{explanation.impactEstimates.addProject}</strong>
                      </li>
                    )}
                    {explanation.impactEstimates.completeCourse && (
                      <li>
                        Complete <strong>{explanation.impactEstimates.completeCourse.course}</strong> →{' '}
                        <strong>{explanation.impactEstimates.completeCourse.impact}</strong>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Unable to load match explanation.</p>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
