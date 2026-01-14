import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
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
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  // Get student profile
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id, visibility, full_name, bio, headline, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
    .eq('profile_id', profile.id)
    .single();

  // Get portfolio projects (only if student profile exists)
  const { data: projects } = studentProfile
    ? await supabase
        .from('portfolio_projects')
        .select('id, title, description, github_url, demo_url, visibility, cover_image_url, images, created_at, featured')
        .eq('student_profile_id', studentProfile.id)
        .order('created_at', { ascending: false })
    : { data: null };

  // Get featured projects separately (for Featured section)
  const { data: featuredProjects } = studentProfile
    ? await supabase
        .from('portfolio_projects')
        .select('id, title, description, github_url, demo_url, cover_image_url')
        .eq('student_profile_id', studentProfile.id)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(4)
    : { data: null };

  // Get CV data
  const { data: cv } = await supabase
    .from('student_cvs')
    .select('file_name, uploaded_at, visibility, url, file_path')
    .eq('student_profile_id', studentProfile?.id)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasCV = !!cv;

  // Generate download URL - use signed URL if private, otherwise use public URL
  let cvDownloadUrl: string | null = null;
  if (cv) {
    const bucketName = getResumeBucketName();
    const serverSupabase = createServerSupabaseClient();
    
    if (cv.visibility === 'private') {
      // Generate signed URL for private CVs (expires in 1 hour)
      const { data: signedUrl } = await serverSupabase.storage
        .from(bucketName)
        .createSignedUrl(cv.file_path, 3600);
      cvDownloadUrl = signedUrl?.signedUrl || null;
    } else {
      // Use public URL for non-private CVs
      const { data: urlData } = serverSupabase.storage
        .from(bucketName)
        .getPublicUrl(cv.file_path);
      cvDownloadUrl = urlData.publicUrl || cv.url || null;
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
  const cvLastUpdated = cv?.uploaded_at || null;
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
              fullName={studentProfile.full_name}
              headline={headline}
              headshotImageUrl={studentProfile.headshot_image_url}
              location={studentProfile.location}
              linkedinUrl={studentProfile.linkedin_url}
              githubUrl={studentProfile.github_url}
              websiteUrl={studentProfile.website_url}
              email={user.email}
              visibility={studentProfile.visibility}
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
          <SkillsSection skills={coreSkills} />
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
          <PortfolioAdvisorSection latestProjectId={projects && projects.length > 0 ? projects[0].id : undefined} />
        </div>
      </div>
    </div>
  );
}

