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
