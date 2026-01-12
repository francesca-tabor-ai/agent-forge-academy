import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { extractTextFromCV } from '@/lib/cv/extractText';
import { safeLogger } from '@/lib/utils/redactPII';

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
async function fetchGitHubRepos(githubUrl: string, token?: string): Promise<any[]> {
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
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=20`,
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
    
    const repos = await response.json();
    
    // Filter out forks and archived repos (optional)
    return repos
      .filter((repo: any) => !repo.fork && !repo.archived)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description || '',
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        updated: repo.updated_at,
        topics: repo.topics || [],
      }));
  } catch (error) {
    safeLogger.error('Error fetching GitHub repos', error);
    throw error;
  }
}

// Create portfolio projects from GitHub repos
async function createProjectsFromRepos(
  supabase: any,
  studentProfileId: string,
  repos: any[]
): Promise<number> {
  let created = 0;
  
  for (const repo of repos.slice(0, 10)) { // Limit to 10 most recent
    // Check if project already exists
    const { data: existing } = await supabase
      .from('portfolio_projects')
      .select('id')
      .eq('student_profile_id', studentProfileId)
      .eq('github_url', repo.url)
      .single();
    
    if (existing) {
      continue; // Skip if already exists
    }
    
    // Create project
    const { error } = await supabase
      .from('portfolio_projects')
      .insert({
        student_profile_id: studentProfileId,
        title: repo.name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        description: repo.description || `A ${repo.language || 'software'} project${repo.topics.length > 0 ? ` using ${repo.topics.slice(0, 3).join(', ')}` : ''}.`,
        github_url: repo.url,
        visibility: 'private', // Default to private, user can change later
      });
    
    if (!error) {
      created++;
    }
  }
  
  return created;
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
    let cvUploaded = false;

    // Process CV
    if (cvFile) {
      try {
        // Extract text from CV
        const extractionResult = await extractTextFromCV(cvFile, cvFile.type);
        const cvText = extractionResult.success ? extractionResult.text : '';
        
        // For now, we'll upload the CV and extract basic info
        // In production, use proper parsing libraries
        const fileExt = cvFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const filePath = `cvs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-files')
          .upload(filePath, cvFile, {
            contentType: cvFile.type,
            upsert: false,
          });

        if (!uploadError) {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('portfolio-files')
            .getPublicUrl(filePath);
          const publicUrl = urlData.publicUrl;

          // Delete old CV if exists
          const { data: oldCVs } = await supabase
            .from('student_cvs')
            .select('file_path')
            .eq('student_profile_id', studentProfileId);

          if (oldCVs && oldCVs.length > 0) {
            for (const oldCV of oldCVs) {
              await supabase.storage
                .from('portfolio-files')
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
        
        // Note: LinkedIn profile scraping requires LinkedIn API or web scraping
        // which may violate ToS. For now, we just store the URL.
      } catch (error) {
        safeLogger.error('Error processing LinkedIn', error);
      }
    }

    // Process GitHub URL
    if (githubUrl) {
      try {
        // Fetch repositories
        const repos = await fetchGitHubRepos(githubUrl, githubToken || undefined);
        
        // Update profile with GitHub URL
        await supabase
          .from('student_profiles')
          .update({ github_url: githubUrl })
          .eq('id', studentProfileId);
        
        profileUpdated = true;
        
        // Create projects from repositories
        if (repos.length > 0) {
          projectsCreated = await createProjectsFromRepos(supabase, studentProfileId, repos);
        }
      } catch (error) {
        safeLogger.error('Error processing GitHub', error);
        // Still update the GitHub URL even if fetching repos fails
        await supabase
          .from('student_profiles')
          .update({ github_url: githubUrl })
          .eq('id', studentProfileId);
        profileUpdated = true;
      }
    }

    return NextResponse.json({
      success: true,
      profileUpdated,
      projectsCreated,
      cvUploaded,
    });
  } catch (error) {
    safeLogger.error('Error in auto-import', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
