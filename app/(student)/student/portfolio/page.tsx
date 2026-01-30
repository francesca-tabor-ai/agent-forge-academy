import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { safeLogger } from '@/lib/utils/redactPII';
import Link from 'next/link';
import { ProfileHeader } from '@/components/portfolio/ProfileHeader';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { ProfileToolProficiencies } from '@/components/portfolio/ProfileToolProficiencies';
import { FeaturedProjects } from '@/components/portfolio/FeaturedProjects';
import { CVResumeSection } from '@/components/portfolio/CVResumeSection';
import { RecruiterVisibilitySection } from '@/components/portfolio/RecruiterVisibilitySection';
import { PortfolioAdvisorSection } from '@/components/portfolio/PortfolioAdvisorSection';
import { ProjectsView } from '@/components/portfolio/ProjectsView';
import { AutoImportSection } from '@/components/portfolio/AutoImportSection';
import { ProfileSavedToast } from '@/components/portfolio/ProfileSavedToast';
import { GitHubSyncStatus } from '@/components/portfolio/GitHubSyncStatus';
import { Suspense } from 'react';
import { getResumeBucketName } from '@/lib/utils/storage';

// Helper function to safely serialize dates
function safeDateSerialize(dateValue: any): string | null {
  if (!dateValue) return null;
  if (typeof dateValue === 'string') {
    // Validate it's a valid date string
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

export default async function PortfolioPage() {
  const reqId = headers().get('x-vercel-id') ?? headers().get('x-request-id') ?? `local-${Date.now()}`;
  let userId: string | undefined;

  try {
    // Stage 1: Initialize Supabase client
    console.error('[PORTFOLIO_PAGE]', { 
      stage: 'init', 
      reqId,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });

    const supabase = await createUserSupabaseClient();
    
    // Stage 2: Authenticate user
    console.error('[PORTFOLIO_PAGE]', { stage: 'auth', reqId });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('[PORTFOLIO_PAGE]', {
        stage: 'auth',
        reqId,
        userId: user?.id,
        error: authError.message,
        code: authError.status,
        stack: authError.stack,
      });
      safeLogger.error('[PortfolioPage] Auth error', {
        reqId,
        error: authError.message,
        code: authError.status,
      });
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!user) {
      redirect('/auth/login');
    }

    userId = user.id;

    // Stage 3: Fetch profile
    console.error('[PORTFOLIO_PAGE]', { stage: 'fetch_profile', reqId, userId });
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('[PORTFOLIO_PAGE]', {
        stage: 'fetch_profile',
        reqId,
        userId,
        error: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
        stack: new Error().stack,
      });
      safeLogger.error('[PortfolioPage] Profile query error', {
        reqId,
        userId: user.id,
        error: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    if (!profile || profile.role !== 'student') {
      redirect('/');
    }

    // Stage 4: Fetch student profile
    console.error('[PORTFOLIO_PAGE]', { stage: 'fetch_student_profile', reqId, userId, profileId: profile.id });
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .select('id, visibility, full_name, bio, headline, skills, location, city, country, linkedin_url, github_url, website_url, headshot_image_url')
      .eq('profile_id', profile.id)
      .single();

    if (studentProfileError && studentProfileError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is acceptable (student profile might not exist yet)
      console.error('[PORTFOLIO_PAGE]', {
        stage: 'fetch_student_profile',
        reqId,
        userId,
        profileId: profile.id,
        error: studentProfileError.message,
        code: studentProfileError.code,
        details: studentProfileError.details,
        hint: studentProfileError.hint,
        stack: new Error().stack,
      });
      safeLogger.error('[PortfolioPage] Student profile query error', {
        reqId,
        userId: user.id,
        profileId: profile.id,
        error: studentProfileError.message,
        code: studentProfileError.code,
        details: studentProfileError.details,
        hint: studentProfileError.hint,
      });
      throw new Error(`Failed to fetch student profile: ${studentProfileError.message}`);
    }

    // Get portfolio projects (only if student profile exists)
    type PortfolioProject = {
      id: string;
      title: string;
      description: string | null;
      github_url: string | null;
      demo_url: string | null;
      visibility: 'private' | 'recruiters_only' | 'public';
      cover_image_url?: string | null;
      image_url?: string | null;
      images?: string[] | null;
      created_at: string | null;
      updated_at?: string | null;
      last_synced_at?: string | null;
      status?: 'draft' | 'published';
      featured?: boolean;
      skills?: Array<{ id: string; name: string }>;
    };
    
    type FeaturedProject = {
      id: string;
      title: string;
      description: string | null;
      github_url: string | null;
      demo_url: string | null;
      cover_image_url: string | null;
    };
    
    let projects: PortfolioProject[] | null = null;
    let featuredProjects: FeaturedProject[] | null = null;
    
    if (studentProfile) {
      // Stage 5: Fetch projects
      console.error('[PORTFOLIO_PAGE]', { 
        stage: 'fetch_projects', 
        reqId, 
        userId, 
        studentProfileId: studentProfile.id 
      });
      
      const { data: projectsData, error: projectsError } = await supabase
        .from('portfolio_projects')
        .select(`
          id, 
          title, 
          description, 
          github_url, 
          demo_url, 
          visibility, 
          cover_image_url,
          image_url,
          created_at,
          updated_at,
          last_synced_at,
          status,
          featured
        `)
        .eq('student_profile_id', studentProfile.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('[PORTFOLIO_PAGE]', {
          stage: 'fetch_projects',
          reqId,
          userId,
          studentProfileId: studentProfile.id,
          error: projectsError.message,
          code: projectsError.code,
          details: projectsError.details,
          hint: projectsError.hint,
          stack: new Error().stack,
        });
        safeLogger.error('[PortfolioPage] Projects query error', {
          reqId,
          studentProfileId: studentProfile.id,
          error: projectsError.message,
          code: projectsError.code,
        });
        // Don't throw - just log and continue with empty projects
        projects = [];
      } else {
        // Fetch skills for each project with error handling
        const projectsWithSkillsResults = await Promise.allSettled(
          (projectsData || []).map(async (project) => {
            try {
              // Fetch project skills
              const { data: projectSkills, error: projectSkillsError } = await supabase
                .from('project_skills')
                .select(`
                  skill_id,
                  skills:skill_id (
                    id,
                    name
                  )
                `)
                .eq('project_id', project.id);

              if (projectSkillsError) {
                safeLogger.warn('[PortfolioPage] Project skills query error', {
                  reqId,
                  projectId: project.id,
                  error: projectSkillsError.message,
                  code: projectSkillsError.code,
                });
              }

              // Safely extract skills with validation
              const skills = (projectSkills || [])
                .map((ps: any) => ps.skills)
                .filter((skill): skill is { id: string; name: string } => 
                  skill && 
                  typeof skill === 'object' && 
                  typeof skill.id === 'string' && 
                  typeof skill.name === 'string'
                )
                .map((skill) => ({
                  id: skill.id,
                  name: skill.name,
                }));

              return {
                ...project,
                visibility: (project.visibility as 'private' | 'recruiters_only' | 'public') || 'private',
                created_at: safeDateSerialize(project.created_at),
                updated_at: safeDateSerialize(project.updated_at),
                last_synced_at: safeDateSerialize(project.last_synced_at),
                skills,
              };
            } catch (error: any) {
              safeLogger.error('[PortfolioPage] Error processing project', {
                reqId,
                projectId: project.id,
                error: error?.message || 'Unknown error',
                stack: error?.stack,
              });
              // Return project without skills rather than failing
              return {
                ...project,
                visibility: (project.visibility as 'private' | 'recruiters_only' | 'public') || 'private',
                created_at: safeDateSerialize(project.created_at),
                updated_at: safeDateSerialize(project.updated_at),
                last_synced_at: safeDateSerialize(project.last_synced_at),
                skills: [],
              };
            }
          })
        );

        // Extract fulfilled results, fallback to empty skills for rejected
        projects = projectsWithSkillsResults.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            safeLogger.error('[PortfolioPage] Project processing failed', {
              reqId,
              projectIndex: index,
              error: result.reason?.message || 'Unknown error',
              stack: result.reason?.stack,
            });
            // Fallback: return project with minimal data
            const project = projectsData?.[index];
            if (!project || !project.id) {
              // If project data is missing, log and return null (will be filtered out)
              safeLogger.warn('[PortfolioPage] Project data missing at index', {
                reqId,
                projectIndex: index,
                totalProjects: projectsData?.length || 0,
              });
              return null;
            }
            return {
              ...project,
              visibility: (project?.visibility as 'private' | 'recruiters_only' | 'public') || 'private',
              created_at: safeDateSerialize(project?.created_at),
              updated_at: safeDateSerialize(project?.updated_at),
              last_synced_at: safeDateSerialize(project?.last_synced_at),
              skills: [],
            } as PortfolioProject;
          }
        }).filter((p): p is PortfolioProject => p !== null && p !== undefined && p.id !== undefined) as PortfolioProject[];
      }

      const { data: featuredData, error: featuredError } = await supabase
        .from('portfolio_projects')
        .select('id, title, description, github_url, demo_url, cover_image_url')
        .eq('student_profile_id', studentProfile.id)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (featuredError) {
        safeLogger.warn('[PortfolioPage] Featured projects query error', {
          reqId,
          studentProfileId: studentProfile.id,
          error: featuredError.message,
        });
        featuredProjects = [];
      } else {
        featuredProjects = featuredData || [];
      }
    }

    // Stage 6: Fetch CV data
    let cv = null;
    if (studentProfile) {
      console.error('[PORTFOLIO_PAGE]', { 
        stage: 'fetch_cv', 
        reqId, 
        userId, 
        studentProfileId: studentProfile.id 
      });
      
      const { data: cvData, error: cvError } = await supabase
        .from('student_cvs')
        .select('file_name, uploaded_at, visibility, url, file_path')
        .eq('student_profile_id', studentProfile.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cvError && cvError.code !== 'PGRST116') {
        console.error('[PORTFOLIO_PAGE]', {
          stage: 'fetch_cv',
          reqId,
          userId,
          studentProfileId: studentProfile.id,
          error: cvError.message,
          code: cvError.code,
          stack: new Error().stack,
        });
        safeLogger.warn('[PortfolioPage] CV query error', {
          reqId,
          studentProfileId: studentProfile.id,
          error: cvError.message,
        });
        // Don't throw - CV is optional
      } else {
        cv = cvData;
      }
    }

    const hasCV = !!cv;

    // Generate download URL - use signed URL if private, otherwise use public URL
    let cvDownloadUrl: string | null = null;
    if (cv) {
      try {
        const bucketName = getResumeBucketName();
        const serverSupabase = createServerSupabaseClient();
        
        if (cv.visibility === 'private') {
          // Generate signed URL for private CVs (expires in 1 hour)
          const { data: signedUrl, error: signedUrlError } = await serverSupabase.storage
            .from(bucketName)
            .createSignedUrl(cv.file_path, 3600);
          
          if (signedUrlError) {
            safeLogger.warn('[PortfolioPage] Failed to generate signed URL', {
              reqId,
              error: signedUrlError.message,
              filePath: cv.file_path,
            });
          } else {
            cvDownloadUrl = signedUrl?.signedUrl || null;
          }
        } else {
          // Use public URL for non-private CVs
          const { data: urlData } = serverSupabase.storage
            .from(bucketName)
            .getPublicUrl(cv.file_path);
          cvDownloadUrl = urlData.publicUrl || cv.url || null;
        }
      } catch (storageError: any) {
        safeLogger.warn('[PortfolioPage] Storage URL generation error', {
          reqId,
          error: storageError?.message || 'Unknown storage error',
        });
        // Don't throw - CV download is optional
      }
    }

    // Calculate portfolio completion percentage
    // Scoring: Profile (25%), CV (25%), Projects (25%), Visibility (25%)
    let completionScore = 0;
    const hasProfile = studentProfile && studentProfile.bio && studentProfile.bio.length > 50;
    if (hasProfile) completionScore += 25;

    if (hasCV) completionScore += 25;

    const hasProjects = projects && projects.length >= 2;
    if (hasProjects) completionScore += 25;

    const hasVisibleProjects = projects && projects.some(p => p.visibility !== 'private');
    if (hasVisibleProjects) completionScore += 25;

    // Get profile data
    const headline = studentProfile?.headline || null;
    const primaryRoles: string[] = []; // Can be derived from skills or separate field in future
    const coreSkills = (studentProfile?.skills as string[]) || [];
    const cvFileName = cv?.file_name || null;
    // Serialize Date to ISO string to avoid serialization issues
    const cvLastUpdated = safeDateSerialize(cv?.uploaded_at);
    const cvVisibility = cv?.visibility || null;

    // Calculate visible project count
    const visibleProjectCount = projects ? projects.filter(p => p.visibility !== 'private').length : 0;

    return (
    <div className="max-w-7xl mx-auto">
      {/* Toast Notification */}
      <Suspense fallback={null}>
        <ProfileSavedToast />
      </Suspense>

      {/* GitHub Sync Status - checks for new projects after sync */}
      <Suspense fallback={null}>
        <GitHubSyncStatus />
      </Suspense>

      {/* Show onboarding state if student profile doesn't exist */}
      {!studentProfile ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="text-gray-400">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Complete your profile to get started
            </h2>
            <p className="text-gray-600">
              Create your student profile to start building your portfolio and showcasing your projects.
            </p>
            <Link
              href="/student/profile/edit"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Profile
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* LinkedIn-style 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
            {/* Main Column - Profile Content */}
            <div className="space-y-6">
              {/* Profile Header - LinkedIn style */}
              <ProfileHeader
                fullName={studentProfile.full_name || ''}
                headline={headline || ''}
                headshotImageUrl={studentProfile.headshot_image_url || null}
                location={studentProfile.location || null}
                city={studentProfile.city || null}
                linkedinUrl={studentProfile.linkedin_url || null}
                githubUrl={studentProfile.github_url || null}
                websiteUrl={studentProfile.website_url || null}
                email={user?.email || ''}
                visibility={studentProfile.visibility || 'private'}
                studentProfileId={studentProfile.id}
              />

              {/* About Section */}
              <AboutSection bio={studentProfile?.bio || null} />

              {/* Featured Projects Section */}
              <FeaturedProjects
                projects={featuredProjects || []}
                studentProfileId={studentProfile.id}
              />

              {/* Experience / Projects Section */}
              <section className="bg-white border border-gray-200 rounded-lg p-6">
                <ProjectsView projects={projects || []} />
              </section>

              {/* Skills Section */}
              <SkillsSection 
                skills={coreSkills} 
                studentProfileId={studentProfile.id}
              />

              {/* Tool Proficiencies */}
              {studentProfile?.id && (
                <ProfileToolProficiencies studentProfileId={studentProfile.id} />
              )}
            </div>

            {/* Right Sidebar - Tools & Actions */}
            <div className="space-y-6">
              {/* Recruiter Visibility */}
              <RecruiterVisibilitySection
                currentVisibility={studentProfile.visibility}
                hasBio={hasProfile}
                hasCV={hasCV}
                projectCount={projects?.length || 0}
                visibleProjectCount={visibleProjectCount}
              />

              {/* CV & Resume Card */}
              <CVResumeSection
                studentProfileId={studentProfile.id}
                cvFileName={cvFileName}
                cvLastUpdated={cvLastUpdated}
                cvVisibility={cvVisibility}
                cvDownloadUrl={cvDownloadUrl}
                hasCV={hasCV}
                isDefault={true}
              />

              {/* Auto-Import Section */}
              <AutoImportSection
                studentProfileId={studentProfile.id}
                hasExistingData={hasProfile || hasCV || (projects && projects.length > 0)}
              />

              {/* Portfolio Advisor */}
              <PortfolioAdvisorSection latestProjectId={projects && projects.length > 0 && projects[0]?.id ? projects[0].id : undefined} />
            </div>
          </div>
        </>
      )}
    </div>
    );
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    
    // Generate a unique error ID for tracking (similar to request ID format)
    const errorId = `err-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    console.error('[PORTFOLIO_PAGE]', {
      stage: 'top_level_error',
      reqId,
      errorId,
      userId,
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
    });
    
    safeLogger.error('[PortfolioPage] Server render error', {
      reqId,
      errorId,
      userId,
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      // Include digest if available (Next.js error boundary)
      digest: (error as any).digest,
    });

    // Enhance error with error ID for better tracking
    if (!(error as any).errorId) {
      (error as any).errorId = errorId;
    }

    // Re-throw to trigger error boundary
    throw e;
  }
}

