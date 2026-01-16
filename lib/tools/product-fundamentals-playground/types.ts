// Core data model types for Product Fundamentals Playground

export interface CaseScenario {
  id: string;
  title: string;
  prompt: string;
  constraints: string[];
  targetUser: string;
}

export type ResearchSourceType = 'article' | 'interview' | 'survey' | 'observation' | 'competitor-analysis' | 'other';

export interface ResearchInput {
  rawNotes: string;
  sourceType: ResearchSourceType;
}

export interface Persona {
  id: string;
  name: string;
  archetype: string;
  goals: string[];
  painPoints: string[];
  quotes: string[];
}

export interface ProblemStatement {
  id: string;
  who: string;
  need: string;
  because: string;
  evidence: string;
  successMetric: string;
  rationale: string; // "Why this matters" - required field
  linkedPersonaIds: string[]; // Multi-select persona links
}

export interface JourneyStage {
  id: string;
  name: string;
  userGoal: string;
  actions: string[];
  painPoints: string[];
  highFrictionPainPoints: string[]; // Pain points marked as "High friction"
  opportunities: string[];
}

export type ImpactLevel = 1 | 2 | 3 | 4 | 5;
export type EffortLevel = 1 | 2 | 3 | 4 | 5;
export type Quadrant = 'quick-win' | 'major-project' | 'fill-in' | 'time-sink';
export type Horizon = 'short' | 'long';

export interface RoadmapItem {
  id: string;
  title: string;
  linkedProblemIds: string[];
  impact: ImpactLevel;
  effort: EffortLevel;
  quadrant: Quadrant;
  rationale: string;
  horizon: Horizon;
}

export interface Sprint {
  goal: string;
  capacityPoints: number;
}

export interface Story {
  id: string;
  title: string;
  acceptanceCriteria: string[];
  points: number;
  linkedRoadmapItemId: string | null;
  rationale: string;
}

export type BugSeverity = 'blocker' | 'major' | 'minor';
export type BugDecision = 'fix-now' | 'fix-later' | 'wont-fix' | 'duplicate' | 'not-a-bug';

export interface UATScenario {
  id: string;
  title: string;
  steps: string[];
  expected: string;
}

export interface Bug {
  id: string;
  title: string;
  severity: BugSeverity;
  reproSteps: string[];
  expected: string;
  actual: string;
  linkedUATScenarioId: string | null;
  decision: BugDecision | null;
  rationale: string | null;
}

export interface AuditEntry {
  timestamp: string;
  step: string;
  action: string;
  metadata: Record<string, unknown>;
}

// State shape
export interface PlaygroundState {
  scenario: CaseScenario | null;
  research: ResearchInput | null;
  personas: Persona[];
  problems: ProblemStatement[];
  journey: JourneyStage[];
  roadmap: RoadmapItem[];
  sprints: Sprint[];
  stories: Story[];
  uatScenarios: UATScenario[];
  bugs: Bug[];
  auditLog: AuditEntry[];
}
