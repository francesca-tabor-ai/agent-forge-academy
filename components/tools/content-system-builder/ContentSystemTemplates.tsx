'use client';

interface ContentSystemTemplatesProps {
  onTemplateSelect: (templateId: string) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  features: string[];
  schemas: number;
  workflows: number;
  rules: number;
}

const TEMPLATES: Template[] = [
  {
    id: 'blog-post-system',
    name: 'Blog Post System',
    description: 'Complete blog content management with SEO optimization and multi-author workflows',
    category: 'Content Marketing',
    features: [
      'SEO metadata management',
      'Author attribution',
      'Category and tag system',
      'Scheduled publishing',
      'Content variations for A/B testing',
    ],
    schemas: 2,
    workflows: 1,
    rules: 3,
  },
  {
    id: 'product-catalog',
    name: 'Product Catalog',
    description: 'E-commerce product content with variants, pricing, and multi-locale support',
    category: 'E-commerce',
    features: [
      'Product variants and options',
      'Multi-currency pricing',
      'Inventory integration',
      'Rich media management',
      'Automated SEO optimization',
    ],
    schemas: 3,
    workflows: 2,
    rules: 5,
  },
  {
    id: 'email-campaigns',
    name: 'Email Campaign System',
    description: 'Email content templates with personalization rules and performance tracking',
    category: 'Marketing',
    features: [
      'Responsive email templates',
      'Personalization rules',
      'A/B test variants',
      'Send time optimization',
      'Performance analytics',
    ],
    schemas: 2,
    workflows: 1,
    rules: 4,
  },
  {
    id: 'help-documentation',
    name: 'Help Documentation',
    description: 'Knowledge base with version control, review workflows, and multi-format export',
    category: 'Documentation',
    features: [
      'Version control',
      'Review and approval workflows',
      'Multi-format export (PDF, HTML, Markdown)',
      'Search optimization',
      'Feedback collection',
    ],
    schemas: 1,
    workflows: 2,
    rules: 2,
  },
  {
    id: 'social-media-content',
    name: 'Social Media Content',
    description: 'Social media post templates with platform-specific rules and scheduling',
    category: 'Social Media',
    features: [
      'Platform-specific templates',
      'Hashtag optimization',
      'Image and video management',
      'Scheduling workflows',
      'Engagement tracking',
    ],
    schemas: 2,
    workflows: 1,
    rules: 3,
  },
  {
    id: 'landing-pages',
    name: 'Landing Page System',
    description: 'Landing page content with conversion optimization and variant testing',
    category: 'Marketing',
    features: [
      'Conversion-focused templates',
      'A/B test variants',
      'Personalization rules',
      'CTA optimization',
      'Performance tracking',
    ],
    schemas: 2,
    workflows: 1,
    rules: 4,
  },
];

export function ContentSystemTemplates({ onTemplateSelect }: ContentSystemTemplatesProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Content System Templates</h2>
        <p className="mt-2 text-gray-600">
          Start with pre-built templates for common content systems. Customize schemas, workflows, and rules to fit your needs.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {template.category}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Features:</h4>
              <ul className="space-y-1">
                {template.features.map((feature, idx) => (
                  <li key={idx} className="text-xs text-gray-600 flex items-start">
                    <span className="mr-2 text-blue-500">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>{template.schemas} schemas</span>
                <span>{template.workflows} workflows</span>
                <span>{template.rules} rules</span>
              </div>
              <button
                onClick={() => onTemplateSelect(template.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Templates provide a starting point with pre-configured schemas, workflows, and rules.
          You can customize everything in the Content Studio after selecting a template.
        </p>
      </div>
    </div>
  );
}
