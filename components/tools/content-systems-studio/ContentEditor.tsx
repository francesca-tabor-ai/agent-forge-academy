'use client';

import { useState, useEffect } from 'react';
import type { ContentItem, ContentSchema, SchemaField, FieldValue, Role } from '@/lib/tools/content-systems-studio/types';
import { validateItem } from '@/lib/tools/content-systems-studio/validateItem';
import { runRules } from '@/lib/tools/content-systems-studio/rulesEngine';
import type { UseContentSystemsStudioReturn } from '@/lib/tools/content-systems-studio/useContentSystemsStudio';
import { RulesPanel } from './RulesPanel';

interface ContentEditorProps {
  studio: UseContentSystemsStudioReturn;
  currentRole: Role;
}

interface NewContentModalProps {
  schemas: ContentSchema[];
  isOpen: boolean;
  onClose: () => void;
  onCreate: (schemaId: string, locale: string) => void;
}

function NewContentModal({ schemas, isOpen, onClose, onCreate }: NewContentModalProps) {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('');
  const [selectedLocale, setSelectedLocale] = useState<string>('en-US');

  if (!isOpen) return null;

  const selectedSchema = schemas.find((s) => s.id === selectedSchemaId);
  const localeField = selectedSchema?.fields.find((f) => f.type === 'locale');
  const supportedLocales = localeField?.supportedLocales || ['en-US'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSchemaId && selectedLocale) {
      onCreate(selectedSchemaId, selectedLocale);
      setSelectedSchemaId('');
      setSelectedLocale('en-US');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Content</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="schema" className="block text-sm font-medium text-gray-700 mb-2">
                Schema <span className="text-red-500">*</span>
              </label>
              <select
                id="schema"
                required
                value={selectedSchemaId}
                onChange={(e) => {
                  setSelectedSchemaId(e.target.value);
                  // Reset locale when schema changes
                  const schema = schemas.find((s) => s.id === e.target.value);
                  const localeField = schema?.fields.find((f) => f.type === 'locale');
                  if (localeField?.supportedLocales && localeField.supportedLocales.length > 0) {
                    setSelectedLocale(localeField.supportedLocales[0]);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a schema...</option>
                {schemas.map((schema) => (
                  <option key={schema.id} value={schema.id}>
                    {schema.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-2">
                Locale <span className="text-red-500">*</span>
              </label>
              <select
                id="locale"
                required
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedSchema}
              >
                {supportedLocales.map((locale) => (
                  <option key={locale} value={locale}>
                    {locale}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedSchemaId || !selectedLocale}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: SchemaField;
  value: FieldValue | undefined;
  onChange: (value: FieldValue) => void;
  error?: string;
}) {
  const fieldValue = value ?? '';

  switch (field.type) {
    case 'text': {
      const isLongText = field.maxLength && field.maxLength > 100;
      const InputComponent = isLongText ? 'textarea' : 'input';
      
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {isLongText ? (
            <textarea
              id={field.id}
              value={String(fieldValue)}
              onChange={(e) => onChange(e.target.value)}
              maxLength={field.maxLength}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          ) : (
            <input
              id={field.id}
              type="text"
              value={String(fieldValue)}
              onChange={(e) => onChange(e.target.value)}
              maxLength={field.maxLength}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          )}
          {field.description && (
            <p className="mt-1 text-xs text-gray-500">{field.description}</p>
          )}
          {field.maxLength && (
            <p className="mt-1 text-xs text-gray-400">
              {String(fieldValue).length} / {field.maxLength} characters
            </p>
          )}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    case 'numeric': {
      const numValue = typeof fieldValue === 'number' ? fieldValue : (fieldValue === '' ? '' : Number(fieldValue) || '');
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id={field.id}
            type="number"
            value={numValue}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                onChange('');
              } else {
                const num = Number(val);
                onChange(isNaN(num) ? '' : num);
              }
            }}
            min={field.min}
            max={field.max}
            step="any"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {field.description && (
            <p className="mt-1 text-xs text-gray-500">{field.description}</p>
          )}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    case 'enum': {
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            id={field.id}
            value={String(fieldValue)}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select...</option>
            {field.enumValues?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {field.description && (
            <p className="mt-1 text-xs text-gray-500">{field.description}</p>
          )}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    case 'locale': {
      return (
        <div>
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-2">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select
            id={field.id}
            value={String(fieldValue)}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {field.supportedLocales?.map((locale) => (
              <option key={locale} value={locale}>
                {locale}
              </option>
            ))}
          </select>
          {field.description && (
            <p className="mt-1 text-xs text-gray-500">{field.description}</p>
          )}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
      );
    }

    default:
      return null;
  }
}

export function ContentEditor({ studio, currentRole }: ContentEditorProps) {
  const [showNewContentModal, setShowNewContentModal] = useState(false);
  const [localFields, setLocalFields] = useState<Record<string, FieldValue>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const { state, selectedItem, selectedSchema, selectItem, createItem, updateField, validateItem: validateItemAction } = studio;

  const currentItem = selectedItem;
  const currentSchema = selectedSchema;

  // Sync local fields with selected item using useEffect
  useEffect(() => {
    if (currentItem) {
      setLocalFields({ ...currentItem.fields });
      setHasChanges(false);
    } else {
      setLocalFields({});
      setHasChanges(false);
    }
  }, [currentItem]); // Reset when item changes

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    if (!currentItem) return;

    setLocalFields((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!currentItem || !currentSchema) return;

    // Validate the item with local fields
    const itemToValidate: ContentItem = {
      ...currentItem,
      fields: localFields,
    };

    // Run schema validation
    const errors = validateItem(itemToValidate, currentSchema);
    if (errors.length > 0) {
      validateItemAction(currentItem.id, errors);
      return;
    }

    // Run rules engine
    const ruleResults = runRules(itemToValidate, currentSchema);
    studio.runRules(currentItem.id, ruleResults);

    // Check for blocking rules
    const blockingRules = ruleResults.filter((r) => r.status === 'block');
    if (blockingRules.length > 0) {
      // Don't save if there are blocking rules
      return;
    }

    // Update all changed fields
    const originalFields = currentItem.fields;
    for (const [fieldId, value] of Object.entries(localFields)) {
      if (originalFields[fieldId] !== value) {
        updateField(currentItem.id, fieldId, value, currentRole);
      }
    }

    // Clear validation errors
    validateItemAction(currentItem.id, []);
    setHasChanges(false);
  };

  const handleCreateNew = (schemaId: string, locale: string) => {
    const schema = state.schemas.find((s) => s.id === schemaId);
    if (!schema) return;

    // Create initial fields from schema
    const initialFields: Record<string, FieldValue> = {};
    for (const field of schema.fields) {
      if (field.type === 'locale') {
        initialFields[field.id] = locale;
      } else {
        initialFields[field.id] = '';
      }
    }

    createItem(
      {
        schemaId,
        locale,
        fields: initialFields,
        status: 'draft',
      },
      currentRole
    );

    // Reset local state
    setLocalFields({});
    setHasChanges(false);
  };

  const getItemTitle = (item: ContentItem): string => {
    // Try to get a title from common field names
    const titleFields = ['headline', 'title', 'name', 'productName'];
    for (const fieldName of titleFields) {
      const value = item.fields[fieldName];
      if (value && String(value).trim()) {
        return String(value);
      }
    }
    // Fallback to first non-empty field
    for (const value of Object.values(item.fields)) {
      if (value && String(value).trim()) {
        return String(value).substring(0, 50);
      }
    }
    return `Untitled (${item.schemaId})`;
  };

  const getItemSchemaName = (item: ContentItem): string => {
    const schema = state.schemas.find((s) => s.id === item.schemaId);
    return schema?.name || item.schemaId;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-full">
      {/* Left Panel - Content Items List */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Content Items</h3>
          <button
            onClick={() => setShowNewContentModal(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            New
          </button>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
          {state.contentItems.map((item) => {
            const isSelected = currentItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  selectItem(item.id);
                  setLocalFields({});
                  setHasChanges(false);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm text-gray-900 truncate">
                  {getItemTitle(item)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getItemSchemaName(item)} • {item.status}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Editor Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {currentItem && currentSchema ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentSchema.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {currentItem.locale} • {currentItem.status}
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>

            {state.validationErrors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Please fix the following errors:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {state.validationErrors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Show rule results if there are blocking rules */}
            {state.ruleResults.length > 0 && (
              <div className="mb-6">
                <RulesPanel
                  studio={studio}
                  ruleResults={state.ruleResults}
                  showAcknowledgeCheckbox={false}
                />
              </div>
            )}

            <div className="space-y-6">
              {currentSchema.fields.map((field) => {
                const fieldError = state.validationErrors.find(
                  (e) => e.fieldId === field.id
                );
                return (
                  <FieldInput
                    key={field.id}
                    field={field}
                    value={localFields[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    error={fieldError?.message}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a content item to edit, or create a new one.</p>
          </div>
        )}
      </div>

      {/* New Content Modal */}
      <NewContentModal
        schemas={state.schemas}
        isOpen={showNewContentModal}
        onClose={() => setShowNewContentModal(false)}
        onCreate={handleCreateNew}
      />
    </div>
  );
}
