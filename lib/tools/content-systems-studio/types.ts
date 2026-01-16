/**
 * Content Systems Studio - Type Definitions
 * 
 * Core types for the Content Systems Studio tool.
 * These types define schemas, content items, workflows, rules, and audit events.
 */

/**
 * Field types supported in content schemas
 */
export type SchemaFieldType = 'text' | 'enum' | 'locale' | 'numeric';

/**
 * Schema field definition
 */
export interface SchemaField {
  id: string;
  name: string;
  type: SchemaFieldType;
  required: boolean;
  description?: string;
  // For enum fields
  enumValues?: string[];
  // For numeric fields
  min?: number;
  max?: number;
  // For text fields
  maxLength?: number;
  // For locale fields
  supportedLocales?: string[];
}

/**
 * Schema version information
 */
export interface SchemaVersion {
  version: string; // e.g., "1.0.0"
  createdAt: Date;
  createdBy: string;
  description?: string;
  deprecated?: boolean;
}

/**
 * Content schema definition
 */
export interface ContentSchema {
  id: string;
  name: string;
  description?: string;
  fields: SchemaField[];
  version: SchemaVersion;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow state for content items
 */
export type WorkflowState = 'draft' | 'review' | 'approved' | 'localised';

/**
 * Role types for content system actors
 * Maps to existing platform roles: student, instructor, admin
 */
export type Role = 'student' | 'instructor' | 'admin';

/**
 * Rule result status
 */
export type RuleResultStatus = 'pass' | 'warn' | 'block';

/**
 * Result from a content validation rule
 */
export interface RuleResult {
  status: RuleResultStatus;
  code: string;
  message: string;
  rationale?: string;
  fieldKey?: string; // Optional field identifier if rule applies to specific field
}

/**
 * Content item field value
 * Can be string, number, or array of strings (for multi-select enums)
 */
export type FieldValue = string | number | string[];

/**
 * Content item with all its data
 */
export interface ContentItem {
  id: string;
  schemaId: string;
  locale: string;
  fields: Record<string, FieldValue>; // fieldId -> value mapping
  status: WorkflowState;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Audit event for tracking content changes
 */
export interface AuditEvent {
  timestamp: Date;
  actorRole: Role;
  action: string; // e.g., "create", "update", "approve", "reject", "publish"
  fromState?: WorkflowState;
  toState?: WorkflowState;
  metadata?: Record<string, unknown>; // Additional context about the action
}
