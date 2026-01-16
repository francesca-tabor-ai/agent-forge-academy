/**
 * Clinical AI Sandbox - Type Definitions
 * 
 * Core types for the Clinical AI Sandbox system.
 * These types define boundaries, escalations, RAG operations, audit logs, and demo prompts.
 */

/**
 * Module identifier for Clinical AI Sandbox modules
 */
export type ModuleId =
  | 'agent-boundary-explorer'
  | 'rag-console'
  | 'voice-interaction-demo'
  | 'failure-mode-viewer'
  | 'governance-panel';

/**
 * Boundary action types that determine what an agent can do
 */
export type BoundaryAction = 'allowed' | 'blocked' | 'conditional';

/**
 * Escalation path types for when an agent cannot proceed
 */
export type EscalationPath = 'refusal' | 'clarify' | 'handoff';

/**
 * Metadata for a RAG document
 */
export interface RagDocMetadata {
  title: string;
  version: string;
  updated_at: Date;
  excerpt: string;
  tags: string[];
}

/**
 * Result from a RAG retrieval operation
 */
export interface RagRetrievalResult {
  doc_ids: string[];
  confidence: number; // 0-1
  gaps: string[]; // Identified knowledge gaps
}

/**
 * Audit log entry for tracking agent decisions and actions
 */
export interface AuditLogEntry {
  timestamp: Date;
  module: string;
  input: string;
  decision: string;
  reasons: string[];
  escalation?: EscalationPath;
  metadata?: Record<string, unknown>;
}

/**
 * Demo prompt for testing agent behavior
 */
export interface DemoPrompt {
  category: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  prompt: string;
  expected_behavior: string;
}

/**
 * Viewing mode for Clinical AI Sandbox
 */
export type ViewingMode = 'regulator' | 'hiring-panel';
