'use client';

import { useState, useEffect } from 'react';
import type { PlaygroundAction } from '@/lib/tools/product-fundamentals-playground/usePlayground';
import type { Persona, ProblemStatement } from '@/lib/tools/product-fundamentals-playground/types';

interface PersonasProblemsStepProps {
  state: {
    personas: Persona[];
    problems: ProblemStatement[];
  };
  dispatch: React.Dispatch<PlaygroundAction>;
}

export function PersonasProblemsStep({ state, dispatch }: PersonasProblemsStepProps) {
  const [editingPersonaId, setEditingPersonaId] = useState<string | 'new' | null>(null);
  const [editingProblemId, setEditingProblemId] = useState<string | 'new' | null>(null);
  
  // Persona form state
  const [personaForm, setPersonaForm] = useState<Omit<Persona, 'id'>>({
    name: '',
    archetype: '',
    goals: [],
    painPoints: [],
    quotes: [],
  });
  const [personaGoalsInput, setPersonaGoalsInput] = useState('');
  const [personaPainPointsInput, setPersonaPainPointsInput] = useState('');

  // Problem form state
  const [problemForm, setProblemForm] = useState<Omit<ProblemStatement, 'id'>>({
    who: '',
    need: '',
    because: '',
    evidence: '',
    successMetric: '',
    rationale: '',
    linkedPersonaIds: [],
  });

  const handleAddPersona = () => {
    setEditingPersonaId('new');
    setPersonaForm({
      name: '',
      archetype: '',
      goals: [],
      painPoints: [],
      quotes: [],
    });
    setPersonaGoalsInput('');
    setPersonaPainPointsInput('');
  };

  const handleEditPersona = (persona: Persona) => {
    setEditingPersonaId(persona.id);
    setPersonaForm({
      name: persona.name,
      archetype: persona.archetype,
      goals: persona.goals,
      painPoints: persona.painPoints,
      quotes: persona.quotes,
    });
    setPersonaGoalsInput(persona.goals.join('\n'));
    setPersonaPainPointsInput(persona.painPoints.join('\n'));
  };

  const handleSavePersona = () => {
    if (!personaForm.name.trim() || !personaForm.archetype.trim()) {
      alert('Please fill in Name and Archetype fields');
      return;
    }

    const goals = personaGoalsInput.split('\n').filter(g => g.trim());
    const painPoints = personaPainPointsInput.split('\n').filter(p => p.trim());

    const persona: Persona = {
      id: editingPersonaId === 'new' ? `persona-${Date.now()}` : editingPersonaId!,
      name: personaForm.name.trim(),
      archetype: personaForm.archetype.trim(),
      goals,
      painPoints,
      quotes: personaForm.quotes,
    };

    if (editingPersonaId === 'new') {
      dispatch({ type: 'ADD_PERSONA', payload: persona });
    } else {
      dispatch({ type: 'UPDATE_PERSONA', payload: persona });
    }

    setEditingPersonaId(null);
  };

  const handleDeletePersona = (id: string) => {
    if (confirm('Are you sure you want to delete this persona?')) {
      const updated = state.personas.filter(p => p.id !== id);
      dispatch({ type: 'SET_PERSONAS', payload: updated });
    }
  };

  const handleAddProblem = () => {
    setEditingProblemId('new');
    setProblemForm({
      who: '',
      need: '',
      because: '',
      evidence: '',
      successMetric: '',
      rationale: '',
      linkedPersonaIds: [],
    });
  };

  const handleEditProblem = (problem: ProblemStatement) => {
    setEditingProblemId(problem.id);
    setProblemForm({
      who: problem.who,
      need: problem.need,
      because: problem.because,
      evidence: problem.evidence,
      successMetric: problem.successMetric,
      rationale: problem.rationale,
      linkedPersonaIds: problem.linkedPersonaIds || [],
    });
  };

  const handleSaveProblem = () => {
    if (!problemForm.who.trim() || !problemForm.need.trim() || !problemForm.because.trim()) {
      alert('Please fill in Who, Need, and Because fields');
      return;
    }

    if (!problemForm.rationale.trim()) {
      alert('Please provide a "Why this matters" rationale. This field is required.');
      return;
    }

    const problem: ProblemStatement = {
      id: editingProblemId === 'new' ? `problem-${Date.now()}` : editingProblemId!,
      who: problemForm.who.trim(),
      need: problemForm.need.trim(),
      because: problemForm.because.trim(),
      evidence: problemForm.evidence.trim(),
      successMetric: problemForm.successMetric.trim(),
      rationale: problemForm.rationale.trim(),
      linkedPersonaIds: problemForm.linkedPersonaIds,
    };

    if (editingProblemId === 'new') {
      dispatch({ type: 'ADD_PROBLEM', payload: problem });
    } else {
      dispatch({ type: 'UPDATE_PROBLEM', payload: problem });
    }

    setEditingProblemId(null);
  };

  const handleDeleteProblem = (id: string) => {
    if (confirm('Are you sure you want to delete this problem statement?')) {
      const updated = state.problems.filter(p => p.id !== id);
      dispatch({ type: 'SET_PROBLEMS', payload: updated });
    }
  };

  const handleTogglePersonaLink = (personaId: string) => {
    setProblemForm(prev => {
      const linked = prev.linkedPersonaIds || [];
      const isLinked = linked.includes(personaId);
      return {
        ...prev,
        linkedPersonaIds: isLinked
          ? linked.filter(id => id !== personaId)
          : [...linked, personaId],
      };
    });
  };

  // Validation: check if we can proceed
  const canProceed = state.problems.length > 0 && 
    state.problems.every(p => p.rationale && p.rationale.trim().length > 0);

  return (
    <div className="space-y-8">
      {/* Validation Banner */}
      {!canProceed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Cannot proceed:</strong> You must have at least one problem statement, and all problem statements must include a "Why this matters" rationale.
          </p>
        </div>
      )}

      {/* Personas Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Personas</h3>
          <button
            onClick={handleAddPersona}
            className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
          >
            + Add Persona
          </button>
        </div>

        {/* Persona List */}
        <div className="space-y-3 mb-4">
          {state.personas.map((persona) => (
            <div
              key={persona.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{persona.name}</div>
                  <div className="text-sm text-gray-600 mt-1">Archetype: {persona.archetype}</div>
                  {persona.goals.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-700">Goals:</div>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {persona.goals.map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {persona.painPoints.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-700">Pain Points:</div>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {persona.painPoints.map((pain, idx) => (
                          <li key={idx}>{pain}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditPersona(persona)}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePersona(persona.id)}
                    className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {state.personas.length === 0 && (
            <p className="text-sm text-gray-500 italic">No personas yet. Click "Add Persona" to create one.</p>
          )}
        </div>

        {/* Persona Editor */}
        {editingPersonaId && (
          <div className="border-2 border-brand-light rounded-lg p-6 bg-blue-50">
            <h4 className="font-semibold text-gray-900 mb-4">
              {editingPersonaId === 'new' ? 'New Persona' : 'Edit Persona'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={personaForm.name}
                  onChange={(e) => setPersonaForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., The Small Business Owner"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archetype <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={personaForm.archetype}
                  onChange={(e) => setPersonaForm(prev => ({ ...prev, archetype: e.target.value }))}
                  placeholder="e.g., Small Business Owner, Student, Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goals (one per line)
                </label>
                <textarea
                  value={personaGoalsInput}
                  onChange={(e) => setPersonaGoalsInput(e.target.value)}
                  placeholder="Goal 1&#10;Goal 2&#10;Goal 3"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Points (one per line)
                </label>
                <textarea
                  value={personaPainPointsInput}
                  onChange={(e) => setPersonaPainPointsInput(e.target.value)}
                  placeholder="Pain point 1&#10;Pain point 2&#10;Pain point 3"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSavePersona}
                  className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
                >
                  Save Persona
                </button>
                <button
                  onClick={() => setEditingPersonaId(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Problems Section */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Problem Statements</h3>
          <button
            onClick={handleAddProblem}
            className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
          >
            + Add Problem
          </button>
        </div>

        {/* Problem List */}
        <div className="space-y-3 mb-4">
          {state.problems.map((problem) => (
            <div
              key={problem.id}
              className={`border rounded-lg p-4 ${
                !problem.rationale || !problem.rationale.trim()
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-2">
                    {problem.who} needs {problem.need}
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div><strong>Because:</strong> {problem.because}</div>
                    {problem.evidence && (
                      <div><strong>Evidence:</strong> {problem.evidence}</div>
                    )}
                    {problem.successMetric && (
                      <div><strong>Success Metric:</strong> {problem.successMetric}</div>
                    )}
                  </div>
                  {problem.rationale ? (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <strong className="text-green-800">Why this matters:</strong>
                      <p className="text-green-700 mt-1">{problem.rationale}</p>
                    </div>
                  ) : (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Missing:</strong> "Why this matters" rationale is required
                    </div>
                  )}
                  {problem.linkedPersonaIds && problem.linkedPersonaIds.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-700">Linked Personas:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {problem.linkedPersonaIds.map(personaId => {
                          const persona = state.personas.find(p => p.id === personaId);
                          return persona ? (
                            <span key={personaId} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {persona.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditProblem(problem)}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProblem(problem.id)}
                    className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {state.problems.length === 0 && (
            <p className="text-sm text-gray-500 italic">No problem statements yet. Click "Add Problem" to create one.</p>
          )}
        </div>

        {/* Problem Editor */}
        {editingProblemId && (
          <div className="border-2 border-brand-light rounded-lg p-6 bg-purple-50">
            <h4 className="font-semibold text-gray-900 mb-4">
              {editingProblemId === 'new' ? 'New Problem Statement' : 'Edit Problem Statement'}
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={problemForm.who}
                    onChange={(e) => setProblemForm(prev => ({ ...prev, who: e.target.value }))}
                    placeholder="e.g., Small business owners"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Need <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={problemForm.need}
                    onChange={(e) => setProblemForm(prev => ({ ...prev, need: e.target.value }))}
                    placeholder="e.g., to manage inventory efficiently"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Because <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={problemForm.because}
                  onChange={(e) => setProblemForm(prev => ({ ...prev, because: e.target.value }))}
                  placeholder="e.g., current solutions are too expensive and complex"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence
                </label>
                <textarea
                  value={problemForm.evidence}
                  onChange={(e) => setProblemForm(prev => ({ ...prev, evidence: e.target.value }))}
                  placeholder="Supporting evidence, data, or observations"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Metric
                </label>
                <input
                  type="text"
                  value={problemForm.successMetric}
                  onChange={(e) => setProblemForm(prev => ({ ...prev, successMetric: e.target.value }))}
                  placeholder="e.g., 50% reduction in inventory management time"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why this matters <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">(Required rationale)</span>
                </label>
                <textarea
                  value={problemForm.rationale}
                  onChange={(e) => setProblemForm(prev => ({ ...prev, rationale: e.target.value }))}
                  placeholder="Explain why solving this problem matters. What impact will it have? Why is it worth solving?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
                {!problemForm.rationale.trim() && (
                  <p className="text-xs text-red-600 mt-1">This field is required and cannot be empty.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to Personas (multi-select)
                </label>
                <div className="border border-gray-300 rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                  {state.personas.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No personas available. Create personas first.</p>
                  ) : (
                    <div className="space-y-2">
                      {state.personas.map((persona) => (
                        <label key={persona.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={problemForm.linkedPersonaIds?.includes(persona.id) || false}
                            onChange={() => handleTogglePersonaLink(persona.id)}
                            className="rounded border-gray-300 text-brand-light focus:ring-brand-light"
                          />
                          <span className="text-sm text-gray-700">
                            {persona.name} ({persona.archetype})
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProblem}
                  className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
                >
                  Save Problem
                </button>
                <button
                  onClick={() => setEditingProblemId(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
                ? `You have ${state.problems.length} problem statement(s) with complete rationale.`
                : `You need at least one problem statement, and all problems must have a "Why this matters" rationale.`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
