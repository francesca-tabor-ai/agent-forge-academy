'use client';

import { useState, useEffect, useCallback } from 'react';
import { ToolLogo } from '../offers/ToolLogo';
import { X, Plus, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

interface Tool {
  id: string;
  projectToolId?: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  version?: string | null;
  toolType?: 'catalog' | 'custom';
  order?: number;
}

interface ProjectToolStackProps {
  projectId: string;
  initialTools?: Tool[];
}

const TOOL_CATEGORIES = [
  'Framework',
  'Language',
  'Library',
  'Platform',
  'Cloud',
  'Database',
  'Tooling',
  'Other',
];

export function ProjectToolStack({ projectId, initialTools = [] }: ProjectToolStackProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddTool, setShowAddTool] = useState(false);
  const [addMode, setAddMode] = useState<'search' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  // Custom tool form state
  const [customToolForm, setCustomToolForm] = useState({
    name: '',
    category: '',
    version: '',
    url: '',
    notes: '',
    saveToMyTools: false,
  });
  const [customToolErrors, setCustomToolErrors] = useState<Record<string, string>>({});

  const fetchProjectTools = useCallback(async () => {
    setLoading(true);
    setError(null);
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
  }, [projectId]);

  // Fetch tools on mount
  useEffect(() => {
    fetchProjectTools();
  }, [fetchProjectTools]);

  const searchTools = async (query: string) => {
    if (!query.trim()) {
      setAvailableTools([]);
      return;
    }

    setSearchLoading(true);
    try {
      // Search both catalog and user's custom tools
      const response = await fetch(`/api/users/me/tools?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTools(data.tools || []);
      } else {
        // Fallback to catalog search if user tools endpoint fails
        const fallbackResponse = await fetch(`/api/tools/search?q=${encodeURIComponent(query)}`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setAvailableTools(fallbackData.tools || []);
        }
      }
    } catch (err) {
      console.error('Error searching tools:', err);
      // Non-blocking: allow custom tool form to still work
    } finally {
      setSearchLoading(false);
    }
  };

  const validateCustomTool = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customToolForm.name.trim()) {
      errors.name = 'Tool name is required';
    } else if (customToolForm.name.trim().length > 60) {
      errors.name = 'Tool name must be 60 characters or less';
    }

    // Check for duplicate name in current project tools
    const duplicate = tools.some(
      t => t.name.toLowerCase() === customToolForm.name.trim().toLowerCase()
    );
    if (duplicate) {
      errors.name = 'A tool with this name already exists in this project';
    }

    if (customToolForm.url.trim()) {
      try {
        new URL(customToolForm.url.trim());
      } catch {
        errors.url = 'Invalid URL format';
      }
    }

    setCustomToolErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCatalogTool = async (tool: Tool) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/portfolio/projects/${projectId}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogToolId: tool.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add tool');
      }

      await fetchProjectTools();
      setShowAddTool(false);
      setSearchQuery('');
      setAvailableTools([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tool');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomTool = async () => {
    if (!validateCustomTool()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/portfolio/projects/${projectId}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customTool: {
            name: customToolForm.name.trim(),
            category: customToolForm.category || undefined,
            version: customToolForm.version.trim() || undefined,
            url: customToolForm.url.trim() || undefined,
            notes: customToolForm.notes.trim() || undefined,
          },
          saveToMyTools: customToolForm.saveToMyTools,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add tool');
      }

      await fetchProjectTools();
      setShowAddTool(false);
      setAddMode('search');
      setCustomToolForm({
        name: '',
        category: '',
        version: '',
        url: '',
        notes: '',
        saveToMyTools: false,
      });
      setCustomToolErrors({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tool');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTool = async (tool: Tool) => {
    setLoading(true);
    setError(null);
    try {
      const projectToolId = tool.projectToolId || tool.id;
      const response = await fetch(
        `/api/portfolio/projects/${projectId}/tools?projectToolId=${projectToolId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove tool');
      }

      await fetchProjectTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove tool');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUp = async (tool: Tool) => {
    const currentIndex = tools.findIndex(t => t.projectToolId === tool.projectToolId || t.id === tool.id);
    if (currentIndex <= 0) return;

    setReordering(tool.projectToolId || tool.id);
    try {
      const newTools = [...tools];
      [newTools[currentIndex - 1], newTools[currentIndex]] = [newTools[currentIndex], newTools[currentIndex - 1]];

      const toolIds = newTools.map(t => t.projectToolId || t.id);

      const response = await fetch(`/api/portfolio/projects/${projectId}/tools/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder tools');
      }

      await fetchProjectTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder tool');
    } finally {
      setReordering(null);
    }
  };

  const handleMoveDown = async (tool: Tool) => {
    const currentIndex = tools.findIndex(t => t.projectToolId === tool.projectToolId || t.id === tool.id);
    if (currentIndex < 0 || currentIndex >= tools.length - 1) return;

    setReordering(tool.projectToolId || tool.id);
    try {
      const newTools = [...tools];
      [newTools[currentIndex], newTools[currentIndex + 1]] = [newTools[currentIndex + 1], newTools[currentIndex]];

      const toolIds = newTools.map(t => t.projectToolId || t.id);

      const response = await fetch(`/api/portfolio/projects/${projectId}/tools/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder tools');
      }

      await fetchProjectTools();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder tool');
    } finally {
      setReordering(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchTools(query);
  };

  const sortedTools = [...tools].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Tool Stack</h3>
        {!showAddTool && (
          <button
            onClick={() => {
              setShowAddTool(true);
              setAddMode('search');
              setSearchQuery('');
              setAvailableTools([]);
              setError(null);
            }}
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

      {/* Add Tool Interface */}
      {showAddTool && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAddMode('search');
                  setSearchQuery('');
                  setAvailableTools([]);
                  setCustomToolErrors({});
                }}
                className={`text-sm font-medium px-3 py-1 rounded ${
                  addMode === 'search'
                    ? 'bg-brand-light text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Search tools
              </button>
              <button
                onClick={() => {
                  setAddMode('custom');
                  setSearchQuery('');
                  setAvailableTools([]);
                  setCustomToolErrors({});
                }}
                className={`text-sm font-medium px-3 py-1 rounded ${
                  addMode === 'custom'
                    ? 'bg-brand-light text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Add custom tool
              </button>
            </div>
            <button
              onClick={() => {
                setShowAddTool(false);
                setAddMode('search');
                setSearchQuery('');
                setAvailableTools([]);
                setCustomToolForm({
                  name: '',
                  category: '',
                  version: '',
                  url: '',
                  notes: '',
                  saveToMyTools: false,
                });
                setCustomToolErrors({});
                setError(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Mode */}
          {addMode === 'search' && (
            <div>
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
                    .filter(tool => !sortedTools.some(t => t.id === tool.id && t.toolType === tool.toolType))
                    .map(tool => (
                      <button
                        key={`${tool.toolType || 'catalog'}-${tool.id}`}
                        onClick={() => handleAddCatalogTool(tool)}
                        className="w-full flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 text-left"
                      >
                        <ToolLogo toolName={tool.name} logoUrl={tool.logo_url} size={32} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {tool.name}
                            {tool.version && <span className="text-gray-500 ml-1">({tool.version})</span>}
                          </p>
                          {tool.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{tool.description}</p>
                          )}
                        </div>
                        {tool.toolType === 'custom' && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Custom</span>
                        )}
                      </button>
                    ))}
                </div>
              )}
              {!searchLoading && searchQuery && availableTools.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  No tools found. Try &quot;Add custom tool&quot; to create one.
                </p>
              )}
            </div>
          )}

          {/* Custom Tool Form */}
          {addMode === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tool name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customToolForm.name}
                  onChange={(e) => {
                    setCustomToolForm({ ...customToolForm, name: e.target.value });
                    if (customToolErrors.name) {
                      setCustomToolErrors({ ...customToolErrors, name: '' });
                    }
                  }}
                  placeholder="e.g., Next.js 15, Custom API"
                  maxLength={60}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light text-sm ${
                    customToolErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {customToolErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{customToolErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={customToolForm.category}
                  onChange={(e) => setCustomToolForm({ ...customToolForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light text-sm"
                >
                  <option value="">Select category</option>
                  {TOOL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input
                  type="text"
                  value={customToolForm.version}
                  onChange={(e) => setCustomToolForm({ ...customToolForm, version: e.target.value })}
                  placeholder="e.g., 1.0.0, 15.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={customToolForm.url}
                  onChange={(e) => {
                    setCustomToolForm({ ...customToolForm, url: e.target.value });
                    if (customToolErrors.url) {
                      setCustomToolErrors({ ...customToolErrors, url: '' });
                    }
                  }}
                  placeholder="https://example.com"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light text-sm ${
                    customToolErrors.url ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {customToolErrors.url && (
                  <p className="text-xs text-red-600 mt-1">{customToolErrors.url}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={customToolForm.notes}
                  onChange={(e) => setCustomToolForm({ ...customToolForm, notes: e.target.value })}
                  placeholder="Optional notes about this tool"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="saveToMyTools"
                  checked={customToolForm.saveToMyTools}
                  onChange={(e) => setCustomToolForm({ ...customToolForm, saveToMyTools: e.target.checked })}
                  className="h-4 w-4 text-brand-light focus:ring-brand-light border-gray-300 rounded"
                />
                <label htmlFor="saveToMyTools" className="ml-2 text-sm text-gray-700">
                  Save to my tools (for reuse in future projects)
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddCustomTool}
                  disabled={loading}
                  className="px-4 py-2 bg-brand-light text-white rounded-md hover:bg-brand-light/90 text-sm font-medium disabled:opacity-50"
                >
                  Add tool
                </button>
                <button
                  onClick={() => {
                    setShowAddTool(false);
                    setCustomToolForm({
                      name: '',
                      category: '',
                      version: '',
                      url: '',
                      notes: '',
                      saveToMyTools: false,
                    });
                    setCustomToolErrors({});
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current Tools */}
      {loading && sortedTools.length === 0 ? (
        <p className="text-sm text-gray-500">Loading tools...</p>
      ) : sortedTools.length === 0 ? (
        <p className="text-sm text-gray-500">No tools added yet. Click &quot;Add tool&quot; to get started.</p>
      ) : (
        <div className="space-y-2">
          {sortedTools.map((tool, index) => (
            <div
              key={tool.projectToolId || tool.id}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-brand-light transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <ToolLogo toolName={tool.name} logoUrl={tool.logo_url} size={24} />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {tool.name}
                    {tool.version && <span className="text-gray-500 ml-1">({tool.version})</span>}
                  </span>
                  {tool.website_url && (
                    <a
                      href={tool.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-brand-light transition-colors"
                      title="Open website"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {tool.toolType === 'custom' && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Custom</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveUp(tool)}
                  disabled={index === 0 || reordering !== null}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveDown(tool)}
                  disabled={index === sortedTools.length - 1 || reordering !== null}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveTool(tool)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove tool"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
