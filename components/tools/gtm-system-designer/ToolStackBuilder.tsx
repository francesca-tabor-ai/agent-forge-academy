'use client';

interface ToolCategory {
  category: string;
  tools: string[];
}

interface ToolStackBuilderProps {
  toolStack: ToolCategory[];
  onUpdate: (stack: ToolCategory[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const TOOL_CATEGORIES = [
  'CRM & Pipeline Management',
  'Data & Enrichment',
  'Outbound & Prospecting',
  'Marketing Automation',
  'Analytics & Reporting',
  'AI & Automation',
  'Other',
];

export function ToolStackBuilder({
  toolStack,
  onUpdate,
  onNext,
  onBack,
}: ToolStackBuilderProps) {
  const getCategoryTools = (category: string): string[] => {
    const existing = toolStack.find((cat) => cat.category === category);
    return existing ? existing.tools : [];
  };

  const updateCategoryTools = (category: string, tools: string[]) => {
    const updated = toolStack.filter((cat) => cat.category !== category);
    if (tools.length > 0) {
      updated.push({ category, tools });
    }
    onUpdate(updated);
  };

  const handleToolInput = (category: string, value: string) => {
    const tools = value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    updateCategoryTools(category, tools);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Tool Stack</h2>
      <p className="text-gray-600 mb-6">
        List the tools you currently use or plan to use in each category. Separate multiple tools with commas.
      </p>

      <div className="space-y-6">
        {TOOL_CATEGORIES.map((category) => {
          const tools = getCategoryTools(category);
          const toolsString = tools.join(', ');

          return (
            <div key={category}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {category}
              </label>
              <input
                type="text"
                value={toolsString}
                onChange={(e) => handleToolInput(category, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                placeholder="e.g., HubSpot, Salesforce, Pipedrive"
              />
              {tools.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-brand-light/10 text-brand-light text-xs rounded-full"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
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
          Next: Integrations
        </button>
      </div>
    </div>
  );
}
