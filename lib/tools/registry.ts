/**
 * Tools Registry
 * 
 * Single source of truth for all tools available in the platform.
 * This registry drives the Tools page and tool-related features.
 */

export type ToolStatus = 'active' | 'coming_soon' | 'beta' | 'deprecated';

export interface Tool {
  id: string;
  name: string;
  description: string;
  href: string;
  status: ToolStatus;
  tags: string[];
  recommendedFor: string[];
  category?: string; // Track/category (e.g., "GTM & Revenue Operations", "Agentic Systems")
  difficultyLevel?: string; // 'beginner', 'intermediate', 'advanced'
  duration?: string; // Time estimate (e.g., "~4-6 hours", "~8 weeks")
  industries?: string[]; // Array of industries
  bestFor?: string[]; // Array of target audiences
}

/**
 * Tools registry array
 * Add new tools here to make them available across the platform
 */
export const toolsRegistry: Tool[] = [
  {
    id: 'gtm-system-designer',
    name: 'GTM System Designer',
    description: 'Design and architect go-to-market systems with AI-native approaches. Build scalable GTM strategies and workflows.',
    href: '/student/tools/gtm-system-designer',
    status: 'active',
    tags: ['gtm', 'strategy', 'sales', 'marketing', 'architecture'],
    recommendedFor: ['ai-native-go-to-market-systems'],
  },
  {
    id: 'agent-boundary-safety-designer',
    name: 'Agent Boundary & Safety Designer',
    description: 'Design safe boundaries and safety mechanisms for AI agents. Ensure reliable and secure agent behavior.',
    href: '/student/tools/agent-boundary-safety-designer',
    status: 'active',
    tags: ['safety', 'security', 'agents', 'boundaries', 'reliability'],
    recommendedFor: ['healthcare-agentic-ai-voice-systems', 'agentic-rag'],
  },
  {
    id: 'rag-trust-inspector',
    name: 'RAG Trust Inspector',
    description: 'Inspect and validate RAG (Retrieval-Augmented Generation) systems for trust, accuracy, and reliability.',
    href: '/student/tools/rag-trust-inspector',
    status: 'active',
    tags: ['rag', 'trust', 'validation', 'inspection', 'reliability'],
    recommendedFor: ['agentic-rag'],
  },
  {
    id: 'content-system-builder',
    name: 'Content System Builder',
    description: 'Build scalable content systems and workflows. Design content architectures for AI-native applications.',
    href: '/student/tools/content-system-builder',
    status: 'active',
    tags: ['content', 'cms', 'architecture', 'workflows', 'systems'],
    recommendedFor: ['ai-native-go-to-market-systems'],
  },
  {
    id: 'decision-tradeoff-simulator',
    name: 'Decision Trade-off Simulator',
    description: 'Simulate and analyze trade-offs in decision-making processes. Evaluate different architectural and strategic choices.',
    href: '/student/tools/decision-tradeoff-simulator',
    status: 'active',
    tags: ['decision-making', 'trade-offs', 'simulation', 'analysis', 'strategy'],
    recommendedFor: ['ai-native-go-to-market-systems', 'platform-os'],
  },
  {
    id: 'ai-product-review-bot',
    name: 'AI Product Review Bot',
    description: 'Automated product review and analysis using AI. Generate comprehensive product reviews and insights.',
    href: '/student/tools/ai-product-review-bot',
    status: 'active',
    tags: ['reviews', 'analysis', 'automation', 'ai', 'products'],
    recommendedFor: ['agentic-commerce', 'ai-native-go-to-market-systems'],
  },
  {
    id: 'ai-product-pricing-revenue-modeler-pro',
    name: 'AI Product Pricing & Revenue Modeler Pro',
    description: 'Advanced ARC-O framework analysis with enhanced features. Model pricing strategies and revenue forecasts for AI products.',
    href: '/student/tools/ai-product-pricing-revenue-modeler-pro',
    status: 'active',
    tags: ['pricing', 'revenue', 'modeling', 'analysis', 'strategy', 'forecasting'],
    recommendedFor: ['gtm-and-revenue-operations', 'ai-native-go-to-market-systems'],
  },
  {
    id: 'grd-generator',
    name: 'Governance Requirements Documents (GRDs)',
    description: 'Automatically generate Governance Requirements Documents (GRDs) from Product Requirements Documents (PRDs). Operationalize CLEAR-G governance by making governance decisions early, explicit, and enforceable.',
    href: '/student/tools/grd-generator',
    status: 'active',
    tags: ['governance', 'compliance', 'risk', 'regulatory', 'ai-safety', 'documentation'],
    recommendedFor: ['trust-and-regulation', 'agentic-rag'],
  },
  {
    id: 'agentic-systems-planner',
    name: 'Agentic Systems Planner',
    description: 'Comprehensive discovery & documentation generator for planning agentic AI applications. Generate PDD, SDD, evaluation frameworks, and more.',
    href: '/student/tools/agentic-systems-planner',
    status: 'active',
    tags: ['planning', 'documentation', 'agents', 'discovery', 'architecture', 'design'],
    recommendedFor: ['agentic-rag', 'agentic-systems'],
  },
  {
    id: 'spec-driven-development',
    name: 'Spec-Driven Development',
    description: 'Orchestrate five specialized AI agents (Decision Author, Analyst, Architect, Scrum Master, Developer) to produce formal specifications, architecture documents, and implementation plans in a sequential, traceable workflow. Treat specifications as the authoritative source of truth with constitutional-compliant outputs. Features include document versioning, real-time streaming, context variable customization, constitution pattern governance, file upload support (PDF/TXT), document validation, and export capabilities. Eliminates "vibe coding" by establishing formal requirements before implementation.',
    href: '/student/tools/spec-driven-development',
    status: 'active',
    tags: ['specifications', 'workflow', 'agents', 'documentation', 'architecture', 'development', 'traceability', 'sddd', 'prd', 'requirements', 'governance', 'constitution', 'versioning', 'validation', 'multi-agent', 'sequential-workflow', 'formal-specs'],
    recommendedFor: ['agentic-systems', 'agentic-rag', 'vibe-engineering'],
    category: 'Agentic Systems',
    difficultyLevel: 'intermediate',
    duration: '~4-8 hours',
    industries: ['SaaS', 'DevTools', 'Enterprise Software', 'Financial Services', 'Healthcare'],
    bestFor: ['Engineer', 'Tech Lead', 'PM', 'Architect', 'Product Manager', 'Engineering Manager'],
  },
];

/**
 * Get all active tools
 */
export function getActiveTools(): Tool[] {
  return toolsRegistry.filter(tool => tool.status === 'active');
}

/**
 * Get all available tools (active, beta, coming_soon - excludes deprecated)
 */
export function getAvailableTools(): Tool[] {
  return toolsRegistry.filter(tool => tool.status !== 'deprecated');
}

/**
 * Get tool by ID
 */
export function getToolById(id: string): Tool | undefined {
  return toolsRegistry.find(tool => tool.id === id);
}

/**
 * Get tools by tag
 */
export function getToolsByTag(tag: string): Tool[] {
  return toolsRegistry.filter(tool => tool.tags.includes(tag));
}

/**
 * Get tools recommended for a course
 */
export function getToolsForCourse(courseSlug: string): Tool[] {
  return toolsRegistry.filter(tool => 
    tool.recommendedFor.includes(courseSlug)
  );
}
