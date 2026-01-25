'use client';

interface IntegrationGuideProps {
  selectedSystem: string | null;
}

interface Integration {
  name: string;
  category: 'cms' | 'analytics' | 'ai' | 'storage' | 'workflow';
  description: string;
  useCase: string;
  setupSteps: string[];
  apiDocs?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    name: 'Headless CMS',
    category: 'cms',
    description: 'Integrate with headless CMS platforms like Contentful, Strapi, or Sanity',
    useCase: 'Sync content between your system and external CMS',
    setupSteps: [
      'Configure API credentials',
      'Map schema fields to CMS fields',
      'Set up webhook for real-time sync',
      'Configure sync direction (bidirectional or one-way)',
    ],
    apiDocs: 'https://docs.example.com/cms-integration',
  },
  {
    name: 'OpenAI / Anthropic',
    category: 'ai',
    description: 'Use AI models for content generation, optimization, and personalization',
    useCase: 'Generate content variations, optimize SEO, and personalize content',
    setupSteps: [
      'Add API key to environment variables',
      'Configure model preferences',
      'Set up content generation rules',
      'Define quality thresholds',
    ],
    apiDocs: 'https://docs.example.com/ai-integration',
  },
  {
    name: 'Google Analytics',
    category: 'analytics',
    description: 'Track content performance and user engagement',
    useCase: 'Measure content effectiveness and optimize based on data',
    setupSteps: [
      'Add Google Analytics tracking ID',
      'Configure event tracking',
      'Set up content performance dashboards',
      'Enable A/B test tracking',
    ],
  },
  {
    name: 'Cloud Storage (S3, GCS)',
    category: 'storage',
    description: 'Store media files and assets in cloud storage',
    useCase: 'Manage images, videos, and other media assets',
    setupSteps: [
      'Configure storage bucket credentials',
      'Set up CDN for asset delivery',
      'Configure image optimization',
      'Set up automatic backups',
    ],
  },
  {
    name: 'Zapier / Make',
    category: 'workflow',
    description: 'Connect with 1000+ apps via automation platforms',
    useCase: 'Automate workflows and trigger actions in other tools',
    setupSteps: [
      'Create webhook endpoint',
      'Configure trigger events',
      'Map data fields',
      'Test automation flows',
    ],
  },
  {
    name: 'Translation Services',
    category: 'ai',
    description: 'Integrate with translation APIs for multi-language content',
    useCase: 'Automatically translate content to multiple locales',
    setupSteps: [
      'Select translation provider (Google Translate, DeepL, etc.)',
      'Configure supported languages',
      'Set up translation workflows',
      'Enable human review for translations',
    ],
  },
];

const CATEGORY_COLORS = {
  cms: 'bg-purple-100 text-purple-700',
  analytics: 'bg-green-100 text-green-700',
  ai: 'bg-blue-100 text-blue-700',
  storage: 'bg-yellow-100 text-yellow-700',
  workflow: 'bg-pink-100 text-pink-700',
};

export function IntegrationGuide({ selectedSystem }: IntegrationGuideProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integration Guide</h2>
        <p className="mt-2 text-gray-600">
          Connect your content system with external tools and services. Follow these guides to set up integrations.
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.name}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${CATEGORY_COLORS[integration.category]}`}
              >
                {integration.category}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{integration.description}</p>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Use Case:</h4>
              <p className="text-xs text-gray-600">{integration.useCase}</p>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Setup Steps:</h4>
              <ol className="space-y-1">
                {integration.setupSteps.map((step, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start">
                    <span className="mr-2 font-medium text-blue-600">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {integration.apiDocs && (
              <a
                href={integration.apiDocs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View API Documentation →
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Integration Best Practices */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Integration Best Practices</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>API Rate Limits:</strong> Respect rate limits and implement retry logic with exponential backoff.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Error Handling:</strong> Implement comprehensive error handling and logging for all integrations.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Data Validation:</strong> Validate data before sending to external services and after receiving responses.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Security:</strong> Store API keys securely, use environment variables, and implement proper authentication.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span><strong>Monitoring:</strong> Set up monitoring and alerts for integration health and performance.</span>
          </li>
        </ul>
      </div>

      {selectedSystem && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Current System:</strong> {selectedSystem}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Configure integrations specific to your system in the Content Studio.
          </p>
        </div>
      )}
    </div>
  );
}
