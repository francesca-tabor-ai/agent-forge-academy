'use client';

import { useState } from 'react';
import type { ContentItem, Role } from '@/lib/tools/content-systems-studio/types';
import type { UseContentSystemsStudioReturn } from '@/lib/tools/content-systems-studio/useContentSystemsStudio';
import {
  generateVariants,
  canGenerateVariants,
  type GeneratedVariant,
  type ToneVariant,
  type LengthVariant,
} from '@/lib/tools/content-systems-studio/variationEngine';
import { validateItem } from '@/lib/tools/content-systems-studio/validateItem';
import { runRules } from '@/lib/tools/content-systems-studio/rulesEngine';
import { getSchemaById } from '@/lib/tools/content-systems-studio/schemaRegistry';

interface VariationsPanelProps {
  studio: UseContentSystemsStudioReturn;
  currentRole: Role;
}

export function VariationsPanel({ studio, currentRole }: VariationsPanelProps) {
  const [selectedTones, setSelectedTones] = useState<ToneVariant[]>([]);
  const [selectedLengths, setSelectedLengths] = useState<LengthVariant[]>([]);
  const [selectedLocales, setSelectedLocales] = useState<string[]>([]);
  const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { state, selectedItem, selectedSchema, generateVariants: generateVariantsAction } = studio;

  if (!selectedItem) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-500">Select a content item to generate variants.</p>
      </div>
    );
  }

  const canGenerate = canGenerateVariants(selectedItem);
  const schema = selectedSchema || getSchemaById(selectedItem.schemaId);

  const handleToneToggle = (tone: ToneVariant) => {
    setSelectedTones((prev) =>
      prev.includes(tone) ? prev.filter((t) => t !== tone) : [...prev, tone]
    );
  };

  const handleLengthToggle = (length: LengthVariant) => {
    setSelectedLengths((prev) =>
      prev.includes(length) ? prev.filter((l) => l !== length) : [...prev, length]
    );
  };

  const handleLocaleToggle = (locale: string) => {
    setSelectedLocales((prev) =>
      prev.includes(locale) ? prev.filter((l) => l !== locale) : [...prev, locale]
    );
  };

  const handleGenerate = () => {
    if (!canGenerate) {
      setError('Content must be approved to generate variants');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const variants = generateVariants(selectedItem, {
        tones: selectedTones.length > 0 ? selectedTones : undefined,
        lengths: selectedLengths.length > 0 ? selectedLengths : undefined,
        locales: selectedLocales.length > 0 ? selectedLocales : undefined,
      });

      // Validate and run rules on each variant
      if (schema) {
        const validVariants: GeneratedVariant[] = [];
        
        for (const variant of variants) {
          // Convert GeneratedVariant to ContentItem for validation
          const variantItem: ContentItem = {
            id: variant.variantId,
            schemaId: selectedItem.schemaId,
            locale: String(variant.fields.locale || selectedItem.locale),
            fields: variant.fields,
            status: 'draft',
            createdAt: variant.createdAt,
            updatedAt: variant.createdAt,
          };

          // Validate schema
          const validationErrors = validateItem(variantItem, schema);
          if (validationErrors.length > 0) {
            console.warn('Variant failed validation:', validationErrors);
            continue; // Skip invalid variants
          }

          // Run rules
          const ruleResults = runRules(variantItem, schema);
          const blockingRules = ruleResults.filter((r) => r.status === 'block');
          if (blockingRules.length > 0) {
            console.warn('Variant has blocking rules:', blockingRules);
            continue; // Skip variants with blocking rules
          }

          validVariants.push(variant);
        }

        setGeneratedVariants(validVariants);
      } else {
        setGeneratedVariants(variants);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate variants');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVariant = (variant: GeneratedVariant) => {
    // Create a new content item from the variant
    const newItem: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'> = {
      schemaId: selectedItem.schemaId,
      locale: String(variant.fields.locale || selectedItem.locale),
      fields: variant.fields,
      status: 'draft',
    };

    // Use the generateVariants action which creates items and logs audit events
    generateVariantsAction(selectedItem.id, [newItem], currentRole);

    // Clear generated variants
    setGeneratedVariants([]);
  };

  // Get available locales from schema
  const availableLocales = schema?.fields.find((f) => f.type === 'locale')?.supportedLocales || [];

  return (
    <div className="space-y-6">
      {/* Status Check */}
      {!canGenerate && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Content must be approved to generate variants
              </p>
              <p className="text-sm text-red-700 mt-1">
                Current status: <span className="font-semibold">{selectedItem.status}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Variant Type Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Variants</h2>

        {/* Tone Variants */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tone Variants</label>
          <div className="flex space-x-3">
            {(['formal', 'neutral', 'friendly'] as ToneVariant[]).map((tone) => (
              <label key={tone} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTones.includes(tone)}
                  onChange={() => handleToneToggle(tone)}
                  disabled={!canGenerate}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{tone}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Length Variants */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Length Variants</label>
          <div className="flex space-x-3">
            {(['short', 'medium', 'long'] as LengthVariant[]).map((length) => (
              <label key={length} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedLengths.includes(length)}
                  onChange={() => handleLengthToggle(length)}
                  disabled={!canGenerate}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{length}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Locale Variants */}
        {availableLocales.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Locale Variants</label>
            <div className="flex flex-wrap gap-3">
              {availableLocales.map((locale) => (
                <label key={locale} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLocales.includes(locale)}
                    onChange={() => handleLocaleToggle(locale)}
                    disabled={!canGenerate || locale === selectedItem.locale}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{locale}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Current locale: <span className="font-medium">{selectedItem.locale}</span>
            </p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isGenerating || (selectedTones.length === 0 && selectedLengths.length === 0 && selectedLocales.length === 0)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          {isGenerating ? 'Generating...' : 'Generate Variants'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Generated Variants Preview */}
      {generatedVariants.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generated Variants ({generatedVariants.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedVariants.map((variant) => (
              <div
                key={variant.variantId}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {variant.variantType}
                    </span>
                    <span className="ml-2 text-xs text-gray-600">
                      {variant.variantSubtype}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {variant.variantId.substring(0, 8)}...
                  </span>
                </div>

                {/* Preview Fields */}
                <div className="space-y-2 mb-4">
                  {Object.entries(variant.fields).slice(0, 3).map(([fieldId, value]) => (
                    <div key={fieldId}>
                      <p className="text-xs font-medium text-gray-600 capitalize">
                        {fieldId}:
                      </p>
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelectVariant(variant)}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 font-medium"
                >
                  Select Variant
                </button>

                {/* Source Reference */}
                <p className="text-xs text-gray-400 mt-2 text-center">
                  From: {variant.parentContentId.substring(0, 8)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source Content Reference */}
      {selectedItem && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Source Content</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">ID:</span> {selectedItem.id}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status:</span> {selectedItem.status}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Schema:</span> {selectedItem.schemaId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Locale:</span> {selectedItem.locale}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
