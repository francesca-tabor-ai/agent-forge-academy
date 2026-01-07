'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AskQuestionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    context_type: 'lesson' as 'lesson' | 'lab' | 'project',
    context_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create question');
      }

      const question = await response.json();
      router.push(`/student/questions?context_type=${formData.context_type}&context_id=${formData.context_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ask-question-form">
      {error && <div className="error">{error}</div>}

      <div>
        <label htmlFor="title">Question Title *</label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., How do I implement multi-agent communication?"
        />
      </div>

      <div>
        <label htmlFor="body">Question Details *</label>
        <textarea
          id="body"
          required
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          rows={10}
          placeholder="Provide details about your question..."
        />
      </div>

      <div>
        <label htmlFor="context_type">Context Type *</label>
        <select
          id="context_type"
          required
          value={formData.context_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              context_type: e.target.value as 'lesson' | 'lab' | 'project',
            })
          }
        >
          <option value="lesson">Lesson</option>
          <option value="lab">Lab</option>
          <option value="project">Project</option>
        </select>
      </div>

      <div>
        <label htmlFor="context_id">Context ID *</label>
        <input
          id="context_id"
          type="text"
          required
          value={formData.context_id}
          onChange={(e) => setFormData({ ...formData, context_id: e.target.value })}
          placeholder="e.g., lesson-01, lab-02, project-capstone"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Posting...' : 'Post Question'}
      </button>
    </form>
  );
}

