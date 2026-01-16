'use client';

import { useState, useEffect } from 'react';
import type { PlaygroundAction } from '@/lib/tools/product-fundamentals-playground/usePlayground';
import type { ResearchInput, Persona, ProblemStatement } from '@/lib/tools/product-fundamentals-playground/types';
import { generateResearchInsights } from '@/lib/tools/product-fundamentals-playground/aiAssist';

interface ResearchStepProps {
  state: {
    research: ResearchInput | null;
  };
  dispatch: React.Dispatch<PlaygroundAction>;
}

interface SuggestionState {
  recurringPains: string[];
  tentativePersonas: Omit<Persona, 'id'>[];
  draftProblemStatements: Omit<ProblemStatement, 'id'>[];
}

export function ResearchStep({ state, dispatch }: ResearchStepProps) {
  const [notes, setNotes] = useState(state.research?.rawNotes || '');
  const [sourceType, setSourceType] = useState<ResearchInput['sourceType']>(
    state.research?.sourceType || 'interview'
  );
  const [additionalNotes, setAdditionalNotes] = useState<string[]>(['']);
  const [suggestions, setSuggestions] = useState<SuggestionState | null>(null);
  const [editableSuggestions, setEditableSuggestions] = useState<SuggestionState | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (state.research) {
      setNotes(state.research.rawNotes);
      setSourceType(state.research.sourceType);
    }
  }, [state.research]);

  const handleAddNote = () => {
    setAdditionalNotes([...additionalNotes, '']);
  };

  const handleNoteChange = (index: number, value: string) => {
    const updated = [...additionalNotes];
    updated[index] = value;
    setAdditionalNotes(updated);
  };

  const handleRemoveNote = (index: number) => {
    if (additionalNotes.length > 1) {
      setAdditionalNotes(additionalNotes.filter((_, i) => i !== index));
    }
  };

  const handleSaveNotes = () => {
    const allNotes = [notes, ...additionalNotes.filter(n => n.trim())].join('\n\n');
    
    dispatch({
      type: 'SET_RESEARCH_NOTES',
      payload: {
        rawNotes: allNotes,
        sourceType,
      },
    });
  };

  const handleGenerateSuggestions = () => {
    const allNotes = [notes, ...additionalNotes.filter(n => n.trim())].join('\n\n');
    
    if (!allNotes.trim()) {
      alert('Please enter some research notes before generating suggestions.');
      return;
    }

    const insights = generateResearchInsights(allNotes);
    setSuggestions(insights);
    setEditableSuggestions(JSON.parse(JSON.stringify(insights))); // Deep copy for editing
    setHasGenerated(true);

    // Log generation
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        step: 'research',
        action: 'generated_suggestions',
        metadata: {
          recurringPainsCount: insights.recurringPains.length,
          personasCount: insights.tentativePersonas.length,
          problemStatementsCount: insights.draftProblemStatements.length,
        },
      },
    });
  };

  const handleAcceptPain = (index: number) => {
    if (!editableSuggestions) return;

    const pain = editableSuggestions.recurringPains[index];
    // For now, just log acceptance - could be used later
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        step: 'research',
        action: 'accepted_suggestion',
        metadata: {
          type: 'recurring_pain',
          content: pain,
        },
      },
    });

    // Remove from suggestions
    const updated = { ...editableSuggestions };
    updated.recurringPains = updated.recurringPains.filter((_, i) => i !== index);
    setEditableSuggestions(updated);
  };

  const handleAcceptPersona = (index: number) => {
    if (!editableSuggestions) return;

    const persona = editableSuggestions.tentativePersonas[index];
    const personaWithId: Persona = {
      ...persona,
      id: `persona-${Date.now()}-${index}`,
    };

    dispatch({
      type: 'ADD_PERSONA',
      payload: personaWithId,
    });

    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        step: 'research',
        action: 'accepted_suggestion',
        metadata: {
          type: 'persona',
          personaId: personaWithId.id,
          name: personaWithId.name,
        },
      },
    });

    // Remove from suggestions
    const updated = { ...editableSuggestions };
    updated.tentativePersonas = updated.tentativePersonas.filter((_, i) => i !== index);
    setEditableSuggestions(updated);
  };

  const handleAcceptProblem = (index: number) => {
    if (!editableSuggestions) return;

    const problem = editableSuggestions.draftProblemStatements[index];
    const problemWithId: ProblemStatement = {
      ...problem,
      id: `problem-${Date.now()}-${index}`,
      rationale: problem.rationale || '', // Ensure rationale field exists
      linkedPersonaIds: problem.linkedPersonaIds || [], // Ensure linkedPersonaIds field exists
    };

    dispatch({
      type: 'ADD_PROBLEM',
      payload: problemWithId,
    });

    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        step: 'research',
        action: 'accepted_suggestion',
        metadata: {
          type: 'problem_statement',
          problemId: problemWithId.id,
        },
      },
    });

    // Remove from suggestions
    const updated = { ...editableSuggestions };
    updated.draftProblemStatements = updated.draftProblemStatements.filter((_, i) => i !== index);
    setEditableSuggestions(updated);
  };

  const handleEditPain = (index: number, value: string) => {
    if (!editableSuggestions) return;
    const updated = { ...editableSuggestions };
    updated.recurringPains[index] = value;
    setEditableSuggestions(updated);
  };

  const handleEditPersona = (index: number, field: keyof Omit<Persona, 'id'>, value: string | string[]) => {
    if (!editableSuggestions) return;
    const updated = { ...editableSuggestions };
    updated.tentativePersonas[index] = {
      ...updated.tentativePersonas[index],
      [field]: value,
    };
    setEditableSuggestions(updated);
  };

  const handleEditProblem = (index: number, field: keyof Omit<ProblemStatement, 'id'>, value: string) => {
    if (!editableSuggestions) return;
    const updated = { ...editableSuggestions };
    updated.draftProblemStatements[index] = {
      ...updated.draftProblemStatements[index],
      [field]: value,
    };
    setEditableSuggestions(updated);
  };

  const allNotes = [notes, ...additionalNotes.filter(n => n.trim())].join('\n\n');

  return (
    <div className="space-y-6">
      {/* Source Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source Type
        </label>
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value as ResearchInput['sourceType'])}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
        >
          <option value="interview">Interview</option>
          <option value="article">Article</option>
          <option value="survey">Survey</option>
          <option value="observation">Observation</option>
          <option value="competitor-analysis">Competitor Analysis</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Main Notes Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Research Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter your research notes, interview transcripts, observations, or findings here..."
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light font-mono text-sm"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <button
            onClick={handleAddNote}
            className="text-sm text-brand-light hover:text-brand-light/90 font-medium"
          >
            + Add another note
          </button>
        </div>
        <div className="space-y-2">
          {additionalNotes.map((note, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={note}
                onChange={(e) => handleNoteChange(index, e.target.value)}
                placeholder={`Additional note ${index + 1}...`}
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light font-mono text-sm"
              />
              {additionalNotes.length > 1 && (
                <button
                  onClick={() => handleRemoveNote(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Notes Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveNotes}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Save Notes
        </button>
      </div>

      {/* Generate Suggestions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI-Assisted Insights</h3>
            <p className="text-sm text-gray-600 mt-1">
              Generate suggested insights from your research notes. All suggestions are editable and require your approval.
            </p>
          </div>
          <button
            onClick={handleGenerateSuggestions}
            disabled={!allNotes.trim()}
            className="px-6 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Suggested Insights (AI Assist)
          </button>
        </div>

        {/* Suggestions Display */}
        {editableSuggestions && (
          <div className="space-y-6 mt-6">
            {/* Recurring Pains */}
            {editableSuggestions.recurringPains.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
                <h4 className="font-semibold text-gray-900 mb-4">Recurring Pains</h4>
                <div className="space-y-3">
                  {editableSuggestions.recurringPains.map((pain, index) => (
                    <div key={index} className="bg-white border border-gray-300 rounded-lg p-4">
                      <textarea
                        value={pain}
                        onChange={(e) => handleEditPain(index, e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm mb-2"
                      />
                      <button
                        onClick={() => handleAcceptPain(index)}
                        className="px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tentative Personas */}
            {editableSuggestions.tentativePersonas.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                <h4 className="font-semibold text-gray-900 mb-4">Tentative Personas</h4>
                <div className="space-y-4">
                  {editableSuggestions.tentativePersonas.map((persona, index) => (
                    <div key={index} className="bg-white border border-gray-300 rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={persona.name}
                            onChange={(e) => handleEditPersona(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Archetype</label>
                          <input
                            type="text"
                            value={persona.archetype}
                            onChange={(e) => handleEditPersona(index, 'archetype', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Goals (one per line)</label>
                          <textarea
                            value={persona.goals.join('\n')}
                            onChange={(e) => handleEditPersona(index, 'goals', e.target.value.split('\n').filter(g => g.trim()))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Pain Points (one per line)</label>
                          <textarea
                            value={persona.painPoints.join('\n')}
                            onChange={(e) => handleEditPersona(index, 'painPoints', e.target.value.split('\n').filter(p => p.trim()))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcceptPersona(index)}
                        className="mt-3 px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                      >
                        Accept Persona
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Draft Problem Statements */}
            {editableSuggestions.draftProblemStatements.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-6 bg-purple-50">
                <h4 className="font-semibold text-gray-900 mb-4">Draft Problem Statements</h4>
                <div className="space-y-4">
                  {editableSuggestions.draftProblemStatements.map((problem, index) => (
                    <div key={index} className="bg-white border border-gray-300 rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Who</label>
                          <input
                            type="text"
                            value={problem.who}
                            onChange={(e) => handleEditProblem(index, 'who', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Need</label>
                          <input
                            type="text"
                            value={problem.need}
                            onChange={(e) => handleEditProblem(index, 'need', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Because</label>
                          <input
                            type="text"
                            value={problem.because}
                            onChange={(e) => handleEditProblem(index, 'because', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Evidence</label>
                          <textarea
                            value={problem.evidence}
                            onChange={(e) => handleEditProblem(index, 'evidence', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Success Metric</label>
                          <input
                            type="text"
                            value={problem.successMetric}
                            onChange={(e) => handleEditProblem(index, 'successMetric', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleAcceptProblem(index)}
                        className="mt-3 px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                      >
                        Accept Problem Statement
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editableSuggestions.recurringPains.length === 0 &&
             editableSuggestions.tentativePersonas.length === 0 &&
             editableSuggestions.draftProblemStatements.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No suggestions generated. Try adding more detailed research notes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
