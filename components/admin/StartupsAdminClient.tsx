'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Loader2, Rocket, ExternalLink } from 'lucide-react';
import { StartupFormModal } from './StartupFormModal';
import { FounderFormModal } from './FounderFormModal';
import { ToolFormModal } from './ToolFormModal';
import { PromptFormModal } from './PromptFormModal';
import { CourseFormModal } from './CourseFormModal';

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
      const response = await fetch('/api/admin/startups');
      if (response.ok) {
        const data = await response.json();
        setStartups(data.startups || []);
      }
    } catch (err) {
      console.error('Failed to refresh startups:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Startups Management</h1>
          <p className="text-base text-gray-600">
            Manage startups, founders, tools, prompts, and courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </button>
          {activeTab === 'startups' && (
            <button
              onClick={() => {
                setEditingStartup(null);
                setShowStartupModal(true);
              }}
              className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Startup
            </button>
          )}
          {activeTab === 'founders' && (
            <button
              onClick={() => setShowFounderModal(true)}
              className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Founder
            </button>
          )}
          {activeTab === 'tools' && (
            <button
              onClick={() => setShowToolModal(true)}
              className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Tool
            </button>
          )}
          {activeTab === 'prompts' && (
            <button
              onClick={() => setShowPromptModal(true)}
              className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Prompt Template
            </button>
          )}
          {activeTab === 'courses' && (
            <button
              onClick={() => setShowCourseModal(true)}
              className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {(['startups', 'founders', 'tools', 'prompts', 'courses'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors capitalize ${
                activeTab === tab
                  ? 'border-brand-light text-brand-light'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search startups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="acquired">Acquired</option>
                <option value="shut_down">Shut Down</option>
              </select>
            </div>
          </div>

          {/* Startups Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Startup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Founder</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vibe Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStartups.map((startup) => (
                    <tr key={startup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {startup.logo_url ? (
                            <img src={startup.logo_url} alt={startup.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center">
                              <Rocket className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{startup.name}</div>
                            {startup.tagline && (
                              <div className="text-xs text-gray-500">{startup.tagline}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startup.founders?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          startup.status === 'active' ? 'bg-green-100 text-green-700' :
                          startup.status === 'acquired' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {startup.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startup.vibe_score || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {startup.revenue_range?.replace('_', ' ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingStartup(startup);
                              setShowStartupModal(true);
                            }}
                            className="text-brand-light hover:text-brand-dark"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStartup(startup.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {startup.website_url && (
                            <a
                              href={startup.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800"
                              title="Visit Website"
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
                <p className="text-gray-500">No startups found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other tabs will be implemented similarly */}
      {activeTab !== 'startups' && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-500">Management for {activeTab} coming soon</p>
        </div>
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
            handleRefresh();
          }}
        />
      )}
      {showToolModal && (
        <ToolFormModal
          onClose={() => {
            setShowToolModal(false);
            handleRefresh();
          }}
        />
      )}
      {showPromptModal && (
        <PromptFormModal
          onClose={() => {
            setShowPromptModal(false);
            handleRefresh();
          }}
        />
      )}
      {showCourseModal && (
        <CourseFormModal
          onClose={() => {
            setShowCourseModal(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
