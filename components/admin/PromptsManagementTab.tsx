'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';

interface Prompt {
  id: string;
  startup_id: string;
  prompt_type: string;
  prompt_text: string;
  difficulty: string;
  startups?: {
    name: string;
  };
}

interface PromptsManagementTabProps {
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => Promise<void>;
}

export function PromptsManagementTab({ onEdit, onDelete }: PromptsManagementTabProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      } else {
        console.error('Failed to load prompts:', response.statusText);
      }
    } catch (err) {
      console.error('Failed to load prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      // Reload after successful delete
      loadPrompts();
    } catch (err) {
      // Error already handled by onDelete
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-ca-neutral-400 mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
          <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Startup</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Type</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider hidden sm:table-cell">Difficulty</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider hidden md:table-cell">Preview</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            {prompts.map((prompt) => (
              <tr key={prompt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {prompt.startups?.name || 'N/A'}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500 capitalize">
                  {prompt.prompt_type}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500 capitalize hidden sm:table-cell">
                  {prompt.difficulty}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-ca-neutral-500 max-w-md hidden md:table-cell">
                  <div className="truncate">{prompt.prompt_text.substring(0, 100)}...</div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(prompt)}
                      className="text-ca-gold hover:text-ca-navy transition-colors"
                      title="Edit prompt"
                      aria-label="Edit prompt"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete prompt"
                      aria-label="Delete prompt"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {prompts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ca-neutral-500 font-sans">No prompts found</p>
        </div>
      )}
    </div>
  );
}
