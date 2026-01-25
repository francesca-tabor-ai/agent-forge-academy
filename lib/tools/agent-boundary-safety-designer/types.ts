/**
 * Agent Boundary & Safety Designer - Type Definitions
 * 
 * Core types for designing and testing agent boundaries.
 */

/**
 * Boundary action types that determine what an agent can do
 */
export type BoundaryAction = 'allowed' | 'blocked' | 'conditional';

/**
 * Escalation path types for when an agent cannot proceed
 */
export type EscalationPath = 'refusal' | 'clarify' | 'handoff' | 'quarantine';

/**
 * Rule evaluation method
 */
export type EvaluationMethod = 'keyword' | 'regex' | 'semantic' | 'custom';

/**
 * Boundary rule definition
 */
export interface BoundaryRule {
  id: string;
  name: string;
  description: string;
  action: BoundaryAction;
  ruleStatement: string;
  whyExists: string;
  escalationPath: EscalationPath;
  evaluationMethod: EvaluationMethod;
  evaluator: (prompt: string) => boolean;
  keywords?: string[];
  regexPattern?: string;
  priority: number; // Lower number = higher priority
  safeResponseTemplate: string;
  metadata?: Record<string, unknown>;
}

/**
 * Boundary evaluation result
 */
export interface BoundaryEvaluationResult {
  action: BoundaryAction;
  escalation: EscalationPath;
  reasons: string[];
  safeResponseTemplate: string;
  matchedRule?: BoundaryRule;
  confidence?: number; // 0-1, for semantic evaluation
}

/**
 * Boundary configuration (collection of rules)
 */
export interface BoundaryConfiguration {
  id: string;
  name: string;
  description: string;
  domain: string; // e.g., 'healthcare', 'finance', 'general'
  rules: BoundaryRule[];
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

/**
 * Test case for boundary evaluation
 */
export interface BoundaryTestCase {
  id: string;
  prompt: string;
  expectedAction: BoundaryAction;
  expectedEscalation: EscalationPath;
  description: string;
  category?: string;
}

/**
 * Test result
 */
export interface BoundaryTestResult {
  testCase: BoundaryTestCase;
  actual: BoundaryEvaluationResult;
  passed: boolean;
  error?: string;
}
