import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { safeLogger } from '@/lib/utils/redactPII';
import { filterGitHubRepos, extractSkillsFromRepo, type GitHubRepo } from '@/lib/portfolio/github-mapper';
import { normalizeSkill } from '@/lib/profile/extractSkillsFromCv';

/**
 * POST /api/portfolio/github/import
 * Import GitHub repositories as portfolio projects
 * 
 * 1. Auth user (Supabase server session)
 * 2. Read user's stored github_url
 * 3. Parse username
 * 4. Fetch repos from GitHub API
 * 5. Upsert repos into portfolio_projects table (draft/private)
 * 6. Auto-generate skills + attach them
 * 7. Return counts: { reposFetched, projectsUpserted, skillsCreated, linksCreated }
 */
export async function POST(request: NextRequest) {
  const importStartTime = Date.now();
  let userId: string | null = null;
  let username: string | null = null;

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      safeLogger.warn('[GitHub Import API] Unauthorized request', {
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json(
        { 
          success: false, 
          error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } 
        },
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
        { 
          success: false, 
          error: { code: 'PROFILE_NOT_FOUND', message: 'Profile not found' } 
        },
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
        { 
          success: false, 
          error: { code: 'STUDENT_PROFILE_NOT_FOUND', message: 'Student profile not found' } 
        },
        { status: 404 }
      );
    }

    if (!studentProfile.github_url) {
      return NextResponse.json(
        { 
          success: false, 
          error: { code: 'NO_GITHUB_URL', message: 'GitHub URL not set in profile' } 
        },
        { status: 400 }
      );
    }

    // Extract username from GitHub URL
    const urlMatch = studentProfile.github_url.match(/github\.com\/([^\/\?]+)/i);
    if (!urlMatch) {
      return NextResponse.json(
        { 
          success: false, 
          error: { code: 'INVALID_GITHUB_URL', message: 'Invalid GitHub URL format' } 
        },
        { status: 400 }
      );
    }

    username = urlMatch[1];

    safeLogger.info('[GitHub Import API] Starting import', {
      userId,
      username,
      githubUrl: studentProfile.github_url,
    });

    // Fetch repositories from GitHub API
    // Endpoint: GET https://api.github.com/users/:username/repos?per_page=100&sort=updated
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    // Use GITHUB_TOKEN from environment if available (for higher rate limits)
    // Add Authorization header: token ${process.env.GITHUB_TOKEN}
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
        safeLogger.error('[GitHub Import API] GitHub user not found', {
          userId,
          username,
          status: response.status,
        });
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'GITHUB_USER_NOT_FOUND', 
              message: 'GitHub user not found. Please check your GitHub URL.' 
            } 
          },
          { status: 404 }
        );
      }
      if (response.status === 403) {
        safeLogger.error('[GitHub Import API] Rate limit exceeded', {
          userId,
          username,
          status: response.status,
        });
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'RATE_LIMIT_EXCEEDED', 
              message: 'GitHub API rate limit exceeded. Please try again later.' 
            } 
          },
          { status: 403 }
        );
      }
      safeLogger.error('[GitHub Import API] GitHub API error', {
        userId,
        username,
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'GITHUB_API_ERROR', 
            message: `GitHub API error: ${response.statusText}` 
          } 
        },
        { status: response.status }
      );
    }

    let repos: GitHubRepo[];
    try {
      repos = await response.json();
    } catch (parseError) {
      safeLogger.error('[GitHub Import API] Failed to parse GitHub response', {
        userId,
        username,
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
      });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse GitHub API response',
          },
        },
        { status: 500 }
      );
    }

    const reposFetched = repos.length;

    safeLogger.info('[GitHub Import API] Fetched repositories', {
      userId,
      username,
      reposFetched,
    });

    // Filter repos based on rules:
    // - ignore forks: fork === false
    // - ignore archived: archived === false
    // - ignore empty repos: size > 0
    const filteredRepos = filterGitHubRepos(repos, {
      excludeForks: true,      // fork === false
      excludeArchived: true,    // archived === false
      excludeEmpty: true,       // size > 0
    });

    safeLogger.info('[GitHub Import API] Filtered repositories', {
      userId,
      username,
      reposFetched,
      filteredCount: filteredRepos.length,
    });

    // Counters
    let projectsUpserted = 0;
    let skillsCreated = 0;
    let linksCreated = 0;
    const errors: string[] = [];

    // Process each repository
    for (const repo of filteredRepos) {
      try {
        // Map GitHub repo to portfolio project
        // Mapping requirements:
        // - title = repo.name (exact, no formatting)
        // - description = repo.description ?? ""
        // - repo_url = repo.html_url
        // - demo_url = repo.homepage ?? null
        // - source = "github"
        // - source_id = `${repo.id}`
        // - status = "draft" (always on first import)
        // - visibility = "private" (always on first import)
        // - last_synced_at = now
        
        // Use simple mapping (no formatting) to match requirements exactly
        const projectInput = {
          title: repo.name,
          description: repo.description ?? "",
          github_url: repo.html_url,
          demo_url: repo.homepage ?? null,
          visibility: 'private' as const,
          source: 'github' as const,
          source_id: repo.id,
        };

        // Validate demo_url if present
        if (projectInput.demo_url) {
          try {
            new URL(projectInput.demo_url);
          } catch {
            // Invalid URL, set to null
            projectInput.demo_url = null;
          }
        }
        
        // Basic validation
        if (!projectInput.title || projectInput.title.trim().length === 0) {
          safeLogger.error('[GitHub Import API] Invalid project: missing title', {
            userId,
            username,
            repo: repo.name,
          });
          errors.push(`Invalid project ${repo.name}: missing title`);
          continue;
        }
        
        if (projectInput.title.length > 255) {
          safeLogger.error('[GitHub Import API] Invalid project: title too long', {
            userId,
            username,
            repo: repo.name,
            titleLength: projectInput.title.length,
          });
          errors.push(`Invalid project ${repo.name}: title too long`);
          continue;
        }

        // Check if project already exists (dedupe by student_profile_id + source + source_id)
        // The unique constraint is on (student_profile_id, source, source_id)
        // This is functionally equivalent to (user_id, source, source_id) since each
        // student_profile belongs to one user
        // ✅ Acceptance test: import twice → no duplicates (enforced by unique constraint)
        const { data: existing } = await supabase
          .from('portfolio_projects')
          .select('id, image_url')
          .eq('student_profile_id', studentProfile.id)
          .eq('source', 'github')
          .eq('source_id', String(projectInput.source_id))
          .single();

        let projectId: string;

        if (existing) {
          // Update existing project - only safe fields
          // Update safe fields: title, description, repo_url, demo_url, last_synced_at
          // Do NOT overwrite user edits like image_url if user set it
          // Do NOT overwrite status/visibility (user may have changed them)
          const updateData: any = {
            title: projectInput.title,
            description: projectInput.description,
            repo_url: projectInput.github_url,
            github_url: projectInput.github_url, // Keep for backward compatibility
            demo_url: projectInput.demo_url,
            last_synced_at: new Date().toISOString(),
            // Keep existing status and visibility (don't overwrite user changes)
            // Keep existing image_url (don't overwrite user edits)
          };
          
          const { error: updateError } = await supabase
            .from('portfolio_projects')
            .update(updateData)
            .eq('id', existing.id);

          if (updateError) {
            safeLogger.error('[GitHub Import API] Failed to update project', {
              userId,
              username,
              repo: repo.name,
              projectId: existing.id,
              error: updateError.message,
            });
            errors.push(`Failed to update project ${repo.name}`);
            continue;
          }

          projectId = existing.id;
        } else {
          // Create new project
          const { data: newProject, error: insertError } = await supabase
            .from('portfolio_projects')
            .insert({
              student_profile_id: studentProfile.id,
              title: projectInput.title,
              description: projectInput.description,
              repo_url: projectInput.github_url,
              github_url: projectInput.github_url, // Keep for backward compatibility
              demo_url: projectInput.demo_url,
              status: 'draft',
              visibility: 'private',
              source: 'github',
              source_id: String(projectInput.source_id),
              last_synced_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (insertError) {
            // Check if it's a unique constraint violation (race condition)
            if (insertError.code === '23505') {
              safeLogger.info('[GitHub Import API] Project already exists (race condition)', {
                userId,
                username,
                repo: repo.name,
                sourceId: projectInput.source_id,
              });
              // Try to fetch the existing project
              const { data: existingAfterRace } = await supabase
                .from('portfolio_projects')
                .select('id')
                .eq('student_profile_id', studentProfile.id)
                .eq('source', 'github')
                .eq('source_id', String(projectInput.source_id))
                .single();
              
              if (existingAfterRace) {
                projectId = existingAfterRace.id;
              } else {
                errors.push(`Race condition for ${repo.name}, could not resolve`);
                continue;
              }
            } else {
              safeLogger.error('[GitHub Import API] Failed to create project', {
                userId,
                username,
                repo: repo.name,
                error: insertError.message,
                errorCode: insertError.code,
              });
              errors.push(`Failed to create project ${repo.name}: ${insertError.message}`);
              continue;
            }
          } else if (!newProject) {
            errors.push(`Failed to create project ${repo.name}: No data returned`);
            continue;
          } else {
            projectId = newProject.id;
          }
        }

        projectsUpserted++;

        // Extract skills from repo metadata
        // Sources:
        // 1. repo.language (e.g., "TypeScript")
        // 2. repo.topics (requires GitHub topics API; may need preview header or GraphQL)
        // 3. heuristic from repo name/description keywords (lightweight)
        // Normalization: trim, title case, dedupe
        const repoSkills = extractSkillsFromRepo(repo, normalizeSkill);

        // Fetch all existing skills for this user (for case-insensitive matching)
        // The unique constraint is on (user_id, LOWER(name)), so we need case-insensitive lookup
        const { data: allUserSkills } = await supabase
          .from('skills')
          .select('id, name')
          .eq('user_id', userId);

        // Create/upsert skills and link them to the project
        for (const skillName of repoSkills) {
          try {
            // Find existing skill (case-insensitive match)
            let skillId: string | undefined;
            if (allUserSkills) {
              const matchingSkill = allUserSkills.find(
                s => s.name.toLowerCase() === skillName.toLowerCase()
              );
              if (matchingSkill) {
                skillId = matchingSkill.id;
              }
            }

            if (!skillId) {
              // Create new skill
              const { data: newSkill, error: skillError } = await supabase
                .from('skills')
                .insert({
                  user_id: userId,
                  name: skillName,
                })
                .select('id')
                .single();

              if (skillError) {
                // Check if it's a unique constraint violation (case-insensitive)
                if (skillError.code === '23505') {
                  // Skill already exists (case-insensitive match - unique constraint violation)
                  // Refresh the skills list and find the matching skill
                  const { data: refreshedSkills } = await supabase
                    .from('skills')
                    .select('id, name')
                    .eq('user_id', userId);
                  
                  if (refreshedSkills) {
                    const matchingSkill = refreshedSkills.find(
                      s => s.name.toLowerCase() === skillName.toLowerCase()
                    );
                    if (matchingSkill) {
                      skillId = matchingSkill.id;
                      // Update the cache for next iterations
                      allUserSkills?.push(matchingSkill);
                    } else {
                      safeLogger.warn('[GitHub Import API] Could not resolve skill race condition', {
                        userId,
                        skillName,
                      });
                      continue;
                    }
                  } else {
                    safeLogger.warn('[GitHub Import API] Could not resolve skill race condition', {
                      userId,
                      skillName,
                    });
                    continue;
                  }
                } else {
                  safeLogger.error('[GitHub Import API] Failed to create skill', {
                    userId,
                    skillName,
                    error: skillError.message,
                  });
                  continue;
                }
              } else if (!newSkill) {
                safeLogger.warn('[GitHub Import API] Failed to create skill: no data returned', {
                  userId,
                  skillName,
                });
                continue;
              } else {
                skillId = newSkill.id;
                skillsCreated++;
                // Update the cache for next iterations
                if (allUserSkills) {
                  allUserSkills.push({ id: skillId, name: skillName });
                }
              }
            }

            // Link skill to project (if not already linked)
            const { data: existingLink } = await supabase
              .from('project_skills')
              .select('project_id')
              .eq('project_id', projectId)
              .eq('skill_id', skillId)
              .single();

            if (!existingLink) {
              const { error: linkError } = await supabase
                .from('project_skills')
                .insert({
                  project_id: projectId,
                  skill_id: skillId,
                });

              if (linkError) {
                // Ignore duplicate key errors (race condition)
                if (linkError.code !== '23505') {
                  safeLogger.error('[GitHub Import API] Failed to link skill to project', {
                    userId,
                    projectId,
                    skillId,
                    skillName,
                    error: linkError.message,
                  });
                }
              } else {
                linksCreated++;
              }
            }
          } catch (skillError) {
            safeLogger.error('[GitHub Import API] Error processing skill', {
              userId,
              skillName,
              error: skillError instanceof Error ? skillError.message : 'Unknown error',
            });
          }
        }
      } catch (repoError) {
        safeLogger.error('[GitHub Import API] Error processing repo', {
          userId,
          username,
          repo: repo.name,
          error: repoError instanceof Error ? repoError.message : 'Unknown error',
        });
        errors.push(`Error processing ${repo.name}: ${repoError instanceof Error ? repoError.message : 'Unknown error'}`);
      }
    }

    const importDuration = Date.now() - importStartTime;

    safeLogger.info('[GitHub Import API] Import completed', {
      userId,
      username,
      reposFetched,
      projectsUpserted,
      skillsCreated,
      linksCreated,
      errors: errors.length,
      durationMs: importDuration,
    });

    return NextResponse.json({
      success: true,
      reposFetched,
      projectsUpserted,
      skillsCreated,
      linksCreated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const importDuration = Date.now() - importStartTime;
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    safeLogger.error('[GitHub Import API] Error in GitHub import', {
      userId: userId || 'unknown',
      username: username || 'unknown',
      error: errorMessage,
      errorStack,
      durationMs: importDuration,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An error occurred while importing GitHub repositories',
        },
      },
      { status: 500 }
    );
  }
}
