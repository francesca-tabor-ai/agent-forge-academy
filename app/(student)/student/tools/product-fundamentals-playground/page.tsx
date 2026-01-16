import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ProductFundamentalsPlaygroundClient } from '@/components/tools/product-fundamentals-playground/ProductFundamentalsPlaygroundClient';

export default async function ProductFundamentalsPlaygroundPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">Product Fundamentals Playground</h1>
        <p className="mt-2 text-gray-600">
          Build comprehensive product fundamentals through a structured, step-by-step process.
        </p>
      </div>

      <ProductFundamentalsPlaygroundClient />
    </div>
  );
}
