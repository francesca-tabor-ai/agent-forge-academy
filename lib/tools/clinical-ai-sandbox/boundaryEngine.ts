/**
 * Clinical AI Sandbox - Boundary Engine
 * 
 * Deterministic boundary evaluation engine for clinical AI agents.
 * All logic is explicit and inspectable - no hidden magic.
 */

import type { BoundaryAction, EscalationPath } from './types';

/**
 * Boundary rule definition
 */
export interface BoundaryRule {
  id: string;
  action: BoundaryAction;
  ruleStatement: string;
  whyExists: string;
  escalationPath: EscalationPath;
  evaluator: (prompt: string) => boolean;
}

/**
 * Boundary evaluation result
 */
export interface BoundaryEvaluationResult {
  action: BoundaryAction;
  reason: string;
  nextStep: string;
  matchedRule?: BoundaryRule;
}

/**
 * Clinical AI boundary rules - explicit and conservative
 */
export const BOUNDARY_RULES: BoundaryRule[] = [
  // ALLOWED ACTIONS
  {
    id: 'allowed-general-inquiry',
    action: 'allowed',
    ruleStatement: 'General health information and educational content requests are allowed.',
    whyExists: 'Patients need access to reliable health information for education and awareness.',
    escalationPath: 'refusal',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        lower.includes('what is') ||
        lower.includes('explain') ||
        lower.includes('tell me about') ||
        lower.includes('information about')
      ) && !lower.includes('diagnose') && !lower.includes('treatment');
    },
  },
  {
    id: 'allowed-symptom-discussion',
    action: 'allowed',
    ruleStatement: 'Discussion of symptoms in general terms is allowed for educational purposes.',
    whyExists: 'Helps patients understand symptoms and when to seek care, without making diagnoses.',
    escalationPath: 'refusal',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        (lower.includes('symptom') || lower.includes('sign')) &&
        (lower.includes('could mean') || lower.includes('might indicate')) &&
        !lower.includes('you have') &&
        !lower.includes('you are')
      );
    },
  },
  {
    id: 'allowed-medication-info',
    action: 'allowed',
    ruleStatement: 'General medication information and drug facts are allowed.',
    whyExists: 'Patients need access to medication information for safety and understanding.',
    escalationPath: 'refusal',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        (lower.includes('medication') || lower.includes('drug') || lower.includes('medicine')) &&
        (lower.includes('what is') || lower.includes('information') || lower.includes('side effect')) &&
        !lower.includes('should i take') &&
        !lower.includes('prescribe') &&
        !lower.includes('dose')
      );
    },
  },

  // BLOCKED ACTIONS
  {
    id: 'blocked-diagnosis',
    action: 'blocked',
    ruleStatement: 'Diagnosis of medical conditions is strictly blocked.',
    whyExists: 'Diagnosis requires clinical examination, history-taking, and professional judgment that AI cannot provide.',
    escalationPath: 'handoff',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        lower.includes('diagnose') ||
        lower.includes('what do i have') ||
        lower.includes('what is wrong with me') ||
        lower.includes('do i have') ||
        (lower.includes('condition') && (lower.includes('i have') || lower.includes('i might have')))
      );
    },
  },
  {
    id: 'blocked-treatment-prescription',
    action: 'blocked',
    ruleStatement: 'Treatment recommendations and prescription advice are blocked.',
    whyExists: 'Treatment decisions require patient-specific factors, contraindications, and clinical judgment.',
    escalationPath: 'handoff',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        lower.includes('prescribe') ||
        lower.includes('treatment for') ||
        lower.includes('should i take') ||
        lower.includes('what medicine') ||
        lower.includes('dose') ||
        lower.includes('dosage')
      );
    },
  },
  {
    id: 'blocked-emergency-advice',
    action: 'blocked',
    ruleStatement: 'Emergency medical advice is blocked - users should call emergency services.',
    whyExists: 'Emergency situations require immediate professional medical attention, not AI assistance.',
    escalationPath: 'handoff',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        lower.includes('emergency') ||
        lower.includes('urgent') ||
        lower.includes('chest pain') ||
        lower.includes('can\'t breathe') ||
        lower.includes('severe pain') ||
        lower.includes('call 911') ||
        lower.includes('ambulance')
      );
    },
  },
  {
    id: 'blocked-specific-dosing',
    action: 'blocked',
    ruleStatement: 'Specific medication dosing instructions are blocked.',
    whyExists: 'Dosing requires consideration of patient weight, age, medical history, and drug interactions.',
    escalationPath: 'handoff',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        (lower.includes('how much') || lower.includes('how many')) &&
        (lower.includes('take') || lower.includes('dose') || lower.includes('mg') || lower.includes('ml'))
      );
    },
  },

  // CONDITIONAL ACTIONS
  {
    id: 'conditional-clarification-needed',
    action: 'conditional',
    ruleStatement: 'Requests requiring clarification about patient context are conditional.',
    whyExists: 'Some questions need additional information to provide safe, accurate responses.',
    escalationPath: 'clarify',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        (lower.includes('should i') || lower.includes('can i') || lower.includes('is it safe')) &&
        !lower.includes('emergency') &&
        !lower.includes('diagnose') &&
        !lower.includes('prescribe')
      );
    },
  },
  {
    id: 'conditional-personal-health',
    action: 'conditional',
    ruleStatement: 'Personal health questions require verification of context and limitations.',
    whyExists: 'Personal health questions may require professional evaluation depending on severity and context.',
    escalationPath: 'clarify',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        (lower.includes('my') || lower.includes('i have') || lower.includes('i am')) &&
        (lower.includes('pain') || lower.includes('symptom') || lower.includes('feeling')) &&
        !lower.includes('diagnose') &&
        !lower.includes('emergency')
      );
    },
  },
];

/**
 * Evaluate a prompt against boundary rules
 * Returns the first matching rule (rules are evaluated in order)
 * Conservative by default - if no rule matches, defaults to blocked
 */
export function evaluateBoundary(prompt: string): BoundaryEvaluationResult {
  // Normalize prompt
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    return {
      action: 'blocked',
      reason: 'Empty prompts are not allowed.',
      nextStep: 'Please provide a valid question or request.',
    };
  }

  // Evaluate against rules in order
  for (const rule of BOUNDARY_RULES) {
    if (rule.evaluator(normalizedPrompt)) {
      return {
        action: rule.action,
        reason: rule.ruleStatement,
        nextStep: getNextStepMessage(rule.action, rule.escalationPath),
        matchedRule: rule,
      };
    }
  }

  // Default: conservative blocking
  return {
    action: 'blocked',
    reason: 'Request does not match any allowed patterns. When in doubt, we block for safety.',
    nextStep: 'Please rephrase your question or consult with a healthcare professional.',
  };
}

/**
 * Get next step message based on action and escalation path
 */
function getNextStepMessage(
  action: BoundaryAction,
  escalationPath: EscalationPath
): string {
  switch (action) {
    case 'allowed':
      return 'This request is allowed. The AI can proceed with providing information.';
    case 'blocked':
      switch (escalationPath) {
        case 'handoff':
          return 'This request is blocked. Please consult with a healthcare professional for proper evaluation.';
        case 'clarify':
          return 'This request is blocked. Please provide more context or consult a healthcare professional.';
        case 'refusal':
          return 'This request cannot be fulfilled. Please consult with a healthcare professional.';
      }
      break;
    case 'conditional':
      switch (escalationPath) {
        case 'clarify':
          return 'This request requires clarification. The AI should ask follow-up questions before proceeding.';
        case 'handoff':
          return 'This request may require professional evaluation. The AI should recommend consulting a healthcare provider.';
        case 'refusal':
          return 'This request requires additional context. Please provide more information or consult a healthcare professional.';
      }
      break;
  }
  return 'Please consult with a healthcare professional.';
}

/**
 * Get all rules by action type
 */
export function getRulesByAction(action: BoundaryAction): BoundaryRule[] {
  return BOUNDARY_RULES.filter((rule) => rule.action === action);
}
