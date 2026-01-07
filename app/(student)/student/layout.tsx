import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isStudent = await hasRole('student');

  if (!isStudent) {
    redirect('/');
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

