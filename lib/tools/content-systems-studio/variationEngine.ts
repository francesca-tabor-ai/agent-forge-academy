/**
 * Content Systems Studio - Variation Engine
 * 
 * Deterministic, rule-based content variation generator.
 * Only generates variants for approved content using fixed phrase maps and rules.
 */

import type { ContentItem, FieldValue } from './types';

/**
 * Variant type
 */
export type VariantType = 'tone' | 'length' | 'locale';

/**
 * Tone variant options
 */
export type ToneVariant = 'formal' | 'neutral' | 'friendly';

/**
 * Length variant options
 */
export type LengthVariant = 'short' | 'medium' | 'long';

/**
 * Generated variant
 */
export interface GeneratedVariant {
  variantId: string;
  parentContentId: string;
  variantType: VariantType;
  variantSubtype: string; // e.g., 'formal', 'short', 'en-GB'
  fields: Record<string, FieldValue>;
  createdAt: Date;
}

/**
 * Phrase maps for tone variations
 */
const TONE_PHRASE_MAPS: Record<ToneVariant, Record<string, string>> = {
  formal: {
    'get': 'obtain',
    'buy': 'purchase',
    'help': 'assist',
    'thanks': 'thank you',
    'hi': 'hello',
    'hey': 'greetings',
    'cool': 'excellent',
    'awesome': 'outstanding',
    'great': 'exceptional',
    'good': 'satisfactory',
    'bad': 'unsatisfactory',
    'sure': 'certainly',
    'yeah': 'yes',
    'nope': 'no',
    'can\'t': 'cannot',
    'won\'t': 'will not',
    'don\'t': 'do not',
    'it\'s': 'it is',
    'you\'re': 'you are',
    'we\'re': 'we are',
  },
  neutral: {
    // Neutral keeps original phrases, no substitutions
  },
  friendly: {
    'obtain': 'get',
    'purchase': 'buy',
    'assist': 'help',
    'thank you': 'thanks',
    'hello': 'hi',
    'greetings': 'hey',
    'excellent': 'cool',
    'outstanding': 'awesome',
    'exceptional': 'great',
    'satisfactory': 'good',
    'unsatisfactory': 'bad',
    'certainly': 'sure',
    'yes': 'yeah',
    'no': 'nope',
    'cannot': 'can\'t',
    'will not': 'won\'t',
    'do not': 'don\'t',
    'it is': 'it\'s',
    'you are': 'you\'re',
    'we are': 'we\'re',
  },
};

/**
 * Locale phrase dictionary
 */
const LOCALE_PHRASE_DICT: Record<string, Record<string, string>> = {
  'en-GB': {
    'color': 'colour',
    'favorite': 'favourite',
    'organize': 'organise',
    'center': 'centre',
    'theater': 'theatre',
    'analyze': 'analyse',
    'defense': 'defence',
    'license': 'licence',
    'practice': 'practise',
    'program': 'programme',
  },
  'en-US': {
    'colour': 'color',
    'favourite': 'favorite',
    'organise': 'organize',
    'centre': 'center',
    'theatre': 'theater',
    'analyse': 'analyze',
    'defence': 'defense',
    'licence': 'license',
    'practise': 'practice',
    'programme': 'program',
  },
};

/**
 * Apply tone variation to text
 */
function applyToneVariation(text: string, tone: ToneVariant): string {
  if (tone === 'neutral') {
    return text; // No changes for neutral
  }

  const phraseMap = TONE_PHRASE_MAPS[tone];
  let result = text;

  // Apply phrase substitutions (case-insensitive)
  for (const [original, replacement] of Object.entries(phraseMap)) {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      // Preserve case
      if (match === match.toUpperCase()) {
        return replacement.toUpperCase();
      } else if (match[0] === match[0].toUpperCase()) {
        return replacement[0].toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return result;
}

/**
 * Apply length variation to text
 */
function applyLengthVariation(text: string, length: LengthVariant, maxLength?: number): string {
  const currentLength = text.length;

  if (length === 'medium') {
    return text; // No changes for medium
  }

  if (length === 'short') {
    // Truncate to 60% of original or maxLength, whichever is smaller
    const targetLength = maxLength
      ? Math.min(maxLength, Math.floor(currentLength * 0.6))
      : Math.floor(currentLength * 0.6);
    
    if (currentLength <= targetLength) {
      return text;
    }

    // Truncate at word boundary
    const truncated = text.substring(0, targetLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > targetLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  }

  if (length === 'long') {
    // Expand by adding descriptive phrases (deterministic)
    const expansions: string[] = [];
    
    // Add expansion phrases based on content
    if (text.toLowerCase().includes('discover')) {
      expansions.push('and explore');
    }
    if (text.toLowerCase().includes('learn')) {
      expansions.push('and master');
    }
    if (text.toLowerCase().includes('transform')) {
      expansions.push('completely');
    }
    if (text.toLowerCase().includes('revolutionize')) {
      expansions.push('in unprecedented ways');
    }

    // Add expansions, but respect maxLength if provided
    let expanded = text;
    for (const expansion of expansions) {
      const newText = expanded + ' ' + expansion;
      if (maxLength && newText.length > maxLength) {
        break;
      }
      expanded = newText;
    }

    return expanded;
  }

  return text;
}

/**
 * Apply locale variation to text
 */
function applyLocaleVariation(text: string, targetLocale: string, sourceLocale: string): string {
  // If same locale, no changes
  if (targetLocale === sourceLocale) {
    return text;
  }

  const phraseDict = LOCALE_PHRASE_DICT[targetLocale];
  if (!phraseDict) {
    return text; // No dictionary for target locale
  }

  let result = text;

  // Apply phrase substitutions (case-insensitive)
  for (const [original, replacement] of Object.entries(phraseDict)) {
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      // Preserve case
      if (match === match.toUpperCase()) {
        return replacement.toUpperCase();
      } else if (match[0] === match[0].toUpperCase()) {
        return replacement[0].toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return result;
}

/**
 * Generate deterministic variant ID
 */
function generateVariantId(parentId: string, variantType: VariantType, subtype: string): string {
  // Deterministic ID based on parent ID, type, and subtype
  const hash = `${parentId}-${variantType}-${subtype}`;
  return `variant-${hash.replace(/[^a-zA-Z0-9-]/g, '-')}`;
}

/**
 * Generate tone variants
 */
function generateToneVariants(
  item: ContentItem,
  tones: ToneVariant[]
): GeneratedVariant[] {
  const variants: GeneratedVariant[] = [];

  for (const tone of tones) {
    const variantFields: Record<string, FieldValue> = { ...item.fields };

    // Apply tone variation to text fields
    for (const [fieldId, value] of Object.entries(item.fields)) {
      if (typeof value === 'string') {
        variantFields[fieldId] = applyToneVariation(value, tone);
      }
    }

    variants.push({
      variantId: generateVariantId(item.id, 'tone', tone),
      parentContentId: item.id,
      variantType: 'tone',
      variantSubtype: tone,
      fields: variantFields,
      createdAt: new Date(),
    });
  }

  return variants;
}

/**
 * Generate length variants
 */
function generateLengthVariants(
  item: ContentItem,
  lengths: LengthVariant[]
): GeneratedVariant[] {
  const variants: GeneratedVariant[] = [];

  for (const length of lengths) {
    const variantFields: Record<string, FieldValue> = { ...item.fields };

    // Apply length variation to text fields
    for (const [fieldId, value] of Object.entries(item.fields)) {
      if (typeof value === 'string') {
        // Get maxLength from schema if available (would need schema passed in)
        // For now, use a reasonable default
        variantFields[fieldId] = applyLengthVariation(value, length);
      }
    }

    variants.push({
      variantId: generateVariantId(item.id, 'length', length),
      parentContentId: item.id,
      variantType: 'length',
      variantSubtype: length,
      fields: variantFields,
      createdAt: new Date(),
    });
  }

  return variants;
}

/**
 * Generate locale variants
 */
function generateLocaleVariants(
  item: ContentItem,
  targetLocales: string[]
): GeneratedVariant[] {
  const variants: GeneratedVariant[] = [];
  const sourceLocale = String(item.locale || item.fields.locale || 'en-US');

  for (const targetLocale of targetLocales) {
    if (targetLocale === sourceLocale) {
      continue; // Skip if same locale
    }

    const variantFields: Record<string, FieldValue> = { ...item.fields };

    // Apply locale variation to text fields
    for (const [fieldId, value] of Object.entries(item.fields)) {
      if (typeof value === 'string') {
        variantFields[fieldId] = applyLocaleVariation(value, targetLocale, sourceLocale);
      }
    }

    // Update locale field
    variantFields.locale = targetLocale;

    variants.push({
      variantId: generateVariantId(item.id, 'locale', targetLocale),
      parentContentId: item.id,
      variantType: 'locale',
      variantSubtype: targetLocale,
      fields: variantFields,
      createdAt: new Date(),
    });
  }

  return variants;
}

/**
 * Generate variants for a content item
 * 
 * @param item - The source content item (must be approved)
 * @param options - Variant generation options
 * @returns Array of generated variants
 */
export function generateVariants(
  item: ContentItem,
  options: {
    tones?: ToneVariant[];
    lengths?: LengthVariant[];
    locales?: string[];
  }
): GeneratedVariant[] {
  // Block if content is not approved
  if (item.status !== 'approved') {
    throw new Error(`Cannot generate variants: content must be approved (current status: ${item.status})`);
  }

  const variants: GeneratedVariant[] = [];

  // Generate tone variants
  if (options.tones && options.tones.length > 0) {
    variants.push(...generateToneVariants(item, options.tones));
  }

  // Generate length variants
  if (options.lengths && options.lengths.length > 0) {
    variants.push(...generateLengthVariants(item, options.lengths));
  }

  // Generate locale variants
  if (options.locales && options.locales.length > 0) {
    variants.push(...generateLocaleVariants(item, options.locales));
  }

  return variants;
}

/**
 * Check if variants can be generated for an item
 */
export function canGenerateVariants(item: ContentItem): boolean {
  return item.status === 'approved';
}
