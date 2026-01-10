import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ProfileOverview } from '@/components/portfolio/ProfileOverview';
import { CVResumeSection } from '@/components/portfolio/CVResumeSection';
import { RecruiterVisibilitySection } from '@/components/portfolio/RecruiterVisibilitySection';
import { PortfolioAdvisorSection } from '@/components/portfolio/PortfolioAdvisorSection';
import { ProjectCard } from '@/components/portfolio/ProjectCard';

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
    .select('id, visibility, bio')
    .eq('profile_id', profile.id)
    .single();

  // Get portfolio projects
  const { data: projects } = await supabase
    .from('portfolio_projects')
    .select('id, title, description, github_url, demo_url, visibility, created_at')
    .eq('student_profile_id', studentProfile?.id)
    .order('created_at', { ascending: false });

  // Calculate portfolio completion percentage
  // Scoring: Profile (25%), CV (25%), Projects (25%), Visibility (25%)
  let completionScore = 0;
  const hasProfile = studentProfile && studentProfile.bio && studentProfile.bio.length > 50;
  if (hasProfile) completionScore += 25;

  // TODO: Check if CV exists (currently mocked)
  const hasCV = false; // Mock: will be replaced with actual CV check
  if (hasCV) completionScore += 25;

  const hasProjects = projects && projects.length >= 2;
  if (hasProjects) completionScore += 25;

  const hasVisibleProjects = projects && projects.some(p => p.visibility !== 'private');
  if (hasVisibleProjects) completionScore += 25;

  // Mock profile data (will be replaced with actual database fields)
  const headline = null; // TODO: Add headline field to student_profiles
  const primaryRoles: string[] = []; // TODO: Add primary_roles field to student_profiles
  const coreSkills: string[] = []; // TODO: Add core_skills field to student_profiles

  // Mock CV data (will be replaced with actual CV table)
  const cvFileName = null;
  const cvLastUpdated = null;
  const cvVisibility = null;

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

      {/* Profile Overview */}
      <ProfileOverview
        headline={headline}
        bio={studentProfile?.bio || null}
        primaryRoles={primaryRoles}
        coreSkills={coreSkills}
      />

      {/* CV & Resume */}
      <CVResumeSection
        cvFileName={cvFileName}
        cvLastUpdated={cvLastUpdated}
        cvVisibility={cvVisibility}
        hasCV={hasCV}
      />

      {/* Projects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Projects</h2>
          <Link
            href="/student/portfolio/new"
            className="btn-primary text-sm"
          >
            Add Project
          </Link>
        </div>

        {projects && projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => {
              // Extract tech stack from description (mock - will be replaced with actual field)
              const techStack: string[] = [];
              // Extract outcome from description (mock - will be replaced with actual field)
              const outcome = null;

              return (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  github_url={project.github_url}
                  demo_url={project.demo_url}
                  visibility={project.visibility}
                  techStack={techStack}
                  outcome={outcome}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-600 mb-2 font-medium">No projects yet</p>
            <p className="text-sm text-gray-500 mb-6">
              Recruiters expect 2–4 strong projects
            </p>
            <Link
              href="/student/portfolio/new"
              className="btn-primary text-sm inline-block"
            >
              Add Project
            </Link>
          </div>
        )}
      </section>

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

      {/* Portfolio Advisor */}
      <PortfolioAdvisorSection />
    </div>
  );
}

