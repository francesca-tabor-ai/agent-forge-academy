import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { StrategyToTechnicalPromptClient } from '@/components/tools/strategy-to-technical-prompt/StrategyToTechnicalPromptClient';

export default async function StrategyToTechnicalPromptPage() {
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

  // Fetch tool from database
  const { data: tool } = await supabase
    .from('platform_tools')
    .select('*')
    .eq('id', 'strategy-to-technical-prompt')
    .single();

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/student/tools"
        className="text-sm text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
      >
        ← Back to Tools
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {tool?.name || 'Strategy-to-Technical Prompt'}
          </h1>
          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 border border-green-200 rounded-full">
            {tool?.status === 'active' ? 'Live' : tool?.status === 'beta' ? 'Beta' : 'Coming Soon'}
          </span>
        </div>
        <p className="text-gray-600 mt-2">
          {tool?.description || 'A ChatGPT prompt template that transforms vague business ideas into structured technical requirement documents (PRD). The prompt guides you through converting high-level strategic concepts into actionable product requirements with specific success metrics, potential risks, user stories, technical constraints, and implementation priorities.'}
        </p>
      </div>

      {/* Tool Client Component */}
      {studentProfileId && (
        <StrategyToTechnicalPromptClient 
          toolId={tool?.id || 'strategy-to-technical-prompt'}
          studentProfileId={studentProfileId}
        />
      )}
    </div>
  );
}
