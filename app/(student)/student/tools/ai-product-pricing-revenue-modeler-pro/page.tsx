import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getToolById } from '@/lib/tools/registry';
import { AIProductPricingRevenueModelerProClient } from '@/components/tools/ai-product-pricing-revenue-modeler-pro/AIProductPricingRevenueModelerProClient';

export default async function AIProductPricingRevenueModelerProPage() {
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

  const tool = getToolById('ai-product-pricing-revenue-modeler-pro');

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
          <h1 className="text-3xl font-bold text-gray-900">{tool?.name || 'AI Product Pricing & Revenue Modeler Pro'}</h1>
          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 border border-green-200 rounded-full">
            {tool?.status === 'active' ? 'Live' : tool?.status === 'beta' ? 'Beta' : 'Coming Soon'}
          </span>
        </div>
        <p className="text-gray-600 mt-2">
          {tool?.description || 'Advanced ARC-O framework analysis with enhanced features. Model pricing strategies and revenue forecasts for AI products.'}
        </p>
      </div>

      {/* Tool Client Component */}
      {studentProfileId && (
        <AIProductPricingRevenueModelerProClient 
          toolId={tool?.id || 'ai-product-pricing-revenue-modeler-pro'}
          studentProfileId={studentProfileId}
        />
      )}
    </div>
  );
}
