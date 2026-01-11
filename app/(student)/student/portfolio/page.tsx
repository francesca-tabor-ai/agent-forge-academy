import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ProfileOverview } from '@/components/portfolio/ProfileOverview';
import { CVResumeSection } from '@/components/portfolio/CVResumeSection';
import { RecruiterVisibilitySection } from '@/components/portfolio/RecruiterVisibilitySection';
import { PortfolioAdvisorSection } from '@/components/portfolio/PortfolioAdvisorSection';
import { ProjectsView } from '@/components/portfolio/ProjectsView';

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
    .select('id, visibility, bio, headline, skills, location, linkedin_url, github_url, website_url')
    .eq('profile_id', profile.id)
    .single();

  // Get portfolio projects
  const { data: projects } = await supabase
    .from('portfolio_projects')
    .select('id, title, description, github_url, demo_url, visibility, cover_image_url, images, created_at')
    .eq('student_profile_id', studentProfile?.id)
    .order('created_at', { ascending: false });

  // Get CV data
  const { data: cv } = await supabase
    .from('student_cvs')
    .select('file_name, uploaded_at, visibility')
    .eq('student_profile_id', studentProfile?.id)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single();

  const hasCV = !!cv;

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-600 mt-1">
            Your professional profile for recruiters and hiring teams
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{completionScore}%</div>
            <p className="text-xs text-gray-500">Complete</p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="transform -rotate-90 w-16 h-16">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionScore / 100)}`}
                className="text-brand-light transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Recruiter Visibility - Moved to top */}
      {studentProfile && (
        <RecruiterVisibilitySection
          currentVisibility={studentProfile.visibility}
          hasBio={hasProfile}
          hasCV={hasCV}
          projectCount={projects?.length || 0}
          visibleProjectCount={visibleProjectCount}
        />
      )}

      {/* Profile Overview */}
      <ProfileOverview
        headline={headline}
        bio={studentProfile?.bio || null}
        primaryRoles={primaryRoles}
        coreSkills={coreSkills}
      />

      {/* CV & Resume */}
      {studentProfile && (
        <CVResumeSection
          studentProfileId={studentProfile.id}
          cvFileName={cvFileName}
          cvLastUpdated={cvLastUpdated}
          cvVisibility={cvVisibility}
          hasCV={hasCV}
        />
      )}

      {/* Projects */}
      <section>
        <ProjectsView projects={projects || []} />
      </section>

      {/* Portfolio Advisor */}
      <PortfolioAdvisorSection latestProjectId={projects && projects.length > 0 ? projects[0].id : undefined} />
    </div>
  );
}

