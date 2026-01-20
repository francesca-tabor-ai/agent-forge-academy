/**
 * Job Ingestion Utilities
 * 
 * Helper functions for low-quota job ingestion system:
 * - Fingerprinting for deduplication
 * - Normalization
 * - Classification
 */

import crypto from 'crypto';

/**
 * Normalize a string for fingerprinting
 * - Lowercase
 * - Remove extra whitespace
 * - Remove special characters that don't affect uniqueness
 */
export function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s]/g, ''); // Remove special chars (keep alphanumeric and spaces)
}

/**
 * Generate job fingerprint from title, company, and location
 * This is used for deduplication
 */
export function generateJobFingerprint(
  title: string,
  company: string,
  location: string | null
): string {
  const normalized = `${normalizeString(title)}|${normalizeString(company)}|${normalizeString(location)}`;
  return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 64);
}

/**
 * Role clusters for rotation
 * Each cluster represents a broad category of AI/tech roles
 */
export const ROLE_CLUSTERS = [
  {
    cluster: 'core_ai',
    query: '(AI Engineer OR Machine Learning OR LLM OR Applied AI)',
  },
  {
    cluster: 'agents_automation',
    query: '(AI Agent OR Autonomous Agent OR Workflow Automation OR RPA)',
  },
  {
    cluster: 'data_mlops',
    query: '(Data Scientist OR Data Engineer OR MLOps OR ML Platform)',
  },
  {
    cluster: 'product_research',
    query: '(AI Product Manager OR Research Scientist OR AI Researcher)',
  },
  {
    cluster: 'commercial_leadership',
    query: '(AI Sales OR Solutions Engineer OR Head of AI OR VP AI)',
  },
] as const;

export type RoleCluster = typeof ROLE_CLUSTERS[number]['cluster'];

/**
 * Classify a job into internal taxonomy based on title and description
 * Uses rule-based classification (no API calls)
 */
export function classifyJob(
  title: string,
  description: string
): {
  category: string;
  priority: number; // 1-5, higher = more relevant
} {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const combined = `${titleLower} ${descLower}`;

  // Priority boost for high-value keywords
  let priority = 3; // Default priority

  // Check for high-priority keywords
  if (
    combined.includes('agent') ||
    combined.includes('autonomous') ||
    combined.includes('llm') ||
    combined.includes('genai') ||
    combined.includes('generative ai')
  ) {
    priority = 5;
  } else if (
    combined.includes('machine learning') ||
    combined.includes('deep learning') ||
    combined.includes('neural network')
  ) {
    priority = 4;
  }

  // Classification rules (order matters - more specific first)
  if (
    titleLower.includes('agent') ||
    titleLower.includes('autonomous') ||
    combined.includes('workflow automation') ||
    combined.includes('rpa') ||
    combined.includes('agentic')
  ) {
    return { category: 'agents_automation', priority };
  }

  if (
    titleLower.includes('llm') ||
    titleLower.includes('genai') ||
    titleLower.includes('generative') ||
    combined.includes('large language model') ||
    combined.includes('transformer') ||
    combined.includes('gpt') ||
    combined.includes('claude')
  ) {
    return { category: 'ai_ml', priority };
  }

  if (
    titleLower.includes('mlops') ||
    titleLower.includes('ml platform') ||
    titleLower.includes('ml infrastructure') ||
    titleLower.includes('ml engineer') ||
    combined.includes('model deployment') ||
    combined.includes('model serving')
  ) {
    return { category: 'mlops_infra', priority };
  }

  if (
    titleLower.includes('data scientist') ||
    titleLower.includes('data engineer') ||
    titleLower.includes('data platform')
  ) {
    return { category: 'data_mlops', priority };
  }

  if (
    titleLower.includes('product manager') ||
    titleLower.includes('product lead') ||
    (titleLower.includes('ai') && titleLower.includes('product'))
  ) {
    return { category: 'product_research', priority };
  }

  if (
    titleLower.includes('research scientist') ||
    titleLower.includes('ai researcher') ||
    titleLower.includes('research engineer')
  ) {
    return { category: 'product_research', priority };
  }

  if (
    titleLower.includes('sales') ||
    titleLower.includes('solutions engineer') ||
    titleLower.includes('head of ai') ||
    titleLower.includes('vp ai') ||
    titleLower.includes('director of ai')
  ) {
    return { category: 'commercial_leadership', priority };
  }

  // Fallback: if it has AI/ML keywords but doesn't match above
  if (
    combined.includes('ai') ||
    combined.includes('machine learning') ||
    combined.includes('artificial intelligence')
  ) {
    return { category: 'core_ai', priority };
  }

  // Default fallback
  return { category: 'core_ai', priority: 2 };
}

/**
 * Check if we should skip the next run based on previous run results
 */
export function shouldSkipNextRun(lastRunNewJobsCount: number): boolean {
  return lastRunNewJobsCount < 3;
}
