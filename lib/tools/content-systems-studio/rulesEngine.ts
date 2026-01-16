/**
 * Content Systems Studio - Rules Engine
 * 
 * Deterministic rules engine for content validation.
 * Rules check content items against business logic and compliance requirements.
 */

import type { ContentItem, ContentSchema, RuleResult } from './types';

/**
 * Run all rules against a content item
 * Returns an array of RuleResult objects
 */
export function runRules(item: ContentItem, schema: ContentSchema): RuleResult[] {
  const results: RuleResult[] = [];

  // Run all rule functions
  results.push(...checkComplianceDisclaimer(item, schema));
  results.push(...checkHeadlineLength(item, schema));
  results.push(...checkLocaleSpecificRules(item, schema));
  results.push(...checkNutritionRanges(item, schema));

  return results;
}

/**
 * Rule: Compliance disclaimer present for certain schemas/locales (block)
 * 
 * Campaign Asset and Product Label schemas require disclaimer for certain locales
 */
function checkComplianceDisclaimer(item: ContentItem, schema: ContentSchema): RuleResult[] {
  const results: RuleResult[] = [];

  // Only apply to Campaign Asset and Product Label schemas
  if (schema.id !== 'campaign-asset' && schema.id !== 'product-label') {
    return results;
  }

  // Locales that require disclaimer
  const disclaimerRequiredLocales = ['en-US', 'en-GB', 'de-DE', 'fr-FR'];
  const locale = String(item.fields.locale || item.locale);
  const disclaimer = String(item.fields.disclaimer || '').trim();

  if (disclaimerRequiredLocales.includes(locale)) {
    if (!disclaimer || disclaimer.length === 0) {
      results.push({
        status: 'block',
        code: 'MISSING_COMPLIANCE_DISCLAIMER',
        message: `Compliance disclaimer is required for locale ${locale}`,
        rationale: `Content targeting ${locale} must include a compliance disclaimer to meet regulatory requirements. This ensures legal protection and consumer transparency.`,
        fieldKey: 'disclaimer',
      });
    }
  }

  return results;
}

/**
 * Rule: Headline length limit based on schema (warn/block thresholds)
 * 
 * Headlines should be within optimal length ranges:
 * - Warn if > 60 characters (may be too long for some displays)
 * - Block if > 100 characters (exceeds most display limits)
 */
function checkHeadlineLength(item: ContentItem, schema: ContentSchema): RuleResult[] {
  const results: RuleResult[] = [];

  // Find headline field
  const headlineField = schema.fields.find((f) => f.id === 'headline');
  if (!headlineField) {
    return results;
  }

  const headline = String(item.fields.headline || '').trim();
  const length = headline.length;

  if (length === 0) {
    return results; // Required field validation handles empty
  }

  // Block threshold: > 100 characters
  if (length > 100) {
    results.push({
      status: 'block',
      code: 'HEADLINE_TOO_LONG',
      message: `Headline exceeds maximum length (${length} > 100 characters)`,
      rationale: `Headlines longer than 100 characters will be truncated in most display contexts, potentially cutting off important information. Consider shortening to ensure full visibility.`,
      fieldKey: 'headline',
    });
  }
  // Warn threshold: > 60 characters
  else if (length > 60) {
    results.push({
      status: 'warn',
      code: 'HEADLINE_LENGTH_WARNING',
      message: `Headline is long (${length} characters) and may be truncated on some displays`,
      rationale: `Headlines over 60 characters may be truncated on mobile devices, social media previews, or email subject lines. Consider shortening for better visibility across all platforms.`,
      fieldKey: 'headline',
    });
  }

  return results;
}

/**
 * Rule: Locale-specific rule (e.g. DE requires specific disclaimer text pattern) (warn/block)
 * 
 * German (de-DE) locale requires disclaimer to contain specific compliance language
 */
function checkLocaleSpecificRules(item: ContentItem, schema: ContentSchema): RuleResult[] {
  const results: RuleResult[] = [];

  const locale = String(item.fields.locale || item.locale);
  const disclaimer = String(item.fields.disclaimer || '').trim().toLowerCase();

  // German locale requires specific compliance language
  if (locale === 'de-DE') {
    // Check if disclaimer contains required German compliance keywords
    const requiredKeywords = ['hinweis', 'agb', 'bedingungen', 'haftung'];
    const hasRequiredLanguage = requiredKeywords.some((keyword) =>
      disclaimer.includes(keyword)
    );

    if (disclaimer && !hasRequiredLanguage) {
      results.push({
        status: 'warn',
        code: 'DE_COMPLIANCE_LANGUAGE_MISSING',
        message: 'German disclaimer should include standard compliance language (Hinweis, AGB, Bedingungen, or Haftung)',
        rationale: `German content requires specific compliance language to meet local regulatory standards. Including terms like "Hinweis", "AGB", "Bedingungen", or "Haftung" ensures proper legal coverage and consumer protection.`,
        fieldKey: 'disclaimer',
      });
    }

    // Block if disclaimer is missing entirely for DE
    if (!disclaimer || disclaimer.length === 0) {
      results.push({
        status: 'block',
        code: 'DE_DISCLAIMER_REQUIRED',
        message: 'German locale requires a compliance disclaimer',
        rationale: `German regulatory requirements mandate that marketing and product content includes a compliance disclaimer. This is a legal requirement for consumer protection.`,
        fieldKey: 'disclaimer',
      });
    }
  }

  // French locale compliance check
  if (locale === 'fr-FR') {
    const requiredKeywords = ['avis', 'conditions', 'responsabilité'];
    const hasRequiredLanguage = requiredKeywords.some((keyword) =>
      disclaimer.includes(keyword)
    );

    if (disclaimer && !hasRequiredLanguage) {
      results.push({
        status: 'warn',
        code: 'FR_COMPLIANCE_LANGUAGE_MISSING',
        message: 'French disclaimer should include standard compliance language (Avis, Conditions, or Responsabilité)',
        rationale: `French content benefits from including standard compliance terminology to meet local expectations and regulatory best practices.`,
        fieldKey: 'disclaimer',
      });
    }
  }

  return results;
}

/**
 * Rule: Nutrition numeric ranges for Product Label (warn/block)
 * 
 * Nutrition values should be within reasonable ranges:
 * - Calories: warn if > 500, block if > 1000
 * - Protein/Carbs/Fat: warn if > 50g, block if > 100g per serving
 */
function checkNutritionRanges(item: ContentItem, schema: ContentSchema): RuleResult[] {
  const results: RuleResult[] = [];

  // Only apply to Product Label schema
  if (schema.id !== 'product-label') {
    return results;
  }

  // Check calories
  const calories = typeof item.fields.calories === 'number' ? item.fields.calories : Number(item.fields.calories);
  if (!isNaN(calories)) {
    if (calories > 1000) {
      results.push({
        status: 'block',
        code: 'CALORIES_TOO_HIGH',
        message: `Calories per serving (${calories}) exceeds maximum recommended value (1000)`,
        rationale: `Calories exceeding 1000 per serving are extremely high and may indicate a data entry error or require special regulatory handling. Most standard food products contain less than 1000 calories per serving.`,
        fieldKey: 'calories',
      });
    } else if (calories > 500) {
      results.push({
        status: 'warn',
        code: 'CALORIES_HIGH_WARNING',
        message: `Calories per serving (${calories}) is high and may require special labeling`,
        rationale: `Products with over 500 calories per serving may require additional regulatory labeling or warnings in some jurisdictions. Verify this is intentional and complies with local regulations.`,
        fieldKey: 'calories',
      });
    }
  }

  // Check protein
  const protein = typeof item.fields.protein === 'number' ? item.fields.protein : Number(item.fields.protein);
  if (!isNaN(protein)) {
    if (protein > 100) {
      results.push({
        status: 'block',
        code: 'PROTEIN_TOO_HIGH',
        message: `Protein per serving (${protein}g) exceeds maximum recommended value (100g)`,
        rationale: `Protein values over 100g per serving are unusually high and may indicate a data entry error. Most protein products contain 20-50g per serving.`,
        fieldKey: 'protein',
      });
    } else if (protein > 50) {
      results.push({
        status: 'warn',
        code: 'PROTEIN_HIGH_WARNING',
        message: `Protein per serving (${protein}g) is high - verify accuracy`,
        rationale: `Protein values over 50g per serving are high but may be valid for specialized products. Verify the value is correct and matches product specifications.`,
        fieldKey: 'protein',
      });
    }
  }

  // Check carbohydrates
  const carbs = typeof item.fields.carbs === 'number' ? item.fields.carbs : Number(item.fields.carbs);
  if (!isNaN(carbs)) {
    if (carbs > 100) {
      results.push({
        status: 'block',
        code: 'CARBS_TOO_HIGH',
        message: `Carbohydrates per serving (${carbs}g) exceeds maximum recommended value (100g)`,
        rationale: `Carbohydrate values over 100g per serving are unusually high and may indicate a data entry error. Most products contain 20-60g per serving.`,
        fieldKey: 'carbs',
      });
    } else if (carbs > 50) {
      results.push({
        status: 'warn',
        code: 'CARBS_HIGH_WARNING',
        message: `Carbohydrates per serving (${carbs}g) is high - verify accuracy`,
        rationale: `Carbohydrate values over 50g per serving are high but may be valid for certain products. Verify the value matches product specifications.`,
        fieldKey: 'carbs',
      });
    }
  }

  // Check fat
  const fat = typeof item.fields.fat === 'number' ? item.fields.fat : Number(item.fields.fat);
  if (!isNaN(fat)) {
    if (fat > 100) {
      results.push({
        status: 'block',
        code: 'FAT_TOO_HIGH',
        message: `Fat per serving (${fat}g) exceeds maximum recommended value (100g)`,
        rationale: `Fat values over 100g per serving are extremely high and may indicate a data entry error. Most products contain 5-30g per serving.`,
        fieldKey: 'fat',
      });
    } else if (fat > 50) {
      results.push({
        status: 'warn',
        code: 'FAT_HIGH_WARNING',
        message: `Fat per serving (${fat}g) is high - verify accuracy`,
        rationale: `Fat values over 50g per serving are high but may be valid for certain products. Verify the value matches product specifications and consider consumer expectations.`,
        fieldKey: 'fat',
      });
    }
  }

  return results;
}
