import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditProjectForm } from '@/components/portfolio/EditProjectForm';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
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
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    redirect('/');
  }

  // Get student profile
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!studentProfile) {
    redirect('/student/portfolio');
  }

  // Get project (verify ownership via RLS)
  const { data: project } = await supabase
    .from('portfolio_projects')
    .select('id, title, description, github_url, demo_url, visibility')
    .eq('id', id)
    .eq('student_profile_id', studentProfile.id)
    .single();

  if (!project) {
    redirect('/student/portfolio');
  }

  // Images are now fetched separately via the component
  // Pass empty arrays initially, component will fetch via API
  const projectWithImages = {
    ...project,
    cover_image_url: null,
    images: [],
  };

  return (
    <div className="edit-project-page">
      <h1>Edit Project</h1>
      <EditProjectForm project={projectWithImages} />
    </div>
  );
}

