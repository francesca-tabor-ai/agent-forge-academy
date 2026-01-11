'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  title: string;
}

interface AddOfferToProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: {
    id: string;
    title: string;
  };
  onAdded: (projectId: string, projectTitle: string) => void;
  linkedProjectIds?: string[]; // Projects that already have this offer linked
}

export function AddOfferToProjectModal({
  open,
  onOpenChange,
  offer,
  onAdded,
  linkedProjectIds = [],
}: AddOfferToProjectModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch projects when modal opens
  useEffect(() => {
    if (open) {
      fetchProjects();
    } else {
      // Reset state when modal closes
      setSelectedProjectId('');
      setError(null);
    }
  }, [open]);

  const fetchProjects = async () => {
    setFetchingProjects(true);
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setFetchingProjects(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedProjectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${selectedProjectId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId: offer.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add offer to project');
      }

      // Find the project title
      const project = projects.find(p => p.id === selectedProjectId);
      const projectTitle = project?.title || 'project';

      // Call the callback
      onAdded(selectedProjectId, projectTitle);

      // Close modal
      onOpenChange(false);
    } catch (err) {
      console.error('Error adding offer to project:', err);
      setError(err instanceof Error ? err.message : 'Failed to add offer to project');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    onOpenChange(false);
    router.push('/student/portfolio');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Add offer to project</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Offer info */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{offer.title}</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Projects list */}
        {fetchingProjects ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-light"></div>
            <p className="text-sm text-gray-600 mt-2">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-sm text-gray-600">You don't have any projects yet.</p>
            <button
              onClick={handleCreateProject}
              className="px-4 py-2 bg-brand-light text-white text-sm font-medium rounded-lg hover:bg-brand-light/90 transition-colors"
            >
              Create a project
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a project
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {projects.map((project) => {
                const isAlreadyLinked = linkedProjectIds.includes(project.id);
                return (
                  <label
                    key={project.id}
                    className={`flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 ${
                      isAlreadyLinked
                        ? 'bg-gray-50 opacity-60 cursor-not-allowed'
                        : selectedProjectId === project.id
                        ? 'bg-blue-50 cursor-pointer hover:bg-blue-100'
                        : 'cursor-pointer hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="project"
                      value={project.id}
                      checked={selectedProjectId === project.id}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="text-brand-light"
                      disabled={loading || isAlreadyLinked}
                    />
                    <span className="text-sm text-gray-900 flex-1">{project.title}</span>
                    {isAlreadyLinked && (
                      <span className="text-xs text-gray-500 italic">Already added</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          {projects.length > 0 && (
            <button
              onClick={handleAdd}
              disabled={loading || !selectedProjectId}
              className="flex-1 px-4 py-2 bg-brand-light text-white text-sm font-medium rounded-lg hover:bg-brand-light/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                'Add to project'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
