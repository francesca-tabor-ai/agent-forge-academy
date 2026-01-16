'use client';

import { useState, useEffect } from 'react';
import type { PlaygroundAction } from '@/lib/tools/product-fundamentals-playground/usePlayground';
import type { JourneyStage } from '@/lib/tools/product-fundamentals-playground/types';

interface JourneyMapStepProps {
  state: {
    journey: JourneyStage[];
  };
  dispatch: React.Dispatch<PlaygroundAction>;
}

export function JourneyMapStep({ state, dispatch }: JourneyMapStepProps) {
  const [editingStageId, setEditingStageId] = useState<string | 'new' | null>(null);
  
  // Stage form state
  const [stageForm, setStageForm] = useState<Omit<JourneyStage, 'id'>>({
    name: '',
    userGoal: '',
    actions: [],
    painPoints: [],
    highFrictionPainPoints: [],
    opportunities: [],
  });
  
  // Input strings for multi-line fields
  const [actionsInput, setActionsInput] = useState('');
  const [painPointsInput, setPainPointsInput] = useState('');
  const [opportunitiesInput, setOpportunitiesInput] = useState('');

  const handleAddStage = () => {
    setEditingStageId('new');
    setStageForm({
      name: '',
      userGoal: '',
      actions: [],
      painPoints: [],
      highFrictionPainPoints: [],
      opportunities: [],
    });
    setActionsInput('');
    setPainPointsInput('');
    setOpportunitiesInput('');
  };

  const handleEditStage = (stage: JourneyStage) => {
    setEditingStageId(stage.id);
    setStageForm({
      name: stage.name,
      userGoal: stage.userGoal,
      actions: stage.actions,
      painPoints: stage.painPoints,
      highFrictionPainPoints: stage.highFrictionPainPoints || [],
      opportunities: stage.opportunities,
    });
    setActionsInput(stage.actions.join('\n'));
    setPainPointsInput(stage.painPoints.join('\n'));
    setOpportunitiesInput(stage.opportunities.join('\n'));
  };

  const handleSaveStage = () => {
    if (!stageForm.name.trim() || !stageForm.userGoal.trim()) {
      alert('Please fill in Stage Name and User Goal fields');
      return;
    }

    const actions = actionsInput.split('\n').filter(a => a.trim());
    const painPoints = painPointsInput.split('\n').filter(p => p.trim());
    const opportunities = opportunitiesInput.split('\n').filter(o => o.trim());

    // Ensure highFrictionPainPoints only contains pain points that still exist
    const validHighFriction = (stageForm.highFrictionPainPoints || []).filter(
      friction => painPoints.includes(friction)
    );

    const stage: JourneyStage = {
      id: editingStageId === 'new' ? `stage-${Date.now()}` : editingStageId!,
      name: stageForm.name.trim(),
      userGoal: stageForm.userGoal.trim(),
      actions,
      painPoints,
      highFrictionPainPoints: validHighFriction,
      opportunities,
    };

    if (editingStageId === 'new') {
      dispatch({ type: 'SET_JOURNEY', payload: [...state.journey, stage] });
    } else {
      dispatch({ type: 'UPDATE_JOURNEY_STAGE', payload: stage });
    }

    setEditingStageId(null);
  };

  const handleDeleteStage = (id: string) => {
    if (confirm('Are you sure you want to delete this journey stage?')) {
      const updated = state.journey.filter(s => s.id !== id);
      dispatch({ type: 'SET_JOURNEY', payload: updated });
    }
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= state.journey.length) return;

    const updated = [...state.journey];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    dispatch({ type: 'SET_JOURNEY', payload: updated });
  };

  const handleToggleFriction = (painPoint: string) => {
    const currentHighFriction = stageForm.highFrictionPainPoints || [];
    const isHighFriction = currentHighFriction.includes(painPoint);
    
    setStageForm(prev => ({
      ...prev,
      highFrictionPainPoints: isHighFriction
        ? currentHighFriction.filter(p => p !== painPoint)
        : [...currentHighFriction, painPoint],
    }));
  };

  // Validation: require at least 3 stages
  const canProceed = state.journey.length >= 3;

  return (
    <div className="space-y-6">
      {/* Validation Banner */}
      {!canProceed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Cannot proceed:</strong> You must have at least 3 journey stages to continue.
            {state.journey.length > 0 && ` Currently have ${state.journey.length} stage(s).`}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Journey Stages</h3>
          <p className="text-sm text-gray-600 mt-1">
            Map the user journey through distinct stages. Highlight moments of high friction.
          </p>
        </div>
        <button
          onClick={handleAddStage}
          className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
        >
          + Add Stage
        </button>
      </div>

      {/* Journey Stages List */}
      <div className="space-y-4">
        {state.journey.map((stage, index) => (
          <div
            key={stage.id}
            className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                    Stage {index + 1}
                  </span>
                  <h4 className="text-lg font-semibold text-gray-900">{stage.name}</h4>
                </div>
                <div className="text-sm text-gray-700 mb-4">
                  <strong>User Goal:</strong> {stage.userGoal}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleMoveStage(index, 'up')}
                  disabled={index === 0}
                  className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveStage(index, 'down')}
                  disabled={index === state.journey.length - 1}
                  className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleEditStage(stage)}
                  className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteStage(stage.id)}
                  className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Stage Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Actions */}
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Actions
                </div>
                {stage.actions.length > 0 ? (
                  <ul className="space-y-1">
                    {stage.actions.map((action, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No actions</p>
                )}
              </div>

              {/* Pain Points with Friction Highlighting */}
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Pain Points
                </div>
                {stage.painPoints.length > 0 ? (
                  <ul className="space-y-2">
                    {stage.painPoints.map((painPoint, idx) => {
                      const isHighFriction = (stage.highFrictionPainPoints || []).includes(painPoint);
                      return (
                        <li
                          key={idx}
                          className={`text-sm flex items-start gap-2 p-2 rounded ${
                            isHighFriction
                              ? 'bg-red-50 border border-red-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className={`mt-1 ${isHighFriction ? 'text-red-500' : 'text-gray-400'}`}>
                            {isHighFriction ? '⚠' : '•'}
                          </span>
                          <div className="flex-1">
                            <span className={isHighFriction ? 'font-medium text-red-800' : 'text-gray-600'}>
                              {painPoint}
                            </span>
                            {isHighFriction && (
                              <span className="ml-2 px-1.5 py-0.5 bg-red-200 text-red-800 text-xs font-semibold rounded">
                                High Friction
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No pain points</p>
                )}
              </div>

              {/* Opportunities */}
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Opportunities
                </div>
                {stage.opportunities.length > 0 ? (
                  <ul className="space-y-1">
                    {stage.opportunities.map((opportunity, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No opportunities</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {state.journey.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">No journey stages yet. Click "Add Stage" to create one.</p>
          </div>
        )}
      </div>

      {/* Stage Editor */}
      {editingStageId && (
        <div className="border-2 border-brand-light rounded-lg p-6 bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-4">
            {editingStageId === 'new' ? 'New Journey Stage' : 'Edit Journey Stage'}
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={stageForm.name}
                  onChange={(e) => setStageForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Discovery, Evaluation, Purchase"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Goal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={stageForm.userGoal}
                  onChange={(e) => setStageForm(prev => ({ ...prev, userGoal: e.target.value }))}
                  placeholder="e.g., Find the right product"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actions (one per line)
              </label>
              <textarea
                value={actionsInput}
                onChange={(e) => setActionsInput(e.target.value)}
                placeholder="Action 1&#10;Action 2&#10;Action 3"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pain Points (one per line)
              </label>
              <textarea
                value={painPointsInput}
                onChange={(e) => {
                  setPainPointsInput(e.target.value);
                  // Remove high friction marks for deleted pain points
                  const newPainPoints = e.target.value.split('\n').filter(p => p.trim());
                  const currentHighFriction = stageForm.highFrictionPainPoints || [];
                  const validHighFriction = currentHighFriction.filter(p => newPainPoints.includes(p));
                  setStageForm(prev => ({ ...prev, highFrictionPainPoints: validHighFriction }));
                }}
                placeholder="Pain point 1&#10;Pain point 2&#10;Pain point 3"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
              {painPointsInput.trim() && (
                <div className="mt-2 space-y-2">
                  <div className="text-xs font-medium text-gray-700">Mark high friction pain points:</div>
                  <div className="flex flex-wrap gap-2">
                    {painPointsInput.split('\n').filter(p => p.trim()).map((painPoint, idx) => {
                      const trimmed = painPoint.trim();
                      const isHighFriction = (stageForm.highFrictionPainPoints || []).includes(trimmed);
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer border transition-colors ${
                            isHighFriction
                              ? 'bg-red-50 border-red-300'
                              : 'bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isHighFriction}
                            onChange={() => handleToggleFriction(trimmed)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className={`text-sm ${isHighFriction ? 'font-medium text-red-800' : 'text-gray-700'}`}>
                            {trimmed}
                          </span>
                          {isHighFriction && (
                            <span className="px-1.5 py-0.5 bg-red-200 text-red-800 text-xs font-semibold rounded">
                              High Friction
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opportunities (one per line)
              </label>
              <textarea
                value={opportunitiesInput}
                onChange={(e) => setOpportunitiesInput(e.target.value)}
                placeholder="Opportunity 1&#10;Opportunity 2&#10;Opportunity 3"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveStage}
                className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
              >
                Save Stage
              </button>
              <button
                onClick={() => setEditingStageId(null)}
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
                ? `You have ${state.journey.length} journey stage(s).`
                : `You need at least 3 journey stages. Currently have ${state.journey.length}.`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
