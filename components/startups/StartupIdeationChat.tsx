'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bookmark, Download, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Startup {
  id: string;
  name: string;
  tagline: string;
}

interface GeneratedIdea {
  id: string;
  niche: string | null;
  icp?: string | null;
  location?: string | null;
  problemStatement: string;
  solutionOutline: string;
  differentiation: string;
  estimatedBuild: {
    timeDaysSolo: number;
    timeDaysTeam: number;
    costUsd: number;
    costBreakdown: {
      tools: number;
      infrastructure: number;
    };
    maintenanceMonthly: number;
  };
  estimatedRevenue: {
    conservative_mrr: number;
    realistic_mrr: number;
    breakout_mrr: number;
  };
  riskFactors: string;
  createdAt: string;
}

interface StartupIdeationChatProps {
  startup: Startup;
  userId: string;
  embedded?: boolean; // If true, render inline; if false, render as floating widget
}

export function StartupIdeationChat({ startup, userId, embedded = false }: StartupIdeationChatProps) {
  const [isExpanded, setIsExpanded] = useState(embedded); // Auto-expand if embedded
  const [niche, setNiche] = useState('');
  const [icp, setIcp] = useState('');
  const [location, setLocation] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookmarkedIdeas, setBookmarkedIdeas] = useState<Set<string>>(new Set());
  const ideasEndRef = useRef<HTMLDivElement>(null);

  // Load existing ideas and bookmark status on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load ideas
        const ideasResponse = await fetch(`/api/startups/${startup.id}/ideas`);
        if (ideasResponse.ok) {
          const ideasData = await ideasResponse.json();
          setGeneratedIdeas(ideasData.ideas || []);
          
          // Check which ideas are bookmarked (via startup bookmark)
          // For now, we'll check if the startup itself is bookmarked
          // In the future, we could add idea-specific bookmarks
        }
        
        // Check if startup is bookmarked
        const bookmarkResponse = await fetch(`/api/startups/${startup.id}/bookmark-status`);
        if (bookmarkResponse.ok) {
          const bookmarkData = await bookmarkResponse.json();
          if (bookmarkData.bookmarked) {
            // Mark all ideas as bookmarked if startup is bookmarked
            // This is a simplified approach - in production you might want per-idea bookmarks
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, [startup.id]);

  useEffect(() => {
    if (generatedIdeas.length > 0) {
      ideasEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [generatedIdeas]);

  const handleGenerate = async () => {
    if (!niche && !icp && !location) {
      setError('Please provide at least one adaptation parameter (niche, ICP, or location)');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/startups/${startup.id}/ideate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          niche: niche || undefined,
          icp: icp || undefined,
          location: location || undefined,
          additionalContext: additionalContext || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate idea');
      }

      const data = await response.json();
      setGeneratedIdeas((prev) => [data.idea, ...prev]);
      setSuccess('Idea generated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      
      // Reset form
      setNiche('');
      setIcp('');
      setLocation('');
      setAdditionalContext('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBookmark = async (ideaId: string) => {
    try {
      const isBookmarked = bookmarkedIdeas.has(ideaId);
      const method = isBookmarked ? 'DELETE' : 'POST';
      
      const response = await fetch(`/api/startups/ideas/${ideaId}/bookmark`, {
        method,
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark');
      }

      if (isBookmarked) {
        setBookmarkedIdeas((prev) => {
          const newSet = new Set(prev);
          newSet.delete(ideaId);
          return newSet;
        });
        setSuccess('Bookmark removed');
      } else {
        setBookmarkedIdeas((prev) => new Set(prev).add(ideaId));
        setSuccess('Idea bookmarked!');
      }
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError('Failed to bookmark idea');
    }
  };

  const handleExport = (idea: GeneratedIdea) => {
    const exportData = {
      startup: {
        name: startup.name,
        tagline: startup.tagline,
      },
      adaptation: {
        niche: idea.niche,
        icp: idea.icp || icp || 'Not specified',
        location: idea.location || location || 'Not specified',
      },
      idea: {
        problemStatement: idea.problemStatement,
        solutionOutline: idea.solutionOutline,
        differentiation: idea.differentiation,
        estimatedBuild: {
          timeDaysSolo: idea.estimatedBuild.timeDaysSolo,
          timeDaysTeam: idea.estimatedBuild.timeDaysTeam,
          costUsd: idea.estimatedBuild.costUsd,
          costBreakdown: idea.estimatedBuild.costBreakdown,
          maintenanceMonthly: idea.estimatedBuild.maintenanceMonthly,
        },
        estimatedRevenue: idea.estimatedRevenue,
        riskFactors: idea.riskFactors,
      },
      generatedAt: idea.createdAt,
    };

    // Export as JSON
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `startup-idea-${startup.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccess('Idea exported!');
    setTimeout(() => setSuccess(null), 2000);
  };

  if (!isExpanded && !embedded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-brand-light text-white rounded-full p-4 shadow-lg hover:bg-brand-light/90 transition-colors flex items-center gap-2"
          aria-label="Open AI Ideation"
        >
          <Sparkles className="w-6 h-6" />
          <span className="font-semibold">AI Ideation</span>
        </button>
      </div>
    );
  }

  const containerClasses = embedded
    ? "w-full bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col"
    : "fixed bottom-6 right-6 z-50 w-full max-w-2xl bg-white border border-gray-200 rounded-lg shadow-2xl flex flex-col";

  const containerStyle = embedded
    ? { minHeight: '600px', maxHeight: '800px' }
    : { height: '85vh', maxHeight: '900px' };

  return (
    <div className={containerClasses} style={containerStyle}>
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-light to-brand-dark p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-white" />
          <div>
            <h3 className="text-white font-semibold">AI Ideation</h3>
            <p className="text-white/80 text-xs">Adapt {startup.name} to your context</p>
          </div>
        </div>
        {!embedded && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages/Alerts */}
      <div className="px-4 pt-4 space-y-2">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="px-4 pb-4 border-b border-gray-200 space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
          <p className="text-xs text-blue-800">
            💡 <strong>Dynamic Calculations:</strong> Build time, cost, and revenue estimates automatically adjust based on your adaptation parameters (niche, ICP, location).
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">New Niche</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g., Healthcare, Education"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">New ICP</label>
            <input
              type="text"
              value={icp}
              onChange={(e) => setIcp(e.target.value)}
              placeholder="e.g., Small business owners"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Europe, Asia, Remote-first"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Additional Context (Optional)</label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Any additional requirements or constraints..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent resize-none"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!niche && !icp && !location)}
          className="w-full px-4 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Idea
            </>
          )}
        </button>
      </div>

      {/* Generated Ideas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {generatedIdeas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm">No ideas generated yet.</p>
            <p className="text-xs mt-1">Fill in the form above to get started.</p>
          </div>
        ) : (
          generatedIdeas.map((idea) => (
            <div key={idea.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Adapted Idea</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {idea.niche && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        Niche: {idea.niche}
                      </span>
                    )}
                    {idea.icp && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                        ICP: {idea.icp}
                      </span>
                    )}
                    {idea.location && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Location: {idea.location}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Generated {new Date(idea.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBookmark(idea.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      bookmarkedIdeas.has(idea.id)
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    aria-label="Bookmark idea"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarkedIdeas.has(idea.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleExport(idea)}
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    aria-label="Export idea"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Problem Statement */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Problem Statement</h5>
                <p className="text-sm text-gray-700 leading-relaxed">{idea.problemStatement}</p>
              </div>

              {/* Solution Outline */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Solution Outline</h5>
                <p className="text-sm text-gray-700 leading-relaxed">{idea.solutionOutline}</p>
              </div>

              {/* Differentiation */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Differentiation</h5>
                <p className="text-sm text-gray-700 leading-relaxed">{idea.differentiation}</p>
              </div>

              {/* Quick Summary Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-gradient-to-r from-gray-50 to-white rounded-lg p-3 border border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Build Time</p>
                  <p className="text-sm font-bold text-gray-900">{idea.estimatedBuild.timeDaysSolo}d solo</p>
                  <p className="text-xs text-gray-600">{idea.estimatedBuild.timeDaysTeam}d team</p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Build Cost</p>
                  <p className="text-sm font-bold text-gray-900">${(idea.estimatedBuild.costUsd / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-gray-600">${idea.estimatedBuild.maintenanceMonthly}/mo</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Revenue (Realistic)</p>
                  <p className="text-sm font-bold text-brand-light">${(idea.estimatedRevenue.realistic_mrr / 1000).toFixed(0)}k MRR</p>
                  <p className="text-xs text-gray-600">${(idea.estimatedRevenue.realistic_mrr * 12 / 1000).toFixed(0)}k ARR</p>
                </div>
              </div>

              {/* Build Estimates with Charts */}
              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Build Estimates</h5>
                
                {/* Build Time Comparison Chart */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-3">Estimated Build Time</p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Solo Founder</span>
                        <span className="text-sm font-semibold text-gray-900">{idea.estimatedBuild.timeDaysSolo} days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${Math.min(100, (idea.estimatedBuild.timeDaysSolo / 180) * 100)}%` }}
                        >
                          <span className="text-xs font-medium text-white">{idea.estimatedBuild.timeDaysSolo}d</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Team (2-3 people)</span>
                        <span className="text-sm font-semibold text-gray-900">{idea.estimatedBuild.timeDaysTeam} days</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-green-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${Math.min(100, (idea.estimatedBuild.timeDaysTeam / 180) * 100)}%` }}
                        >
                          <span className="text-xs font-medium text-white">{idea.estimatedBuild.timeDaysTeam}d</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Team saves ~{Math.round(((idea.estimatedBuild.timeDaysSolo - idea.estimatedBuild.timeDaysTeam) / idea.estimatedBuild.timeDaysSolo) * 100)}% time
                      </p>
                    </div>
                  </div>
                </div>

                {/* Build Cost Breakdown Chart */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-3">Build Cost Breakdown</p>
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Tools</span>
                        <span className="text-sm font-semibold text-gray-900">${idea.estimatedBuild.costBreakdown.tools.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(idea.estimatedBuild.costBreakdown.tools / idea.estimatedBuild.costUsd) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Infrastructure</span>
                        <span className="text-sm font-semibold text-gray-900">${idea.estimatedBuild.costBreakdown.infrastructure.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(idea.estimatedBuild.costBreakdown.infrastructure / idea.estimatedBuild.costUsd) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total Build Cost</span>
                      <span className="text-lg font-bold text-gray-900">${idea.estimatedBuild.costUsd.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">Monthly Maintenance</span>
                      <span className="text-sm font-semibold text-gray-700">${idea.estimatedBuild.maintenanceMonthly.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Potential with Chart */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-3">Revenue Potential (MRR)</h5>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  {/* Bar Chart */}
                  <div className="mb-4">
                    <div className="flex items-end gap-2 h-32">
                      {[
                        { label: 'Conservative', value: idea.estimatedRevenue.conservative_mrr, color: 'bg-gray-400' },
                        { label: 'Realistic', value: idea.estimatedRevenue.realistic_mrr, color: 'bg-brand-light' },
                        { label: 'Breakout', value: idea.estimatedRevenue.breakout_mrr, color: 'bg-green-500' },
                      ].map((scenario) => {
                        const maxValue = idea.estimatedRevenue.breakout_mrr;
                        const height = (scenario.value / maxValue) * 100;
                        return (
                          <div key={scenario.label} className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-full ${scenario.color} rounded-t transition-all duration-500 relative group`}
                              style={{ height: `${height}%` }}
                              title={`${scenario.label}: $${scenario.value.toLocaleString()}`}
                            >
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                  ${scenario.value.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-2 text-center font-medium">{scenario.label}</div>
                            <div className="text-xs font-semibold text-gray-900 mt-1">
                              ${(scenario.value / 1000).toFixed(0)}k
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Conservative</p>
                      <p className="text-base font-bold text-gray-900">${idea.estimatedRevenue.conservative_mrr.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Realistic</p>
                      <p className="text-base font-bold text-brand-light">${idea.estimatedRevenue.realistic_mrr.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Breakout</p>
                      <p className="text-base font-bold text-green-600">${idea.estimatedRevenue.breakout_mrr.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {/* Growth Potential Indicator */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Growth Potential</span>
                      <span className="text-xs font-semibold text-green-600">
                        {Math.round(((idea.estimatedRevenue.breakout_mrr - idea.estimatedRevenue.conservative_mrr) / idea.estimatedRevenue.conservative_mrr) * 100)}x
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-gray-400 via-brand-light to-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              {idea.riskFactors && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-900 mb-2">Risk Factors</h5>
                  <p className="text-sm text-gray-700 leading-relaxed">{idea.riskFactors}</p>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={ideasEndRef} />
      </div>
    </div>
  );
}
