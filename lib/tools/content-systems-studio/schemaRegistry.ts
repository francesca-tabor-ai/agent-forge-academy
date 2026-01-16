/**
 * Content Systems Studio - Schema Registry
 * 
 * Registry of all available content schemas.
 * Schemas define the structure and validation rules for content items.
 */

import type { ContentSchema, SchemaField } from './types';

/**
 * Campaign Asset Schema
 * Used for marketing campaign content with headlines, body text, and disclaimers
 */
const campaignAssetFields: SchemaField[] = [
  {
    id: 'headline',
    name: 'Headline',
    type: 'text',
    required: true,
    description: 'Main headline for the campaign',
    maxLength: 100,
  },
  {
    id: 'body',
    name: 'Body',
    type: 'text',
    required: true,
    description: 'Main body copy for the campaign',
    maxLength: 500,
  },
  {
    id: 'disclaimer',
    name: 'Disclaimer',
    type: 'text',
    required: false,
    description: 'Legal disclaimer text',
    maxLength: 200,
  },
  {
    id: 'locale',
    name: 'Locale',
    type: 'locale',
    required: true,
    description: 'Target locale for the content',
    supportedLocales: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'],
  },
];

export const campaignAssetSchema: ContentSchema = {
  id: 'campaign-asset',
  name: 'Campaign Asset',
  description: 'Marketing campaign content with headline, body, and disclaimer',
  fields: campaignAssetFields,
  version: {
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    createdBy: 'system',
    description: 'Initial version of Campaign Asset schema',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Product Label Schema
 * Used for product labeling with nutrition information
 */
const productLabelFields: SchemaField[] = [
  {
    id: 'headline',
    name: 'Product Name',
    type: 'text',
    required: true,
    description: 'Product name or headline',
    maxLength: 80,
  },
  {
    id: 'calories',
    name: 'Calories',
    type: 'numeric',
    required: true,
    description: 'Calories per serving',
    min: 0,
    max: 10000,
  },
  {
    id: 'protein',
    name: 'Protein (g)',
    type: 'numeric',
    required: true,
    description: 'Protein in grams per serving',
    min: 0,
    max: 1000,
  },
  {
    id: 'carbs',
    name: 'Carbohydrates (g)',
    type: 'numeric',
    required: true,
    description: 'Carbohydrates in grams per serving',
    min: 0,
    max: 1000,
  },
  {
    id: 'fat',
    name: 'Fat (g)',
    type: 'numeric',
    required: true,
    description: 'Fat in grams per serving',
    min: 0,
    max: 1000,
  },
  {
    id: 'disclaimer',
    name: 'Disclaimer',
    type: 'text',
    required: false,
    description: 'Nutritional disclaimer text',
    maxLength: 150,
  },
  {
    id: 'locale',
    name: 'Locale',
    type: 'locale',
    required: true,
    description: 'Target locale for the label',
    supportedLocales: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'],
  },
];

export const productLabelSchema: ContentSchema = {
  id: 'product-label',
  name: 'Product Label',
  description: 'Product labeling with nutrition information',
  fields: productLabelFields,
  version: {
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    createdBy: 'system',
    description: 'Initial version of Product Label schema',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Offer/Promotion Schema
 * Used for promotional offers with tone and length controls
 */
const offerPromotionFields: SchemaField[] = [
  {
    id: 'headline',
    name: 'Offer Headline',
    type: 'text',
    required: true,
    description: 'Main headline for the offer',
    maxLength: 120,
  },
  {
    id: 'body',
    name: 'Offer Description',
    type: 'text',
    required: true,
    description: 'Detailed description of the offer',
    maxLength: 300,
  },
  {
    id: 'tone',
    name: 'Tone',
    type: 'enum',
    required: true,
    description: 'Tone of voice for the offer',
    enumValues: ['professional', 'casual', 'urgent', 'friendly', 'formal'],
  },
  {
    id: 'length',
    name: 'Length',
    type: 'enum',
    required: true,
    description: 'Preferred content length',
    enumValues: ['short', 'medium', 'long'],
  },
  {
    id: 'locale',
    name: 'Locale',
    type: 'locale',
    required: true,
    description: 'Target locale for the offer',
    supportedLocales: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'],
  },
];

export const offerPromotionSchema: ContentSchema = {
  id: 'offer-promotion',
  name: 'Offer/Promotion',
  description: 'Promotional offers with tone and length controls',
  fields: offerPromotionFields,
  version: {
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    createdBy: 'system',
    description: 'Initial version of Offer/Promotion schema',
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

/**
 * Schema registry - all available schemas
 */
export const schemaRegistry: ContentSchema[] = [
  campaignAssetSchema,
  productLabelSchema,
  offerPromotionSchema,
];

/**
 * Get schema by ID
 */
export function getSchemaById(id: string): ContentSchema | undefined {
  return schemaRegistry.find((schema) => schema.id === id);
}

/**
 * Get all schemas
 */
export function getAllSchemas(): ContentSchema[] {
  return schemaRegistry;
}

/**
 * Get schemas by version
 */
export function getSchemasByVersion(version: string): ContentSchema[] {
  return schemaRegistry.filter((schema) => schema.version.version === version);
}
