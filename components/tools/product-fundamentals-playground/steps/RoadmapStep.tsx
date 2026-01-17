'use client';

import { useState, useEffect } from 'react';
import type { PlaygroundAction } from '@/lib/tools/product-fundamentals-playground/usePlayground';
import type { RoadmapItem, ImpactLevel, EffortLevel, Quadrant, Horizon } from '@/lib/tools/product-fundamentals-playground/types';

interface RoadmapStepProps {
  state: {
    problems: Array<{ id: string; who: string; need: string; because?: string }>;
    roadmap: RoadmapItem[];
  };
  dispatch: React.Dispatch<PlaygroundAction>;
}

// Helper function to calculate quadrant based on impact and effort
function calculateQuadrant(impact: ImpactLevel, effort: EffortLevel): Quadrant {
  // High impact, low effort = quick win
  if (impact >= 4 && effort <= 2) {
    return 'quick-win';
  }
  // High impact, high effort = major project (big bet)
  if (impact >= 4 && effort >= 4) {
    return 'major-project';
  }
  // Low impact, low effort = fill-in
  if (impact <= 2 && effort <= 2) {
    return 'fill-in';
  }
  // Low impact, high effort = time sink
  if (impact <= 2 && effort >= 4) {
    return 'time-sink';
  }
  // Default based on impact/effort ratio
  if (impact > effort) {
    return 'quick-win';
  }
  if (effort > impact) {
    return 'time-sink';
  }
  return 'fill-in';
}

const QUADRANT_LABELS: Record<Quadrant, string> = {
  'quick-win': 'Quick Win',
  'major-project': 'Major Project (Big Bet)',
  'fill-in': 'Fill-In',
  'time-sink': 'Time Sink',
};

const QUADRANT_COLORS: Record<Quadrant, string> = {
  'quick-win': 'bg-green-100 text-green-800 border-green-300',
  'major-project': 'bg-blue-100 text-blue-800 border-blue-300',
  'fill-in': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'time-sink': 'bg-red-100 text-red-800 border-red-300',
};

export function RoadmapStep({ state, dispatch }: RoadmapStepProps) {
  const [editingItemId, setEditingItemId] = useState<string | 'new' | null>(null);
  
  // Roadmap item form state
  const [itemForm, setItemForm] = useState<Omit<RoadmapItem, 'id'>>({
    title: '',
    linkedProblemIds: [],
    impact: 3,
    effort: 3,
    quadrant: 'fill-in',
    rationale: '',
    horizon: 'short',
  });

  useEffect(() => {
    // Auto-calculate quadrant when impact or effort changes
    if (editingItemId) {
      const newQuadrant = calculateQuadrant(itemForm.impact, itemForm.effort);
      setItemForm(prev => ({ ...prev, quadrant: newQuadrant }));
    }
  }, [itemForm.impact, itemForm.effort, editingItemId]);

  const handleAddItem = () => {
    setEditingItemId('new');
    setItemForm({
      title: '',
      linkedProblemIds: [],
      impact: 3,
      effort: 3,
      quadrant: calculateQuadrant(3, 3),
      rationale: '',
      horizon: 'short',
    });
  };

  const handleEditItem = (item: RoadmapItem) => {
    setEditingItemId(item.id);
    setItemForm({
      title: item.title,
      linkedProblemIds: item.linkedProblemIds,
      impact: item.impact,
      effort: item.effort,
      quadrant: item.quadrant,
      rationale: item.rationale,
      horizon: item.horizon,
    });
  };

  const handleSaveItem = () => {
    if (!itemForm.title.trim()) {
      alert('Please enter a title for the roadmap item');
      return;
    }

    if (itemForm.linkedProblemIds.length === 0) {
      alert('Please link at least one problem statement to this roadmap item');
      return;
    }

    if (!itemForm.rationale.trim()) {
      alert('Please provide a "Why now / why this order?" rationale. This field is required.');
      return;
    }

    const item: RoadmapItem = {
      id: editingItemId === 'new' ? `roadmap-${Date.now()}` : editingItemId!,
      title: itemForm.title.trim(),
      linkedProblemIds: itemForm.linkedProblemIds,
      impact: itemForm.impact,
      effort: itemForm.effort,
      quadrant: itemForm.quadrant,
      rationale: itemForm.rationale.trim(),
      horizon: itemForm.horizon,
    };

    if (editingItemId === 'new') {
      dispatch({ type: 'SET_ROADMAP', payload: [...state.roadmap, item] });
    } else {
      dispatch({ type: 'UPDATE_ROADMAP_ITEM', payload: item });
    }

    setEditingItemId(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this roadmap item?')) {
      const updated = state.roadmap.filter(item => item.id !== id);
      dispatch({ type: 'SET_ROADMAP', payload: updated });
    }
  };

  const handleToggleProblemLink = (problemId: string) => {
    setItemForm(prev => {
      const linked = prev.linkedProblemIds || [];
      const isLinked = linked.includes(problemId);
      return {
        ...prev,
        linkedProblemIds: isLinked
          ? linked.filter(id => id !== problemId)
          : [...linked, problemId],
      };
    });
  };

  // Validation: check if we can proceed
  const canProceed = state.roadmap.length > 0 && 
    state.roadmap.every(item => 
      item.linkedProblemIds.length > 0 && 
      item.rationale && 
      item.rationale.trim().length > 0
    );

  // Group roadmap items by quadrant for grid view
  const itemsByQuadrant: Record<Quadrant, RoadmapItem[]> = {
    'quick-win': [],
    'major-project': [],
    'fill-in': [],
    'time-sink': [],
  };

  state.roadmap.forEach(item => {
    itemsByQuadrant[item.quadrant].push(item);
  });

  return (
    <div className="space-y-6">
      {/* Validation Banner */}
      {!canProceed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Cannot proceed:</strong> All roadmap items must be linked to at least one problem statement and include a "Why now / why this order?" rationale.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Roadmap</h3>
          <p className="text-sm text-gray-600 mt-1">
            Prioritize initiatives using impact/effort analysis. Link to problems and explain your prioritization decisions.
          </p>
        </div>
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
        >
          + Add Roadmap Item
        </button>
      </div>

      {/* Roadmap Grid View */}
      <div className="grid grid-cols-2 gap-4">
        {/* Quick Wins */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className={`px-3 py-1 rounded mb-3 border ${QUADRANT_COLORS['quick-win']}`}>
            <div className="font-semibold text-sm">Quick Win</div>
            <div className="text-xs opacity-75">High Impact, Low Effort</div>
          </div>
          <div className="space-y-2">
            {itemsByQuadrant['quick-win'].map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded p-3 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Impact: {item.impact}/5 | Effort: {item.effort}/5
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                      ×
                    </button>
                  </div>
                </div>
                {item.linkedProblemIds.length > 0 && (
                  <div className="text-xs text-gray-600 mb-1">
                    Linked to {item.linkedProblemIds.length} problem(s)
                  </div>
                )}
                {!item.rationale || !item.rationale.trim() ? (
                  <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                    Missing rationale
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 line-clamp-2">{item.rationale}</div>
                )}
              </div>
            ))}
            {itemsByQuadrant['quick-win'].length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-4">No items</p>
            )}
          </div>
        </div>

        {/* Major Projects (Big Bets) */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className={`px-3 py-1 rounded mb-3 border ${QUADRANT_COLORS['major-project']}`}>
            <div className="font-semibold text-sm">Major Project (Big Bet)</div>
            <div className="text-xs opacity-75">High Impact, High Effort</div>
          </div>
          <div className="space-y-2">
            {itemsByQuadrant['major-project'].map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded p-3 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Impact: {item.impact}/5 | Effort: {item.effort}/5
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                      ×
                    </button>
                  </div>
                </div>
                {item.linkedProblemIds.length > 0 && (
                  <div className="text-xs text-gray-600 mb-1">
                    Linked to {item.linkedProblemIds.length} problem(s)
                  </div>
                )}
                {!item.rationale || !item.rationale.trim() ? (
                  <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                    Missing rationale
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 line-clamp-2">{item.rationale}</div>
                )}
              </div>
            ))}
            {itemsByQuadrant['major-project'].length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-4">No items</p>
            )}
          </div>
        </div>

        {/* Fill-Ins */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className={`px-3 py-1 rounded mb-3 border ${QUADRANT_COLORS['fill-in']}`}>
            <div className="font-semibold text-sm">Fill-In</div>
            <div className="text-xs opacity-75">Low Impact, Low Effort</div>
          </div>
          <div className="space-y-2">
            {itemsByQuadrant['fill-in'].map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded p-3 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Impact: {item.impact}/5 | Effort: {item.effort}/5
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                      ×
                    </button>
                  </div>
                </div>
                {item.linkedProblemIds.length > 0 && (
                  <div className="text-xs text-gray-600 mb-1">
                    Linked to {item.linkedProblemIds.length} problem(s)
                  </div>
                )}
                {!item.rationale || !item.rationale.trim() ? (
                  <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                    Missing rationale
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 line-clamp-2">{item.rationale}</div>
                )}
              </div>
            ))}
            {itemsByQuadrant['fill-in'].length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-4">No items</p>
            )}
          </div>
        </div>

        {/* Time Sinks */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className={`px-3 py-1 rounded mb-3 border ${QUADRANT_COLORS['time-sink']}`}>
            <div className="font-semibold text-sm">Time Sink</div>
            <div className="text-xs opacity-75">Low Impact, High Effort</div>
          </div>
          <div className="space-y-2">
            {itemsByQuadrant['time-sink'].map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded p-3 bg-white hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Impact: {item.impact}/5 | Effort: {item.effort}/5
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="px-2 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                      ×
                    </button>
                  </div>
                </div>
                {item.linkedProblemIds.length > 0 && (
                  <div className="text-xs text-gray-600 mb-1">
                    Linked to {item.linkedProblemIds.length} problem(s)
                  </div>
                )}
                {!item.rationale || !item.rationale.trim() ? (
                  <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                    Missing rationale
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 line-clamp-2">{item.rationale}</div>
                )}
              </div>
            ))}
            {itemsByQuadrant['time-sink'].length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-4">No items</p>
            )}
          </div>
        </div>
      </div>

      {/* Roadmap Item Editor */}
      {editingItemId && (
        <div className="border-2 border-brand-light rounded-lg p-6 bg-purple-50">
          <h4 className="font-semibold text-gray-900 mb-4">
            {editingItemId === 'new' ? 'New Roadmap Item' : 'Edit Roadmap Item'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={itemForm.title}
                onChange={(e) => setItemForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Build mobile app, Implement analytics dashboard"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact <span className="text-red-500">*</span>
                </label>
                <select
                  value={itemForm.impact}
                  onChange={(e) => setItemForm(prev => ({ ...prev, impact: parseInt(e.target.value) as ImpactLevel }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                >
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>{level} - {level === 1 ? 'Very Low' : level === 2 ? 'Low' : level === 3 ? 'Medium' : level === 4 ? 'High' : 'Very High'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effort <span className="text-red-500">*</span>
                </label>
                <select
                  value={itemForm.effort}
                  onChange={(e) => setItemForm(prev => ({ ...prev, effort: parseInt(e.target.value) as EffortLevel }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                >
                  {[1, 2, 3, 4, 5].map(level => (
                    <option key={level} value={level}>{level} - {level === 1 ? 'Very Low' : level === 2 ? 'Low' : level === 3 ? 'Medium' : level === 4 ? 'High' : 'Very High'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Auto-calculated Quadrant Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quadrant (Auto-calculated)
              </label>
              <div className={`px-3 py-2 rounded border ${QUADRANT_COLORS[itemForm.quadrant]}`}>
                <div className="font-semibold">{QUADRANT_LABELS[itemForm.quadrant]}</div>
                <div className="text-xs opacity-75 mt-1">
                  Impact: {itemForm.impact}/5, Effort: {itemForm.effort}/5
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horizon <span className="text-red-500">*</span>
              </label>
              <select
                value={itemForm.horizon}
                onChange={(e) => setItemForm(prev => ({ ...prev, horizon: e.target.value as Horizon }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              >
                <option value="short">Short-term</option>
                <option value="long">Long-term</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link to Problem Statements <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">(Select at least one)</span>
              </label>
              <div className="border border-gray-300 rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                {state.problems.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No problems available. Create problem statements first.</p>
                ) : (
                  <div className="space-y-2">
                    {state.problems.map((problem) => (
                      <label key={problem.id} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={itemForm.linkedProblemIds?.includes(problem.id) || false}
                          onChange={() => handleToggleProblemLink(problem.id)}
                          className="mt-1 rounded border-gray-300 text-brand-light focus:ring-brand-light"
                        />
                        <div className="flex-1 text-sm text-gray-700">
                          <div className="font-medium">{problem.who} needs {problem.need}</div>
                          <div className="text-xs text-gray-500">Because: {problem.because ?? ''}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {itemForm.linkedProblemIds.length === 0 && (
                <p className="text-xs text-red-600 mt-1">At least one problem statement must be linked.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why now / why this order? <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">(Required rationale)</span>
              </label>
              <textarea
                value={itemForm.rationale}
                onChange={(e) => setItemForm(prev => ({ ...prev, rationale: e.target.value }))}
                placeholder="Explain why this initiative should be prioritized now and in this order. What dependencies exist? What business value does it unlock?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
              {!itemForm.rationale.trim() && (
                <p className="text-xs text-red-600 mt-1">This field is required and cannot be empty.</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
              >
                Save Roadmap Item
              </button>
              <button
                onClick={() => setEditingItemId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Summary */}
      <div className={`border rounded-lg p-4 ${
        canProceed 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start gap-2">
          <span className={`text-lg ${canProceed ? 'text-green-600' : 'text-yellow-600'}`}>
            {canProceed ? '✓' : '⚠'}
          </span>
          <div className="flex-1">
            <div className={`font-medium ${canProceed ? 'text-green-800' : 'text-yellow-800'}`}>
              {canProceed ? 'Ready to proceed' : 'Cannot proceed yet'}
            </div>
            <div className={`text-sm mt-1 ${canProceed ? 'text-green-700' : 'text-yellow-700'}`}>
              {canProceed 
                ? `All ${state.roadmap.length} roadmap item(s) have linked problems and rationale.`
                : `All roadmap items must be linked to at least one problem statement and include a rationale.`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
