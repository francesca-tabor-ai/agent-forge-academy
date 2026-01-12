'use client';

import { ActiveContext } from './AIAdvisor';
import { useState } from 'react';

interface ContextSelectorModalProps {
  activeCourses: Array<{ id: string; slug: string; title: string }>;
  activeProjects: Array<{ id: string; title: string }>;
  activeJobs: Array<{ id: string; title: string; company: string }>;
  currentContext: ActiveContext;
  onSelectContext: (context: ActiveContext) => void;
  onClose: () => void;
}

export function ContextSelectorModal({
  activeCourses,
  activeProjects,
  activeJobs,
  currentContext,
  onSelectContext,
  onClose,
}: ContextSelectorModalProps) {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(
    currentContext.course?.id || null
  );
  const [selectedProject, setSelectedProject] = useState<string | null>(
    currentContext.project?.id || null
  );
  const [selectedJob, setSelectedJob] = useState<string | null>(
    currentContext.job?.id || null
  );

  const handleApply = async () => {
    const newContext: ActiveContext = {};
    
    if (selectedCourse) {
      const course = activeCourses.find((c) => c.id === selectedCourse);
      if (course) newContext.course = course;
    }
    
    if (selectedProject) {
      const project = activeProjects.find((p) => p.id === selectedProject);
      if (project) newContext.project = project;
    }
    
    if (selectedJob) {
      const job = activeJobs.find((j) => j.id === selectedJob);
      if (job) newContext.job = job;
    }
    
    // Persist to database
    try {
      await fetch('/api/advisor/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activeCourseId: selectedCourse || null,
          activeProjectId: selectedProject || null,
          activeJobId: selectedJob || null,
        }),
      });
    } catch (error) {
      console.error('Error persisting context:', error);
      // Continue anyway - context will still be set in UI
    }
    
    onSelectContext(newContext);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Change Context</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Course
            </label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {activeCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Project
            </label>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {activeProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {/* Job Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Job / Application
            </label>
            <select
              value={selectedJob || ''}
              onChange={(e) => setSelectedJob(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {activeJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} at {job.company}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 ease-out text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-200 ease-out text-sm font-medium"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
