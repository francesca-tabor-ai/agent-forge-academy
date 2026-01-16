/**
 * Maps GitHub repository data to portfolio project schema
 */

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics: string[];
  language: string | null;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  size: number; // Repository size in KB
  default_branch?: string; // Default branch name (e.g., 'main', 'master')
}

export interface PortfolioProjectInput {
  title: string;
  description: string;
  github_url: string;
  demo_url: string | null;
  visibility: 'private' | 'recruiters_only' | 'public';
  // Note: source and source_id would require schema changes
  // For now, we use github_url for deduplication
  source?: 'github';
  source_id?: number; // repo.id for deduplication
}

/**
 * Filter options for GitHub repositories
 */
export interface GitHubRepoFilterOptions {
  excludeForks?: boolean; // Default: true
  excludeArchived?: boolean; // Default: true
  excludeEmpty?: boolean; // Default: true (size === 0)
}

/**
 * Filters GitHub repositories based on specified rules
 * 
 * @param repos - Array of GitHub repositories
 * @param options - Filtering options
 * @returns Filtered array of repositories
 */
export function filterGitHubRepos(
  repos: GitHubRepo[],
  options: GitHubRepoFilterOptions = {}
): GitHubRepo[] {
  const {
    excludeForks = true,
    excludeArchived = true,
    excludeEmpty = true,
  } = options;

  return repos.filter((repo) => {
    // Exclude forks if enabled
    if (excludeForks && repo.fork) {
      return false;
    }

    // Exclude archived repos if enabled
    if (excludeArchived && repo.archived) {
      return false;
    }

    // Exclude empty repos if enabled (size === 0 means no commits)
    if (excludeEmpty && repo.size === 0) {
      return false;
    }

    return true;
  });
}

/**
 * Maps a GitHub repository to a portfolio project input
 * 
 * @param repo - GitHub repository data from API
 * @param options - Mapping options
 * @returns Portfolio project input object
 */
export function mapGitHubRepoToProject(
  repo: GitHubRepo,
  options: {
    defaultVisibility?: 'private' | 'recruiters_only' | 'public';
    includeTopicsInDescription?: boolean;
  } = {}
): PortfolioProjectInput {
  const {
    defaultVisibility = 'private',
    includeTopicsInDescription = true,
  } = options;

  // Format title: convert kebab-case/snake_case to Title Case
  const title = repo.name
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase())
    .trim();

  // Build description
  let description = repo.description || 'GitHub repository';
  
  // Optionally include topics in description
  if (includeTopicsInDescription && repo.topics && repo.topics.length > 0) {
    const topicsText = repo.topics.slice(0, 5).join(', ');
    if (repo.description) {
      description = `${repo.description} (Topics: ${topicsText})`;
    } else {
      description = `A ${repo.language || 'software'} project using ${topicsText}.`;
    }
  } else if (!repo.description && repo.language) {
    description = `A ${repo.language} project.`;
  }

  // Map demo_url from homepage (if set and valid)
  let demo_url: string | null = null;
  if (repo.homepage && repo.homepage.trim() !== '') {
    try {
      // Validate it's a proper URL
      new URL(repo.homepage);
      demo_url = repo.homepage.trim();
    } catch {
      // Invalid URL, skip it
      demo_url = null;
    }
  }

  return {
    title,
    description: description.trim(),
    github_url: repo.html_url,
    demo_url,
    visibility: defaultVisibility,
    source: 'github',
    source_id: repo.id,
  };
}

/**
 * Validates that a mapped project object is valid for database insertion
 */
export function validateProjectInput(project: PortfolioProjectInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!project.title || project.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (project.title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }

  if (!project.github_url || project.github_url.trim().length === 0) {
    errors.push('GitHub URL is required');
  } else {
    try {
      new URL(project.github_url);
    } catch {
      errors.push('GitHub URL must be a valid URL');
    }
  }

  if (project.demo_url) {
    try {
      new URL(project.demo_url);
    } catch {
      errors.push('Demo URL must be a valid URL');
    }
  }

  if (!['private', 'recruiters_only', 'public'].includes(project.visibility)) {
    errors.push('Visibility must be one of: private, recruiters_only, public');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize skill name: trim, title case, and return canonical form
 * Uses lowercase for storage (for case-insensitive matching) but formats for display
 */
function formatSkillName(skill: string): string {
  // Trim and normalize whitespace
  let formatted = skill.trim().replace(/\s+/g, ' ');
  
  // Convert to title case (capitalize first letter of each word)
  formatted = formatted
    .split(/\s+/)
    .map(word => {
      if (word.length === 0) return word;
      // Handle special cases like "C++", "C#", ".NET"
      if (/^[.#+\-]+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  return formatted;
}

/**
 * Extract skills from GitHub repository metadata
 * 
 * Sources:
 * 1. repo.language (e.g., "TypeScript")
 * 2. repo.topics (array of topic strings)
 * 3. Heuristic from repo name/description keywords (lightweight)
 * 
 * Normalization:
 * - trim whitespace
 * - title case (or consistent casing)
 * - dedupe
 * 
 * @param repo - GitHub repository data
 * @param normalizeSkillFn - Function to normalize skill names (from extractSkillsFromCv)
 * @returns Array of normalized skill names (deduplicated)
 */
export function extractSkillsFromRepo(
  repo: GitHubRepo,
  normalizeSkillFn: (skill: string) => string
): string[] {
  const skills = new Set<string>();
  
  // 1. Extract from repo.language
  if (repo.language) {
    const normalized = normalizeSkillFn(repo.language);
    if (normalized && normalized.length > 0) {
      skills.add(normalized);
    }
  }
  
  // 2. Extract from repo.topics
  if (repo.topics && repo.topics.length > 0) {
    for (const topic of repo.topics) {
      const normalized = normalizeSkillFn(topic);
      if (normalized && normalized.length > 0) {
        skills.add(normalized);
      }
    }
  }
  
  // 3. Heuristic extraction from repo name/description keywords
  // Combine name and description for keyword matching
  const textToSearch = [
    repo.name,
    repo.description || '',
  ].join(' ').toLowerCase();
  
  // Common technology keywords to look for
  const techKeywords = [
    // Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'cpp', 'c#', 'csharp',
    'go', 'golang', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r',
    // Frontend
    'react', 'vue', 'angular', 'svelte', 'nextjs', 'next.js', 'nuxt', 'gatsby',
    'html', 'css', 'sass', 'scss', 'less', 'tailwind', 'bootstrap', 'material-ui',
    // Backend
    'node', 'nodejs', 'node.js', 'express', 'nestjs', 'fastify', 'koa',
    'django', 'flask', 'fastapi', 'spring', 'springboot', 'laravel', 'symfony',
    'rails', 'ruby on rails', 'asp.net', 'aspnet',
    // Databases
    'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'cassandra',
    // Cloud/DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
    // Tools
    'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'github actions',
    // ML/AI
    'tensorflow', 'pytorch', 'scikit-learn', 'machine learning', 'deep learning', 'ai',
  ];
  
  // Look for keywords in repo name/description
  for (const keyword of techKeywords) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(textToSearch)) {
      const normalized = normalizeSkillFn(keyword);
      if (normalized && normalized.length > 0) {
        skills.add(normalized);
      }
    }
  }
  
  // Convert to array, format for display (title case), and dedupe
  const skillArray = Array.from(skills);
  const formattedSkills = skillArray.map(skill => formatSkillName(skill));
  
  // Final deduplication (case-insensitive)
  const deduplicated = new Set<string>();
  const lowerToOriginal = new Map<string, string>();
  
  for (const skill of formattedSkills) {
    const lower = skill.toLowerCase();
    if (!lowerToOriginal.has(lower)) {
      lowerToOriginal.set(lower, skill);
      deduplicated.add(skill);
    }
  }
  
  return Array.from(deduplicated).sort();
}
