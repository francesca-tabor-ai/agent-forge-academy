import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ProfileHeader } from '@/components/portfolio/ProfileHeader';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { ProfileToolProficiencies } from '@/components/portfolio/ProfileToolProficiencies';
import { CVResumeSection } from '@/components/portfolio/CVResumeSection';
import { RecruiterVisibilitySection } from '@/components/portfolio/RecruiterVisibilitySection';

export default async function ProfilePage() {
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
    .select('id, visibility, full_name, headline, bio, skills, location, city, country, linkedin_url, github_url, website_url, headshot_image_url')
    .eq('profile_id', profile.id)
    .single();

  // If no student profile exists, redirect to edit to create one
  if (!studentProfile) {
    redirect('/student/profile/edit');
  }

  // Get CV/resume information
  const { data: cv } = await supabase
    .from('student_cvs')
    .select('id, file_name, uploaded_at, visibility, file_path, url')
    .eq('student_profile_id', studentProfile.id)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasCV = !!cv;
  const hasBio = !!(studentProfile.bio && studentProfile.bio.length > 50);
  const coreSkills = (studentProfile.skills as string[]) || [];
  const headline = studentProfile.headline || null;

  // Get CV download URL if available
  let cvDownloadUrl: string | null = null;
  let cvFileName: string | null = null;
  let cvLastUpdated: string | null = null;
  let cvVisibility: string | null = null;

  if (cv) {
    cvFileName = cv.file_name || null;
    cvLastUpdated = cv.uploaded_at ? new Date(cv.uploaded_at).toISOString() : null;
    cvVisibility = cv.visibility || null;
    
    // Try to get signed URL for private CVs or public URL for others
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(cv.file_path);
      cvDownloadUrl = publicUrl || cv.url || null;
    } catch {
      cvDownloadUrl = cv.url || null;
    }
  }

  // Type-safe CV visibility - narrow to expected union type
  const safeCvVisibility =
    cvVisibility === "public" ||
    cvVisibility === "private" ||
    cvVisibility === "recruiters_only"
      ? cvVisibility
      : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
        {/* Main Column - Profile Content */}
        <div className="space-y-6">
          {/* Profile Header */}
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
          <AboutSection bio={studentProfile.bio || null} />

          {/* Skills Section */}
          <SkillsSection 
            skills={coreSkills} 
            studentProfileId={studentProfile.id}
          />

          {/* Tool Proficiencies */}
          {studentProfile.id && (
            <ProfileToolProficiencies studentProfileId={studentProfile.id} />
          )}
        </div>

        {/* Right Sidebar - Tools & Actions */}
        <div className="space-y-6">
          {/* Edit Profile Button */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Link
              href="/student/profile/edit"
              className="w-full btn-primary flex"
            >
              Edit Profile
            </Link>
          </div>

          {/* Recruiter Visibility */}
          <RecruiterVisibilitySection
            currentVisibility={studentProfile.visibility}
            hasBio={hasBio}
            hasCV={hasCV}
            projectCount={0}
            visibleProjectCount={0}
          />

          {/* CV & Resume Card */}
          <CVResumeSection
            studentProfileId={studentProfile.id}
            cvFileName={cvFileName}
            cvLastUpdated={cvLastUpdated}
            cvVisibility={safeCvVisibility}
            cvDownloadUrl={cvDownloadUrl}
            hasCV={hasCV}
            isDefault={true}
          />
        </div>
      </div>
    </div>
  );
}
