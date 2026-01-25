'use client';

import { useEffect } from 'react';

interface Integration {
  from: string;
  to: string;
  type: string;
}

interface IntegrationMapperProps {
  integrations: Integration[];
  onUpdate: (integrations: Integration[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const INTEGRATION_TYPES = [
  'API',
  'Webhook',
  'Native Integration',
  'Zapier/Make',
  'Manual',
  'Other',
];

export function IntegrationMapper({
  integrations,
  onUpdate,
  onNext,
  onBack,
}: IntegrationMapperProps) {
  // Ensure at least one integration row exists
  useEffect(() => {
    if (integrations.length === 0) {
      onUpdate([{ from: '', to: '', type: '' }]);
    }
  }, [integrations.length, onUpdate]);

  const addIntegration = () => {
    onUpdate([...integrations, { from: '', to: '', type: '' }]);
  };

  const updateIntegration = (index: number, field: keyof Integration, value: string) => {
    const updated = [...integrations];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const removeIntegration = (index: number) => {
    if (integrations.length > 1) {
      onUpdate(integrations.filter((_, i) => i !== index));
    } else {
      // Keep at least one empty row
      onUpdate([{ from: '', to: '', type: '' }]);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Integrations</h2>
      <p className="text-gray-600 mb-6">
        Map how data flows between your tools. This helps identify integration points and potential automation opportunities.
      </p>

      <div className="space-y-4">
        {integrations.map((integration, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  From Tool
                </label>
                <input
                  type="text"
                  value={integration.from}
                  onChange={(e) => updateIntegration(index, 'from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                  placeholder="e.g., HubSpot"
                />
              </div>

              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  To Tool
                </label>
                <input
                  type="text"
                  value={integration.to}
                  onChange={(e) => updateIntegration(index, 'to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                  placeholder="e.g., Clearbit"
                />
              </div>

              <div className="col-span-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={integration.type}
                  onChange={(e) => updateIntegration(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light text-sm"
                >
                  <option value="">Select type</option>
                  {INTEGRATION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-1">
                <button
                  type="button"
                  onClick={() => removeIntegration(index)}
                  disabled={integrations.length === 1 && !integration.from && !integration.to && !integration.type}
                  className="w-full px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addIntegration}
          className="text-sm text-brand-light hover:text-brand-light/80 font-medium"
        >
          + Add another integration
        </button>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 px-4 py-2.5 bg-brand-light text-white text-sm font-medium rounded-lg hover:bg-brand-light/90 transition-colors"
        >
          Next: Friction Points
        </button>
      </div>
    </div>
  );
}
