/**
 * Content Systems Studio - Main Export
 * 
 * Clean exports for all Content Systems Studio types, schemas, and utilities.
 */

// Types
export type {
  SchemaFieldType,
  SchemaField,
  SchemaVersion,
  ContentSchema,
  WorkflowState,
  Role,
  RuleResultStatus,
  RuleResult,
  FieldValue,
  ContentItem,
  AuditEvent,
} from './types';

// Schema Registry
export {
  campaignAssetSchema,
  productLabelSchema,
  offerPromotionSchema,
  schemaRegistry,
  getSchemaById,
  getAllSchemas,
  getSchemasByVersion,
} from './schemaRegistry';

// Default Sample Content
export {
  sampleCampaignAssets,
  sampleProductLabels,
  sampleOfferPromotions,
  sampleContentItems,
  getSampleContentBySchemaId,
  getSampleContentByStatus,
  getSampleContentByLocale,
} from './defaults';

// State Management
export {
  initialState,
  contentSystemsStudioReducer,
  type ContentSystemsStudioState,
  type ContentSystemsStudioAction,
  type ValidationError,
} from './state';

// Hook
export {
  useContentSystemsStudio,
  type UseContentSystemsStudioReturn,
} from './useContentSystemsStudio';

// Validation
export {
  validateItem,
  isValidItem,
} from './validateItem';

// Rules Engine
export {
  runRules,
} from './rulesEngine';

// Variation Engine
export {
  generateVariants,
  canGenerateVariants,
  type GeneratedVariant,
  type VariantType,
  type ToneVariant,
  type LengthVariant,
} from './variationEngine';

// Metrics
export {
  computeThroughputMetrics,
  type ThroughputMetrics,
  type MetricsFilters,
  type ItemsPerState,
  type AvgTimePerStage,
  type RuleViolationsOverTime,
  type VariantsPerItem,
} from './metrics';

// Persistence
export {
  loadContentItems,
  saveContentItem,
  updateContentItem,
  loadAuditEvents,
  appendAuditEvent,
  isPersistenceAvailable,
} from './persistence';
