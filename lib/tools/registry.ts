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
