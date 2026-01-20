'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Search, Filter, Loader2, Rocket, ExternalLink } from 'lucide-react';
import { StartupFormModal } from './StartupFormModal';
import { FounderFormModal } from './FounderFormModal';
import { ToolFormModal } from './ToolFormModal';
import { PromptFormModal } from './PromptFormModal';
import { CourseFormModal } from './CourseFormModal';
import { FoundersManagementTab } from './FoundersManagementTab';
import { ToolsManagementTab } from './ToolsManagementTab';
import { PromptsManagementTab } from './PromptsManagementTab';
import { CoursesManagementTab } from './CoursesManagementTab';

interface Founder {
  id: string;
  name: string;
}

interface Startup {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  status: string;
  revenue_range?: string;
  vibe_score?: number;
  launch_year?: number;
  pricing_model?: string;
  target_customer?: string;
  logo_url?: string;
  website_url?: string;
  is_featured?: boolean;
  created_at: string;
  founders?: {
    id: string;
    name: string;
  };
}

interface StartupsAdminClientProps {
  initialStartups: Startup[];
  founders: Founder[];
}

export function StartupsAdminClient({ initialStartups, founders }: StartupsAdminClientProps) {
  const [startups, setStartups] = useState<Startup[]>(initialStartups);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStartupModal, setShowStartupModal] = useState(false);
  const [showFounderModal, setShowFounderModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingStartup, setEditingStartup] = useState<Startup | null>(null);
  const [activeTab, setActiveTab] = useState<'startups' | 'founders' | 'tools' | 'prompts' | 'courses'>('startups');

  const filteredStartups = startups.filter((startup) => {
    const matchesSearch = 
      startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      startup.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || startup.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteStartup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this startup? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/startups/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStartups(startups.filter((s) => s.id !== id));
      } else {
        const error = await response.json();
        alert(`Failed to delete startup: ${error.error}`);
      }
    } catch (err) {
      alert('Failed to delete startup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Refresh based on active tab
      if (activeTab === 'startups') {
        const response = await fetch('/api/admin/startups');
        if (response.ok) {
          const data = await response.json();
          setStartups(data.startups || []);
        }
      }
      // Other tabs refresh themselves via their own load functions
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2 font-playfair">Startups Management</h1>
          <p className="text-sm sm:text-base text-gray-600 font-sans">
            Manage startups, founders, tools, prompts, and courses
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </button>
          {activeTab === 'startups' && (
            <button
              onClick={() => {
                setEditingStartup(null);
                setShowStartupModal(true);
              }}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Startup</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
          {activeTab === 'founders' && (
            <button
              onClick={() => setShowFounderModal(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Founder</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
          {activeTab === 'tools' && (
            <button
              onClick={() => setShowToolModal(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Tool</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
          {activeTab === 'prompts' && (
            <button
              onClick={() => setShowPromptModal(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Prompt Template</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
          {activeTab === 'courses' && (
            <button
              onClick={() => setShowCourseModal(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Course</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: 'var(--ca-neutral-300)' }}>
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {(['startups', 'founders', 'tools', 'prompts', 'courses'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'border-ca-gold text-ca-gold'
                  : 'border-transparent text-ca-neutral-500 hover:text-ca-neutral-700 hover:border-ca-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'startups' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow overflow-hidden" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ca-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search startups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                    style={{ borderColor: 'var(--ca-neutral-300)' }}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-sm"
                  style={{ borderColor: 'var(--ca-neutral-300)' }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="acquired">Acquired</option>
                  <option value="shut_down">Shut Down</option>
                </select>
              </div>
            </div>
          </div>

          {/* Startups Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Startup</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider hidden sm:table-cell">Founder</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider hidden md:table-cell">Vibe</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider hidden lg:table-cell">Revenue</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                  {filteredStartups.map((startup) => (
                    <tr key={startup.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          {startup.logo_url ? (
                            <img src={startup.logo_url} alt={startup.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-ca-gold to-ca-navy flex items-center justify-center flex-shrink-0">
                              <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{startup.name}</div>
                            {startup.tagline && (
                              <div className="text-xs text-ca-neutral-500 truncate hidden sm:block">{startup.tagline}</div>
                            )}
                            <div className="text-xs text-ca-neutral-500 sm:hidden">
                              {startup.founders?.name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                        {startup.founders?.name || 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          startup.status === 'active' ? 'bg-green-100 text-green-700' :
                          startup.status === 'acquired' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {startup.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {startup.vibe_score || 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                        {startup.revenue_range?.replace('_', ' ') || 'N/A'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingStartup(startup);
                              setShowStartupModal(true);
                            }}
                            className="text-ca-gold hover:text-ca-navy transition-colors"
                            title="Edit"
                            aria-label="Edit startup"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStartup(startup.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                            aria-label="Delete startup"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {startup.website_url && (
                            <a
                              href={startup.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-ca-neutral-500 hover:text-ca-neutral-700 transition-colors"
                              title="Visit Website"
                              aria-label="Visit website"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStartups.length === 0 && (
              <div className="text-center py-12">
                <p className="text-ca-neutral-500 font-sans">No startups found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Founders Tab */}
      {activeTab === 'founders' && (
        <FoundersManagementTab
          onEdit={(founder) => {
            // TODO: Implement edit founder modal
            console.log('Edit founder:', founder);
          }}
          onDelete={async (id) => {
            if (!confirm('Are you sure you want to delete this founder?')) return;
            try {
              const response = await fetch(`/api/admin/founders/${id}`, { method: 'DELETE' });
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete founder');
              }
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Failed to delete founder');
              throw err; // Re-throw so tab can handle it
            }
          }}
        />
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <ToolsManagementTab
          onEdit={(tool) => {
            // TODO: Implement edit tool modal
            console.log('Edit tool:', tool);
          }}
          onDelete={async (id) => {
            if (!confirm('Are you sure you want to delete this tool?')) return;
            try {
              const response = await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' });
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete tool');
              }
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Failed to delete tool');
              throw err; // Re-throw so tab can handle it
            }
          }}
        />
      )}

      {/* Prompts Tab */}
      {activeTab === 'prompts' && (
        <PromptsManagementTab
          onEdit={(prompt) => {
            // TODO: Implement edit prompt modal
            console.log('Edit prompt:', prompt);
          }}
          onDelete={async (id) => {
            if (!confirm('Are you sure you want to delete this prompt?')) return;
            try {
              const response = await fetch(`/api/admin/prompts/${id}`, { method: 'DELETE' });
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete prompt');
              }
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Failed to delete prompt');
              throw err; // Re-throw so tab can handle it
            }
          }}
        />
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <CoursesManagementTab
          onEdit={(course) => {
            // TODO: Implement edit course modal
            console.log('Edit course:', course);
          }}
          onDelete={async (id) => {
            if (!confirm('Are you sure you want to delete this course?')) return;
            try {
              const response = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete course');
              }
            } catch (err) {
              alert(err instanceof Error ? err.message : 'Failed to delete course');
              throw err; // Re-throw so tab can handle it
            }
          }}
        />
      )}

      {/* Modals */}
      {showStartupModal && (
        <StartupFormModal
          startup={editingStartup}
          founders={founders}
          onClose={() => {
            setShowStartupModal(false);
            setEditingStartup(null);
            handleRefresh();
          }}
        />
      )}
      {showFounderModal && (
        <FounderFormModal
          onClose={() => {
            setShowFounderModal(false);
            // Force tab remount to refresh data
            const currentTab = activeTab;
            setActiveTab('startups');
            setTimeout(() => setActiveTab(currentTab), 0);
          }}
        />
      )}
      {showToolModal && (
        <ToolFormModal
          onClose={() => {
            setShowToolModal(false);
            // Force tab remount to refresh data
            const currentTab = activeTab;
            setActiveTab('startups');
            setTimeout(() => setActiveTab(currentTab), 0);
          }}
        />
      )}
      {showPromptModal && (
        <PromptFormModal
          onClose={() => {
            setShowPromptModal(false);
            // Force tab remount to refresh data
            const currentTab = activeTab;
            setActiveTab('startups');
            setTimeout(() => setActiveTab(currentTab), 0);
          }}
        />
      )}
      {showCourseModal && (
        <CourseFormModal
          onClose={() => {
            setShowCourseModal(false);
            // Force tab remount to refresh data
            const currentTab = activeTab;
            setActiveTab('startups');
            setTimeout(() => setActiveTab(currentTab), 0);
          }}
        />
      )}
    </div>
  );
}
