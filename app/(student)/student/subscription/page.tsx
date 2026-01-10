import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SubscriptionPageContent } from '@/components/subscription/SubscriptionPageContent';

export default async function SubscriptionPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  // TODO: Fetch actual subscription data from database
  // For now, using mock data structure that matches requirements
  const subscriptionData = {
    plan: {
      name: 'Starter',
      tier: 'starter', // starter, pro, career
      status: 'active', // active, trial, paused, canceled
      billingCycle: 'monthly', // monthly, annual
      price: 29,
      currency: 'GBP',
      renewalDate: '2024-02-15',
      trialEndDate: null,
      trialDaysRemaining: null,
    },
    benefits: {
      courseAccess: 'All courses',
      projectLimit: 5,
      portfolioLimit: 1,
      jobOpportunitiesAccess: true,
      aiAdvisorUsage: 'Unlimited',
      toolDiscountEligibility: false,
    },
    billing: {
      paymentMethod: {
        type: 'card',
        brand: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
      },
      billingEmail: user.email || '',
      nextInvoiceAmount: 29,
    },
    invoices: [
      { id: 'INV-001', date: '2024-01-15', amount: 29, status: 'paid', url: '#' },
      { id: 'INV-002', date: '2023-12-15', amount: 29, status: 'paid', url: '#' },
      { id: 'INV-003', date: '2023-11-15', amount: 29, status: 'paid', url: '#' },
    ],
    availablePlans: [
      { name: 'Starter', tier: 'starter', price: 29, billingCycle: 'monthly' },
      { name: 'Pro', tier: 'pro', price: 79, billingCycle: 'monthly' },
      { name: 'Career', tier: 'career', price: 149, billingCycle: 'monthly' },
    ],
  };

  return <SubscriptionPageContent subscriptionData={subscriptionData} userEmail={user.email || ''} />;
}
