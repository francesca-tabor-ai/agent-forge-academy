import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { safeLogger } from '@/lib/utils/redactPII';
import Link from 'next/link';
import { ProfileHeader } from '@/components/portfolio/ProfileHeader';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
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

export default async function PortfolioPage() {
  const reqId = headers().get('x-vercel-id') ?? headers().get('x-request-id') ?? `local-${Date.now()}`;

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
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

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
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

    // Get student profile
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .select('id, visibility, full_name, bio, headline, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
      .eq('profile_id', profile.id)
      .single();

    if (studentProfileError && studentProfileError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is acceptable (student profile might not exist yet)
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
          images, 
          created_at,
          updated_at,
          last_synced_at,
          status,
          featured
        `)
        .eq('student_profile_id', studentProfile.id)
        .order('created_at', { ascending: false });

      if (projectsError) {
        safeLogger.error('[PortfolioPage] Projects query error', {
          reqId,
          studentProfileId: studentProfile.id,
          error: projectsError.message,
          code: projectsError.code,
        });
        // Don't throw - just log and continue with empty projects
        projects = [];
      } else {
        // Fetch skills for each project
        const projectsWithSkills = await Promise.all(
          (projectsData || []).map(async (project) => {
            // Fetch project skills
            const { data: projectSkills } = await supabase
              .from('project_skills')
              .select(`
                skill_id,
                skills:skill_id (
                  id,
                  name
                )
              `)
              .eq('project_id', project.id);

            const skills = (projectSkills || [])
              .map((ps: any) => ps.skills)
              .filter(Boolean)
              .map((skill: any) => ({
                id: skill.id,
                name: skill.name,
              }));

            return {
              ...project,
              visibility: (project.visibility as 'private' | 'recruiters_only' | 'public') || 'private',
              created_at: project.created_at 
                ? (typeof project.created_at === 'string' 
                    ? project.created_at 
                    : new Date(project.created_at).toISOString())
                : null,
              updated_at: project.updated_at 
                ? (typeof project.updated_at === 'string' 
                    ? project.updated_at 
                    : new Date(project.updated_at).toISOString())
                : null,
              last_synced_at: project.last_synced_at 
                ? (typeof project.last_synced_at === 'string' 
                    ? project.last_synced_at 
                    : new Date(project.last_synced_at).toISOString())
                : null,
              skills,
            };
          })
        );

        projects = projectsWithSkills as PortfolioProject[];
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
        featuredProjects = featuredData;
      }
    }

    // Get CV data
    let cv = null;
    if (studentProfile) {
      const { data: cvData, error: cvError } = await supabase
        .from('student_cvs')
        .select('file_name, uploaded_at, visibility, url, file_path')
        .eq('student_profile_id', studentProfile.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cvError && cvError.code !== 'PGRST116') {
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
    const cvLastUpdated = cv?.uploaded_at 
      ? (typeof cv.uploaded_at === 'string' 
          ? cv.uploaded_at 
          : new Date(cv.uploaded_at).toISOString())
      : null;
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

      {/* LinkedIn-style 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
        {/* Main Column - Profile Content */}
        <div className="space-y-6">
          {/* Profile Header - LinkedIn style */}
          {studentProfile && (
            <ProfileHeader
              fullName={studentProfile.full_name || ''}
              headline={headline || ''}
              headshotImageUrl={studentProfile.headshot_image_url || null}
              location={studentProfile.location || null}
              linkedinUrl={studentProfile.linkedin_url || null}
              githubUrl={studentProfile.github_url || null}
              websiteUrl={studentProfile.website_url || null}
              email={user?.email || ''}
              visibility={studentProfile.visibility || 'private'}
              studentProfileId={studentProfile.id}
            />
          )}

          {/* About Section */}
          <AboutSection bio={studentProfile?.bio || null} />

          {/* Featured Projects Section */}
          {studentProfile && (
            <FeaturedProjects
              projects={featuredProjects || []}
              studentProfileId={studentProfile.id}
            />
          )}

          {/* Experience / Projects Section */}
          <section className="bg-white border border-gray-200 rounded-lg p-6">
            <ProjectsView projects={projects || []} />
          </section>

          {/* Skills Section */}
          <SkillsSection 
            skills={coreSkills} 
            studentProfileId={studentProfile?.id}
          />
        </div>

        {/* Right Sidebar - Tools & Actions */}
        <div className="space-y-6">
          {/* Recruiter Visibility */}
          {studentProfile && (
            <RecruiterVisibilitySection
              currentVisibility={studentProfile.visibility}
              hasBio={hasProfile}
              hasCV={hasCV}
              projectCount={projects?.length || 0}
              visibleProjectCount={visibleProjectCount}
            />
          )}

          {/* CV & Resume Card */}
          {studentProfile && (
            <CVResumeSection
              studentProfileId={studentProfile.id}
              cvFileName={cvFileName}
              cvLastUpdated={cvLastUpdated}
              cvVisibility={cvVisibility}
              cvDownloadUrl={cvDownloadUrl}
              hasCV={hasCV}
              isDefault={true}
            />
          )}

          {/* Auto-Import Section */}
          {studentProfile && (
            <AutoImportSection
              studentProfileId={studentProfile.id}
              hasExistingData={hasProfile || hasCV || (projects && projects.length > 0)}
            />
          )}

          {/* Portfolio Advisor */}
          <PortfolioAdvisorSection latestProjectId={projects && projects.length > 0 && projects[0]?.id ? projects[0].id : undefined} />
        </div>
      </div>
    </div>
    );
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    
    safeLogger.error('[PortfolioPage] Server render error', {
      reqId,
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
    });

    // Re-throw to trigger error boundary
    throw e;
  }
}

