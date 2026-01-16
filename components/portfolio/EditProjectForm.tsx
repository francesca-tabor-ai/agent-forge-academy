'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from './RichTextEditor';
import { ProjectImageUpload } from './ProjectImageUpload';
import { ProjectToolStack } from './ProjectToolStack';
import { ProjectToolOffers } from './ProjectToolOffers';

interface GalleryImage {
  id: string;
  url: string;
  sort_order: number;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
  visibility: 'private' | 'recruiters_only' | 'public';
  cover_image_url?: string | null;
  images?: GalleryImage[] | null;
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
    cover_image_url: project.cover_image_url || '',
    images: (project.images as GalleryImage[]) || [],
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
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          github_url: formData.github_url,
          demo_url: formData.demo_url,
          visibility: formData.visibility,
          // Images are now handled separately via dedicated API routes
        }),
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Describe your project. Use markdown for formatting."
            minHeight="250px"
            maxLength={5000}
          />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-transparent"
            />
          </div>
        </div>

        {/* Project Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Images
          </label>
          <ProjectImageUpload
            projectId={project.id}
            coverImageUrl={formData.cover_image_url}
            images={formData.images}
            onImagesChange={(coverUrl, images) => {
              // Images are automatically saved via API, just update local state for display
              setFormData({
                ...formData,
                cover_image_url: coverUrl || '',
                images,
              });
            }}
          />
        </div>

        {/* Tool Stack */}
        <div className="border-t border-gray-200 pt-6">
          <ProjectToolStack projectId={project.id} />
        </div>

        {/* Relevant Offers */}
        <div className="border-t border-gray-200 pt-6">
          <ProjectToolOffers projectId={project.id} />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-transparent"
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
            className="btn-secondary text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || saveState === 'saving'}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

