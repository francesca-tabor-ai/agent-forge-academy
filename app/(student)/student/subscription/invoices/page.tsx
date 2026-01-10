import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InvoicesList } from '@/components/subscription/InvoicesList';

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

  // TODO: Fetch actual invoices from database
  const invoices = [
    { id: 'INV-001', date: '2024-01-15', amount: 29, status: 'paid', url: '#' },
    { id: 'INV-002', date: '2023-12-15', amount: 29, status: 'paid', url: '#' },
    { id: 'INV-003', date: '2023-11-15', amount: 29, status: 'paid', url: '#' },
    { id: 'INV-004', date: '2023-10-15', amount: 29, status: 'paid', url: '#' },
    { id: 'INV-005', date: '2023-09-15', amount: 29, status: 'paid', url: '#' },
  ];

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
