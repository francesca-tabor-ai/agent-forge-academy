import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { extractTextFromCV } from '@/lib/cv/extractText';
import { safeLogger } from '@/lib/utils/redactPII';
import { filterGitHubRepos, mapGitHubRepoToProject, validateProjectInput, type GitHubRepo } from '@/lib/portfolio/github-mapper';

// Extract profile data from CV text
function extractProfileFromCV(cvText: string): {
  headline?: string;
  bio?: string;
  skills?: string[];
  location?: string;
} {
  const result: {
    headline?: string;
    bio?: string;
    skills?: string[];
    location?: string;
  } = {};

  // Simple extraction patterns (can be enhanced with NLP/LLM)
  const lines = cvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Try to find headline (usually first few lines)
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length > 10 && firstLine.length < 100) {
      result.headline = firstLine;
    }
  }

  // Extract skills (look for common patterns)
  const skillKeywords = [
    'javascript', 'typescript', 'python', 'java', 'react', 'node', 'vue', 'angular',
    'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes', 'git', 'github',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'nextjs', 'express', 'django',
    'flask', 'spring', 'laravel', 'php', 'ruby', 'go', 'rust', 'c++', 'c#', '.net',
    'machine learning', 'ai', 'data science', 'tensorflow', 'pytorch', 'scikit-learn'
  ];
  
  const foundSkills: string[] = [];
  const lowerText = cvText.toLowerCase();
  skillKeywords.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  if (foundSkills.length > 0) {
    result.skills = foundSkills;
  }

  // Extract location (look for common patterns)
  const locationPatterns = [
    /(?:location|based in|located in|from)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*[A-Z]{2}/, // City, State
    /(remote|hybrid|onsite)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = cvText.match(pattern);
    if (match && match.length > 0) {
      result.location = match[1] || match[0];
      break;
    }
  }

  // Extract bio (usually a summary section)
  const bioKeywords = ['summary', 'about', 'profile', 'objective', 'overview'];
  let bioStart = -1;
  for (const keyword of bioKeywords) {
    const index = lowerText.indexOf(keyword);
    if (index !== -1) {
      bioStart = index;
      break;
    }
  }
  
  if (bioStart !== -1) {
    const bioText = cvText.substring(bioStart, bioStart + 500).trim();
    if (bioText.length > 50) {
      result.bio = bioText.substring(0, 500);
    }
  }

  return result;
}

// Fetch GitHub repositories
async function fetchGitHubRepos(
  githubUrl: string, 
  token?: string
): Promise<{ repos: GitHubRepo[]; totalFetched: number; filteredCount: number }> {
  try {
    // Extract username from GitHub URL
    const urlMatch = githubUrl.match(/github\.com\/([^\/\?]+)/i);
    if (!urlMatch) {
      throw new Error('Invalid GitHub URL');
    }
    
    const username = urlMatch[1];
    
    // Fetch user's repositories
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      { headers }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('GitHub user not found');
      }
      if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please provide a personal access token.');
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }
    
    const repos: GitHubRepo[] = await response.json();
    const totalFetched = repos.length;
    
    // Filter repos based on rules (exclude forks, archived, and empty repos)
    const filteredRepos = filterGitHubRepos(repos, {
      excludeForks: true,
      excludeArchived: true,
      excludeEmpty: true,
    });
    
    return {
      repos: filteredRepos,
      totalFetched,
      filteredCount: filteredRepos.length,
    };
  } catch (error) {
    safeLogger.error('Error fetching GitHub repos', error);
    throw error;
  }
}

// Create portfolio projects from GitHub repos using proper mapping and upsert
async function createProjectsFromRepos(
  supabase: any,
  studentProfileId: string,
  repos: GitHubRepo[]
): Promise<{ created: number; updated: number; skipped: number; skipReasons: Record<string, string[]> }> {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const skipReasons: Record<string, string[]> = {};
  
  // Limit to 50 most recent repos
  const reposToProcess = repos.slice(0, 50);
  
  for (const repo of reposToProcess) {
    try {
      // Map GitHub repo to project input using the proper mapper
      const projectInput = mapGitHubRepoToProject(repo, {
        defaultVisibility: 'private', // Default to private, user can change later
        includeTopicsInDescription: true,
      });
      
      // Validate the project input
      const validation = validateProjectInput(projectInput);
      if (!validation.valid) {
        const reasons = validation.errors;
        skipReasons[repo.name] = reasons;
        safeLogger.warn('Skipping invalid project', {
          repoName: repo.name,
          errors: validation.errors,
        });
        skipped++;
        continue;
      }
      
      // Check if project already exists using source + source_id (proper deduplication)
      const { data: existing } = await supabase
        .from('portfolio_projects')
        .select('id, image_url, status, visibility')
        .eq('student_profile_id', studentProfileId)
        .eq('source', 'github')
        .eq('source_id', String(projectInput.source_id))
        .single();
      
      if (existing) {
        // Update existing project - only safe fields
        // Don't overwrite user edits like image_url, status, visibility
        const updateData: any = {
          title: projectInput.title,
          description: projectInput.description,
          repo_url: projectInput.github_url,
          github_url: projectInput.github_url, // Keep for backward compatibility
          demo_url: projectInput.demo_url,
          last_synced_at: new Date().toISOString(),
          // Keep existing image_url, status, visibility (don't overwrite user changes)
        };
        
        const { error: updateError } = await supabase
          .from('portfolio_projects')
          .update(updateData)
          .eq('id', existing.id);
        
        if (updateError) {
          skipReasons[repo.name] = [`Database error: ${updateError.message}`];
          safeLogger.error('Error updating project', {
            projectId: existing.id,
            error: updateError,
          });
          skipped++;
        } else {
          updated++;
        }
      } else {
        // Insert new project with source tracking
        const { error: insertError } = await supabase
          .from('portfolio_projects')
          .insert({
            student_profile_id: studentProfileId,
            title: projectInput.title,
            description: projectInput.description,
            github_url: projectInput.github_url,
            repo_url: projectInput.github_url,
            demo_url: projectInput.demo_url,
            visibility: projectInput.visibility,
            status: 'draft', // Default to draft
            source: 'github',
            source_id: String(projectInput.source_id),
            last_synced_at: new Date().toISOString(),
          });
        
        if (insertError) {
          // If it's a unique constraint violation, treat as update
          if (insertError.code === '23505') {
            // Try to update instead
            const { error: updateError } = await supabase
              .from('portfolio_projects')
              .update({
                title: projectInput.title,
                description: projectInput.description,
                repo_url: projectInput.github_url,
                github_url: projectInput.github_url,
                demo_url: projectInput.demo_url,
                last_synced_at: new Date().toISOString(),
              })
              .eq('student_profile_id', studentProfileId)
              .eq('source', 'github')
              .eq('source_id', String(projectInput.source_id));
            
            if (!updateError) {
              updated++;
            } else {
              skipReasons[repo.name] = [`Database error: ${updateError.message}`];
              safeLogger.error('Error upserting project', {
                repoName: repo.name,
                error: updateError,
              });
              skipped++;
            }
          } else {
            skipReasons[repo.name] = [`Database error: ${insertError.message}`];
            safeLogger.error('Error creating project', {
              repoName: repo.name,
              error: insertError,
            });
            skipped++;
          }
        } else {
          created++;
        }
      }
    } catch (error) {
      skipReasons[repo.name] = [`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`];
      safeLogger.error('Error processing repo', {
        repoName: repo.name,
        error,
      });
      skipped++;
    }
  }
  
  return { created, updated, skipped, skipReasons };
}

export async function POST(request: Request) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const cvFile = formData.get('cv') as File | null;
    const linkedinUrl = formData.get('linkedinUrl') as string | null;
    const githubUrl = formData.get('githubUrl') as string | null;
    const githubToken = formData.get('githubToken') as string | null;
    const studentProfileId = formData.get('studentProfileId') as string;

    if (!studentProfileId) {
      return NextResponse.json({ error: 'Student profile ID required' }, { status: 400 });
    }

    // Verify ownership
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, profile_id')
      .eq('id', studentProfileId)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', studentProfile.profile_id)
      .single();

    if (!profile || profile.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let profileUpdated = false;
    let projectsCreated = 0;
    let projectsUpdated = 0;
    let projectsSkipped = 0;
    let projectsSkipReasons: Record<string, string[]> = {};
    let reposFetched = 0;
    let reposFiltered = 0;
    let cvUploaded = false;
    let githubImported = false;
    let linkedinImported = false;

    // Process CV
    if (cvFile) {
      try {
        // Extract text from CV
        const extractionResult = await extractTextFromCV(cvFile, cvFile.type);
        const cvText = extractionResult.success ? extractionResult.text : '';
        
        // For now, we'll upload the CV and extract basic info
        // In production, use proper parsing libraries
        const { createServerSupabaseClient } = await import('@/lib/supabase/server');
        const { getResumeBucketName } = await import('@/lib/utils/storage');
        const serverSupabase = createServerSupabaseClient();
        const bucketName = getResumeBucketName();
        
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `${user.id}/resume-${Date.now()}.${fileExt}`;
        const filePath = fileName; // Store directly in bucket root with user prefix

        const { error: uploadError } = await serverSupabase.storage
          .from(bucketName)
          .upload(filePath, cvFile, {
            contentType: cvFile.type,
            upsert: false,
          });

        if (!uploadError) {
          // Get public URL
          const { data: urlData } = serverSupabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);
          const publicUrl = urlData.publicUrl;

          // Delete old CV if exists
          const { data: oldCVs } = await supabase
            .from('student_cvs')
            .select('file_path')
            .eq('student_profile_id', studentProfileId);

          if (oldCVs && oldCVs.length > 0) {
            for (const oldCV of oldCVs) {
              await serverSupabase.storage
                .from(bucketName)
                .remove([oldCV.file_path]);
            }
            await supabase
              .from('student_cvs')
              .delete()
              .eq('student_profile_id', studentProfileId);
          }

          // Save CV metadata
          await supabase
            .from('student_cvs')
            .insert({
              student_profile_id: studentProfileId,
              file_name: cvFile.name,
              file_path: filePath,
              url: publicUrl, // Store public URL for convenience
              file_size: cvFile.size,
              mime_type: cvFile.type,
              visibility: 'private',
            });

          // Update student_profiles with extracted CV text
          if (cvText && cvText.length > 0) {
            await supabase
              .from('student_profiles')
              .update({ cv_text: cvText })
              .eq('id', studentProfileId);
          }

          cvUploaded = true;

          // Extract profile data from CV (if text extraction works)
          if (cvText.length > 100) {
            const extractedData = extractProfileFromCV(cvText);
            
            // Update profile with extracted data
            const updateData: any = {};
            if (extractedData.headline) updateData.headline = extractedData.headline;
            if (extractedData.bio) updateData.bio = extractedData.bio;
            if (extractedData.skills && extractedData.skills.length > 0) {
              // Merge with existing skills
              const { data: currentProfile } = await supabase
                .from('student_profiles')
                .select('skills')
                .eq('id', studentProfileId)
                .single();
              
              const existingSkills = (currentProfile?.skills as string[]) || [];
              const mergedSkills = [...new Set([...existingSkills, ...extractedData.skills])];
              updateData.skills = mergedSkills;
            }
            if (extractedData.location) updateData.location = extractedData.location;

            if (Object.keys(updateData).length > 0) {
              await supabase
                .from('student_profiles')
                .update(updateData)
                .eq('id', studentProfileId);
              
              profileUpdated = true;
            }
          }
        }
      } catch (error) {
        // Note: cvText is never logged - it contains PII
        safeLogger.error('Error processing CV', error);
        // Continue with other imports even if CV fails
      }
    }

    // Process LinkedIn URL
    if (linkedinUrl) {
      try {
        // Validate LinkedIn URL
        if (!linkedinUrl.match(/linkedin\.com\/in\//i)) {
          throw new Error('Invalid LinkedIn URL format. Expected: https://linkedin.com/in/username');
        }

        // Update profile with LinkedIn URL
        await supabase
          .from('student_profiles')
          .update({ linkedin_url: linkedinUrl })
          .eq('id', studentProfileId);
        
        profileUpdated = true;
        linkedinImported = true;
        
        // Note: LinkedIn profile scraping requires LinkedIn API or web scraping
        // which may violate ToS. For now, we just store the URL.
      } catch (error) {
        safeLogger.error('Error processing LinkedIn', error);
      }
    }

    // Process GitHub URL
    if (githubUrl) {
      try {
        // Fetch repositories with filtering metadata
        const { repos: filteredRepos, totalFetched, filteredCount } = await fetchGitHubRepos(
          githubUrl, 
          githubToken || undefined
        );
        reposFetched = totalFetched;
        reposFiltered = filteredCount;
        
        // Update profile with GitHub URL
        await supabase
          .from('student_profiles')
          .update({ github_url: githubUrl })
          .eq('id', studentProfileId);
        
        profileUpdated = true;
        
        // Create projects from repositories using proper mapping and upsert
        if (filteredRepos.length > 0) {
          const result = await createProjectsFromRepos(supabase, studentProfileId, filteredRepos);
          projectsCreated = result.created;
          projectsUpdated = result.updated;
          projectsSkipped = result.skipped;
          projectsSkipReasons = result.skipReasons;
          githubImported = true;
        } else if (reposFetched > 0) {
          // Repos were fetched but all were filtered out
          githubImported = false; // Don't mark as imported if nothing was imported
        }
      } catch (error) {
        safeLogger.error('Error processing GitHub', error);
        // Still update the GitHub URL even if fetching repos fails
        await supabase
          .from('student_profiles')
          .update({ github_url: githubUrl })
          .eq('id', studentProfileId);
        profileUpdated = true;
        // Don't set githubImported = true if repos failed to fetch
      }
    }

    return NextResponse.json({
      success: true,
      profileUpdated,
      projectsCreated,
      projectsUpdated,
      projectsSkipped,
      projectsSkipReasons: Object.keys(projectsSkipReasons).length > 0 ? projectsSkipReasons : undefined,
      reposFetched,
      reposFiltered,
      cvUploaded,
      githubImported,
      linkedinImported,
    });
  } catch (error) {
    safeLogger.error('Error in auto-import', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
