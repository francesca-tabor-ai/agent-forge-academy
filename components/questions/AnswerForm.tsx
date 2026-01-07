'use client';

import { useState } from 'react';

interface AnswerFormProps {
  questionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AnswerForm({ questionId, onSuccess, onCancel }: AnswerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/questions/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          body,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post answer');
      }

      onSuccess();
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="answer-form">
      {error && <div className="error">{error}</div>}

      <div>
        <label htmlFor="answer-body">Your Answer *</label>
        <textarea
          id="answer-body"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          placeholder="Provide a helpful answer..."
        />
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Posting...' : 'Post Answer'}
        </button>
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}

