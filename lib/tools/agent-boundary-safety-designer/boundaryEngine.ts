/**
 * Agent Boundary & Safety Designer - Boundary Engine
 * 
 * General-purpose boundary evaluation engine for AI agents.
 * Supports multiple evaluation methods and flexible rule configuration.
 */

import type {
  BoundaryRule,
  BoundaryEvaluationResult,
  BoundaryAction,
  EscalationPath,
  EvaluationMethod,
} from './types';

/**
 * Default safe response templates
 */
const DEFAULT_SAFE_RESPONSES: Record<string, string> = {
  blocked_default: 'I understand your request, but I\'m not able to assist with that. This falls outside my operational boundaries for safety and reliability reasons.',
  
  blocked_security: 'I cannot process this request as it may involve security-sensitive operations. Please consult with a security professional or authorized personnel.',
  
  blocked_legal: 'I\'m not able to provide legal advice or assistance with legal matters. Please consult with a qualified legal professional.',
  
  blocked_financial: 'I cannot provide financial advice or make financial decisions. Please consult with a qualified financial advisor.',
  
  conditional_clarify: 'I\'d like to help, but I need more information to provide a safe and accurate response. Could you provide additional context?',
  
  conditional_context: 'This request requires additional context to determine if I can safely assist. Please provide more details about your specific situation.',
  
  allowed_default: 'I can help with this request. However, please keep in mind that I have certain limitations, and for critical decisions, consulting with a qualified professional is recommended.',
  
  handoff_human: 'This request requires human oversight. I\'m escalating this to a qualified professional who can provide the appropriate assistance.',
  
  quarantine_suspicious: 'I\'ve detected potentially suspicious activity. This request has been quarantined for review by security personnel.',
};

/**
 * Create a keyword-based evaluator
 */
export function createKeywordEvaluator(keywords: string[], caseSensitive = false): (prompt: string) => boolean {
  const normalizedKeywords = caseSensitive 
    ? keywords 
    : keywords.map(k => k.toLowerCase());
  
  return (prompt: string) => {
    const normalizedPrompt = caseSensitive ? prompt : prompt.toLowerCase();
    return normalizedKeywords.some(keyword => normalizedPrompt.includes(keyword));
  };
}

/**
 * Create a regex-based evaluator
 */
export function createRegexEvaluator(pattern: string, flags = 'i'): (prompt: string) => boolean {
  const regex = new RegExp(pattern, flags);
  return (prompt: string) => regex.test(prompt);
}

/**
 * Create a custom evaluator function
 */
export function createCustomEvaluator(fn: (prompt: string) => boolean): (prompt: string) => boolean {
  return fn;
}

/**
 * Create a boundary rule
 */
export function createBoundaryRule(
  id: string,
  name: string,
  description: string,
  action: BoundaryAction,
  ruleStatement: string,
  whyExists: string,
  escalationPath: EscalationPath,
  evaluationMethod: EvaluationMethod,
  evaluator: (prompt: string) => boolean,
  options: {
    priority?: number;
    safeResponseTemplate?: string;
    keywords?: string[];
    regexPattern?: string;
    metadata?: Record<string, unknown>;
  } = {}
): BoundaryRule {
  return {
    id,
    name,
    description,
    action,
    ruleStatement,
    whyExists,
    escalationPath,
    evaluationMethod,
    evaluator,
    priority: options.priority ?? 100,
    safeResponseTemplate: options.safeResponseTemplate ?? getDefaultSafeResponse(action, escalationPath),
    keywords: options.keywords,
    regexPattern: options.regexPattern,
    metadata: options.metadata,
  };
}

/**
 * Get default safe response template
 */
function getDefaultSafeResponse(action: BoundaryAction, escalation: EscalationPath): string {
  if (escalation === 'quarantine') {
    return DEFAULT_SAFE_RESPONSES.quarantine_suspicious;
  }
  
  if (escalation === 'handoff') {
    return DEFAULT_SAFE_RESPONSES.handoff_human;
  }
  
  switch (action) {
    case 'blocked':
      return DEFAULT_SAFE_RESPONSES.blocked_default;
    case 'conditional':
      return escalation === 'clarify' 
        ? DEFAULT_SAFE_RESPONSES.conditional_clarify
        : DEFAULT_SAFE_RESPONSES.conditional_context;
    case 'allowed':
      return DEFAULT_SAFE_RESPONSES.allowed_default;
    default:
      return DEFAULT_SAFE_RESPONSES.blocked_default;
  }
}

/**
 * Evaluate a prompt against boundary rules
 * Rules are evaluated in priority order (lower priority number = evaluated first)
 * First match wins
 */
export function evaluateBoundary(
  prompt: string,
  rules: BoundaryRule[]
): BoundaryEvaluationResult {
  // Normalize prompt
  const normalizedPrompt = prompt.trim();
  
  if (!normalizedPrompt) {
    return {
      action: 'blocked',
      escalation: 'refusal',
      reasons: ['Empty prompts are not allowed.'],
      safeResponseTemplate: 'I\'d be happy to help, but I need a question or request to respond to. Please share what you\'d like to know.',
    };
  }
  
  // Sort rules by priority (lower number = higher priority)
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
  
  // Evaluate against rules in priority order
  for (const rule of sortedRules) {
    try {
      if (rule.evaluator(normalizedPrompt)) {
        return {
          action: rule.action,
          escalation: rule.escalationPath,
          reasons: [rule.ruleStatement, rule.whyExists],
          safeResponseTemplate: rule.safeResponseTemplate,
          matchedRule: rule,
        };
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      // Continue to next rule if evaluation fails
    }
  }
  
  // Default: conservative blocking
  return {
    action: 'blocked',
    escalation: 'refusal',
    reasons: [
      'Request does not match any defined boundary rules.',
      'When in doubt, we block for safety to prevent inappropriate agent behavior.',
    ],
    safeResponseTemplate: DEFAULT_SAFE_RESPONSES.blocked_default,
  };
}

/**
 * Get rules by action type
 */
export function getRulesByAction(rules: BoundaryRule[], action: BoundaryAction): BoundaryRule[] {
  return rules.filter(rule => rule.action === action);
}

/**
 * Get rules by escalation path
 */
export function getRulesByEscalation(rules: BoundaryRule[], escalation: EscalationPath): BoundaryRule[] {
  return rules.filter(rule => rule.escalationPath === escalation);
}

/**
 * Validate a boundary rule
 */
export function validateRule(rule: BoundaryRule): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!rule.id || rule.id.trim() === '') {
    errors.push('Rule ID is required');
  }
  
  if (!rule.name || rule.name.trim() === '') {
    errors.push('Rule name is required');
  }
  
  if (!rule.ruleStatement || rule.ruleStatement.trim() === '') {
    errors.push('Rule statement is required');
  }
  
  if (!rule.evaluator || typeof rule.evaluator !== 'function') {
    errors.push('Rule evaluator function is required');
  }
  
  if (rule.evaluationMethod === 'keyword' && (!rule.keywords || rule.keywords.length === 0)) {
    errors.push('Keywords are required for keyword-based evaluation');
  }
  
  if (rule.evaluationMethod === 'regex' && (!rule.regexPattern || rule.regexPattern.trim() === '')) {
    errors.push('Regex pattern is required for regex-based evaluation');
  }
  
  // Test evaluator with a sample prompt
  try {
    rule.evaluator('test prompt');
  } catch (error) {
    errors.push(`Evaluator function error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export rule to JSON (for persistence/export)
 */
export function exportRuleToJSON(rule: BoundaryRule): string {
  // Create a serializable version (exclude the evaluator function)
  const serializableRule = {
    id: rule.id,
    name: rule.name,
    description: rule.description,
    action: rule.action,
    ruleStatement: rule.ruleStatement,
    whyExists: rule.whyExists,
    escalationPath: rule.escalationPath,
    evaluationMethod: rule.evaluationMethod,
    priority: rule.priority,
    safeResponseTemplate: rule.safeResponseTemplate,
    keywords: rule.keywords,
    regexPattern: rule.regexPattern,
    metadata: rule.metadata,
  };
  
  return JSON.stringify(serializableRule, null, 2);
}

/**
 * Import rule from JSON (reconstructs evaluator based on evaluation method)
 */
export function importRuleFromJSON(json: string): BoundaryRule {
  const data = JSON.parse(json);
  
  let evaluator: (prompt: string) => boolean;
  
  switch (data.evaluationMethod) {
    case 'keyword':
      if (!data.keywords || data.keywords.length === 0) {
        throw new Error('Keywords are required for keyword-based evaluation');
      }
      evaluator = createKeywordEvaluator(data.keywords);
      break;
      
    case 'regex':
      if (!data.regexPattern) {
        throw new Error('Regex pattern is required for regex-based evaluation');
      }
      evaluator = createRegexEvaluator(data.regexPattern);
      break;
      
    case 'custom':
      throw new Error('Custom evaluators cannot be imported from JSON. Please recreate manually.');
      
    default:
      throw new Error(`Unknown evaluation method: ${data.evaluationMethod}`);
  }
  
  return createBoundaryRule(
    data.id,
    data.name,
    data.description,
    data.action,
    data.ruleStatement,
    data.whyExists,
    data.escalationPath,
    data.evaluationMethod,
    evaluator,
    {
      priority: data.priority,
      safeResponseTemplate: data.safeResponseTemplate,
      keywords: data.keywords,
      regexPattern: data.regexPattern,
      metadata: data.metadata,
    }
  );
}
