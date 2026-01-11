'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  link?: string;
  action?: () => void;
}

interface DiscoverabilityChecklistProps {
  hasBio: boolean;
  hasCV: boolean;
  hasProjects: boolean;
  hasSkills: boolean;
  hasLinks: boolean;
  studentProfileId: string;
}

export function DiscoverabilityChecklist({
  hasBio,
  hasCV,
  hasProjects,
  hasSkills,
  hasLinks,
  studentProfileId,
}: DiscoverabilityChecklistProps) {
  const [isOpen, setIsOpen] = useState(false);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'bio',
      label: 'Add Bio (rich text)',
      completed: hasBio,
      link: '/student/portfolio/profile/edit',
    },
    {
      id: 'cv',
      label: 'Upload CV',
      completed: hasCV,
      link: '/student/portfolio#cv',
    },
    {
      id: 'projects',
      label: 'Publish at least 1 project (public)',
      completed: hasProjects,
      link: '/student/portfolio/new',
    },
    {
      id: 'skills',
      label: 'Add skills (min 3)',
      completed: hasSkills,
      link: '/student/portfolio/profile/edit',
    },
    {
      id: 'links',
      label: 'Add links (GitHub/LinkedIn optional)',
      completed: hasLinks,
      link: '/student/portfolio/profile/edit',
    },
  ];

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary text-sm"
      >
        Make me discoverable
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Make Me Discoverable
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progress
                  </span>
                  <span className="text-sm text-gray-600">
                    {completedCount} of {totalCount} completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-light h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                {checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      item.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {item.completed ? '✓' : ''}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          item.completed ? 'text-green-800' : 'text-gray-700'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {!item.completed && item.link && (
                      <Link
                        href={item.link}
                        onClick={() => setIsOpen(false)}
                        className="text-sm text-brand-light hover:text-brand-light/90 font-medium"
                      >
                        Fix →
                      </Link>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-4">
                  Completing these steps will improve your visibility to recruiters and increase your chances of being discovered.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn-secondary text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
