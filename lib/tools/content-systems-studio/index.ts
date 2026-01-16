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
