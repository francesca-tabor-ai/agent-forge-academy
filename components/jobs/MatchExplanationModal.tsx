'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  matchingScore?: number;
  matching_score?: number; // Computed from API
  status?: 'new' | 'unlocked' | 'recommended' | 'locked' | 'stretch'; // Computed from API
  skills: string[];
  skillsMissing?: string[];
  skills_missing?: string[]; // Computed from API
  explanation?: string; // Computed explanation from API
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
    // Use computed explanation from API if available, otherwise generate from job data
    const loadExplanation = async () => {
      try {
        // If job has explanation field from API, parse and use it
        if (job.explanation) {
          // Parse the explanation text to extract structured data
          // The explanation is a formatted string, so we'll extract what we can
          const missingSkills = job.skills_missing ?? job.skillsMissing ?? [];
          const matchedSkills = job.skills.filter(
            skill => !missingSkills.includes(skill)
          );

          const explanation: MatchExplanation = {
            matchedSkills,
            missingSkills,
            contributingProjects: [], // Would need to parse from explanation or fetch separately
            suggestedCourses: [], // Would need to parse from explanation or fetch separately
            impactEstimates: {},
          };
          setExplanation(explanation);
          setLoading(false);
          return;
        }

        // Fallback: Generate from job data (no explanation field available)
        const missingSkills = job.skills_missing ?? job.skillsMissing ?? [];
        const matchedSkills = job.skills.filter(
          skill => !missingSkills.includes(skill)
        );

        const explanation: MatchExplanation = {
          matchedSkills,
          missingSkills,
          contributingProjects: [
            { id: '1', title: 'View your portfolio', url: '/student/portfolio' },
          ],
          suggestedCourses: [],
          impactEstimates: {},
        };
        setExplanation(explanation);
        setLoading(false);
      } catch (error) {
        console.error('Error loading match explanation:', error);
        setLoading(false);
      }
    };

    loadExplanation();
  }, [job]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Why {(job.matching_score ?? job.matchingScore ?? 0)}% Match?
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
              {/* Computed Explanation Text (if available from API) */}
              {job.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Match Breakdown</h3>
                  <pre className="text-xs text-blue-800 whitespace-pre-wrap font-mono">
                    {job.explanation}
                  </pre>
                </div>
              )}

              {/* Matched Skills */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-600">✅</span> Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {explanation.matchedSkills.length > 0 ? (
                    explanation.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No matched skills found</span>
                  )}
                </div>
              </div>

              {/* Missing Skills (computed from API) */}
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
