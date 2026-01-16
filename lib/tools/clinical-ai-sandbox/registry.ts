/**
 * Clinical AI Sandbox - Module Registry
 * 
 * Central registry of all modules available in the Clinical AI Sandbox.
 */

import type { ModuleId } from './types';

/**
 * Module information structure
 */
export interface ModuleInfo {
  id: ModuleId;
  title: string;
  description: string;
}

/**
 * Registry of all Clinical AI Sandbox modules
 */
export const CLINICAL_AI_SANDBOX_MODULES: ModuleInfo[] = [
  {
    id: 'agent-boundary-explorer',
    title: 'Agent Boundary Explorer',
    description: 'Explore the boundaries and limitations of AI agents in clinical settings. Understand where human oversight is critical and how to define clear agent responsibilities and constraints.',
  },
  {
    id: 'rag-console',
    title: 'RAG Console',
    description: 'Test and debug Retrieval-Augmented Generation systems for clinical knowledge. Query medical databases, review retrieved context, and evaluate response quality and accuracy.',
  },
  {
    id: 'voice-interaction-demo',
    title: 'Voice Interaction Demo',
    description: 'Experience voice-based interactions with clinical AI systems. Test natural language understanding, speech recognition, and conversational flows in a simulated clinical environment.',
  },
  {
    id: 'failure-mode-viewer',
    title: 'Failure Mode Viewer',
    description: 'Analyze common failure modes in clinical AI applications. Review case studies of system failures, edge cases, and learn how to implement robust error handling and safety measures.',
  },
  {
    id: 'governance-panel',
    title: 'Governance Panel',
    description: 'Understand regulatory requirements, compliance frameworks, and governance models for clinical AI. Explore audit trails, documentation standards, and risk management protocols.',
  },
];

/**
 * Get a module by its ID
 */
export function getModuleById(id: ModuleId): ModuleInfo | undefined {
  return CLINICAL_AI_SANDBOX_MODULES.find(module => module.id === id);
}

/**
 * Get all module IDs
 */
export function getAllModuleIds(): ModuleId[] {
  return CLINICAL_AI_SANDBOX_MODULES.map(module => module.id);
}

/**
 * Get the default module (first in registry)
 */
export function getDefaultModule(): ModuleInfo {
  return CLINICAL_AI_SANDBOX_MODULES[0];
}
