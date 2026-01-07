'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
  visibility: 'private' | 'recruiters_only' | 'public';
}

interface EditProjectFormProps {
  project: Project;
}

export function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    github_url: project.github_url || '',
    demo_url: project.demo_url || '',
    visibility: project.visibility,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaveState('saving');

    try {
      const response = await fetch(`/api/portfolio/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update project');
      }

      setSaveState('saved');
      setTimeout(() => {
        router.push('/student/portfolio');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSaveState('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Edit Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {saveState === 'saved' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800">Project saved successfully</p>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent font-mono text-sm"
            placeholder="Describe your project. Use markdown for formatting."
          />
          <p className="mt-1 text-xs text-gray-500">Markdown supported</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub URL
            </label>
            <input
              id="github_url"
              type="url"
              value={formData.github_url}
              onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="demo_url" className="block text-sm font-medium text-gray-700 mb-2">
              Demo URL
            </label>
            <input
              id="demo_url"
              type="url"
              value={formData.demo_url}
              onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
            Visibility
          </label>
          <div className="space-y-2">
            <select
              id="visibility"
              value={formData.visibility}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  visibility: e.target.value as 'private' | 'recruiters_only' | 'public',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
            >
              <option value="private">Private - Only you can see this</option>
              <option value="recruiters_only">Recruiters Only - Visible to verified recruiters</option>
              <option value="public">Public - Visible to everyone</option>
            </select>
            <p className="text-xs text-gray-500">
              {formData.visibility === 'private' && 'This project is only visible to you.'}
              {formData.visibility === 'recruiters_only' && 'This project is visible to verified recruiters who can request contact.'}
              {formData.visibility === 'public' && 'This project is visible to everyone, including other students and instructors.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push('/student/portfolio')}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || saveState === 'saving'}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-light rounded-md hover:bg-brand-light/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

