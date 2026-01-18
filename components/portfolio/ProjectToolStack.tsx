'use client';

import { useState, useEffect } from 'react';
import { ToolLogo } from '../offers/ToolLogo';
import { X, Plus } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
}

interface ProjectToolStackProps {
  projectId: string;
  initialTools?: Tool[];
}

export function ProjectToolStack({ projectId, initialTools = [] }: ProjectToolStackProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddTool, setShowAddTool] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch tools on mount
  useEffect(() => {
    fetchProjectTools();
  }, [projectId]);

  const fetchProjectTools = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio/projects/${projectId}/tools`);
      if (!response.ok) {
        throw new Error('Failed to fetch project tools');
      }
      const data = await response.json();
      setTools(data.tools || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const searchTools = async (query: string) => {
    if (!query.trim()) {
      setAvailableTools([]);
      return;
    }

    setSearchLoading(true);
    try {
      // For now, we'll search in the offers table to find tools
      // In the future, this should search the tools table directly
      const response = await fetch(`/api/tools/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTools(data.tools || []);
      }
    } catch (err) {
      console.error('Error searching tools:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddTool = async (tool: Tool) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio/projects/${projectId}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_id: tool.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add tool');
      }

      setTools([...tools, tool]);
      setShowAddTool(false);
      setSearchQuery('');
      setAvailableTools([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tool');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTool = async (toolId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/portfolio/projects/${projectId}/tools?tool_id=${toolId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove tool');
      }

      setTools(tools.filter(t => t.id !== toolId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove tool');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchTools(query);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Tool Stack</h3>
        {!showAddTool && (
          <button
            onClick={() => setShowAddTool(true)}
            className="text-sm text-brand-light hover:text-brand-light/90 font-medium inline-flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add tool
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Add Tool Search */}
      {showAddTool && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Search tools</label>
            <button
              onClick={() => {
                setShowAddTool(false);
                setSearchQuery('');
                setAvailableTools([]);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for tools (e.g., Supabase, OpenAI, Cursor)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light text-sm"
          />
          {searchLoading && (
            <p className="text-xs text-gray-500 mt-2">Searching...</p>
          )}
          {availableTools.length > 0 && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {availableTools
                .filter(tool => !tools.some(t => t.id === tool.id))
                .map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => handleAddTool(tool)}
                    className="w-full flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                  >
                    <ToolLogo toolName={tool.name} logoUrl={tool.logo_url} size={32} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                      {tool.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">{tool.description}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Current Tools */}
      {loading && tools.length === 0 ? (
        <p className="text-sm text-gray-500">Loading tools...</p>
      ) : tools.length === 0 ? (
        <p className="text-sm text-gray-500">No tools added yet. Click &quot;Add tool&quot; to get started.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tools.map(tool => (
            <div
              key={tool.id}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-brand-light transition-colors"
            >
              <ToolLogo toolName={tool.name} logoUrl={tool.logo_url} size={24} />
              <span className="text-sm font-medium text-gray-900">{tool.name}</span>
              <button
                onClick={() => handleRemoveTool(tool.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="Remove tool"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
