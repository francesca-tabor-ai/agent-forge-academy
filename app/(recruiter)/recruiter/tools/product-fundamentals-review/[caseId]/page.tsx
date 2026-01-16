import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProductFundamentalsReview } from '@/components/tools/product-fundamentals-playground/ProductFundamentalsReview';
import { generateDemoCaseData } from '@/lib/tools/product-fundamentals-playground/demoData';

interface ProductFundamentalsReviewPageProps {
  params: Promise<{ caseId: string }>;
}

export default async function ProductFundamentalsReviewPage({ params }: ProductFundamentalsReviewPageProps) {
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

  // For now, use demo data since persistence isn't implemented yet
  // In the future, this would fetch case data from database using caseId
  const { caseId } = await params;
  
  // TODO: When persistence is implemented, fetch case data from database:
  // const { data: caseData } = await supabase
  //   .from('product_fundamentals_cases')
  //   .select('*')
  //   .eq('id', caseId)
  //   .single();
  
  // For now, use demo data
  const caseData = generateDemoCaseData();

  return (
    <div className="space-y-6">
      <ProductFundamentalsReview caseData={caseData} />
    </div>
  );
}
