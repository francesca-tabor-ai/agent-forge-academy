import { Suspense } from 'react';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ToolsPageClient } from '@/components/tools/ToolsPageClient';
import type { Tool } from '@/lib/tools/registry';

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

  // Get tools from database (platform_tools table) - only show Live tools
  const { data: platformTools, error } = await supabase
    .from('platform_tools')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching platform tools:', error);
  }

  // Map database tools to Tool interface
  const tools: Tool[] = (platformTools || []).map((tool: any) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    href: tool.href,
    status: tool.status,
    tags: tool.tags || [],
    recommendedFor: tool.recommended_for_courses || [],
    category: tool.category || undefined,
    difficultyLevel: tool.difficulty_level || undefined,
    duration: tool.duration || undefined,
    industries: tool.industries || [],
    bestFor: tool.best_for || [],
  }));

  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tools</h1>
          <p className="text-gray-600 mt-2">
            Discover tools and resources to help you build and ship faster
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading tools...</p>
        </div>
      </div>
    }>
      <ToolsPageClient
        tools={tools}
        studentProfileId={studentProfileId}
      />
    </Suspense>
  );
}
