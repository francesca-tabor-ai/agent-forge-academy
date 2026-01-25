'use client';

import { useState } from 'react';

interface SystemArchitectureDesignerProps {
  onSystemSelect: (systemId: string | null) => void;
  selectedSystem: string | null;
}

interface ContentSystem {
  id: string;
  name: string;
  description: string;
  architecture: {
    components: Array<{
      name: string;
      type: 'schema' | 'workflow' | 'rule' | 'integration';
      description: string;
    }>;
    dataFlow: string[];
    aiCapabilities: string[];
  };
  useCases: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

const EXAMPLE_SYSTEMS: ContentSystem[] = [
  {
    id: 'ecommerce-product-content',
    name: 'E-commerce Product Content System',
    description: 'Multi-locale product content with automated workflows and AI-powered variations',
    architecture: {
      components: [
        { name: 'Product Schema', type: 'schema', description: 'Structured product data with variants' },
        { name: 'Approval Workflow', type: 'workflow', description: 'Multi-stage review process' },
        { name: 'SEO Rules', type: 'rule', description: 'Automated SEO optimization checks' },
        { name: 'CMS Integration', type: 'integration', description: 'Sync with headless CMS' },
      ],
      dataFlow: [
        'Content Creation → Validation → Review → Approval → Localization → Publishing',
      ],
      aiCapabilities: [
        'Auto-generate product descriptions',
        'SEO optimization suggestions',
        'Multi-language translation',
        'A/B test variant generation',
      ],
    },
    useCases: [
      'Product catalog management',
      'Multi-region e-commerce',
      'Automated content workflows',
    ],
    complexity: 'moderate',
  },
  {
    id: 'marketing-campaign-content',
    name: 'Marketing Campaign Content System',
    description: 'Campaign content with personalization rules and performance tracking',
    architecture: {
      components: [
        { name: 'Campaign Schema', type: 'schema', description: 'Campaign templates with variants' },
        { name: 'Personalization Rules', type: 'rule', description: 'Audience-specific content rules' },
        { name: 'A/B Testing Framework', type: 'workflow', description: 'Automated variant testing' },
        { name: 'Analytics Integration', type: 'integration', description: 'Performance tracking' },
      ],
      dataFlow: [
        'Template Creation → Variant Generation → Audience Targeting → Testing → Optimization',
      ],
      aiCapabilities: [
        'Audience-specific content generation',
        'Performance prediction',
        'Optimal variant selection',
        'Content optimization suggestions',
      ],
    },
    useCases: [
      'Email campaigns',
      'Social media content',
      'Landing page variants',
    ],
    complexity: 'complex',
  },
  {
    id: 'documentation-system',
    name: 'Technical Documentation System',
    description: 'Versioned documentation with review workflows and multi-format export',
    architecture: {
      components: [
        { name: 'Document Schema', type: 'schema', description: 'Structured documentation format' },
        { name: 'Review Workflow', type: 'workflow', description: 'Technical review process' },
        { name: 'Version Control', type: 'rule', description: 'Change tracking and rollback' },
        { name: 'Export Integration', type: 'integration', description: 'Multi-format export' },
      ],
      dataFlow: [
        'Draft → Technical Review → Editorial Review → Approval → Publishing → Versioning',
      ],
      aiCapabilities: [
        'Auto-generate documentation',
        'Consistency checking',
        'Link validation',
        'Format conversion',
      ],
    },
    useCases: [
      'API documentation',
      'User guides',
      'Technical specifications',
    ],
    complexity: 'simple',
  },
];

export function SystemArchitectureDesigner({
  onSystemSelect,
  selectedSystem,
}: SystemArchitectureDesignerProps) {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [showNewSystemForm, setShowNewSystemForm] = useState(false);
  const [systemName, setSystemName] = useState('');
  const [systemDescription, setSystemDescription] = useState('');

  const handleCreateSystem = () => {
    if (!systemName.trim()) return;
    
    // In a real implementation, this would create a new system
    // For now, we'll just show a success message
    alert(`System "${systemName}" created! Switch to Content Studio to start building.`);
    setShowNewSystemForm(false);
    setSystemName('');
    setSystemDescription('');
    onSystemSelect(systemName.toLowerCase().replace(/\s+/g, '-'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Design Your Content System</h2>
        <p className="mt-2 text-gray-600">
          Architect scalable content systems with schemas, workflows, rules, and AI capabilities.
        </p>
      </div>

      {/* Create New System */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New System</h3>
          <button
            onClick={() => setShowNewSystemForm(!showNewSystemForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {showNewSystemForm ? 'Cancel' : '+ New System'}
          </button>
        </div>

        {showNewSystemForm && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Name
              </label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="e.g., Product Content System"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={systemDescription}
                onChange={(e) => setSystemDescription(e.target.value)}
                placeholder="Describe what this content system will manage..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleCreateSystem}
              disabled={!systemName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Create System
            </button>
          </div>
        )}
      </div>

      {/* Example Systems */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Systems</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXAMPLE_SYSTEMS.map((system) => (
            <div
              key={system.id}
              className={`bg-white border rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg ${
                selectedExample === system.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200'
              }`}
              onClick={() => setSelectedExample(system.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{system.name}</h4>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    system.complexity === 'simple'
                      ? 'bg-green-100 text-green-700'
                      : system.complexity === 'moderate'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {system.complexity}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{system.description}</p>

              {selectedExample === system.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Components:</h5>
                    <ul className="space-y-1">
                      {system.architecture.components.map((component, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start">
                          <span className="mr-2">
                            {component.type === 'schema' && '📋'}
                            {component.type === 'workflow' && '🔄'}
                            {component.type === 'rule' && '⚙️'}
                            {component.type === 'integration' && '🔗'}
                          </span>
                          <span>
                            <strong>{component.name}:</strong> {component.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">AI Capabilities:</h5>
                    <ul className="space-y-1">
                      {system.architecture.aiCapabilities.map((capability, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start">
                          <span className="mr-2">✨</span>
                          <span>{capability}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSystemSelect(system.id);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Use This System
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Principles */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Content System Architecture Principles</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Schema-First:</strong> Define structure before content. Schemas ensure consistency and enable automation.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Rule-Based:</strong> Use deterministic rules for validation, transformation, and personalization.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Workflow-Driven:</strong> Explicit approval workflows ensure quality and provide audit trails.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>AI-Enhanced:</strong> Leverage AI for generation, optimization, and personalization while maintaining human oversight.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
