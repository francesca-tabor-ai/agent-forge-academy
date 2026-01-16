'use client';

import { useState } from 'react';
import type { PlaygroundState } from '@/lib/tools/product-fundamentals-playground/usePlayground';

interface ExportStepProps {
  state: PlaygroundState;
}

function generateMarkdown(state: PlaygroundState): string {
  let markdown = '# Product Fundamentals Case Report\n\n';
  markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
  markdown += '---\n\n';

  // Scenario
  markdown += '## 1. Scenario\n\n';
  if (state.scenario) {
    markdown += `### ${state.scenario.title}\n\n`;
    markdown += `**Target User:** ${state.scenario.targetUser}\n\n`;
    markdown += `**Prompt:**\n${state.scenario.prompt}\n\n`;
    if (state.scenario.constraints.length > 0) {
      markdown += `**Constraints:**\n`;
      state.scenario.constraints.forEach(constraint => {
        markdown += `- ${constraint}\n`;
      });
      markdown += '\n';
    }
  } else {
    markdown += '*No scenario defined*\n\n';
  }
  markdown += '---\n\n';

  // Research Summary
  markdown += '## 2. Research Summary\n\n';
  if (state.research) {
    markdown += `**Source Type:** ${state.research.sourceType}\n\n`;
    markdown += `**Research Notes:**\n${state.research.rawNotes}\n\n`;
  } else {
    markdown += '*No research notes*\n\n';
  }
  markdown += '---\n\n';

  // Personas
  markdown += '## 3. Personas\n\n';
  if (state.personas.length > 0) {
    state.personas.forEach((persona, idx) => {
      markdown += `### ${idx + 1}. ${persona.name} (${persona.archetype})\n\n`;
      if (persona.goals.length > 0) {
        markdown += `**Goals:**\n`;
        persona.goals.forEach(goal => {
          markdown += `- ${goal}\n`;
        });
        markdown += '\n';
      }
      if (persona.painPoints.length > 0) {
        markdown += `**Pain Points:**\n`;
        persona.painPoints.forEach(pain => {
          markdown += `- ${pain}\n`;
        });
        markdown += '\n';
      }
      if (persona.quotes.length > 0) {
        markdown += `**Quotes:**\n`;
        persona.quotes.forEach(quote => {
          markdown += `> ${quote}\n`;
        });
        markdown += '\n';
      }
    });
  } else {
    markdown += '*No personas defined*\n\n';
  }
  markdown += '---\n\n';

  // Problem Statements
  markdown += '## 4. Problem Statements\n\n';
  if (state.problems.length > 0) {
    state.problems.forEach((problem, idx) => {
      markdown += `### ${idx + 1}. ${problem.who} needs ${problem.need}\n\n`;
      markdown += `**Because:** ${problem.because}\n\n`;
      if (problem.evidence) {
        markdown += `**Evidence:** ${problem.evidence}\n\n`;
      }
      if (problem.successMetric) {
        markdown += `**Success Metric:** ${problem.successMetric}\n\n`;
      }
      if (problem.rationale) {
        markdown += `**Why this matters:** ${problem.rationale}\n\n`;
      }
      if (problem.linkedPersonaIds && problem.linkedPersonaIds.length > 0) {
        markdown += `**Linked Personas:**\n`;
        problem.linkedPersonaIds.forEach(personaId => {
          const persona = state.personas.find(p => p.id === personaId);
          if (persona) {
            markdown += `- ${persona.name}\n`;
          }
        });
        markdown += '\n';
      }
    });
  } else {
    markdown += '*No problem statements defined*\n\n';
  }
  markdown += '---\n\n';

  // Journey Map
  markdown += '## 5. Journey Map\n\n';
  if (state.journey.length > 0) {
    state.journey.forEach((stage, idx) => {
      markdown += `### Stage ${idx + 1}: ${stage.name}\n\n`;
      markdown += `**User Goal:** ${stage.userGoal}\n\n`;
      if (stage.actions.length > 0) {
        markdown += `**Actions:**\n`;
        stage.actions.forEach(action => {
          markdown += `- ${action}\n`;
        });
        markdown += '\n';
      }
      if (stage.painPoints.length > 0) {
        markdown += `**Pain Points:**\n`;
        stage.painPoints.forEach(pain => {
          const isHighFriction = (stage.highFrictionPainPoints || []).includes(pain);
          markdown += `- ${pain}${isHighFriction ? ' ⚠️ **HIGH FRICTION**' : ''}\n`;
        });
        markdown += '\n';
      }
      if (stage.opportunities.length > 0) {
        markdown += `**Opportunities:**\n`;
        stage.opportunities.forEach(opp => {
          markdown += `- ${opp}\n`;
        });
        markdown += '\n';
      }
    });
  } else {
    markdown += '*No journey stages defined*\n\n';
  }
  markdown += '---\n\n';

  // Roadmap
  markdown += '## 6. Roadmap\n\n';
  if (state.roadmap.length > 0) {
    // Group by quadrant
    const byQuadrant: Record<string, typeof state.roadmap> = {
      'quick-win': [],
      'major-project': [],
      'fill-in': [],
      'time-sink': [],
    };
    state.roadmap.forEach(item => {
      byQuadrant[item.quadrant].push(item);
    });

    const quadrantLabels: Record<string, string> = {
      'quick-win': 'Quick Win',
      'major-project': 'Major Project (Big Bet)',
      'fill-in': 'Fill-In',
      'time-sink': 'Time Sink',
    };

    Object.entries(byQuadrant).forEach(([quadrant, items]) => {
      if (items.length > 0) {
        markdown += `### ${quadrantLabels[quadrant]}\n\n`;
        items.forEach(item => {
          markdown += `**${item.title}** (Impact: ${item.impact}/5, Effort: ${item.effort}/5, ${item.horizon}-term)\n\n`;
          if (item.rationale) {
            markdown += `*Why now / why this order:* ${item.rationale}\n\n`;
          }
          if (item.linkedProblemIds.length > 0) {
            markdown += `Linked to problems: ${item.linkedProblemIds.length}\n\n`;
          }
        });
      }
    });
  } else {
    markdown += '*No roadmap items defined*\n\n';
  }
  markdown += '---\n\n';

  // Sprint Plan
  markdown += '## 7. Sprint Plan\n\n';
  if (state.sprints.length > 0) {
    state.sprints.forEach((sprint, idx) => {
      markdown += `### Sprint ${idx + 1}\n\n`;
      markdown += `**Goal:** ${sprint.goal}\n\n`;
      markdown += `**Capacity:** ${sprint.capacityPoints} points\n\n`;
      if (sprint.overCapacityJustification) {
        markdown += `**Over Capacity Justification:** ${sprint.overCapacityJustification}\n\n`;
      }
    });
  } else {
    markdown += '*No sprint defined*\n\n';
  }

  if (state.stories.length > 0) {
    markdown += `### Stories (${state.stories.length})\n\n`;
    const totalPoints = state.stories.reduce((sum, s) => sum + s.points, 0);
    markdown += `**Total Points:** ${totalPoints}\n\n`;
    state.stories.forEach((story, idx) => {
      markdown += `#### ${idx + 1}. ${story.title} (${story.points} points)\n\n`;
      if (story.acceptanceCriteria.length > 0) {
        markdown += `**Acceptance Criteria:**\n`;
        story.acceptanceCriteria.forEach(ac => {
          markdown += `- ${ac}\n`;
        });
        markdown += '\n';
      }
      if (story.rationale) {
        markdown += `**Rationale:** ${story.rationale}\n\n`;
      }
      if (story.linkedRoadmapItemId) {
        const roadmapItem = state.roadmap.find(r => r.id === story.linkedRoadmapItemId);
        if (roadmapItem) {
          markdown += `**Linked to:** ${roadmapItem.title}\n\n`;
        }
      }
    });
  } else {
    markdown += '*No stories defined*\n\n';
  }
  markdown += '---\n\n';

  // UAT & Bugs
  markdown += '## 8. UAT & Bugs\n\n';
  if (state.uatScenarios.length > 0) {
    markdown += `### UAT Scenarios (${state.uatScenarios.length})\n\n`;
    state.uatScenarios.forEach((scenario, idx) => {
      markdown += `#### ${idx + 1}. ${scenario.title}\n\n`;
      markdown += `**Steps:**\n`;
      scenario.steps.forEach((step, stepIdx) => {
        markdown += `${stepIdx + 1}. ${step}\n`;
      });
      markdown += `\n**Expected:** ${scenario.expected}\n\n`;
    });
  } else {
    markdown += '*No UAT scenarios defined*\n\n';
  }

  if (state.bugs.length > 0) {
    markdown += `### Bugs (${state.bugs.length})\n\n`;
    const bySeverity: Record<string, typeof state.bugs> = {
      blocker: [],
      major: [],
      minor: [],
    };
    state.bugs.forEach(bug => {
      bySeverity[bug.severity].push(bug);
    });

    ['blocker', 'major', 'minor'].forEach(severity => {
      if (bySeverity[severity].length > 0) {
        markdown += `#### ${severity.toUpperCase()} (${bySeverity[severity].length})\n\n`;
        bySeverity[severity].forEach((bug, idx) => {
          markdown += `${idx + 1}. **${bug.title}**\n\n`;
          markdown += `**Repro Steps:**\n`;
          bug.reproSteps.forEach((step, stepIdx) => {
            markdown += `${stepIdx + 1}. ${step}\n`;
          });
          markdown += `\n**Expected:** ${bug.expected}\n\n`;
          markdown += `**Actual:** ${bug.actual}\n\n`;
          if (bug.decision) {
            markdown += `**Decision:** ${bug.decision}${bug.rationale ? ` - ${bug.rationale}` : ''}\n\n`;
          }
        });
      }
    });
  } else {
    markdown += '*No bugs logged*\n\n';
  }
  markdown += '---\n\n';

  // Audit Trail Summary
  markdown += '## 9. Audit Trail Summary\n\n';
  markdown += `**Total Actions Logged:** ${state.auditLog.length}\n\n`;
  
  // Group by step
  const byStep: Record<string, typeof state.auditLog> = {};
  state.auditLog.forEach(entry => {
    if (!byStep[entry.step]) {
      byStep[entry.step] = [];
    }
    byStep[entry.step].push(entry);
  });

  Object.entries(byStep).forEach(([step, entries]) => {
    markdown += `### ${step} (${entries.length} actions)\n\n`;
    // Show key decisions
    const keyActions = entries.filter(e => 
      e.action.includes('SET_') || 
      e.action.includes('ADD_') || 
      e.action.includes('ship_decision') ||
      e.action.includes('accepted_suggestion')
    );
    if (keyActions.length > 0) {
      keyActions.slice(-5).forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleString();
        markdown += `- **${date}**: ${entry.action}\n`;
      });
      markdown += '\n';
    }
  });

  markdown += '\n---\n\n';
  markdown += `*End of Report - Generated from Product Fundamentals Playground*\n`;

  return markdown;
}

function generateJSON(state: PlaygroundState): string {
  const exportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      version: '1.0',
    },
    scenario: state.scenario,
    research: state.research,
    personas: state.personas,
    problems: state.problems,
    journey: state.journey,
    roadmap: state.roadmap,
    sprints: state.sprints,
    stories: state.stories,
    uatScenarios: state.uatScenarios,
    bugs: state.bugs,
    auditLog: state.auditLog,
  };

  return JSON.stringify(exportData, null, 2);
}

export function ExportStep({ state }: ExportStepProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = async () => {
    const markdown = generateMarkdown(state);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy to clipboard. Please use the download option instead.');
    }
  };

  const handleDownloadMarkdown = () => {
    const markdown = generateMarkdown(state);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-fundamentals-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const json = generateJSON(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-fundamentals-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const markdown = generateMarkdown(state);

  return (
    <div className="space-y-6">
      {/* Export Actions */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
          >
            {copied ? '✓ Copied!' : 'Copy as Markdown'}
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            Download Markdown
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            Download JSON
          </button>
        </div>
      </div>

      {/* Case Report Preview */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Report Preview</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-[600px] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
            {markdown}
          </pre>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="text-2xl font-bold text-gray-900">
            {state.personas.length}
          </div>
          <div className="text-sm text-gray-600">Personas</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="text-2xl font-bold text-gray-900">
            {state.problems.length}
          </div>
          <div className="text-sm text-gray-600">Problems</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="text-2xl font-bold text-gray-900">
            {state.roadmap.length}
          </div>
          <div className="text-sm text-gray-600">Roadmap Items</div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="text-2xl font-bold text-gray-900">
            {state.bugs.length}
          </div>
          <div className="text-sm text-gray-600">Bugs</div>
        </div>
      </div>
    </div>
  );
}
