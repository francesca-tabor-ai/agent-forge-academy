import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InvoicesList } from '@/components/subscription/InvoicesList';
import { getSubscriptionData } from '@/lib/subscription/getSubscriptionData';

export default async function InvoicesPage() {
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

  // Fetch subscription data to get invoices
  const subscriptionData = await getSubscriptionData();

  if (!subscriptionData) {
    redirect('/auth/login');
  }

  // Convert invoices to format expected by InvoicesList component
  const invoices = subscriptionData.invoices.map((inv) => ({
    id: inv.invoiceNumber,
    date: new Date(inv.invoiceDate).toISOString().split('T')[0],
    amount: parseFloat(inv.amount.replace(/[£$€,\s]/g, '')), // Extract number from formatted string
    status: inv.status,
    url: inv.downloadUrl || '#',
    downloadUrl: inv.downloadUrl || undefined,
  }));

  return (
    <div className="space-y-8 authenticated-app">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-600 mt-1">View and download your billing history</p>
      </div>
      <InvoicesList invoices={invoices} />
    </div>
  );
}
