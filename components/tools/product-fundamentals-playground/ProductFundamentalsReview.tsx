'use client';

import type { PlaygroundState } from '@/lib/tools/product-fundamentals-playground/types';

interface ProductFundamentalsReviewProps {
  caseData: PlaygroundState;
}

export function ProductFundamentalsReview({ caseData }: ProductFundamentalsReviewProps) {
  // Get top 3 problems (prioritized by linked roadmap items or by order)
  const topProblems = caseData.problems
    .slice(0, 3)
    .map(problem => {
      const linkedRoadmapItems = caseData.roadmap.filter(r => r.linkedProblemIds.includes(problem.id));
      return { problem, linkedRoadmapItems };
    });

  // Get roadmap rationales
  const roadmapRationales = caseData.roadmap.map(item => ({
    title: item.title,
    rationale: item.rationale,
    quadrant: item.quadrant,
    impact: item.impact,
    effort: item.effort,
  }));

  // Get ship decision from audit log
  const shipDecision = caseData.auditLog
    .filter(entry => entry.action === 'ship_decision')
    .slice(-1)[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Fundamentals Case Review</h1>
            <p className="mt-2 text-gray-600">
              Read-only review of product fundamentals case study
            </p>
          </div>
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
            Review Mode
          </div>
        </div>
      </div>

      {/* Decision Trace Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Decision Trace</h2>
        
        {/* Top 3 Problems */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 3 Problems Chosen</h3>
          <div className="space-y-4">
            {topProblems.map(({ problem, linkedRoadmapItems }, idx) => (
              <div key={problem.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <span className="px-2 py-1 bg-brand-light text-white text-xs font-semibold rounded">
                    #{idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">
                      {problem.who} needs {problem.need}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>Because:</strong> {problem.because}
                    </div>
                    {problem.rationale && (
                      <div className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded p-2 mb-2">
                        <strong className="text-green-800">Why this matters:</strong>
                        <p className="text-green-700 mt-1">{problem.rationale}</p>
                      </div>
                    )}
                    {linkedRoadmapItems.length > 0 && (
                      <div className="text-xs text-gray-600 mt-2">
                        <strong>Addressed by:</strong>{' '}
                        {linkedRoadmapItems.map(r => r.title).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap Rationale */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Roadmap Prioritization Rationale</h3>
          <div className="space-y-4">
            {roadmapRationales.map((item, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      {item.quadrant.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                      {' '}(Impact: {item.impact}/5, Effort: {item.effort}/5)
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded p-3">
                  <strong className="text-blue-800">Why now / why this order:</strong>
                  <p className="text-blue-700 mt-1">{item.rationale}</p>
                </div>
              </div>
            ))}
            {roadmapRationales.length === 0 && (
              <p className="text-gray-500 italic">No roadmap items defined</p>
            )}
          </div>
        </div>

        {/* Ship/No-Ship Reasoning */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ship/No-Ship Decision</h3>
          {shipDecision ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  shipDecision.metadata?.decision === 'ship'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {shipDecision.metadata?.decision === 'ship' ? 'SHIP' : 'NO-SHIP'}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(shipDecision.timestamp).toLocaleString()}
                </span>
              </div>
              {shipDecision.metadata?.explanation != null && String(shipDecision.metadata.explanation).trim() !== '' ? (
                <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded p-3">
                  <strong>Reasoning:</strong>
                  <p className="mt-1">{String(shipDecision.metadata.explanation)}</p>
                </div>
              ) : null}
              {Number(shipDecision.metadata?.blockerBugsCount || 0) > 0 ? (
                <div className="mt-3 text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded p-2">
                  <strong>Note:</strong> {String(shipDecision.metadata?.blockerBugsCount ?? 0)} blocker bug(s) present
                  {shipDecision.metadata?.hasOverride ? ' (override rationale provided)' : ''}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-500 italic">No ship decision recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Case Report */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Full Case Report</h2>
        
        {/* Scenario */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Scenario</h3>
          {caseData.scenario ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">{caseData.scenario.title}</h4>
                <p className="text-sm text-gray-600 mt-1">Target User: {caseData.scenario.targetUser}</p>
              </div>
              <p className="text-gray-700">{caseData.scenario.prompt}</p>
              {caseData.scenario.constraints.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Constraints:</div>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {caseData.scenario.constraints.map((constraint, idx) => (
                      <li key={idx}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No scenario defined</p>
          )}
        </section>

        {/* Research */}
        <section className="mb-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Research Summary</h3>
          {caseData.research ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Source Type: {caseData.research.sourceType}</p>
              <p className="text-gray-700 whitespace-pre-wrap">{caseData.research.rawNotes}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No research notes</p>
          )}
        </section>

        {/* Personas */}
        <section className="mb-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Personas</h3>
          {caseData.personas.length > 0 ? (
            <div className="space-y-4">
              {caseData.personas.map((persona) => (
                <div key={persona.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{persona.name} ({persona.archetype})</h4>
                  {persona.goals.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-gray-700">Goals:</div>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {persona.goals.map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {persona.painPoints.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-gray-700">Pain Points:</div>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {persona.painPoints.map((pain, idx) => (
                          <li key={idx}>{pain}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No personas defined</p>
          )}
        </section>

        {/* Problem Statements */}
        <section className="mb-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Problem Statements</h3>
          {caseData.problems.length > 0 ? (
            <div className="space-y-4">
              {caseData.problems.map((problem) => (
                <div key={problem.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {problem.who} needs {problem.need}
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div><strong>Because:</strong> {problem.because}</div>
                    {problem.evidence && <div><strong>Evidence:</strong> {problem.evidence}</div>}
                    {problem.successMetric && <div><strong>Success Metric:</strong> {problem.successMetric}</div>}
                    {problem.rationale && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                        <strong className="text-green-800">Why this matters:</strong>
                        <p className="text-green-700 mt-1">{problem.rationale}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No problem statements defined</p>
          )}
        </section>

        {/* Journey Map */}
        <section className="mb-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Journey Map</h3>
          {caseData.journey.length > 0 ? (
            <div className="space-y-4">
              {caseData.journey.map((stage, idx) => (
                <div key={stage.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Stage {idx + 1}: {stage.name}
                  </h4>
                  <p className="text-sm text-gray-700 mb-3"><strong>User Goal:</strong> {stage.userGoal}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {stage.actions.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Actions:</div>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {stage.actions.map((action, aIdx) => (
                            <li key={aIdx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {stage.painPoints.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Pain Points:</div>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {stage.painPoints.map((pain, pIdx) => {
                            const isHighFriction = (stage.highFrictionPainPoints || []).includes(pain);
                            return (
                              <li key={pIdx} className={isHighFriction ? 'text-red-700 font-medium' : ''}>
                                {pain} {isHighFriction && '⚠️ HIGH FRICTION'}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {stage.opportunities.length > 0 && (
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Opportunities:</div>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {stage.opportunities.map((opp, oIdx) => (
                            <li key={oIdx}>{opp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No journey stages defined</p>
          )}
        </section>

        {/* Roadmap */}
        <section className="mb-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Roadmap</h3>
          {caseData.roadmap.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caseData.roadmap.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                  <div className="text-xs text-gray-600 mb-2">
                    {item.quadrant.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                    {' '}(Impact: {item.impact}/5, Effort: {item.effort}/5, {item.horizon}-term)
                  </div>
                  {item.rationale && (
                    <p className="text-sm text-gray-700 mt-2">{item.rationale}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No roadmap items defined</p>
          )}
        </section>

        {/* Sprint Plan */}
        <section className="mb-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Sprint Plan</h3>
          {caseData.sprints.length > 0 ? (
            <div className="space-y-4">
              {caseData.sprints.map((sprint, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Sprint {idx + 1}</h4>
                  <p className="text-sm text-gray-700 mb-2"><strong>Goal:</strong> {sprint.goal}</p>
                  <p className="text-sm text-gray-700"><strong>Capacity:</strong> {sprint.capacityPoints} points</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No sprint defined</p>
          )}
          {caseData.stories.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Stories ({caseData.stories.length})</h4>
              <div className="space-y-3">
                {caseData.stories.map((story) => (
                  <div key={story.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                        {story.points} points
                      </span>
                      <h5 className="font-semibold text-gray-900">{story.title}</h5>
                    </div>
                    {story.acceptanceCriteria.length > 0 && (
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Acceptance Criteria:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {story.acceptanceCriteria.map((ac, idx) => (
                            <li key={idx}>{ac}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {story.rationale && (
                      <p className="text-sm text-gray-600 mt-2"><strong>Rationale:</strong> {story.rationale}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* UAT & Bugs */}
        <section className="mb-8 border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">8. UAT & Bugs</h3>
          {caseData.uatScenarios.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">UAT Scenarios ({caseData.uatScenarios.length})</h4>
              <div className="space-y-3">
                {caseData.uatScenarios.map((scenario) => (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">{scenario.title}</h5>
                    <div className="text-sm text-gray-700">
                      <div className="mb-1"><strong>Steps:</strong></div>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        {scenario.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                      <div className="mt-2"><strong>Expected:</strong> {scenario.expected}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {caseData.bugs.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Bugs ({caseData.bugs.length})</h4>
              <div className="space-y-3">
                {caseData.bugs.map((bug) => (
                  <div key={bug.id} className={`border rounded-lg p-4 ${
                    bug.severity === 'blocker' ? 'border-red-300 bg-red-50' :
                    bug.severity === 'major' ? 'border-orange-300 bg-orange-50' :
                    'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        bug.severity === 'blocker' ? 'bg-red-200 text-red-800' :
                        bug.severity === 'major' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {bug.severity.toUpperCase()}
                      </span>
                      <h5 className="font-semibold text-gray-900">{bug.title}</h5>
                    </div>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><strong>Expected:</strong> {bug.expected}</div>
                      <div><strong>Actual:</strong> {bug.actual}</div>
                      {bug.decision && (
                        <div><strong>Decision:</strong> {bug.decision} {bug.rationale && `- ${bug.rationale}`}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
