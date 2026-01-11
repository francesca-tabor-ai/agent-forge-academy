import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await hasRole('admin');

  if (!isAdmin) {
    redirect('/');
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
