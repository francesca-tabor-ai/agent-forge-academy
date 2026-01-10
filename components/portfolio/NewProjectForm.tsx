'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function NewProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    github_url: '',
    demo_url: '',
    visibility: 'private' as 'private' | 'recruiters_only' | 'public',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const project = await response.json();
      router.push(`/student/portfolio/${project.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="text-sm text-brand-light hover:text-brand-light/90 font-medium flex items-center gap-2"
        >
          <span>{showGuide ? '▼' : '▶'}</span>
          <span>How to add a strong AI project (2–5 minutes)</span>
        </button>
        {showGuide && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-gray-700 space-y-3">
            <div>
              <strong>Title:</strong> Use format: <em>What it is + who it's for + key tech</em>
              <br />
              <span className="text-gray-600">Example: "RAG Support Bot for E-commerce (FastAPI + Pinecone)"</span>
            </div>
            <div>
              <strong>Description:</strong> Include these 5 bullets:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-gray-600">
                <li><strong>Problem:</strong> What did you build and why?</li>
                <li><strong>Users:</strong> Who is it for?</li>
                <li><strong>Approach:</strong> How does it work (high level)?</li>
                <li><strong>AI/ML:</strong> What models or techniques did you use?</li>
                <li><strong>Results:</strong> Metrics, learnings, or impact</li>
              </ul>
            </div>
            <div>
              <strong>GitHub URL:</strong> Make sure your README includes setup steps, screenshots, and architecture notes.
            </div>
            <div>
              <strong>Demo URL:</strong> Link to a live demo or video (Loom/YouTube is fine).
            </div>
            <div className="pt-2 border-t border-blue-200">
              <strong>💡 Tip:</strong> If you're unsure, submit now and improve later — you can edit this project anytime.
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="RAG Support Bot for E-commerce (FastAPI + Pinecone)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: What it is + who it's for + key tech
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent font-mono text-sm"
            placeholder={`• **Problem:** What did you build and why?
• **Users:** Who is it for?
• **Approach:** How does it work (high level)?
• **AI/ML:** What models or techniques did you use (RAG, fine-tuning, agents, CV, etc.)?
• **Results:** Metrics, learnings, or impact (latency, cost, accuracy, qualitative feedback).`}
          />
          <p className="mt-1 text-xs text-gray-500">Markdown supported. Include the 5 bullets above for best results.</p>
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
              placeholder="https://github.com/username/repo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Make sure your README includes setup steps and screenshots</p>
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
              placeholder="https://demo.example.com or Loom/YouTube link"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Live demo or video (Loom/YouTube is fine)</p>
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
              <option value="recruiters_only">Recruiters Only - Recommended when applying</option>
              <option value="public">Public - Shareable link on your profile</option>
            </select>
            <p className="text-xs text-gray-500">
              {formData.visibility === 'private' && 'This project is only visible to you.'}
              {formData.visibility === 'recruiters_only' && 'This project is visible to verified recruiters who can request contact. Recommended when applying.'}
              {formData.visibility === 'public' && 'This project is visible to everyone, including other students and instructors. Shareable link on your profile.'}
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
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-light rounded-md hover:bg-brand-light/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}

