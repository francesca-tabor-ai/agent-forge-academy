/**
 * Content Systems Studio - Item Validation
 * 
 * Deterministic validation logic for content items based on their schema.
 */

import type { ContentItem, ContentSchema, SchemaField, FieldValue } from './types';
import type { ValidationError } from './state';

/**
 * Validate a content item against its schema
 * Returns an array of validation errors (empty if valid)
 */
export function validateItem(
  item: ContentItem,
  schema: ContentSchema
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check all required fields are present
  for (const field of schema.fields) {
    const fieldValue = item.fields[field.id];

    // Check required fields
    if (field.required) {
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        errors.push({
          fieldId: field.id,
          message: `${field.name} is required`,
        });
        continue; // Skip further validation for missing required fields
      }
    }

    // Skip validation if field is empty and not required
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      continue;
    }

    // Type-specific validation
    switch (field.type) {
      case 'text': {
        const textValue = String(fieldValue);
        
        // Check max length
        if (field.maxLength && textValue.length > field.maxLength) {
          errors.push({
            fieldId: field.id,
            message: `${field.name} must be ${field.maxLength} characters or less`,
          });
        }
        break;
      }

      case 'numeric': {
        const numValue = typeof fieldValue === 'number' ? fieldValue : Number(fieldValue);
        
        if (isNaN(numValue)) {
          errors.push({
            fieldId: field.id,
            message: `${field.name} must be a valid number`,
          });
        } else {
          // Check min/max bounds
          if (field.min !== undefined && numValue < field.min) {
            errors.push({
              fieldId: field.id,
              message: `${field.name} must be at least ${field.min}`,
            });
          }
          if (field.max !== undefined && numValue > field.max) {
            errors.push({
              fieldId: field.id,
              message: `${field.name} must be at most ${field.max}`,
            });
          }
        }
        break;
      }

      case 'enum': {
        if (!field.enumValues || field.enumValues.length === 0) {
          errors.push({
            fieldId: field.id,
            message: `${field.name} has invalid enum configuration`,
          });
          break;
        }

        const stringValue = String(fieldValue);
        if (!field.enumValues.includes(stringValue)) {
          errors.push({
            fieldId: field.id,
            message: `${field.name} must be one of: ${field.enumValues.join(', ')}`,
          });
        }
        break;
      }

      case 'locale': {
        if (!field.supportedLocales || field.supportedLocales.length === 0) {
          errors.push({
            fieldId: field.id,
            message: `${field.name} has invalid locale configuration`,
          });
          break;
        }

        const stringValue = String(fieldValue);
        if (!field.supportedLocales.includes(stringValue)) {
          errors.push({
            fieldId: field.id,
            message: `${field.name} must be one of: ${field.supportedLocales.join(', ')}`,
          });
        }
        break;
      }
    }
  }

  return errors;
}

/**
 * Check if a content item is valid (no errors)
 */
export function isValidItem(item: ContentItem, schema: ContentSchema): boolean {
  return validateItem(item, schema).length === 0;
}
