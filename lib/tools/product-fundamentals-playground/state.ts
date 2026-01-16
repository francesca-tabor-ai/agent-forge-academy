import type {
  PlaygroundState,
  CaseScenario,
  ResearchInput,
  Persona,
  ProblemStatement,
  JourneyStage,
  RoadmapItem,
  Sprint,
  Story,
  Bug,
  UATScenario,
  AuditEntry,
} from './types';

// Action types
export type PlaygroundAction =
  | { type: 'SET_SCENARIO'; payload: CaseScenario }
  | { type: 'SET_RESEARCH_NOTES'; payload: ResearchInput }
  | { type: 'SET_PERSONAS'; payload: Persona[] }
  | { type: 'ADD_PERSONA'; payload: Persona }
  | { type: 'UPDATE_PERSONA'; payload: Persona }
  | { type: 'SET_PROBLEMS'; payload: ProblemStatement[] }
  | { type: 'ADD_PROBLEM'; payload: ProblemStatement }
  | { type: 'UPDATE_PROBLEM'; payload: ProblemStatement }
  | { type: 'SET_JOURNEY'; payload: JourneyStage[] }
  | { type: 'UPDATE_JOURNEY_STAGE'; payload: JourneyStage }
  | { type: 'SET_ROADMAP'; payload: RoadmapItem[] }
  | { type: 'UPDATE_ROADMAP_ITEM'; payload: RoadmapItem }
  | { type: 'SET_SPRINT'; payload: { index: number; sprint: Sprint } }
  | { type: 'ADD_STORY'; payload: Story }
  | { type: 'UPDATE_STORY'; payload: Story }
  | { type: 'DELETE_STORY'; payload: string } // Story ID
  | { type: 'SET_UAT_SCENARIOS'; payload: UATScenario[] }
  | { type: 'ADD_UAT_SCENARIO'; payload: UATScenario }
  | { type: 'UPDATE_UAT_SCENARIO'; payload: UATScenario }
  | { type: 'ADD_BUG'; payload: Bug }
  | { type: 'UPDATE_BUG'; payload: Bug }
  | { type: 'SET_SHIP_DECISION'; payload: { bugId: string; decision: Bug['decision']; rationale: string | null } }
  | { type: 'ADD_AUDIT_ENTRY'; payload: Omit<AuditEntry, 'timestamp'> };

// Initial state
export const initialState: PlaygroundState = {
  scenario: null,
  research: null,
  personas: [],
  problems: [],
  journey: [],
  roadmap: [],
  sprints: [],
  stories: [],
  uatScenarios: [],
  bugs: [],
  auditLog: [],
};

// Helper to create audit entry with timestamp
const createAuditEntry = (action: string, step: string, metadata: Record<string, unknown> = {}): AuditEntry => ({
  timestamp: new Date().toISOString(),
  step,
  action,
  metadata,
});

// Reducer
export function playgroundReducer(
  state: PlaygroundState,
  action: PlaygroundAction
): PlaygroundState {
  let newState: PlaygroundState;
  let auditMetadata: Record<string, unknown> = {};

  switch (action.type) {
    case 'SET_SCENARIO':
      newState = {
        ...state,
        scenario: action.payload,
      };
      auditMetadata = { scenarioId: action.payload.id, title: action.payload.title };
      break;

    case 'SET_RESEARCH_NOTES':
      newState = {
        ...state,
        research: action.payload,
      };
      auditMetadata = { sourceType: action.payload.sourceType };
      break;

    case 'SET_PERSONAS':
      newState = {
        ...state,
        personas: action.payload,
      };
      auditMetadata = { count: action.payload.length };
      break;

    case 'ADD_PERSONA':
      newState = {
        ...state,
        personas: [...state.personas, action.payload],
      };
      auditMetadata = { personaId: action.payload.id, name: action.payload.name };
      break;

    case 'UPDATE_PERSONA':
      newState = {
        ...state,
        personas: state.personas.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
      auditMetadata = { personaId: action.payload.id, name: action.payload.name };
      break;

    case 'SET_PROBLEMS':
      newState = {
        ...state,
        problems: action.payload,
      };
      auditMetadata = { count: action.payload.length };
      break;

    case 'ADD_PROBLEM':
      newState = {
        ...state,
        problems: [...state.problems, action.payload],
      };
      auditMetadata = { problemId: action.payload.id };
      break;

    case 'UPDATE_PROBLEM':
      newState = {
        ...state,
        problems: action.payload,
      };
      auditMetadata = { count: action.payload.length };
      break;

    case 'UPDATE_PROBLEM':
      newState = {
        ...state,
        problems: state.problems.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
      auditMetadata = { problemId: action.payload.id };
      break;

    case 'SET_JOURNEY':
      newState = {
        ...state,
        journey: action.payload,
      };
      auditMetadata = { count: action.payload.length };
      break;

    case 'UPDATE_JOURNEY_STAGE':
      newState = {
        ...state,
        journey: state.journey.map((j) =>
          j.id === action.payload.id ? action.payload : j
        ),
      };
      auditMetadata = { stageId: action.payload.id, name: action.payload.name };
      break;

    case 'SET_ROADMAP':
      newState = {
        ...state,
        roadmap: action.payload,
      };
      auditMetadata = { count: action.payload.length };
      break;

    case 'UPDATE_ROADMAP_ITEM':
      newState = {
        ...state,
        roadmap: state.roadmap.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };
      auditMetadata = { roadmapItemId: action.payload.id, title: action.payload.title };
      break;

    case 'SET_SPRINT':
      // If index exists, update; otherwise, add new sprint
      const sprintIndex = action.payload.index;
      if (sprintIndex < state.sprints.length) {
        // Update existing sprint
        newState = {
          ...state,
          sprints: state.sprints.map((s, idx) =>
            idx === sprintIndex ? action.payload.sprint : s
          ),
        };
      } else {
        // Add new sprint
        newState = {
          ...state,
          sprints: [...state.sprints, action.payload.sprint],
        };
      }
      auditMetadata = { sprintIndex: action.payload.index, goal: action.payload.sprint.goal };
      break;

    case 'ADD_STORY':
      newState = {
        ...state,
        stories: [...state.stories, action.payload],
      };
      auditMetadata = { storyId: action.payload.id, title: action.payload.title };
      break;

    case 'UPDATE_STORY':
      newState = {
        ...state,
        stories: state.stories.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
      auditMetadata = { storyId: action.payload.id, title: action.payload.title };
      break;

    case 'DELETE_STORY':
      newState = {
        ...state,
        stories: state.stories.filter((s) => s.id !== action.payload),
      };
      auditMetadata = { storyId: action.payload };
      break;

    case 'SET_UAT_SCENARIOS':
      newState = {
        ...state,
        uatScenarios: action.payload,
      };
      auditMetadata = { count: action.payload.length };
      break;

    case 'ADD_UAT_SCENARIO':
      newState = {
        ...state,
        uatScenarios: [...state.uatScenarios, action.payload],
      };
      auditMetadata = { uatScenarioId: action.payload.id, title: action.payload.title };
      break;

    case 'UPDATE_UAT_SCENARIO':
      newState = {
        ...state,
        uatScenarios: state.uatScenarios.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      };
      auditMetadata = { uatScenarioId: action.payload.id, title: action.payload.title };
      break;

    case 'ADD_BUG':
      newState = {
        ...state,
        bugs: [...state.bugs, action.payload],
      };
      auditMetadata = { bugId: action.payload.id, title: action.payload.title, severity: action.payload.severity };
      break;

    case 'UPDATE_BUG':
      newState = {
        ...state,
        bugs: state.bugs.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      };
      auditMetadata = { bugId: action.payload.id, title: action.payload.title };
      break;

    case 'SET_SHIP_DECISION':
      newState = {
        ...state,
        bugs: state.bugs.map((b) =>
          b.id === action.payload.bugId
            ? { ...b, decision: action.payload.decision, rationale: action.payload.rationale }
            : b
        ),
      };
      auditMetadata = { bugId: action.payload.bugId, decision: action.payload.decision };
      break;

    case 'ADD_AUDIT_ENTRY':
      // Audit entries are append-only - never mutate past entries
      newState = {
        ...state,
        auditLog: [...state.auditLog, createAuditEntry(action.payload.action, action.payload.step, action.payload.metadata)],
      };
      // Don't add another audit entry for audit entries themselves
      return newState;

    default:
      return state;
  }

  // Automatically append audit entry for all actions except ADD_AUDIT_ENTRY
  // Determine step from action type
  const stepMap: Record<string, string> = {
    SET_SCENARIO: 'scenario',
    SET_RESEARCH_NOTES: 'research',
    SET_PERSONAS: 'personas-problems',
    ADD_PERSONA: 'personas-problems',
    UPDATE_PERSONA: 'personas-problems',
    SET_PROBLEMS: 'personas-problems',
    ADD_PROBLEM: 'personas-problems',
    UPDATE_PROBLEM: 'personas-problems',
    SET_JOURNEY: 'journey-map',
    UPDATE_JOURNEY_STAGE: 'journey-map',
    SET_ROADMAP: 'roadmap',
    UPDATE_ROADMAP_ITEM: 'roadmap',
    SET_SPRINT: 'sprint-plan',
    ADD_STORY: 'sprint-plan',
    UPDATE_STORY: 'sprint-plan',
    DELETE_STORY: 'sprint-plan',
    SET_UAT_SCENARIOS: 'uat-bugs',
    ADD_UAT_SCENARIO: 'uat-bugs',
    UPDATE_UAT_SCENARIO: 'uat-bugs',
    ADD_BUG: 'uat-bugs',
    UPDATE_BUG: 'uat-bugs',
    SET_SHIP_DECISION: 'uat-bugs',
  };

  const step = stepMap[action.type] || 'unknown';
  const auditEntry = createAuditEntry(action.type, step, auditMetadata);

  return {
    ...newState,
    auditLog: [...state.auditLog, auditEntry],
  };
}
