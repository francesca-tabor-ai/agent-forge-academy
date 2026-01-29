import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logRequest, getUserIdFromRequest, getIpAddress, getUserAgent } from '@/lib/utils/request-logger';
import { safeLogger } from '@/lib/utils/redactPII';
import { mapGitHubRepoToProject, validateProjectInput, filterGitHubRepos, type GitHubRepo } from '@/lib/portfolio/github-mapper';
import { revalidatePath } from 'next/cache';
import { parseLocation } from '@/lib/profile/parseLocation';
import { findCityForLocation } from '@/lib/cities/findNearestCity';
import { normalizeSkillsAI } from '@/lib/utils/skill-normalization';

/**
 * Helper function to sync GitHub repositories and create portfolio projects
 * Called automatically when a GitHub URL is saved in the profile
 * 
 * @returns Object with success status and details for logging
 */
async function syncGitHubRepos(
  supabase: any,
  studentProfileId: string,
  githubUrl: string,
  userId?: string
): Promise<{ success: boolean; error?: string; details?: any }> {
  const syncStartTime = Date.now();
  let username: string | null = null;
  
  try {
    // Extract username from GitHub URL
    const urlMatch = githubUrl.match(/github\.com\/([^\/\?]+)/i);
    if (!urlMatch) {
      const error = 'Invalid GitHub URL format';
      safeLogger.error('[GitHub Sync] Invalid GitHub URL format', {
        userId,
        studentProfileId,
        githubUrl,
        error,
      });
      return { success: false, error };
    }

    username = urlMatch[1];
    
    safeLogger.info('[GitHub Sync] Starting sync', {
      userId,
      studentProfileId,
      username,
      githubUrl,
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
      let error: string;
      if (response.status === 404) {
        error = 'GitHub user not found';
        safeLogger.error('[GitHub Sync] GitHub user not found', {
          userId,
          studentProfileId,
          username,
          status: response.status,
        });
        return { success: false, error: 'Couldn\'t connect to GitHub. Please check the URL or try again.' };
      }
      if (response.status === 403) {
        error = 'Rate limit exceeded';
        safeLogger.error('[GitHub Sync] Rate limit exceeded', {
          userId,
          studentProfileId,
          username,
          status: response.status,
        });
        return { success: false, error: 'GitHub API rate limit exceeded. Please try again later.' };
      }
      error = `GitHub API error: ${response.statusText}`;
      safeLogger.error('[GitHub Sync] GitHub API error', {
        userId,
        studentProfileId,
        username,
        status: response.status,
        statusText: response.statusText,
      });
      return { success: false, error: 'Couldn\'t connect to GitHub. Please check the URL or try again.' };
    }

    let repos: GitHubRepo[];
    try {
      repos = await response.json();
    } catch (parseError) {
      const error = 'Failed to parse GitHub API response';
      safeLogger.error('[GitHub Sync] Failed to parse GitHub response', {
        userId,
        studentProfileId,
        username,
        error: parseError,
      });
      return { success: false, error: 'Couldn\'t connect to GitHub. Please check the URL or try again.' };
    }

    const totalReposFetched = repos.length;
    
    safeLogger.info('[GitHub Sync] Fetched repositories', {
      userId,
      studentProfileId,
      username,
      totalReposFetched,
    });

    // Filter repos based on rules (exclude forks, archived, and empty repos)
    const filteredRepos = filterGitHubRepos(repos, {
      excludeForks: true,
      excludeArchived: true,
      excludeEmpty: true,
    }).slice(0, 10); // Limit to 10 most recent

    const reposAfterFiltering = filteredRepos.length;
    
    safeLogger.info('[GitHub Sync] Filtered repositories', {
      userId,
      studentProfileId,
      username,
      totalReposFetched,
      reposAfterFiltering,
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const repo of filteredRepos) {
      try {
        // Map GitHub repo to portfolio project
        const projectInput = mapGitHubRepoToProject(repo, {
          defaultVisibility: 'private',
          includeTopicsInDescription: true,
        });

        // Validate the mapped project
        const validation = validateProjectInput(projectInput);
        if (!validation.valid) {
          safeLogger.error('[GitHub Sync] Invalid project input', {
            repo: repo.name,
            errors: validation.errors,
          });
          errors++;
          continue;
        }

        // Check if project already exists (dedupe by source + source_id)
        const { data: existing } = await supabase
          .from('portfolio_projects')
          .select('id, title, description, demo_url, github_url, source, source_id')
          .eq('student_profile_id', studentProfileId)
          .eq('source', 'github')
          .eq('source_id', String(projectInput.source_id))
          .single();

        if (existing) {
          // Project exists - perform smart update (preserve user edits)
          const updateData: any = {};

          // Only update demo_url if it changed (safe to update)
          if (projectInput.demo_url !== existing.demo_url) {
            updateData.demo_url = projectInput.demo_url;
          }

          // Only update github_url if it changed (shouldn't happen, but just in case)
          if (projectInput.github_url !== existing.github_url) {
            updateData.github_url = projectInput.github_url;
          }

          // Smart update: preserve user-edited fields
          // Only update title/description if they differ AND existing values look auto-generated
          // This prevents overwriting user edits while allowing updates when repo changes
          
          // Update title if it changed and existing looks auto-generated
          if (existing.title !== projectInput.title) {
            // Heuristic: if existing title matches repo name pattern (Title Case from kebab-case),
            // it's likely auto-generated, so safe to update
            const repoNameInTitleCase = repo.name
              .replace(/-/g, ' ')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l: string) => l.toUpperCase())
              .trim();
            
            if (existing.title === repoNameInTitleCase || existing.title.toLowerCase() === repoNameInTitleCase.toLowerCase()) {
              // Existing title matches auto-generated pattern, safe to update
              updateData.title = projectInput.title;
            }
            // Otherwise, assume user edited it - preserve it
          }

          // Update description if it changed and existing looks auto-generated
          if (existing.description !== projectInput.description) {
            // Heuristic: check if existing description matches our auto-generated patterns
            const descLooksAutoGenerated = 
              existing.description.includes('(Topics:') || // Our format with topics
              (existing.description.startsWith('A ') && existing.description.includes(' project')) || // Fallback format
              existing.description === 'GitHub repository' || // Minimal fallback
              existing.description === projectInput.description; // Matches what we'd generate
            
            if (descLooksAutoGenerated) {
              // Existing description matches auto-generated pattern, safe to update
              updateData.description = projectInput.description;
            }
            // Otherwise, assume user edited it - preserve it
          }

          // Perform update if there are changes
          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
              .from('portfolio_projects')
              .update(updateData)
              .eq('id', existing.id);

            if (updateError) {
              safeLogger.error('[GitHub Sync] Failed to update project', {
                userId,
                studentProfileId,
                username,
                repo: repo.name,
                projectId: existing.id,
                sourceId: projectInput.source_id,
                error: updateError.message,
                errorCode: updateError.code,
              });
              errors++;
            } else {
              updated++;
              safeLogger.info('[GitHub Sync] Updated project', {
                userId,
                studentProfileId,
                username,
                repo: repo.name,
                projectId: existing.id,
                sourceId: projectInput.source_id,
                fieldsUpdated: Object.keys(updateData),
              });
            }
          } else {
            skipped++; // No changes needed
          }
        } else {
          // New project - insert it
          const { error: insertError } = await supabase
            .from('portfolio_projects')
            .insert({
              student_profile_id: studentProfileId,
              title: projectInput.title,
              description: projectInput.description,
              github_url: projectInput.github_url,
              demo_url: projectInput.demo_url,
              visibility: projectInput.visibility,
              source: 'github',
              source_id: String(projectInput.source_id), // Store as string for consistency
            });

          if (insertError) {
            // If unique constraint violation, project was created between check and insert
            if (insertError.code === '23505') {
              skipped++;
              safeLogger.info('[GitHub Sync] Project already exists (race condition)', {
                userId,
                studentProfileId,
                username,
                repo: repo.name,
                sourceId: projectInput.source_id,
              });
            } else {
              safeLogger.error('[GitHub Sync] Failed to create project', {
                userId,
                studentProfileId,
                username,
                repo: repo.name,
                sourceId: projectInput.source_id,
                error: insertError.message,
                errorCode: insertError.code,
              });
              errors++;
            }
          } else {
            created++;
            safeLogger.info('[GitHub Sync] Created project', {
              userId,
              studentProfileId,
              username,
              repo: repo.name,
              sourceId: projectInput.source_id,
            });
          }
        }
      } catch (error) {
        safeLogger.error('[GitHub Sync] Error processing repo', {
          repo: repo.name,
          error,
        });
        errors++;
      }
    }

    const syncDuration = Date.now() - syncStartTime;
    
    safeLogger.info('[GitHub Sync] Successfully synced repositories', {
      userId,
      studentProfileId,
      username,
      totalReposFetched,
      reposAfterFiltering,
      projectsCreated: created,
      projectsUpdated: updated,
      projectsSkipped: skipped,
      errors,
      durationMs: syncDuration,
    });

    // Revalidate portfolio page cache so new projects appear immediately
    if (created > 0 || updated > 0) {
      revalidatePath('/student/portfolio');
      revalidatePath('/student/portfolio', 'page');
    }

    return {
      success: true,
      details: {
        username,
        totalReposFetched,
        reposAfterFiltering,
        projectsCreated: created,
        projectsUpdated: updated,
        projectsSkipped: skipped,
        errors,
        durationMs: syncDuration,
      },
    };
  } catch (error) {
    const syncDuration = Date.now() - syncStartTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    safeLogger.error('[GitHub Sync] Error syncing GitHub repos', {
      userId,
      studentProfileId,
      username: username || 'unknown',
      error: errorMessage,
      errorStack: error instanceof Error ? error.stack : undefined,
      durationMs: syncDuration,
    });
    
    return {
      success: false,
      error: 'Couldn\'t connect to GitHub. Please check the URL or try again.',
    };
  }
}

/**
 * GET /api/portfolio/profile
 * Get or create student profile for the authenticated user
 */
export async function GET(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  let status = 200;

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

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

    // Get or create student profile
    let { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, full_name, headline, bio, skills, location, city, country, linkedin_url, github_url, website_url, headshot_image_url')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      // Create student profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          profile_id: profile.id,
          full_name: null,
          headline: '',
          bio: null,
          skills: [],
          location: null,
          city: null,
          country: null,
          linkedin_url: null,
          github_url: null,
          website_url: null,
          headshot_image_url: null,
        })
        .select('id, full_name, headline, bio, skills, location, city, country, linkedin_url, github_url, website_url, headshot_image_url')
        .single();

      if (createError) {
        console.error('[Profile GET] Failed to create student profile:', createError);
        status = 500;
        const duration = Date.now() - startTime;
        await logRequest({
          requestId,
          userId: user.id,
          path: '/api/portfolio/profile',
          method: 'GET',
          status,
          duration,
          errorStack: createError.stack || null,
          errorMessage: createError.message,
          ipAddress: getIpAddress(request),
          userAgent: getUserAgent(request),
        });
        return NextResponse.json(
          { ok: false, error: { code: 'CREATE_FAILED', message: createError.message } },
          { status: 500 }
        );
      }

      studentProfile = newProfile;
    }

    const duration = Date.now() - startTime;
    await logRequest({
      requestId,
      userId: user.id,
      path: '/api/portfolio/profile',
      method: 'GET',
      status,
      duration,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      ok: true,
      profile: studentProfile,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    status = 500;
    console.error('[Profile GET] Unexpected error:', error);
    
    await logRequest({
      requestId,
      userId: await getUserIdFromRequest(request),
      path: '/api/portfolio/profile',
      method: 'GET',
      status,
      duration,
      errorStack: error instanceof Error ? error.stack || null : null,
      errorMessage: error instanceof Error ? error.message : 'Internal server error',
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/portfolio/profile
 * Update student profile for the authenticated user
 */
export async function PATCH(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  let status = 200;

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      status = 401;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: null,
        path: '/api/portfolio/profile',
        method: 'PATCH',
        status,
        duration,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    let { full_name, headline, bio, skills, location, linkedin_url, github_url, website_url } = body;

    // Normalize empty strings to null for URL fields
    const normalizeUrl = (url: string | null | undefined): string | null => {
      if (!url || typeof url !== 'string') return null;
      const trimmed = url.trim();
      return trimmed === '' ? null : trimmed;
    };

    linkedin_url = normalizeUrl(linkedin_url);
    github_url = normalizeUrl(github_url);
    website_url = normalizeUrl(website_url);

    // Validate full_name
    const fieldErrors: Record<string, string> = {};
    full_name = full_name?.trim() || '';
    if (!full_name || full_name.length < 2) {
      fieldErrors.full_name = 'Full name is required and must be at least 2 characters';
    } else if (full_name.length > 80) {
      fieldErrors.full_name = 'Full name must be 80 characters or less';
    }

    // Validate headline
    headline = headline?.trim() || '';
    if (!headline || headline.length < 5) {
      fieldErrors.headline = 'Professional headline must be at least 5 characters';
    }

    // Validate bio length if provided
    if (bio && bio.trim().length > 2000) {
      fieldErrors.bio = 'Bio must be 2000 characters or less';
    }

    // Validate skills array
    if (!Array.isArray(skills)) {
      fieldErrors.skills = 'Skills must be an array';
    } else if (skills.length > 30) {
      fieldErrors.skills = 'Maximum 30 skills allowed';
    } else {
      // Normalize AI in skills before persistence (source of truth)
      skills = normalizeSkillsAI(skills);
    }

    // Return validation errors if any
    if (Object.keys(fieldErrors).length > 0) {
      status = 400;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile',
        method: 'PATCH',
        status,
        duration,
        errorMessage: 'Validation failed',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Validation failed',
            fieldErrors 
          } 
        },
        { status: 400 }
      );
    }

    // Validate URLs if provided
    const isValidUrl = (url: string | null): boolean => {
      if (!url) return true; // null/empty is valid
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    if (linkedin_url && !isValidUrl(linkedin_url)) {
      status = 400;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile',
        method: 'PATCH',
        status,
        duration,
        errorMessage: 'Invalid LinkedIn URL format',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid LinkedIn URL format',
            fieldErrors: { linkedin_url: 'Please enter a valid URL' }
          } 
        },
        { status: 400 }
      );
    }

    if (github_url && !isValidUrl(github_url)) {
      status = 400;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile',
        method: 'PATCH',
        status,
        duration,
        errorMessage: 'Invalid GitHub URL format',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid GitHub URL format',
            fieldErrors: { github_url: 'Please enter a valid URL' }
          } 
        },
        { status: 400 }
      );
    }

    if (website_url && !isValidUrl(website_url)) {
      status = 400;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile',
        method: 'PATCH',
        status,
        duration,
        errorMessage: 'Invalid website URL format',
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid website URL format',
            fieldErrors: { website_url: 'Please enter a valid URL' }
          } 
        },
        { status: 400 }
      );
    }

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

    // Get or create student profile
    let { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, github_url')
      .eq('profile_id', profile.id)
      .single();

    // Normalize bio and location
    bio = bio?.trim() || null;
    location = location?.trim() || null;

    // Parse location to extract city and country
    // Parse city from first token before comma, store normalized city key
    const { city, country } = parseLocation(location);

    // Find nearest city for location (for banner image association)
    // This will try exact match first, then nearest by coordinates if available
    const matchedCity = location ? await findCityForLocation(location) : null;
    const cityId = matchedCity?.id || null;

    if (!studentProfile) {
      // Create student profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('student_profiles')
        .insert({
          profile_id: profile.id,
          full_name: full_name || null,
          headline: headline || '',
          bio: bio || null,
          skills: normalizeSkillsAI(skills || []),
          location: location || null,
          city: city,
          country: country,
          city_id: cityId,
          linkedin_url: linkedin_url,
          github_url: github_url,
          website_url: website_url,
        })
        .select('id, full_name, headline, bio, skills, location, city, country, linkedin_url, github_url, website_url, headshot_image_url')
        .single();

      if (createError) {
        console.error('[Profile PATCH] Failed to create student profile:', createError);
        status = 400;
        const duration = Date.now() - startTime;
        await logRequest({
          requestId,
          userId: user.id,
          path: '/api/portfolio/profile',
          method: 'PATCH',
          status,
          duration,
          errorStack: createError.stack || null,
          errorMessage: createError.message,
          ipAddress: getIpAddress(request),
          userAgent: getUserAgent(request),
        });
        return NextResponse.json(
          { ok: false, error: { code: 'CREATE_FAILED', message: createError.message } },
          { status: 400 }
        );
      }

      // TEMPORARY: Log GitHub URL save confirmation
      if (github_url) {
        console.log('[Profile PATCH] GitHub URL saved successfully (new profile):', {
          userId: user.id,
          profileId: newProfile.id,
          github_url: github_url,
          savedTo: 'student_profiles.github_url'
        });
      }

      // Revalidate profile and portfolio pages to ensure fresh data
      revalidatePath('/student/profile');
      revalidatePath('/student/profile', 'page');
      revalidatePath('/student/portfolio');
      revalidatePath('/student/portfolio', 'page');

      // Trigger GitHub sync if github_url was provided
      // Do this asynchronously so it doesn't block the response
      if (github_url) {
        syncGitHubRepos(supabase, newProfile.id, github_url, user.id)
          .then((result) => {
            if (!result.success) {
              safeLogger.warn('[Profile PATCH] GitHub sync completed with errors (new profile)', {
                userId: user.id,
                studentProfileId: newProfile.id,
                error: result.error,
                details: result.details,
              });
            }
          })
          .catch((error) => {
            // Log error but don't fail the profile creation
            safeLogger.error('[Profile PATCH] GitHub sync failed (non-blocking)', {
              userId: user.id,
              studentProfileId: newProfile.id,
              error: error instanceof Error ? error.message : 'Unknown error',
              errorStack: error instanceof Error ? error.stack : undefined,
            });
          });
      }

      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile',
        method: 'PATCH',
        status,
        duration,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });

      return NextResponse.json({
        ok: true,
        profile: newProfile,
      });
    }

    // Update existing student profile (RLS will enforce ownership)
    // When user edits profile location, parse city from first token before comma
    // Store normalized city key (e.g., "london")
    // Also find and associate nearest city for banner image
    const { data: updatedProfile, error } = await supabase
      .from('student_profiles')
      .update({
        full_name: full_name || null,
        headline,
        bio: bio || null,
        skills: normalizeSkillsAI(skills || []),
        location: location || null,
        city: city, // Normalized city key (e.g., "london")
        country: country, // Country (e.g., "UK")
        city_id: cityId, // Foreign key to cities table for banner image
        linkedin_url: linkedin_url,
        github_url: github_url,
        website_url: website_url,
      })
      .eq('id', studentProfile.id)
      .select('id, full_name, headline, bio, skills, location, city, country, linkedin_url, github_url, website_url, headshot_image_url')
      .single();

    if (error) {
      console.error('[Profile PATCH] Update error:', error);
      status = 400;
      const duration = Date.now() - startTime;
      await logRequest({
        requestId,
        userId: user.id,
        path: '/api/portfolio/profile',
        method: 'PATCH',
        status,
        duration,
        errorStack: error.stack || null,
        errorMessage: error.message,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
      });
      return NextResponse.json(
        { ok: false, error: { code: 'UPDATE_FAILED', message: error.message } },
        { status: 400 }
      );
    }

    // TEMPORARY: Log GitHub URL save confirmation
    if (github_url) {
      console.log('[Profile PATCH] GitHub URL saved successfully:', {
        userId: user.id,
        profileId: studentProfile.id,
        github_url: github_url,
        savedTo: 'student_profiles.github_url'
      });
    }

    // Trigger GitHub sync if github_url was provided and is new or changed
    // Do this asynchronously so it doesn't block the response
    const previousGithubUrl = studentProfile?.github_url;
    const githubUrlChanged = github_url && github_url !== previousGithubUrl;
    if (githubUrlChanged) {
      syncGitHubRepos(supabase, studentProfile.id, github_url, user.id)
        .then((result) => {
          if (!result.success) {
            safeLogger.warn('[Profile PATCH] GitHub sync completed with errors', {
              userId: user.id,
              studentProfileId: studentProfile.id,
              error: result.error,
              details: result.details,
            });
          }
        })
        .catch((error) => {
          // Log error but don't fail the profile update
          safeLogger.error('[Profile PATCH] GitHub sync failed (non-blocking)', {
            userId: user.id,
            studentProfileId: studentProfile.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorStack: error instanceof Error ? error.stack : undefined,
          });
        });
    }

    // Revalidate profile and portfolio pages to ensure fresh data
    revalidatePath('/student/profile');
    revalidatePath('/student/profile', 'page');
    revalidatePath('/student/portfolio');
    revalidatePath('/student/portfolio', 'page');

    const duration = Date.now() - startTime;
    await logRequest({
      requestId,
      userId: user.id,
      path: '/api/portfolio/profile',
      method: 'PATCH',
      status,
      duration,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      ok: true,
      profile: updatedProfile,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    status = 500;
    console.error('[Profile PATCH] Unexpected error:', error);
    
    await logRequest({
      requestId,
      userId: await getUserIdFromRequest(request),
      path: '/api/portfolio/profile',
      method: 'PATCH',
      status,
      duration,
      errorStack: error instanceof Error ? error.stack || null : null,
      errorMessage: error instanceof Error ? error.message : 'Internal server error',
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
