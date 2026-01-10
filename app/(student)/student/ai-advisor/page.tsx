import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AIAdvisor } from '@/components/ai-advisor/AIAdvisor';

export default async function AIAdvisorPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get student profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  let studentProfileId: string | null = null;
  if (profile) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();
    studentProfileId = studentProfile?.id || null;
  }

  // Get enrolled courses
  let activeCourses: Array<{ id: string; slug: string; title: string }> = [];
  if (studentProfileId) {
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select(`
        course_id,
        courses (
          id,
          slug,
          title
        )
      `)
      .eq('student_profile_id', studentProfileId);

    if (enrollments) {
      activeCourses = enrollments
        .filter((e: any) => e.courses)
        .map((e: any) => ({
          id: e.courses.id,
          slug: e.courses.slug,
          title: e.courses.title,
        }));
    }
  }

  // Get portfolio projects
  let activeProjects: Array<{ id: string; title: string }> = [];
  if (studentProfileId) {
    const { data: projects } = await supabase
      .from('portfolio_projects')
      .select('id, title')
      .eq('student_profile_id', studentProfileId)
      .order('created_at', { ascending: false });

    if (projects) {
      activeProjects = projects.map((p) => ({
        id: p.id,
        title: p.title,
      }));
    }
  }

  // Get job applications (mock for now - would need a jobs table)
  const activeJobs: Array<{ id: string; title: string; company: string }> = [
    // TODO: Replace with actual job applications from database
    // For now, using empty array
  ];

  return (
    <AIAdvisor
      studentProfileId={studentProfileId}
      activeCourses={activeCourses}
      activeProjects={activeProjects}
      activeJobs={activeJobs}
    />
  );
}
