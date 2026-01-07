import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isRecruiter = await hasRole('recruiter');

  if (!isRecruiter) {
    redirect('/');
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

