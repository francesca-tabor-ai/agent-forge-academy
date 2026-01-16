/**
 * Content Systems Studio - State Management
 * 
 * Tool-scoped state manager using useReducer.
 * Manages schemas, content items, validation, rules, and audit log.
 */

import type {
  ContentSchema,
  ContentItem,
  WorkflowState,
  Role,
  RuleResult,
  AuditEvent,
  FieldValue,
} from './types';
import { schemaRegistry, getAllSchemas } from './schemaRegistry';
import { sampleContentItems } from './defaults';

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  fieldId: string;
  message: string;
}

/**
 * State structure for Content Systems Studio
 */
export interface ContentSystemsStudioState {
  schemas: ContentSchema[];
  contentItems: ContentItem[];
  selectedItemId: string | null;
  validationErrors: ValidationError[];
  ruleResults: RuleResult[];
  auditLog: AuditEvent[];
}

/**
 * Initial state for Content Systems Studio
 */
export const initialState: ContentSystemsStudioState = {
  schemas: getAllSchemas(),
  contentItems: sampleContentItems,
  selectedItemId: null,
  validationErrors: [],
  ruleResults: [],
  auditLog: [],
};

/**
 * Action types for the reducer
 */
export type ContentSystemsStudioAction =
  | {
      type: 'SELECT_ITEM';
      payload: string | null; // itemId
    }
  | {
      type: 'CREATE_ITEM';
      payload: {
        item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>;
        actorRole: Role;
      };
    }
  | {
      type: 'UPDATE_FIELD';
      payload: {
        itemId: string;
        fieldId: string;
        value: FieldValue;
        actorRole: Role;
      };
    }
  | {
      type: 'VALIDATE_ITEM';
      payload: {
        itemId: string;
        errors: ValidationError[];
      };
    }
  | {
      type: 'RUN_RULES';
      payload: {
        itemId: string;
        results: RuleResult[];
      };
    }
  | {
      type: 'ACK_WARNINGS';
      payload: {
        itemId: string;
        warningCodes: string[];
      };
    }
  | {
      type: 'TRANSITION_STATE';
      payload: {
        itemId: string;
        fromState: WorkflowState;
        toState: WorkflowState;
        actorRole: Role;
        comment?: string;
      };
    }
  | {
      type: 'ADD_COMMENT';
      payload: {
        itemId: string;
        comment: string;
        actorRole: Role;
      };
    }
  | {
      type: 'GENERATE_VARIANTS';
      payload: {
        sourceItemId: string;
        variants: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>[];
        actorRole: Role;
      };
    }
  | {
      type: 'ADD_AUDIT_EVENT';
      payload: Omit<AuditEvent, 'timestamp'> & { timestamp?: Date };
    };

/**
 * Generate a unique ID for new content items
 */
function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Reducer function for Content Systems Studio state
 */
export function contentSystemsStudioReducer(
  state: ContentSystemsStudioState,
  action: ContentSystemsStudioAction
): ContentSystemsStudioState {
  switch (action.type) {
    case 'SELECT_ITEM': {
      return {
        ...state,
        selectedItemId: action.payload,
      };
    }

    case 'CREATE_ITEM': {
      const now = new Date();
      const newItem: ContentItem = {
        ...action.payload.item,
        id: generateItemId(),
        createdAt: now,
        updatedAt: now,
      };

      const auditEvent: AuditEvent = {
        timestamp: now,
        actorRole: action.payload.actorRole,
        action: 'create',
        toState: action.payload.item.status,
        metadata: {
          itemId: newItem.id,
          schemaId: newItem.schemaId,
        },
      };

      return {
        ...state,
        contentItems: [...state.contentItems, newItem],
        selectedItemId: newItem.id,
        auditLog: [...state.auditLog, auditEvent],
      };
    }

    case 'UPDATE_FIELD': {
      const itemIndex = state.contentItems.findIndex(
        (item) => item.id === action.payload.itemId
      );

      if (itemIndex === -1) {
        return state;
      }

      const updatedItems = [...state.contentItems];
      const item = updatedItems[itemIndex];
      updatedItems[itemIndex] = {
        ...item,
        fields: {
          ...item.fields,
          [action.payload.fieldId]: action.payload.value,
        },
        updatedAt: new Date(),
        updatedBy: action.payload.actorRole,
      };

      const auditEvent: AuditEvent = {
        timestamp: new Date(),
        actorRole: action.payload.actorRole,
        action: 'update_field',
        fromState: item.status,
        toState: item.status,
        metadata: {
          itemId: item.id,
          fieldId: action.payload.fieldId,
          value: action.payload.value,
        },
      };

      return {
        ...state,
        contentItems: updatedItems,
        auditLog: [...state.auditLog, auditEvent],
      };
    }

    case 'VALIDATE_ITEM': {
      return {
        ...state,
        validationErrors: action.payload.errors,
      };
    }

    case 'RUN_RULES': {
      return {
        ...state,
        ruleResults: action.payload.results,
      };
    }

    case 'ACK_WARNINGS': {
      // Remove acknowledged warnings from rule results
      const filteredResults = state.ruleResults.filter(
        (result) =>
          result.status !== 'warn' ||
          !action.payload.warningCodes.includes(result.code)
      );

      return {
        ...state,
        ruleResults: filteredResults,
      };
    }

    case 'TRANSITION_STATE': {
      const itemIndex = state.contentItems.findIndex(
        (item) => item.id === action.payload.itemId
      );

      if (itemIndex === -1) {
        return state;
      }

      const updatedItems = [...state.contentItems];
      const item = updatedItems[itemIndex];
      updatedItems[itemIndex] = {
        ...item,
        status: action.payload.toState,
        updatedAt: new Date(),
        updatedBy: action.payload.actorRole,
      };

      const auditEvent: AuditEvent = {
        timestamp: new Date(),
        actorRole: action.payload.actorRole,
        action: 'transition_state',
        fromState: action.payload.fromState,
        toState: action.payload.toState,
        metadata: {
          itemId: item.id,
          comment: action.payload.comment,
        },
      };

      return {
        ...state,
        contentItems: updatedItems,
        auditLog: [...state.auditLog, auditEvent],
      };
    }

    case 'ADD_COMMENT': {
      const auditEvent: AuditEvent = {
        timestamp: new Date(),
        actorRole: action.payload.actorRole,
        action: 'add_comment',
        metadata: {
          itemId: action.payload.itemId,
          comment: action.payload.comment,
        },
      };

      return {
        ...state,
        auditLog: [...state.auditLog, auditEvent],
      };
    }

    case 'GENERATE_VARIANTS': {
      const now = new Date();
      const newItems: ContentItem[] = action.payload.variants.map((variant) => ({
        ...variant,
        id: generateItemId(),
        createdAt: now,
        updatedAt: now,
      }));

      const auditEvents: AuditEvent[] = newItems.map((item) => ({
        timestamp: new Date(),
        actorRole: action.payload.actorRole,
        action: 'generate_variant',
        toState: item.status,
        metadata: {
          sourceItemId: action.payload.sourceItemId,
          variantId: item.id,
          schemaId: item.schemaId,
        },
      }));

      return {
        ...state,
        contentItems: [...state.contentItems, ...newItems],
        auditLog: [...state.auditLog, ...auditEvents],
      };
    }

    case 'ADD_AUDIT_EVENT': {
      const auditEvent: AuditEvent = {
        ...action.payload,
        timestamp: action.payload.timestamp || new Date(),
      };

      // Append-only: never mutate existing entries, always create new array
      return {
        ...state,
        auditLog: [...state.auditLog, auditEvent],
      };
    }

    default: {
      return state;
    }
  }
}
