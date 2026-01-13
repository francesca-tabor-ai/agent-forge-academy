import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RecruiterDashboard } from '@/components/recruiter/RecruiterDashboard';

export default async function RecruiterDashboardPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user's profile and verify recruiter role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || (profile.role !== 'recruiter' && profile.role !== 'admin')) {
    redirect('/');
  }

  // Fetch students the recruiter has access to via recruiter_student_access
  // First, get access grants that are not expired
  const now = new Date().toISOString();
  const { data: accessGrants, error: accessError } = await supabase
    .from('recruiter_student_access')
    .select('student_id, expires_at, created_at')
    .eq('recruiter_id', profile.id)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (accessError) {
    console.error('Error fetching access grants:', accessError);
  }

  // If no access grants, return empty array
  if (!accessGrants || accessGrants.length === 0) {
    return (
      <div className="recruiter-dashboard-page">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Students you have access to view CVs
          </p>
        </div>
        <RecruiterDashboard students={[]} />
      </div>
    );
  }

  // Get student profile IDs from access grants
  const studentProfileIds = accessGrants.map((grant) => grant.student_id);

  // Fetch student profiles and their student_profiles
  const { data: studentProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      id,
      user_id,
      student_profiles (
        id,
        bio,
        headshot_image_url,
        visibility
      )
    `)
    .in('id', studentProfileIds)
    .eq('role', 'student');

  if (profilesError) {
    console.error('Error fetching student profiles:', profilesError);
  }

  // Map access grants to student data
  const students = (studentProfiles || [])
    .map((profile) => {
      const studentProfile = Array.isArray(profile.student_profiles) 
        ? profile.student_profiles[0] 
        : profile.student_profiles;
      
      const accessGrant = accessGrants.find((grant) => grant.student_id === profile.id);

      return {
        profileId: profile.id,
        userId: profile.user_id,
        studentProfileId: studentProfile?.id,
        bio: studentProfile?.bio || null,
        headshotImageUrl: studentProfile?.headshot_image_url || null,
        visibility: studentProfile?.visibility || null,
        accessGrantedAt: accessGrant?.created_at || new Date().toISOString(),
        accessExpiresAt: accessGrant?.expires_at || null,
      };
    })
    .filter((student) => student.profileId && student.studentProfileId); // Filter out invalid entries

  return (
    <div className="recruiter-dashboard-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Students you have access to view CVs
        </p>
      </div>
      <RecruiterDashboard students={students} />
    </div>
  );
}
