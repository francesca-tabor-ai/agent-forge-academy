import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ToolsPageClient } from '@/components/tools/ToolsPageClient';
import { getAvailableTools } from '@/lib/tools/registry';

export default async function ToolsPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get student profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  // Get student profile ID
  let studentProfileId: string | null = null;
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .single();
  studentProfileId = studentProfile?.id || null;

  if (!studentProfileId) {
    redirect('/');
  }

  // Get tools from registry (includes active, beta, and coming_soon - excludes deprecated)
  const tools = getAvailableTools();

  return (
    <ToolsPageClient
      tools={tools}
      studentProfileId={studentProfileId}
    />
  );
}
