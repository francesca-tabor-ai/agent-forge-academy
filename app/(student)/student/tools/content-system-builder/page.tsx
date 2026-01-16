import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getToolById } from '@/lib/tools/registry';

export default async function ContentSystemBuilderPage() {
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

  const tool = getToolById('content-system-builder');

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
          <h1 className="text-3xl font-bold text-gray-900">{tool?.name || 'Content System Builder'}</h1>
          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 border border-green-200 rounded-full">
            {tool?.status === 'active' ? 'Live' : tool?.status === 'beta' ? 'Beta' : 'Coming Soon'}
          </span>
        </div>
        <p className="text-gray-600 mt-2">
          {tool?.description || 'Build scalable content systems and workflows. Design content architectures for AI-native applications.'}
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">What this tool does</h2>
        <p className="text-gray-600 mb-4">
          The Content System Builder helps you build scalable content systems and workflows. 
          Design content architectures for AI-native applications that scale with your business needs.
        </p>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Status:</strong> {tool?.status === 'active' ? 'Live' : tool?.status === 'beta' ? 'Beta' : 'Coming Soon'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This tool is currently under development. Check back soon for updates!
          </p>
        </div>
      </div>
    </div>
  );
}
