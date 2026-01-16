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
  escalation: EscalationPath;
  reasons: string[];
  safeResponseTemplate: string;
  matchedRule?: BoundaryRule;
}

/**
 * Safe response templates - non-medical, supportive language
 */
const SAFE_RESPONSE_TEMPLATES = {
  blocked_diagnosis_treatment: 'I understand you\'re looking for medical guidance. I\'m not able to provide diagnoses, treatment recommendations, or dosing instructions, as these require a healthcare professional who can evaluate your specific situation. I\'d recommend speaking with your doctor or a qualified healthcare provider who can give you personalized medical advice.',
  
  blocked_self_harm_crisis: 'I want you to know that your safety is important. If you\'re having thoughts of self-harm or suicide, please reach out for immediate help. You can contact the National Suicide Prevention Lifeline at 988 (in the US), or your local emergency services. You don\'t have to go through this alone, and there are people who want to help. Please speak with a mental health professional or crisis counselor who can provide the support you need.',
  
  blocked_medical_decision: 'I appreciate you reaching out, but I\'m not able to help with medical decision-making. These decisions are best made with a healthcare professional who can consider your full medical history, current medications, and individual circumstances. Please consult with your doctor for guidance.',
  
  allowed_symptom_anxiety: 'It\'s completely understandable to feel concerned about symptoms. While I can provide general information, I want to emphasize that I\'m not a healthcare provider and cannot diagnose or treat. If your symptoms are causing significant worry or affecting your daily life, I\'d encourage you to speak with a healthcare professional who can provide proper evaluation and support. You\'re not alone in seeking answers, and reaching out to a doctor is a positive step.',
  
  conditional_lacks_context: 'I\'d like to help, but I need a bit more information to provide a safe and accurate response. Could you share more details about your situation? However, please keep in mind that I\'m not a healthcare provider, and for any medical concerns, consulting with a doctor is always the best approach.',
  
  default_blocked: 'Thank you for your question. I\'m designed to provide general health information, but I\'m not able to provide medical advice, diagnoses, or treatment recommendations. For personalized medical guidance, I\'d recommend consulting with a qualified healthcare professional who can evaluate your specific situation.',
};

/**
 * Clinical AI boundary rules - explicit and conservative
 * Rules are evaluated in order - first match wins
 */
export const BOUNDARY_RULES: BoundaryRule[] = [
  // BLOCKED: Diagnosis/Treatment/Dose (highest priority - check first)
  {
    id: 'blocked-diagnosis-treatment-dose',
    action: 'blocked',
    ruleStatement: 'Requests for diagnosis, treatment recommendations, or dosing instructions are strictly blocked.',
    whyExists: 'These require clinical examination, patient history, and professional judgment that AI cannot provide safely.',
    escalationPath: 'refusal',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        lower.includes('diagnose') ||
        lower.includes('diagnosis') ||
        lower.includes('what do i have') ||
        lower.includes('what is wrong with me') ||
        lower.includes('do i have') ||
        lower.includes('treatment for') ||
        lower.includes('treat') ||
        lower.includes('prescribe') ||
        lower.includes('prescription') ||
        lower.includes('dose') ||
        lower.includes('dosage') ||
        lower.includes('how much') && (lower.includes('take') || lower.includes('mg') || lower.includes('ml'))
      );
    },
  },

  // BLOCKED: Self-Harm / Crisis Situations (highest priority - check early)
  {
    id: 'blocked-self-harm-crisis',
    action: 'blocked',
    ruleStatement: 'Mentions of self-harm, suicidal ideation, or crisis situations require immediate human escalation.',
    whyExists: 'These situations require immediate professional mental health support and crisis intervention. AI must recognize and escalate appropriately.',
    escalationPath: 'handoff',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        lower.includes('don\'t want to be here') ||
        lower.includes('want to hurt myself') ||
        lower.includes('end it all') ||
        lower.includes('suicide') ||
        lower.includes('kill myself') ||
        (lower.includes('thoughts') && (lower.includes('harm') || lower.includes('hurt'))) ||
        lower.includes('crisis')
      );
    },
  },

  // BLOCKED: Medical Decision-Making
  {
    id: 'blocked-medical-decision',
    action: 'blocked',
    ruleStatement: 'Medical decision-making requests are blocked.',
    whyExists: 'Medical decisions require professional evaluation of patient-specific factors, risks, and benefits.',
    escalationPath: 'refusal',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        lower.includes('should i') && (lower.includes('take') || lower.includes('do') || lower.includes('start') || lower.includes('stop')) ||
        lower.includes('can i') && (lower.includes('take') || lower.includes('use')) ||
        lower.includes('is it safe to') ||
        lower.includes('medical decision')
      );
    },
  },

  // ALLOWED: Symptom Anxiety (with safe reassurance)
  {
    id: 'allowed-symptom-anxiety',
    action: 'allowed',
    ruleStatement: 'General symptom discussion and anxiety-related questions are allowed with safe reassurance and escalation suggestion.',
    whyExists: 'Patients need supportive, non-medical responses while being directed to professional care when needed.',
    escalationPath: 'handoff',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        (lower.includes('anxious') || lower.includes('worried') || lower.includes('concerned')) &&
        (lower.includes('symptom') || lower.includes('feeling') || lower.includes('about')) &&
        !lower.includes('diagnose') &&
        !lower.includes('treatment') &&
        !lower.includes('prescribe')
      );
    },
  },

  // CONDITIONAL: Lacks Context
  {
    id: 'conditional-lacks-context',
    action: 'conditional',
    ruleStatement: 'Requests that lack sufficient context require clarification.',
    whyExists: 'Some questions need additional information to determine if they can be safely answered or require professional evaluation.',
    escalationPath: 'clarify',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      // Short prompts or vague questions
      const wordCount = prompt.trim().split(/\s+/).length;
      return (
        wordCount < 5 ||
        (lower.includes('what') && wordCount < 8) ||
        (lower.includes('help') && wordCount < 6) ||
        (lower.includes('question') && wordCount < 7)
      );
    },
  },

  // ALLOWED: General Health Information
  {
    id: 'allowed-general-inquiry',
    action: 'allowed',
    ruleStatement: 'General health information and educational content requests are allowed.',
    whyExists: 'Patients need access to reliable health information for education and awareness.',
    escalationPath: 'refusal',
    evaluator: (prompt: string) => {
      const lower = prompt.toLowerCase();
      return (
        (lower.includes('what is') || lower.includes('explain') || lower.includes('tell me about') || lower.includes('information about')) &&
        !lower.includes('diagnose') &&
        !lower.includes('treatment') &&
        !lower.includes('prescribe') &&
        !lower.includes('dose')
      );
    },
  },
];

/**
 * Evaluate a prompt against boundary rules
 * Returns the first matching rule (rules are evaluated in order)
 * Conservative by default - if no rule matches, defaults to blocked
 * 
 * Deterministic: Same prompt always yields same output
 */
export function evaluateBoundary(prompt: string): BoundaryEvaluationResult {
  // Normalize prompt (deterministic normalization)
  const normalizedPrompt = prompt.trim().toLowerCase();

  if (!normalizedPrompt) {
    return {
      action: 'blocked',
      escalation: 'refusal',
      reasons: ['Empty prompts are not allowed.'],
      safeResponseTemplate: 'I\'d be happy to help, but I need a question or request to respond to. Please share what you\'d like to know.',
    };
  }

  // Evaluate against rules in order (deterministic - first match wins)
  for (const rule of BOUNDARY_RULES) {
    if (rule.evaluator(normalizedPrompt)) {
      return {
        action: rule.action,
        escalation: rule.escalationPath,
        reasons: [rule.ruleStatement, rule.whyExists],
        safeResponseTemplate: getSafeResponseTemplate(rule.id, rule.action),
        matchedRule: rule,
      };
    }
  }

  // Default: conservative blocking (refusal bias)
  return {
    action: 'blocked',
    escalation: 'refusal',
    reasons: [
      'Request does not match any allowed patterns.',
      'When in doubt, we block for safety to prevent providing inappropriate medical advice.',
    ],
    safeResponseTemplate: SAFE_RESPONSE_TEMPLATES.default_blocked,
  };
}

/**
 * Get safe response template based on rule ID and action
 * All templates are non-medical and supportive
 */
function getSafeResponseTemplate(ruleId: string, action: BoundaryAction): string {
  // Specific templates for key rules
  if (ruleId === 'blocked-self-harm-crisis') {
    return SAFE_RESPONSE_TEMPLATES.blocked_self_harm_crisis;
  }
  if (ruleId === 'blocked-diagnosis-treatment-dose') {
    return SAFE_RESPONSE_TEMPLATES.blocked_diagnosis_treatment;
  }
  if (ruleId === 'blocked-medical-decision') {
    return SAFE_RESPONSE_TEMPLATES.blocked_medical_decision;
  }
  if (ruleId === 'allowed-symptom-anxiety') {
    return SAFE_RESPONSE_TEMPLATES.allowed_symptom_anxiety;
  }
  if (ruleId === 'conditional-lacks-context') {
    return SAFE_RESPONSE_TEMPLATES.conditional_lacks_context;
  }

  // Default templates by action
  switch (action) {
    case 'blocked':
      return SAFE_RESPONSE_TEMPLATES.default_blocked;
    case 'conditional':
      return SAFE_RESPONSE_TEMPLATES.conditional_lacks_context;
    case 'allowed':
      return 'I can provide general information about this topic. However, please remember that I\'m not a healthcare provider, and for any medical concerns, consulting with a doctor is always recommended.';
    default:
      return SAFE_RESPONSE_TEMPLATES.default_blocked;
  }
}

/**
 * Get all rules by action type
 */
export function getRulesByAction(action: BoundaryAction): BoundaryRule[] {
  return BOUNDARY_RULES.filter((rule) => rule.action === action);
}

/**
 * Test fixtures - unit-test-like examples for deterministic behavior verification
 * These can be used to verify that the boundary engine produces consistent results
 */
export interface TestFixture {
  prompt: string;
  expectedAction: BoundaryAction;
  expectedEscalation: EscalationPath;
  description: string;
}

export const TEST_FIXTURES: TestFixture[] = [
  // Blocked: Diagnosis/Treatment/Dose
  {
    prompt: 'Can you diagnose what I have?',
    expectedAction: 'blocked',
    expectedEscalation: 'refusal',
    description: 'Direct diagnosis request should be blocked',
  },
  {
    prompt: 'What treatment should I take for my headache?',
    expectedAction: 'blocked',
    expectedEscalation: 'refusal',
    description: 'Treatment recommendation request should be blocked',
  },
  {
    prompt: 'How much medication should I take?',
    expectedAction: 'blocked',
    expectedEscalation: 'refusal',
    description: 'Dosing question should be blocked',
  },
  {
    prompt: 'What is wrong with me?',
    expectedAction: 'blocked',
    expectedEscalation: 'refusal',
    description: 'Diagnosis-seeking question should be blocked',
  },

  // Blocked: Medical Decision-Making
  {
    prompt: 'Should I take this medication?',
    expectedAction: 'blocked',
    expectedEscalation: 'refusal',
    description: 'Medical decision-making question should be blocked',
  },
  {
    prompt: 'Is it safe to take aspirin?',
    expectedAction: 'blocked',
    expectedEscalation: 'refusal',
    description: 'Safety decision question should be blocked',
  },
  {
    prompt: 'Can I take this medicine with my other medications?',
    expectedAction: 'blocked',
    expectedEscalation: 'refusal',
    description: 'Medication interaction decision should be blocked',
  },

  // Allowed: Symptom Anxiety
  {
    prompt: 'I\'m anxious about my symptoms',
    expectedAction: 'allowed',
    expectedEscalation: 'handoff',
    description: 'Symptom anxiety question should be allowed with escalation suggestion',
  },
  {
    prompt: 'I\'m worried about how I\'m feeling',
    expectedAction: 'allowed',
    expectedEscalation: 'handoff',
    description: 'General anxiety about symptoms should be allowed',
  },

  // Conditional: Lacks Context
  {
    prompt: 'Help',
    expectedAction: 'conditional',
    expectedEscalation: 'clarify',
    description: 'Very short prompt should require clarification',
  },
  {
    prompt: 'What?',
    expectedAction: 'conditional',
    expectedEscalation: 'clarify',
    description: 'Single word question should require clarification',
  },
  {
    prompt: 'I have a question',
    expectedAction: 'conditional',
    expectedEscalation: 'clarify',
    description: 'Vague question should require clarification',
  },

  // Allowed: General Information
  {
    prompt: 'What is diabetes?',
    expectedAction: 'allowed',
    expectedEscalation: 'refusal',
    description: 'General health information question should be allowed',
  },
  {
    prompt: 'Tell me about hypertension',
    expectedAction: 'allowed',
    expectedEscalation: 'refusal',
    description: 'Educational question should be allowed',
  },
  {
    prompt: 'Explain what a heart attack is',
    expectedAction: 'allowed',
    expectedEscalation: 'refusal',
    description: 'General explanation request should be allowed',
  },

  // Edge Cases
  {
    prompt: '',
    expectedAction: 'blocked',
    expectedEscalation: 'refusal',
    description: 'Empty prompt should be blocked',
  },
  {
    prompt: '   ',
    expectedAction: 'blocked',
    expectedEscalation: 'refusal',
    description: 'Whitespace-only prompt should be blocked',
  },
];

/**
 * Run test fixtures and return results
 * Useful for verifying deterministic behavior
 */
export function runTestFixtures(): Array<TestFixture & { actual: BoundaryEvaluationResult; passed: boolean }> {
  return TEST_FIXTURES.map((fixture) => {
    const actual = evaluateBoundary(fixture.prompt);
    const passed =
      actual.action === fixture.expectedAction &&
      actual.escalation === fixture.expectedEscalation;

    return {
      ...fixture,
      actual,
      passed,
    };
  });
}
