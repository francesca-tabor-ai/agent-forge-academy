'use client';

import { useState, useEffect } from 'react';
import type { PlaygroundAction } from '@/lib/tools/product-fundamentals-playground/usePlayground';
import type { Sprint, Story } from '@/lib/tools/product-fundamentals-playground/types';

interface SprintPlanStepProps {
  state: {
    sprints: Sprint[];
    stories: Story[];
    roadmap: Array<{ id: string; title: string }>;
  };
  dispatch: React.Dispatch<PlaygroundAction>;
}

export function SprintPlanStep({ state, dispatch }: SprintPlanStepProps) {
  // For v1, we'll work with a single sprint (index 0)
  const sprintIndex = 0;
  const currentSprint = state.sprints[sprintIndex] || { goal: '', capacityPoints: 20, overCapacityJustification: '' };
  
  const [sprintGoal, setSprintGoal] = useState(currentSprint.goal);
  const [capacityPoints, setCapacityPoints] = useState(currentSprint.capacityPoints || 20);
  const [overCapacityJustification, setOverCapacityJustification] = useState(currentSprint.overCapacityJustification || '');
  
  const [editingStoryId, setEditingStoryId] = useState<string | 'new' | null>(null);
  
  // Story form state
  const [storyForm, setStoryForm] = useState<Omit<Story, 'id'>>({
    title: '',
    acceptanceCriteria: [],
    points: 1,
    linkedRoadmapItemId: null,
    rationale: '',
  });
  const [acceptanceCriteriaInput, setAcceptanceCriteriaInput] = useState('');

  useEffect(() => {
    // Update sprint when form changes
    if (sprintGoal !== currentSprint.goal || capacityPoints !== currentSprint.capacityPoints || overCapacityJustification !== (currentSprint.overCapacityJustification || '')) {
      const totalPoints = state.stories.reduce((sum, story) => sum + story.points, 0);
      const isOverCapacity = totalPoints > capacityPoints;
      
      dispatch({
        type: 'SET_SPRINT',
        payload: {
          index: sprintIndex,
          sprint: {
            goal: sprintGoal,
            capacityPoints,
            overCapacityJustification: isOverCapacity ? overCapacityJustification : undefined,
          },
        },
      });
    }
  }, [
    sprintGoal,
    capacityPoints,
    overCapacityJustification,
    currentSprint.goal,
    currentSprint.capacityPoints,
    currentSprint.overCapacityJustification,
    state.stories,
    state.sprints,
    dispatch,
    sprintIndex,
  ]);

  const handleAddStory = () => {
    setEditingStoryId('new');
    setStoryForm({
      title: '',
      acceptanceCriteria: [],
      points: 1,
      linkedRoadmapItemId: null,
      rationale: '',
    });
    setAcceptanceCriteriaInput('');
  };

  const handleEditStory = (story: Story) => {
    setEditingStoryId(story.id);
    setStoryForm({
      title: story.title,
      acceptanceCriteria: story.acceptanceCriteria,
      points: story.points,
      linkedRoadmapItemId: story.linkedRoadmapItemId,
      rationale: story.rationale,
    });
    setAcceptanceCriteriaInput(story.acceptanceCriteria.join('\n'));
  };

  const handleSaveStory = () => {
    if (!storyForm.title.trim()) {
      alert('Please enter a story title');
      return;
    }

    const acceptanceCriteria = acceptanceCriteriaInput.split('\n').filter(ac => ac.trim());
    if (acceptanceCriteria.length < 2) {
      alert('Please provide at least 2 acceptance criteria');
      return;
    }

    if (!storyForm.rationale.trim()) {
      alert('Please provide a rationale for this story. This field is required.');
      return;
    }

    const story: Story = {
      id: editingStoryId === 'new' ? `story-${Date.now()}` : editingStoryId!,
      title: storyForm.title.trim(),
      acceptanceCriteria,
      points: storyForm.points,
      linkedRoadmapItemId: storyForm.linkedRoadmapItemId,
      rationale: storyForm.rationale.trim(),
    };

    if (editingStoryId === 'new') {
      dispatch({ type: 'ADD_STORY', payload: story });
    } else {
      dispatch({ type: 'UPDATE_STORY', payload: story });
    }

    setEditingStoryId(null);
    
    // Check if we need over-capacity justification
    const newTotalPoints = editingStoryId === 'new' 
      ? state.stories.reduce((sum, s) => sum + s.points, 0) + story.points
      : state.stories.reduce((sum, s) => s.id === story.id ? sum + story.points : sum + s.points, 0);
    
    if (newTotalPoints > capacityPoints && !overCapacityJustification.trim()) {
      // Prompt for justification
      const justification = prompt('Total points exceed capacity. Please provide a justification for why this is acceptable:');
      if (justification) {
        setOverCapacityJustification(justification);
      }
    }
  };

  const handleDeleteStory = (id: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      dispatch({ type: 'DELETE_STORY', payload: id });
    }
  };

  // Calculate total points
  const totalPoints = state.stories.reduce((sum, story) => sum + story.points, 0);
  const isOverCapacity = totalPoints > capacityPoints;
  const remainingCapacity = capacityPoints - totalPoints;

  return (
    <div className="space-y-6">
      {/* Sprint Configuration */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sprint Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sprint Goal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              placeholder="e.g., Launch MVP features for user authentication"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity (Points) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={capacityPoints}
              onChange={(e) => setCapacityPoints(parseInt(e.target.value) || 20)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
            />
          </div>
        </div>
      </div>

      {/* Capacity Summary */}
      <div className={`border rounded-lg p-4 ${
        isOverCapacity 
          ? 'bg-red-50 border-red-200' 
          : remainingCapacity < 5
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`font-semibold ${
              isOverCapacity ? 'text-red-800' : remainingCapacity < 5 ? 'text-yellow-800' : 'text-green-800'
            }`}>
              Capacity: {totalPoints} / {capacityPoints} points
            </div>
            <div className={`text-sm mt-1 ${
              isOverCapacity ? 'text-red-700' : remainingCapacity < 5 ? 'text-yellow-700' : 'text-green-700'
            }`}>
              {isOverCapacity 
                ? `⚠️ Over capacity by ${totalPoints - capacityPoints} points`
                : remainingCapacity < 5
                ? `⚠️ Only ${remainingCapacity} points remaining`
                : `${remainingCapacity} points remaining`
              }
            </div>
          </div>
        </div>
      </div>

      {/* Over Capacity Justification */}
      {isOverCapacity && (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <label className="block text-sm font-medium text-red-800 mb-2">
            Why over capacity? <span className="text-red-500">*</span>
            <span className="text-xs text-red-600 font-normal ml-2">(Required when exceeding capacity)</span>
          </label>
          <textarea
            value={overCapacityJustification}
            onChange={(e) => setOverCapacityJustification(e.target.value)}
            placeholder="Explain why it's acceptable to exceed the sprint capacity. What trade-offs or adjustments are being made?"
            rows={3}
            className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          {!overCapacityJustification.trim() && (
            <p className="text-xs text-red-600 mt-1">This field is required when capacity is exceeded.</p>
          )}
        </div>
      )}

      {/* Stories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Stories</h3>
          <button
            onClick={handleAddStory}
            className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
          >
            + Add Story
          </button>
        </div>

        {/* Stories List */}
        <div className="space-y-3">
          {state.stories.map((story) => (
            <div
              key={story.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                      {story.points} {story.points === 1 ? 'point' : 'points'}
                    </span>
                    <h4 className="font-semibold text-gray-900">{story.title}</h4>
                  </div>
                  {story.acceptanceCriteria.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">Acceptance Criteria:</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {story.acceptanceCriteria.map((ac, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-1">✓</span>
                            <span>{ac}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {story.linkedRoadmapItemId && (
                    <div className="text-xs text-gray-600 mb-1">
                      Linked to: {state.roadmap.find(r => r.id === story.linkedRoadmapItemId)?.title || 'Unknown roadmap item'}
                    </div>
                  )}
                  {story.rationale && (
                    <div className="text-xs text-gray-600">
                      <strong>Rationale:</strong> {story.rationale}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditStory(story)}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteStory(story.id)}
                    className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {state.stories.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No stories yet. Click &quot;Add Story&quot; to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Story Editor */}
      {editingStoryId && (
        <div className="border-2 border-brand-light rounded-lg p-6 bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-4">
            {editingStoryId === 'new' ? 'New Story' : 'Edit Story'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Story Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={storyForm.title}
                onChange={(e) => setStoryForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., User can log in with email and password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={storyForm.points}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Roadmap Item
                </label>
                <select
                  value={storyForm.linkedRoadmapItemId || ''}
                  onChange={(e) => setStoryForm(prev => ({ ...prev, linkedRoadmapItemId: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                >
                  <option value="">None</option>
                  {state.roadmap.map(item => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acceptance Criteria <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">(At least 2 required, one per line)</span>
              </label>
              <textarea
                value={acceptanceCriteriaInput}
                onChange={(e) => setAcceptanceCriteriaInput(e.target.value)}
                placeholder="Criterion 1&#10;Criterion 2&#10;Criterion 3"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
              {acceptanceCriteriaInput.split('\n').filter(ac => ac.trim()).length < 2 && acceptanceCriteriaInput.trim() && (
                <p className="text-xs text-red-600 mt-1">At least 2 acceptance criteria are required.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rationale <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">(Required)</span>
              </label>
              <textarea
                value={storyForm.rationale}
                onChange={(e) => setStoryForm(prev => ({ ...prev, rationale: e.target.value }))}
                placeholder="Explain why this story is needed. What problem does it solve? What value does it deliver?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
              {!storyForm.rationale.trim() && (
                <p className="text-xs text-red-600 mt-1">This field is required and cannot be empty.</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveStory}
                className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
              >
                Save Story
              </button>
              <button
                onClick={() => setEditingStoryId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
