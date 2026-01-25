'use client';

interface SystemDesign {
  systemMap: {
    nodes: Array<{
      id: string;
      label: string;
      category: string;
      description: string;
    }>;
    edges: Array<{
      from: string;
      to: string;
      type: string;
      description: string;
    }>;
  };
  architecture: {
    overview: string;
    components: Array<{
      name: string;
      description: string;
      technologies: string[];
    }>;
    dataFlow: string;
    aiOpportunities: string[];
  };
  nextSteps: string[];
}

interface SystemArchitectureViewProps {
  design: SystemDesign;
}

const CATEGORY_COLORS: Record<string, string> = {
  'CRM & Pipeline': 'bg-blue-100 text-blue-800 border-blue-200',
  'Data & Enrichment': 'bg-green-100 text-green-800 border-green-200',
  'Outbound & Prospecting': 'bg-purple-100 text-purple-800 border-purple-200',
  'Marketing Automation': 'bg-orange-100 text-orange-800 border-orange-200',
  'Analytics & Reporting': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'AI & Automation': 'bg-pink-100 text-pink-800 border-pink-200',
  'Automation': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Other': 'bg-gray-100 text-gray-800 border-gray-200',
};

export function SystemArchitectureView({ design }: SystemArchitectureViewProps) {
  const { systemMap, architecture, nextSteps } = design;

  // Group nodes by category
  const nodesByCategory = systemMap.nodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, typeof systemMap.nodes>);

  return (
    <div className="space-y-6">
      {/* Architecture Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Architecture Overview
        </h3>
        <p className="text-gray-700 whitespace-pre-line">{architecture.overview}</p>
      </div>

      {/* System Map */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Map</h3>
        
        {/* Nodes by Category */}
        <div className="space-y-6">
          {Object.entries(nodesByCategory).map(([category, nodes]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {nodes.map((node) => {
                  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
                  return (
                    <div
                      key={node.id}
                      className={`p-4 rounded-lg border ${categoryColor}`}
                    >
                      <div className="font-medium mb-1">{node.label}</div>
                      <div className="text-xs opacity-75">{node.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Data Flow Edges */}
        {systemMap.edges.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Data Flows</h4>
            <div className="space-y-2">
              {systemMap.edges.map((edge, idx) => {
                const fromNode = systemMap.nodes.find((n) => n.id === edge.from);
                const toNode = systemMap.nodes.find((n) => n.id === edge.to);
                return (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{fromNode?.label || edge.from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium">{toNode?.label || edge.to}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{edge.type}</span>
                    {edge.description && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{edge.description}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Components */}
      {architecture.components.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Components</h3>
          <div className="space-y-4">
            {architecture.components.map((component, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{component.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{component.description}</p>
                {component.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {component.technologies.map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Flow */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Flow</h3>
        <p className="text-gray-700 whitespace-pre-line">{architecture.dataFlow}</p>
      </div>

      {/* AI Opportunities */}
      {architecture.aiOpportunities.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Opportunities</h3>
          <ul className="space-y-2">
            {architecture.aiOpportunities.map((opportunity, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span className="text-gray-700">{opportunity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
          <ol className="space-y-2 list-decimal list-inside">
            {nextSteps.map((step, idx) => (
              <li key={idx} className="text-gray-700">{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
