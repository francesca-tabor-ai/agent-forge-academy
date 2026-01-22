import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { safeLogger } from '@/lib/utils/redactPII';
import { mapGitHubRepoToProject, filterGitHubRepos, type GitHubRepo } from '@/lib/portfolio/github-mapper';

// Force dynamic rendering (this route uses cookies for authentication)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/portfolio/github/sync
 * Fetch GitHub repositories for the authenticated user
 * Reads github_url from student_profiles and fetches repos from GitHub API
 */
export async function GET(request: NextRequest) {
  const syncStartTime = Date.now();
  let userId: string | null = null;
  let username: string | null = null;

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      safeLogger.warn('[GitHub Sync API] Unauthorized request', {
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    userId = user.id;

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { ok: false, error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' } },
        { status: 404 }
      );
    }

    // Get student profile with github_url
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, github_url')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json(
        { ok: false, error: { code: 'STUDENT_PROFILE_NOT_FOUND', message: 'Student profile not found' } },
        { status: 404 }
      );
    }

    if (!studentProfile.github_url) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_GITHUB_URL', message: 'GitHub URL not set in profile' } },
        { status: 400 }
      );
    }

    // Extract username from GitHub URL
    const urlMatch = studentProfile.github_url.match(/github\.com\/([^\/\?]+)/i);
    if (!urlMatch) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_GITHUB_URL', message: 'Invalid GitHub URL format' } },
        { status: 400 }
      );
    }

    username = urlMatch[1];

    safeLogger.info('[GitHub Sync API] Starting sync', {
      userId,
      username,
      githubUrl: studentProfile.github_url,
    });

    // Fetch repositories from GitHub API
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    // Use GITHUB_TOKEN from environment if available (for higher rate limits)
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) {
        safeLogger.error('[GitHub Sync API] GitHub user not found', {
          userId,
          username,
          status: response.status,
        });
        return NextResponse.json(
          { 
            ok: false, 
            error: { 
              code: 'GITHUB_USER_NOT_FOUND', 
              message: 'Couldn\'t connect to GitHub. Please check the URL or try again.' 
            } 
          },
          { status: 404 }
        );
      }
      if (response.status === 403) {
        safeLogger.error('[GitHub Sync API] Rate limit exceeded', {
          userId,
          username,
          status: response.status,
        });
        return NextResponse.json(
          { 
            ok: false, 
            error: { 
              code: 'RATE_LIMIT_EXCEEDED', 
              message: 'GitHub API rate limit exceeded. Please try again later or set GITHUB_TOKEN environment variable.' 
            } 
          },
          { status: 403 }
        );
      }
      safeLogger.error('[GitHub Sync API] GitHub API error', {
        userId,
        username,
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'GITHUB_API_ERROR', 
            message: 'Couldn\'t connect to GitHub. Please check the URL or try again.' 
          } 
        },
        { status: response.status }
      );
    }

    let repos: GitHubRepo[];
    try {
      repos = await response.json();
    } catch (parseError) {
      safeLogger.error('[GitHub Sync API] Failed to parse GitHub response', {
        userId,
        username,
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
      });
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Couldn\'t connect to GitHub. Please check the URL or try again.',
          },
        },
        { status: 500 }
      );
    }

    const totalReposFetched = repos.length;

    safeLogger.info('[GitHub Sync API] Fetched repositories', {
      userId,
      username,
      totalReposFetched,
    });

    // Filter repos based on rules (exclude forks, archived, and empty repos)
    const filteredRepos = filterGitHubRepos(repos, {
      excludeForks: true,
      excludeArchived: true,
      excludeEmpty: true,
    });

    const reposAfterFiltering = filteredRepos.length;

    safeLogger.info('[GitHub Sync API] Filtered repositories', {
      userId,
      username,
      totalReposFetched,
      reposAfterFiltering,
    });

    // Map repos to portfolio project format
    const transformedRepos = filteredRepos.map((repo: GitHubRepo) => {
      const projectInput = mapGitHubRepoToProject(repo, {
        defaultVisibility: 'private',
        includeTopicsInDescription: true,
      });

      return {
        // Original repo data
        name: repo.name,
        description: repo.description || '',
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        updated: repo.updated_at,
        topics: repo.topics || [],
        default_branch: repo.default_branch,
        created_at: repo.created_at,
        pushed_at: repo.pushed_at,
        // Mapped project data
        mapped: {
          title: projectInput.title,
          description: projectInput.description,
          github_url: projectInput.github_url,
          demo_url: projectInput.demo_url,
          visibility: projectInput.visibility,
          source: projectInput.source,
          source_id: projectInput.source_id,
        },
      };
    });

    const syncDuration = Date.now() - syncStartTime;

    safeLogger.info('[GitHub Sync API] Successfully synced', {
      userId,
      username,
      totalReposFetched,
      reposAfterFiltering,
      durationMs: syncDuration,
    });

    return NextResponse.json({
      ok: true,
      repos: transformedRepos,
      count: transformedRepos.length,
      username,
      totalReposFetched,
      reposAfterFiltering,
    });
  } catch (error) {
    const syncDuration = Date.now() - syncStartTime;
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    safeLogger.error('[GitHub Sync API] Error in GitHub sync', {
      userId: userId || 'unknown',
      username: username || 'unknown',
      error: errorMessage,
      errorStack,
      durationMs: syncDuration,
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Couldn\'t connect to GitHub. Please check the URL or try again.',
        },
      },
      { status: 500 }
    );
  }
}
